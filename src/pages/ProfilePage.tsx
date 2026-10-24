import { useState, type SubmitEvent } from 'react'
import { LogOut } from 'lucide-react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import LogoutDialog from '../components/LogoutDialog'
import SelectField from '../components/SelectField'
import TextField from '../components/TextField'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { actualizarPerfil } from '../services/authService'
import { actualizarNegocio } from '../services/negocioService'
import { formatearFechaLarga, iniciales } from '../utils/format'
import { MONEDAS } from '../utils/monedas'
import { esAdminNegocio, nombreRol } from '../utils/roles'
import ChangePasswordModal from './ChangePasswordModal'

const FORM_ID = 'perfil-form'

// Solo se guarda lo que el usuario tocó; lo demás se lee del contexto.
interface Cambios {
  nombre?: string
  email?: string
  nombreNegocio?: string
  moneda?: string
}

function ProfilePage() {
  const { usuario, negocio, actualizarUsuario, actualizarNegocio: actualizarNegocioEnContexto } = useAppContext()
  const [cambios, setCambios] = useState<Cambios>({})
  const [cambiandoPassword, setCambiandoPassword] = useState(false)
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  // El administrador de la empresa la edita; los demás usuarios la ven en solo lectura
  const negocioEditable = esAdminNegocio(usuario.rol) ? negocio : null

  const nombre = cambios.nombre ?? usuario.nombre
  const email = cambios.email ?? usuario.email
  const nombreNegocio = cambios.nombreNegocio ?? negocioEditable?.nombre ?? ''
  const moneda = cambios.moneda ?? negocioEditable?.moneda ?? ''

  const cambiaronDatos = nombre.trim() !== usuario.nombre || email.trim() !== usuario.email
  const cambioNegocio =
    negocioEditable !== null && (nombreNegocio.trim() !== negocioEditable.nombre || moneda !== negocioEditable.moneda)

  const guardar = useAsyncAction(async () => {
    if (cambiaronDatos) {
      const { usuario: actualizado, token } = await actualizarPerfil({ nombre: nombre.trim(), email: email.trim() })
      actualizarUsuario(actualizado, token)
    }
    if (negocioEditable && cambioNegocio) {
      const actualizado = await actualizarNegocio(negocioEditable.id, { nombre: nombreNegocio.trim(), moneda })
      actualizarNegocioEnContexto(actualizado)
    }
  })

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const resultado = await guardar.ejecutar()
    if (resultado.ok) {
      setCambios({})
      setToast({ mensaje: 'Cambios guardados.' })
    }
  }

  function cambiar(campo: keyof Cambios, valor: string) {
    setCambios((actuales) => ({ ...actuales, [campo]: valor }))
  }

  const monedas =
    !moneda || MONEDAS.some((m) => m.value === moneda) ? MONEDAS : [...MONEDAS, { value: moneda, label: moneda }]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {iniciales(usuario.nombre)}
          </span>
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold">Perfil</h1>
            <p className="text-sm text-muted">
              {usuario.nombre} · {negocio?.nombre ?? nombreRol(usuario.rol)}
            </p>
          </div>
        </div>
        <Button type="submit" form={FORM_ID} disabled={guardar.cargando || (!cambiaronDatos && !cambioNegocio)}>
          {guardar.cargando ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </header>

      {guardar.error && <Alert>{guardar.error}</Alert>}

      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card title="Tus datos">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="nombre"
              label="Nombre"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => cambiar('nombre', e.target.value)}
            />
            <TextField
              id="email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => cambiar('email', e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Contraseña</span>
              <span aria-hidden="true" className="text-subtle">
                ••••••••
              </span>
            </div>
            <Button type="button" variant="secondary" onClick={() => setCambiandoPassword(true)}>
              Cambiar contraseña
            </Button>
          </div>
        </Card>

        {negocioEditable && (
          <Card title="Tu negocio" aside={`Creado el ${formatearFechaLarga(negocioEditable.fechaCreacion)}`}>
            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
              <TextField
                id="nombreNegocio"
                label="Nombre del negocio"
                required
                value={nombreNegocio}
                onChange={(e) => cambiar('nombreNegocio', e.target.value)}
              />
              <SelectField
                id="moneda"
                label="Moneda"
                options={monedas}
                value={moneda}
                onChange={(e) => cambiar('moneda', e.target.value)}
              />
            </div>
          </Card>
        )}

        {/* Los demás usuarios del negocio solo ven a qué empresa pertenecen */}
        {!negocioEditable && negocio && (
          <Card title="Tu empresa">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-subtle">Empresa</dt>
                <dd className="font-semibold">{negocio.nombre}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-subtle">Tu rol</dt>
                <dd className="font-semibold">{nombreRol(usuario.rol)}</dd>
              </div>
            </dl>
            <p className="border-t border-line pt-4 text-[13px] text-subtle">
              Solo el administrador de la empresa puede cambiar sus datos.
            </p>
          </Card>
        )}
      </form>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Cerrar sesión</span>
            <span className="text-[13px] text-subtle">Saldrás de tu cuenta en este dispositivo.</span>
          </div>
          <Button variant="dangerOutline" onClick={() => setCerrandoSesion(true)}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </Card>

      {cerrandoSesion && <LogoutDialog onClose={() => setCerrandoSesion(false)} />}

      {/* Fuera del <form> del perfil: un submit dentro del modal no debe disparar el guardado */}
      {cambiandoPassword && (
        <ChangePasswordModal
          onClose={() => setCambiandoPassword(false)}
          onCambiada={() => {
            setCambiandoPassword(false)
            setToast({ mensaje: 'Contraseña actualizada.' })
          }}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProfilePage
