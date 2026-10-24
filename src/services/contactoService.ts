import type { TipoDocumento } from '../utils/documentos'
import { queryString, request, type Pagina } from './api'

export type TipoContacto = 'Cliente' | 'Proveedor'

export interface Contacto {
  id: string
  tipo: TipoContacto
  nombre: string // Persona o razón social
  tipoDocumento: TipoDocumento | null
  numeroDocumento: string | null
  telefono: string | null
  email: string | null
  notas: string | null
  fechaCreacion: string
  fechaActualizacion: string
}

// Conteo para las pestañas; ignora el filtro `tipo`
export interface ResumenContactos {
  Cliente: number
  Proveedor: number
}

export interface PaginaContactos extends Pagina<Contacto> {
  resumen?: ResumenContactos
}

export type FiltrosContacto = {
  tipo?: TipoContacto
  buscar?: string // Nombre, documento, teléfono o correo
  pagina?: number
  porPagina?: number
}

export type DatosContacto = Omit<Contacto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>

export function listarContactos(filtros: FiltrosContacto = {}) {
  return request<PaginaContactos>(`/contacto${queryString(filtros)}`)
}

export function crearContacto(datos: DatosContacto) {
  return request<Contacto>('/contacto', { method: 'POST', body: JSON.stringify(datos) })
}

// El tipo no se cambia: un cliente no pasa a ser proveedor
export function actualizarContacto(id: string, cambios: Partial<Omit<DatosContacto, 'tipo'>>) {
  return request<Contacto>(`/contacto/${id}`, { method: 'PUT', body: JSON.stringify(cambios) })
}

// Si es un proveedor, los productos y compras que lo usan quedan sin proveedor.
export function eliminarContacto(id: string) {
  return request<unknown>(`/contacto/${id}`, { method: 'DELETE' })
}
