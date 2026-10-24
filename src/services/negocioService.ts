import { queryString, request, type Pagina } from './api'
import type { ResultadoInvitacion } from './authService'

export type TipoNegocio = 'Empresa' | 'Persona'
export type EstadoNegocio = 'Activa' | 'InvitacionPendiente' | 'Inactiva'

export interface NegocioBase {
  id: string
  nombre: string
  tipo: TipoNegocio
  moneda: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface AdministradorNegocio {
  id: string
  nombre: string
  email: string
  invitacionPendiente: boolean
}

export interface Negocio extends NegocioBase {
  administrador: AdministradorNegocio | null
  totalUsuarios: number
  estado: EstadoNegocio
}

export interface ResumenNegocios {
  total: number
  Empresa: number
  Persona: number
}

export interface PaginaNegocios extends Pagina<Negocio> {
  resumen?: ResumenNegocios
}

export type FiltrosNegocio = {
  buscar?: string
  tipo?: TipoNegocio
  pagina?: number
  porPagina?: number
}

export interface NuevoNegocio {
  nombre: string
  tipo: TipoNegocio
  moneda: string
  nombreAdmin: string
  emailAdmin: string
}

export type CambiosNegocio = Partial<Pick<NegocioBase, 'nombre' | 'tipo' | 'moneda' | 'activo'>>

export function listarNegocios(filtros: FiltrosNegocio = {}) {
  return request<PaginaNegocios>(`/negocio${queryString(filtros)}`)
}

export function obtenerNegocio(id: string) {
  return request<Negocio>(`/negocio/${id}`)
}

export function crearNegocio(negocio: NuevoNegocio) {
  return request<ResultadoInvitacion>('/negocio', { method: 'POST', body: JSON.stringify(negocio) })
}

export function actualizarNegocio(id: string, cambios: CambiosNegocio) {
  return request<NegocioBase>(`/negocio/${id}`, { method: 'PUT', body: JSON.stringify(cambios) })
}

export function desactivarNegocio(id: string) {
  return request<NegocioBase>(`/negocio/${id}/desactivar`, { method: 'PATCH' })
}

export function reenviarInvitacionNegocio(id: string) {
  return request<ResultadoInvitacion>(`/negocio/${id}/reenviar-invitacion`, { method: 'POST' })
}

// Solo se puede si no tiene datos operativos; si los tiene, el backend responde 409 y no borra nada.
export function eliminarNegocio(id: string) {
  return request<unknown>(`/negocio/${id}`, { method: 'DELETE' })
}
