import { queryString, request, type Pagina } from './api'
import type { UsuarioResumen } from './authService'
import type { Producto } from './productoService'

export type EstadoCompra = 'Pendiente' | 'Recibida'

export interface ItemReposicion {
  producto: Producto
  ventasPeriodo: number // Unidades vendidas en los últimos `dias`
  compraSugerida: number // Unidades a comprar, calculadas por el backend
}

export interface ResumenReposicion {
  total: number
  StockBajo: number
  Agotado: number
}

export interface PaginaReposicion extends Pagina<ItemReposicion> {
  resumen?: ResumenReposicion
}

export type FiltrosReposicion = {
  dias?: number
  pagina?: number
  porPagina?: number
}

export interface LineaCompra {
  productoId: string
  cantidad: number
  costoUnitario: number
}

export interface NuevaCompra {
  proveedorId: string | null
  estado: EstadoCompra
  detalle: LineaCompra[]
}

export interface DetalleCompra {
  id: string
  productoId: string
  producto: { id: string; nombre: string }
  cantidad: number
  costoUnitario: number
  subtotal: number
}

export interface Compra {
  id: string
  fecha: string
  costoTotal: number
  estado: EstadoCompra
  proveedorId: string | null // Contacto de tipo Proveedor
  proveedor: string | null // Su nombre, para mostrar
  detalle: DetalleCompra[]
  usuario: UsuarioResumen | null // Quién la registró
}

export interface ResumenCompras {
  cantidadCompras: number
  unidades: number
  costoTotal: number
}

export interface PaginaCompras extends Pagina<Compra> {
  resumen?: ResumenCompras
}

export type FiltrosCompra = {
  desde?: string // ISO con hora y zona
  hasta?: string
  estado?: EstadoCompra
  pagina?: number
  porPagina?: number
}

// Productos que necesitan reposición, del más urgente al menos urgente.
export function listarReposicion(filtros: FiltrosReposicion = {}) {
  return request<PaginaReposicion>(`/inventario/reposicion${queryString(filtros)}`)
}

export function listarCompras(filtros: FiltrosCompra = {}) {
  return request<PaginaCompras>(`/compra${queryString(filtros)}`)
}

// Registra la compra; si está Recibida, suma el stock en la misma transacción.
export function registrarCompra(compra: NuevaCompra) {
  return request<Compra>('/inventario/compra', { method: 'POST', body: JSON.stringify(compra) })
}

// Pasa una compra Pendiente a Recibida y suma su stock.
export function recibirCompra(id: string) {
  return request<Compra>(`/inventario/compra/${id}/recibir`, { method: 'POST' })
}

// Anula la compra; si estaba recibida, resta el stock que había sumado.
export function anularCompra(id: string) {
  return request<unknown>(`/inventario/compra/${id}`, { method: 'DELETE' })
}
