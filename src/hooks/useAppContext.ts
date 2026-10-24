import { useOutletContext } from 'react-router-dom'
import type { Usuario } from '../services/authService'
import type { Negocio, NegocioBase } from '../services/negocioService'

// Lo que AppLayout comparte con las páginas privadas.
export interface AppContext {
  usuario: Usuario
  negocio: Negocio | null // null para los admins de plataforma, o mientras carga
  actualizarUsuario: (usuario: Usuario, token?: string) => void
  actualizarNegocio: (negocio: NegocioBase) => void
}

export function useAppContext() {
  return useOutletContext<AppContext>()
}
