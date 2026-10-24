import { useState, type SubmitEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Alert from '../components/Alert'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import PasswordField from '../components/PasswordField'
import TextField from '../components/TextField'
import { useLogin } from '../hooks/useLogin'
import { rutaInicio } from '../utils/roles'
import { getToken, getUsuario } from '../utils/session'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { iniciarSesion, cargando, error } = useLogin()
  const usuario = getUsuario()

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    iniciarSesion(email, password)
  }

  // Con sesión abierta no tiene sentido volver a pedir el login
  if (getToken() && usuario) return <Navigate to={rutaInicio(usuario.rol)} replace />

  return (
    <AuthLayout title="Inicia sesión" description="Entra para ver cómo va tu negocio hoy.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <TextField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={cargando} className="mt-1.5">
          {cargando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
