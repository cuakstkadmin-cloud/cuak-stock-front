import type { Usuario } from '../services/authService'

const TOKEN_KEY = 'token'
const USUARIO_KEY = 'usuario'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario(): Usuario | null {
  const usuario = localStorage.getItem(USUARIO_KEY)
  return usuario ? JSON.parse(usuario) : null
}

export function saveSession(token: string, usuario: Usuario) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

// Tras editar el perfil: guarda el usuario nuevo y, si el backend emitió otro token, también.
export function updateSession(usuario: Usuario, token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}
