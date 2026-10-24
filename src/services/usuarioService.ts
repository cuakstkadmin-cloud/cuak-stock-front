import { queryString, request, type Pagina } from './api'
import type { ResultadoInvitacion, Usuario } from './authService'

export type EstadoUsuario = 'Activo' | 'InvitacionPendiente' | 'Inactivo'

// Roles que un administrador de empresa puede asignar a las personas de su negocio
export type RolNegocio = Extract<Usuario['rol'], 'AdminEmpresa' | 'Usuario'>

// Persona del negocio, tal como la lista el backend
export interface UsuarioNegocio extends Usuario {
  rol: RolNegocio
  activo: boolean
  estado: EstadoUsuario
}

export type FiltrosUsuario = {
  pagina?: number
  porPagina?: number
}

export interface DatosUsuario {
  nombre: string
  email: string
  rol: RolNegocio
}

export function listarUsuarios(filtros: FiltrosUsuario = {}) {
  return request<Pagina<UsuarioNegocio>>(`/usuario${queryString(filtros)}`)
}

// Crea a la persona sin contraseña y le manda la invitación por correo.
export function crearUsuario(datos: DatosUsuario) {
  return request<ResultadoInvitacion>('/usuario', { method: 'POST', body: JSON.stringify(datos) })
}

export function actualizarUsuario(id: string, cambios: Partial<DatosUsuario>) {
  return request<UsuarioNegocio>(`/usuario/${id}`, { method: 'PUT', body: JSON.stringify(cambios) })
}

// Token nuevo; el anterior deja de servir.
export function reenviarInvitacionUsuario(id: string) {
  return request<ResultadoInvitacion>(`/usuario/${id}/reenviar-invitacion`, { method: 'POST' })
}

// Conserva a la persona y su historial, pero ya no puede iniciar sesión.
export function desactivarUsuario(id: string) {
  return request<UsuarioNegocio>(`/usuario/${id}/desactivar`, { method: 'PATCH' })
}

export function activarUsuario(id: string) {
  return request<UsuarioNegocio>(`/usuario/${id}/activar`, { method: 'PATCH' })
}

export function eliminarUsuario(id: string) {
  return request<unknown>(`/usuario/${id}`, { method: 'DELETE' })
}
