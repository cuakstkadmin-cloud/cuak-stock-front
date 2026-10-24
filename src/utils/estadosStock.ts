import type { BadgeVariant } from '../components/Badge'
import type { EstadoStock } from '../services/productoService'

export interface InfoEstadoStock {
  label: string
  variant: BadgeVariant
  stockClass: string // Color del número de stock
}

const ESTADOS: Record<EstadoStock, InfoEstadoStock> = {
  Disponible: { label: 'Disponible', variant: 'exito', stockClass: 'text-ink' },
  StockBajo: { label: 'Stock bajo', variant: 'aviso', stockClass: 'text-amber-700' },
  Agotado: { label: 'Agotado', variant: 'peligro', stockClass: 'text-red-600' },
}

// Si el backend no manda el estado (o manda uno nuevo), se muestra neutro en vez de romper la página
const ESTADO_DESCONOCIDO: InfoEstadoStock = { label: '—', variant: 'neutral', stockClass: 'text-ink' }

export function infoEstadoStock(estado: EstadoStock | undefined) {
  return (estado && ESTADOS[estado]) || ESTADO_DESCONOCIDO
}
