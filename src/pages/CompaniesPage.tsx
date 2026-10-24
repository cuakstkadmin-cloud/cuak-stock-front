import { useState } from 'react'
import { Ban, CircleCheck, Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import Badge, { type BadgeVariant } from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import type { DropdownItem } from '../components/Dropdown'
import Pagination from '../components/Pagination'
import RowMenu from '../components/RowMenu'
import SearchInput from '../components/SearchInput'
import Tabs from '../components/Tabs'
import Toast, { type ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useCompanies } from '../hooks/useCompanies'
import { useDebounce } from '../hooks/useDebounce'
import {
  actualizarNegocio,
  desactivarNegocio,
  eliminarNegocio,
  reenviarInvitacionNegocio,
  type EstadoNegocio,
  type Negocio,
  type TipoNegocio,
} from '../services/negocioService'
import { formatearFecha, plural } from '../utils/format'
import CompanyFormModal from './CompanyFormModal'

type FiltroTipo = 'Todas' | TipoNegocio

interface Confirmacion {
  accion: 'desactivar' | 'eliminar'
  negocio: Negocio
}

const ESTADOS: Record<EstadoNegocio, { label: string; variant: BadgeVariant }> = {
  Activa: { label: 'Activa', variant: 'exito' },
  InvitacionPendiente: { label: 'Invitación pendiente', variant: 'aviso' },
  Inactiva: { label: 'Inactiva', variant: 'inactivo' },
}

const thClass = 'px-3 py-3.5 font-medium first:pl-5'
const tdClass = 'px-3 py-3.5 first:pl-5'

function CompaniesPage() {
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState<FiltroTipo>('Todas')
  const [pagina, setPagina] = useState(1)
  const buscar = useDebounce(busqueda.trim())

  const { negocios, paginacion, resumen, cargando, error, recargar } = useCompanies({
    buscar: buscar || undefined,
    tipo: tipo === 'Todas' ? undefined : tipo,
    pagina,
  })

  const [formulario, setFormulario] = useState<{ negocio?: Negocio } | null>(null)
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

  function reenviarInvitacion(negocio: Negocio) {
    ejecutarAccion(async () => {
      const { correoEnviado } = await reenviarInvitacionNegocio(negocio.id)
      return correoEnviado
        ? { mensaje: `Invitación reenviada a ${negocio.administrador?.email}.` }
        : { mensaje: 'Se generó una invitación nueva, pero el correo no salió.', tipo: 'aviso' }
    })
  }

  function activar(negocio: Negocio) {
    ejecutarAccion(async () => {
      await actualizarNegocio(negocio.id, { activo: true })
      return { mensaje: `${negocio.nombre} quedó activa.` }
    })
  }

  function desactivar(negocio: Negocio) {
    ejecutarAccion(async () => {
      await desactivarNegocio(negocio.id)
      return { mensaje: `${negocio.nombre} quedó inactiva.` }
    })
  }

  function eliminar(negocio: Negocio) {
    ejecutarAccion(async () => {
      await eliminarNegocio(negocio.id)
      // Si era la última fila de la página, se vuelve a la anterior para no quedar en una página vacía
      if (negocios.length === 1 && pagina > 1) setPagina(pagina - 1)
      return { mensaje: `${negocio.nombre} se eliminó.` }
    })
  }

  function pedirConfirmacion(accionPedida: Confirmacion['accion'], negocio: Negocio) {
    accion.limpiarError()
    setConfirmacion({ accion: accionPedida, negocio })
  }

  function accionesDe(negocio: Negocio): DropdownItem[] {
    const items: DropdownItem[] = [{ label: 'Editar', icon: Pencil, onClick: () => setFormulario({ negocio }) }]

    if (negocio.estado === 'InvitacionPendiente') {
      items.push({ label: 'Reenviar invitación', icon: Mail, onClick: () => reenviarInvitacion(negocio) })
    }
    if (negocio.activo) {
      items.push({ label: 'Desactivar', icon: Ban, onClick: () => pedirConfirmacion('desactivar', negocio) })
    } else {
      items.push({ label: 'Activar', icon: CircleCheck, onClick: () => activar(negocio) })
    }
    items.push({ label: 'Eliminar', icon: Trash2, danger: true, onClick: () => pedirConfirmacion('eliminar', negocio) })

    return items
  }

  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  function cambiarTipo(valor: FiltroTipo) {
    setTipo(valor)
    setPagina(1)
  }

  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">Empresas</h1>
          {resumen && (
            <p className="text-sm text-muted">
              {plural(resumen.total, 'cuenta registrada', 'cuentas registradas')} ·{' '}
              {plural(resumen.Empresa, 'empresa', 'empresas')} y {plural(resumen.Persona, 'persona', 'personas')}
            </p>
          )}
        </div>
        <Button onClick={() => setFormulario({})}>
          <Plus className="size-[18px]" />
          Registrar empresa
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          className="w-full sm:w-80"
          placeholder="Buscar por nombre o correo..."
          aria-label="Buscar cuentas"
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
        <Tabs
          value={tipo}
          onChange={cambiarTipo}
          items={[
            { value: 'Todas', label: 'Todas', count: resumen?.total },
            { value: 'Empresa', label: 'Empresas', count: resumen?.Empresa },
            { value: 'Persona', label: 'Personas', count: resumen?.Persona },
          ]}
        />
      </div>

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
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-subtle">
                  <th className={thClass}>Cuenta</th>
                  <th className={thClass}>Tipo</th>
                  <th className={thClass}>Administrador</th>
                  <th className={`${thClass} text-right`}>Usuarios</th>
                  <th className={thClass}>Registro</th>
                  <th className={thClass}>Estado</th>
                  <th className="w-14">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                {cargaInicial || negocios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      {cargaInicial
                        ? 'Cargando…'
                        : buscar
                          ? 'No hay cuentas que coincidan con la búsqueda.'
                          : 'Todavía no hay cuentas registradas.'}
                    </td>
                  </tr>
                ) : (
                  negocios.map((negocio) => (
                    <tr key={negocio.id} className="border-b border-line last:border-0">
                      <td className={`${tdClass} font-bold`}>{negocio.nombre}</td>
                      <td className={tdClass}>
                        <Badge>{negocio.tipo}</Badge>
                      </td>
                      <td className={tdClass}>
                        {negocio.administrador ? (
                          <div className="flex flex-col">
                            <span>{negocio.administrador.nombre}</span>
                            <span className="text-xs text-subtle">{negocio.administrador.email}</span>
                          </div>
                        ) : (
                          <span className="text-subtle">Sin administrador</span>
                        )}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{negocio.totalUsuarios}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatearFecha(negocio.fechaCreacion)}</td>
                      <td className={tdClass}>
                        <Badge variant={ESTADOS[negocio.estado].variant} dot>
                          {ESTADOS[negocio.estado].label}
                        </Badge>
                      </td>
                      <td className="pr-4 text-right">
                        <RowMenu label={`Acciones de ${negocio.nombre}`} items={accionesDe(negocio)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3 text-[13px] text-subtle">
          <p>Cada cuenta tiene sus propios productos, ventas y compras. El administrador general no ve esos datos.</p>
          {paginacion && <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />}
        </div>
      </div>

      {formulario && (
        <CompanyFormModal
          negocio={formulario.negocio}
          onClose={() => setFormulario(null)}
          onGuardado={(aviso) => {
            setFormulario(null)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {confirmacion?.accion === 'desactivar' && (
        <ConfirmDialog
          title="Desactivar cuenta"
          message={
            <>
              <strong className="text-ink">{confirmacion.negocio.nombre}</strong> y sus usuarios no podrán seguir usando la
              app. Su historial se conserva y puedes volver a activarla cuando quieras.
            </>
          }
          confirmLabel="Desactivar"
          danger
          cargando={accion.cargando}
          error={accion.error}
          onConfirm={() => desactivar(confirmacion.negocio)}
          onClose={() => setConfirmacion(null)}
        />
      )}

      {confirmacion?.accion === 'eliminar' && (
        <ConfirmDialog
          title="Eliminar cuenta"
          message={
            <>
              Se eliminará <strong className="text-ink">{confirmacion.negocio.nombre}</strong> junto con sus usuarios. No se
              puede deshacer. Si ya tiene productos, ventas o compras no se podrá eliminar: en ese caso, desactívala.
            </>
          }
          confirmLabel="Eliminar"
          danger
          cargando={accion.cargando}
          error={accion.error}
          onConfirm={() => eliminar(confirmacion.negocio)}
          onClose={() => setConfirmacion(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default CompaniesPage
