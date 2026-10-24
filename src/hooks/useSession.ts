import { useNavigate } from 'react-router-dom'
import { RUTAS } from '../utils/routes'
import { clearSession } from '../utils/session'

export function useSession() {
  const navigate = useNavigate()

  function cerrarSesion() {
    clearSession()
    navigate(RUTAS.login, { replace: true })
  }

  return { cerrarSesion }
}
