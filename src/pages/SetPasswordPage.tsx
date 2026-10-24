import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../components/Alert'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import PasswordField from '../components/PasswordField'
import { useSetPassword } from '../hooks/useSetPassword'
import type { RutaInvitacion } from '../services/authService'
import { RUTAS } from '../utils/routes'

const ESPERA_REDIRECCION = 3000

const linkClass = 'font-semibold text-primary hover:underline'

interface SetPasswordPageProps {
  ruta: RutaInvitacion // Endpoint al que se postea; es el mismo path de la URL
}

function SetPasswordPage({ ruta }: SetPasswordPageProps) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  return (
    <AuthLayout title="Crea tu contraseña" description="Es el último paso para empezar a usar tu cuenta.">
      {token ? (
        <SetPasswordForm ruta={ruta} token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <Alert>El enlace está incompleto: le falta el código de invitación. Ábrelo de nuevo desde el correo.</Alert>
          <Link to={RUTAS.login} className={linkClass}>
            Ir a iniciar sesión
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}

function SetPasswordForm({ ruta, token }: SetPasswordPageProps & { token: string }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const { crearPassword, cargando, error, enlaceInservible, exito, minimo } = useSetPassword(ruta, token)

  useEffect(() => {
    if (!exito) return
    const timer = setTimeout(() => navigate(RUTAS.login, { replace: true }), ESPERA_REDIRECCION)
    return () => clearTimeout(timer)
  }, [exito, navigate])

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    crearPassword(password, confirmacion)
  }

  if (exito) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="exito">{exito}</Alert>
        <p className="text-sm text-muted">
          Te llevamos al inicio de sesión en unos segundos.{' '}
          <Link to={RUTAS.login} replace className={linkClass}>
            Ir ahora
          </Link>
        </p>
      </div>
    )
  }

  if (enlaceInservible) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>{error}</Alert>
        <p className="text-sm text-muted">Pídele a tu administrador que te reenvíe la invitación.</p>
        <Link to={RUTAS.login} className={linkClass}>
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
      <PasswordField
        id="password"
        label="Contraseña"
        autoComplete="new-password"
        placeholder={`Mínimo ${minimo} caracteres`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordField
        id="confirmacion"
        label="Confirma la contraseña"
        autoComplete="new-password"
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
      />

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={cargando} className="mt-1.5">
        {cargando ? 'Guardando…' : 'Crear contraseña'}
      </Button>
    </form>
  )
}

export default SetPasswordPage
