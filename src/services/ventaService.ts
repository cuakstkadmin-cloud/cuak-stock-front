import { queryString, request, type Pagina } from './api'
import type { Agrupacion } from '../utils/periodos'
import type { UsuarioResumen } from './authService'

export const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'] as const

export type MetodoPago = (typeof METODOS_PAGO)[number]

export interface DetalleVenta {
  id: string
  productoId: string
  producto: { id: string; nombre: string }
  cantidad: number
  precioUnitario: number
  costoUnitario: number
  subtotal: number
  ganancia: number
}

export interface Venta {
  id: string
  fecha: string
  totalVenta: number
  costoTotal: number
  gananciaBruta: number
  metodoPago: MetodoPago | null
  detalle: DetalleVenta[]
  usuario: UsuarioResumen | null // Quién la registró
}

export interface ResumenVentas {
  cantidadVentas: number
  unidades: number
  totalVentas: number
  costoTotal: number
  gananciaBruta: number
}

export interface PaginaVentas extends Pagina<Venta> {
  resumen?: ResumenVentas
}

export type FiltrosVenta = {
  desde?: string // ISO con hora y zona
  hasta?: string
  pagina?: number
  porPagina?: number
}

export interface NuevaVenta {
  metodoPago: MetodoPago | null
  detalle: { productoId: string; cantidad: number }[] // Precio, costo y totales los calcula el backend
}

export type RangoFechas = { desde: string; hasta: string } // ISO con hora y zona

export interface PuntoSerie {
  inicio: string // Comienzo del tramo (hora, día, semana o mes), ISO
  totalVentas: number
  gananciaBruta: number
}

export type FiltrosSerie = RangoFechas & {
  agrupacion: Agrupacion
  zonaHoraria: string // IANA, p. ej. "America/Bogota"
}

export type OrdenTop = 'unidades' | 'ganancia'

export interface ProductoTop {
  producto: { id: string; nombre: string }
  unidades: number
  totalVentas: number
  gananciaBruta: number
  unidadesAnterior: number // Mismo producto en el periodo anterior de igual largo
}

export type FiltrosTop = RangoFechas & { orden: OrdenTop; limite: number }

// Totales del periodo, sin traer las ventas
export function obtenerResumenVentas(rango: RangoFechas) {
  return request<ResumenVentas>(`/venta/resumen${queryString(rango)}`)
}

// Ventas y ganancia agrupadas por tramo, para el gráfico de Inicio
export function obtenerSerieVentas(filtros: FiltrosSerie) {
  return request<PuntoSerie[]>(`/venta/serie${queryString(filtros)}`)
}

export function obtenerTopProductos(filtros: FiltrosTop) {
  return request<ProductoTop[]>(`/venta/top-productos${queryString(filtros)}`)
}

export function listarVentas(filtros: FiltrosVenta = {}) {
  return request<PaginaVentas>(`/venta${queryString(filtros)}`)
}

// Registra la venta y descuenta el stock en una sola transacción.
export function registrarVenta(venta: NuevaVenta) {
  return request<Venta>('/inventario/venta', { method: 'POST', body: JSON.stringify(venta) })
}

// Anula la venta devolviendo el stock (no confundir con DELETE /venta/:id, que no lo devuelve).
export function anularVenta(id: string) {
  return request<unknown>(`/inventario/venta/${id}`, { method: 'DELETE' })
}
