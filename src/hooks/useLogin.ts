import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mensajeDeError } from '../services/api'
import { login } from '../services/authService'
import { rutaInicio } from '../utils/roles'
import { saveSession } from '../utils/session'

export function useLogin() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function iniciarSesion(email: string, password: string) {
    setCargando(true)
    setError(null)
    try {
      const { token, usuario } = await login(email, password)
      saveSession(token, usuario)
      navigate(rutaInicio(usuario.rol), { replace: true })
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  return { iniciarSesion, cargando, error }
}
