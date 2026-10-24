import type { BadgeVariant } from '../components/Badge'
import type { EstadoCompra } from '../services/compraService'

const ESTADOS: Record<EstadoCompra, { label: string; variant: BadgeVariant }> = {
  Recibida: { label: 'Recibida', variant: 'exito' },
  Pendiente: { label: 'Pendiente', variant: 'aviso' },
}

export function infoEstadoCompra(estado: EstadoCompra) {
  return ESTADOS[estado] ?? { label: estado, variant: 'neutral' as BadgeVariant }
}
