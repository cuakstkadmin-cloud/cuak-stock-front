import { queryString, request, type Pagina } from './api'
import type { UsuarioResumen } from './authService'

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste'

export interface Movimiento {
  id: string
  tipo: TipoMovimiento
  cantidad: number // Entrada y Salida en positivo (el signo lo da el tipo); Ajuste puede ser negativo
  stockResultante: number
  motivo: 'Compra' | 'Venta' | 'Ajuste'
  fecha: string
  referenciaId: string | null
  usuario: UsuarioResumen | null // Quién lo registró
}

export type FiltrosMovimiento = {
  productoId?: string
  tipo?: TipoMovimiento
  desde?: string
  hasta?: string
  pagina?: number
  porPagina?: number
}

export interface Ajuste {
  productoId: string
  cantidad: number // Positivo suma, negativo resta
}

// Cantidad con su signo real, sin importar el tipo de movimiento.
export function cantidadConSigno(movimiento: Movimiento) {
  return movimiento.tipo === 'Salida' ? -movimiento.cantidad : movimiento.cantidad
}

// Un ajuste suelto. El backend rechaza dejar el stock en negativo.
export function ajustarStock(productoId: string, cantidad: number) {
  return request<Movimiento>('/inventario/ajuste', {
    method: 'POST',
    body: JSON.stringify({ productoId, cantidad }),
  })
}

// Varios ajustes en una sola transacción: o se guardan todos o ninguno.
export function ajustarStockEnLote(ajustes: Ajuste[]) {
  return request<Movimiento[]>('/inventario/ajustes', {
    method: 'POST',
    body: JSON.stringify({ ajustes }),
  })
}

export function listarMovimientos(filtros: FiltrosMovimiento = {}) {
  return request<Pagina<Movimiento>>(`/inventario/movimientos${queryString(filtros)}`)
}
