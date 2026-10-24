import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, CircleCheck, Mail, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import type { DropdownItem } from '../components/Dropdown'
import Pagination from '../components/Pagination'
import RowMenu from '../components/RowMenu'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useUsers } from '../hooks/useUsers'
import {
  activarUsuario,
  desactivarUsuario,
  eliminarUsuario,
  reenviarInvitacionUsuario,
  type UsuarioNegocio,
} from '../services/usuarioService'
import { infoEstadoUsuario } from '../utils/estadosUsuario'
import { formatearFecha, iniciales, plural } from '../utils/format'
import { esAdminNegocio, infoRolNegocio, ROLES_ASIGNABLES } from '../utils/roles'
import { RUTAS } from '../utils/routes'
import UserFormModal from './UserFormModal'

interface Confirmacion {
  accion: 'desactivar' | 'eliminar'
  usuario: UsuarioNegocio
}

const thClass = 'px-3 py-3 font-medium first:pl-5'
const tdClass = 'px-3 py-3 first:pl-5'

// El rol de administrador se distingue en oscuro; el resto, neutro
const varianteRol = (rol: UsuarioNegocio['rol']) => (esAdminNegocio(rol) ? 'destacado' : 'neutral')

function UsersPage() {
  const navigate = useNavigate()
  const { usuario: yo, negocio } = useAppContext()
  const negocioNombre = negocio?.nombre ?? 'tu negocio'

  const [pagina, setPagina] = useState(1)
  const { usuarios, paginacion, cargando, error, recargar } = useUsers({ pagina })

  const [formulario, setFormulario] = useState<{ usuario?: UsuarioNegocio } | null>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const accion = useAsyncAction((ejecutar: () => Promise<ToastData>) => ejecutar())

  async function ejecutarAccion(ejecutar: () => Promise<ToastData>) {
    const resultado = await accion.ejecutar(ejecutar)
    if (resultado.ok) {
      setToast(resultado.valor)
      setConfirmacion(null)
      recargar()
    } else if (!confirmacion) {
      setToast({ mensaje: resultado.error, tipo: 'error' })
    }
  }

  function pedirConfirmacion(accionPedida: Confirmacion['accion'], usuario: UsuarioNegocio) {
    accion.limpiarError()
    setConfirmacion({ accion: accionPedida, usuario })
  }

  function reenviarInvitacion(usuario: UsuarioNegocio) {
    ejecutarAccion(async () => {
      const { correoEnviado } = await reenviarInvitacionUsuario(usuario.id)
      return correoEnviado
        ? { mensaje: `Invitación reenviada a ${usuario.email}.` }
        : { mensaje: 'Se generó una invitación nueva, pero el correo no salió.', tipo: 'aviso' }
    })
  }

  function activar(usuario: UsuarioNegocio) {
    ejecutarAccion(async () => {
      await activarUsuario(usuario.id)
      return { mensaje: `${usuario.nombre} puede volver a entrar.` }
    })
  }

  function confirmar({ accion: accionConfirmada, usuario }: Confirmacion) {
    ejecutarAccion(async () => {
      if (accionConfirmada === 'desactivar') {
        await desactivarUsuario(usuario.id)
        return { mensaje: `${usuario.nombre} ya no puede iniciar sesión.` }
      }
      await eliminarUsuario(usuario.id)
      // Si era la última fila de la página, se vuelve a la anterior para no quedar en una página vacía
      if (usuarios.length === 1 && pagina > 1) setPagina(pagina - 1)
      return { mensaje: `${usuario.nombre} se eliminó.` }
    })
  }

  function accionesDe(usuario: UsuarioNegocio): DropdownItem[] {
    // Sobre uno mismo solo se edita el perfil: nadie se quita su propio acceso ni su rol
    if (usuario.id === yo.id) {
      return [{ label: 'Editar mi perfil', icon: UserRound, onClick: () => navigate(RUTAS.perfil) }]
    }

    const items: DropdownItem[] = [{ label: 'Editar', icon: Pencil, onClick: () => setFormulario({ usuario }) }]
    if (usuario.estado === 'InvitacionPendiente') {
      items.push({ label: 'Reenviar invitación', icon: Mail, onClick: () => reenviarInvitacion(usuario) })
    }
    if (usuario.estado === 'Activo') {
      items.push({ label: 'Desactivar', icon: Ban, onClick: () => pedirConfirmacion('desactivar', usuario) })
    }
    if (usuario.estado === 'Inactivo') {
      items.push({ label: 'Activar', icon: CircleCheck, onClick: () => activar(usuario) })
    }
    items.push({ label: 'Eliminar', icon: Trash2, danger: true, onClick: () => pedirConfirmacion('eliminar', usuario) })
    return items
  }

  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted">
            Personas con acceso a {negocioNombre}
            {paginacion && ` · ${plural(paginacion.total, 'registrada', 'registradas')}`}
          </p>
        </div>
        <Button onClick={() => setFormulario({})}>
          <Plus className="size-[18px]" />
          Registrar persona
        </Button>
      </header>

      <div className="rounded-2xl border border-line bg-white">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-muted">{error}</p>
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-subtle">
                  <th className={thClass}>Persona</th>
                  <th className={thClass}>Rol</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Registro</th>
                  <th className="w-14">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                {cargaInicial || usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      {cargaInicial ? 'Cargando…' : 'Todavía no hay personas registradas.'}
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => {
                    const estado = infoEstadoUsuario(usuario.estado)
                    return (
                      <tr key={usuario.id} className="border-b border-line last:border-0">
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tile text-xs font-bold">
                              {iniciales(usuario.nombre)}
                            </span>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-bold">
                                {usuario.nombre}
                                {usuario.id === yo.id && <span className="ml-1.5 text-xs font-medium text-subtle">(tú)</span>}
                              </span>
                              <span className="truncate text-xs text-subtle">{usuario.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <Badge variant={varianteRol(usuario.rol)}>{infoRolNegocio(usuario.rol).label}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge variant={estado.variant} dot>
                            {estado.label}
                          </Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatearFecha(usuario.fechaCreacion)}</td>
                        <td className="pr-4 text-right">
                          <RowMenu label={`Acciones de ${usuario.nombre}`} items={accionesDe(usuario)} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {paginacion && paginacion.totalPaginas > 1 && (
          <div className="flex justify-end rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3">
            <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />
          </div>
        )}
      </div>

      {/* Qué puede hacer cada rol: de mayor a menor alcance (el formulario los ordena al revés, Usuario primero) */}
      <section className="grid gap-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        {[...ROLES_ASIGNABLES].reverse().map((opcion) => (
          <div key={opcion.rol} className="flex flex-col items-start gap-2">
            <Badge variant={varianteRol(opcion.rol)}>{opcion.label}</Badge>
            <p className="text-sm text-muted">{opcion.alcance}</p>
          </div>
        ))}
      </section>

      {formulario && (
        <UserFormModal
          usuario={formulario.usuario}
          negocioNombre={negocioNombre}
          onClose={() => setFormulario(null)}
          onGuardado={(aviso) => {
            setFormulario(null)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {confirmacion && (
        <ConfirmDialog
          title={confirmacion.accion === 'desactivar' ? 'Desactivar persona' : 'Eliminar persona'}
          message={
            confirmacion.accion === 'desactivar' ? (
              <>
                <strong className="text-ink">{confirmacion.usuario.nombre}</strong> ya no podrá iniciar sesión. Sus datos y lo
                que registró se conservan, y puedes volver a activarla cuando quieras.
              </>
            ) : (
              <>
                Se eliminará <strong className="text-ink">{confirmacion.usuario.nombre}</strong>. No se puede deshacer. Las
                ventas y compras que registró se conservan, pero sin su nombre. Si solo quieres quitarle el acceso, desactívala.
              </>
            )
          }
          confirmLabel={confirmacion.accion === 'desactivar' ? 'Desactivar' : 'Eliminar'}
          danger
          cargando={accion.cargando}
          error={accion.error}
          onConfirm={() => confirmar(confirmacion)}
          onClose={() => setConfirmacion(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default UsersPage
