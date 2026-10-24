import { queryString, request, type Pagina } from './api'

export type EstadoStock = 'Disponible' | 'StockBajo' | 'Agotado'

export interface Producto {
  id: string
  codigo: string | null // SKU del negocio, p. ej. "LAB-001"; único dentro del negocio
  nombre: string
  marca: string | null
  categoria: string
  presentacion: string | null // "3,5 g", "50 ml"
  variante: string | null // Tono o variante: "Rosa mate"
  descripcion: string | null
  imagenUrl: string | null // "/storage/productos/..." (relativa a la API) o URL completa; ver utils/imagenes
  stockActual: number
  stockMinimo: number
  costoUnitario: number
  precioVenta: number
  proveedorId: string | null // Contacto de tipo Proveedor
  proveedor: string | null // Su nombre, para mostrar
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
  estado: EstadoStock
}

export interface ResumenProductos {
  total: number
  Disponible: number
  StockBajo: number
  Agotado: number
}

// Conteo para las pestañas del catálogo; ignora el filtro `activo`
export interface ResumenCatalogo {
  total: number
  activos: number
  inactivos: number
}

export interface PaginaProductos extends Pagina<Producto> {
  resumen?: ResumenProductos
  resumenCatalogo?: ResumenCatalogo
}

export type FiltrosProducto = {
  nombre?: string
  buscar?: string // Nombre, código, marca o categoría
  estado?: EstadoStock
  activo?: 'true' | 'false'
  pagina?: number
  porPagina?: number
}

// Ficha del producto en el catálogo: qué es y cuánto cuesta. Sin cantidades:
// el stock se maneja aparte, en Inventario (movimientos y stock mínimo).
export interface DatosCatalogo {
  codigo: string | null
  nombre: string
  categoria: string
  marca: string | null
  presentacion: string | null
  variante: string | null
  proveedorId: string | null
  descripcion: string | null
  costoUnitario: number
  precioVenta: number
  activo: boolean
}

// Configuración de stock, que se edita desde Inventario
export interface ConfigStock {
  stockMinimo: number
}

// Etiquetas que se muestran en la tarjeta y el detalle: presentación y variante, si las tiene
export function caracteristicasDe(producto: Pick<Producto, 'presentacion' | 'variante'>) {
  return [producto.presentacion, producto.variante].filter((valor): valor is string => Boolean(valor))
}

export function listarProductos(filtros: FiltrosProducto = {}) {
  return request<PaginaProductos>(`/producto${queryString(filtros)}`)
}

// Activos, ordenados por unidades vendidas
export function listarMasVendidos(limite: number) {
  return request<Producto[]>(`/producto/mas-vendidos${queryString({ limite })}`)
}

export function obtenerProducto(id: string) {
  return request<Producto>(`/producto/${id}`)
}

// El producto nace con stock 0; entra al inventario con ajustes o compras.
export function crearProducto(producto: DatosCatalogo) {
  return request<Producto>('/producto', { method: 'POST', body: JSON.stringify(producto) })
}

export function actualizarProducto(id: string, cambios: Partial<DatosCatalogo & ConfigStock>) {
  return request<Producto>(`/producto/${id}`, { method: 'PUT', body: JSON.stringify(cambios) })
}

// Deja de aparecer en Inventario, Ventas y Compras, pero conserva su historial.
export function desactivarProducto(id: string) {
  return request<Producto>(`/producto/${id}/desactivar`, { method: 'PATCH' })
}

export function activarProducto(id: string) {
  return actualizarProducto(id, { activo: true })
}

// Solo si nunca tuvo movimientos, ventas ni compras; si no, el backend responde 409.
export function eliminarProducto(id: string) {
  return request<unknown>(`/producto/${id}`, { method: 'DELETE' })
}

// Reemplaza la imagen del producto (campo "imagen" del formulario).
export function subirImagenProducto(id: string, archivo: File) {
  const datos = new FormData()
  datos.append('imagen', archivo)
  return request<Producto>(`/producto/${id}/imagen`, { method: 'POST', body: datos })
}

export function eliminarImagenProducto(id: string) {
  return request<Producto>(`/producto/${id}/imagen`, { method: 'DELETE' })
}
