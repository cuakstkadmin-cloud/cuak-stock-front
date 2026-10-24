import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import type { Rol } from '../services/authService'
import { rutaInicio } from '../utils/roles'
import { RUTAS } from '../utils/routes'
import { getToken, getUsuario } from '../utils/session'

interface ProtectedRouteProps {
  roles?: readonly Rol[]
}

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  // Se reenvía el contexto de AppLayout para que las páginas anidadas lo sigan recibiendo
  const contexto = useOutletContext()
  const usuario = getUsuario()

  if (!getToken() || !usuario) return <Navigate to={RUTAS.login} replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={rutaInicio(usuario.rol)} replace />

  return <Outlet context={contexto} />
}

export default ProtectedRoute
