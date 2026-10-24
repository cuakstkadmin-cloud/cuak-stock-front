import { request } from './api'

export type Rol = 'AdminGeneral' | 'AdminGeneralSustituto' | 'AdminEmpresa' | 'Usuario'

// Quién registró una venta, compra o movimiento. null en registros anteriores a guardar el autor,
// o si ese usuario ya fue eliminado.
export interface UsuarioResumen {
  id: string
  nombre: string
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  negocioId: string | null
  fechaCreacion: string
  fechaActualizacion: string
}

// Respuesta de todo alta o reenvío de invitación (empresas, personas, admins)
export interface ResultadoInvitacion {
  usuario: Usuario
  correoEnviado: boolean
  urlInvitacion?: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface SesionToken {
  sub: string
  negocioId: string | null
  email: string
  rol: Rol
  iat: number
  exp: number
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Rutas públicas del link de invitación. No son intercambiables: cada token
// solo sirve en el endpoint que coincide con su link.
export const RUTAS_INVITACION = [
  '/auth/asignar-password-usuario',
  '/auth/asignar-password-negocio',
  '/auth/asignar-password-admin',
] as const

export type RutaInvitacion = (typeof RUTAS_INVITACION)[number]

export interface AsignarPasswordResponse {
  mensaje: string
  usuario: Usuario
}

// La autorización la da el token de la URL, no el JWT.
export function asignarPassword(ruta: RutaInvitacion, token: string, password: string) {
  return request<AsignarPasswordResponse>(ruta, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ token, password }),
  })
}

export function obtenerSesion() {
  return request<SesionToken>('/auth/yo')
}

export interface CambiosPerfil {
  nombre?: string
  email?: string
}

export interface PerfilResponse {
  usuario: Usuario
  token: string // El email va dentro del JWT, así que el backend emite uno nuevo
}

// Tus propios datos, para cualquier rol. Pendiente en el backend: PUT /auth/perfil
export function actualizarPerfil(cambios: CambiosPerfil) {
  return request<PerfilResponse>('/auth/perfil', { method: 'PUT', body: JSON.stringify(cambios) })
}

export function cambiarPassword(passwordActual: string, passwordNuevo: string) {
  return request<{ mensaje: string }>('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ passwordActual, passwordNuevo }),
  })
}
