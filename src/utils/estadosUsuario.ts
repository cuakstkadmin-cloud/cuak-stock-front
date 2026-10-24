import type { BadgeVariant } from '../components/Badge'
import type { EstadoUsuario } from '../services/usuarioService'

const ESTADOS: Record<EstadoUsuario, { label: string; variant: BadgeVariant }> = {
  Activo: { label: 'Activo', variant: 'exito' },
  InvitacionPendiente: { label: 'Invitación pendiente', variant: 'aviso' },
  Inactivo: { label: 'Inactivo', variant: 'inactivo' },
}

// Si el backend no manda el estado (o manda uno nuevo), se muestra neutro en vez de romper la página
export function infoEstadoUsuario(estado: EstadoUsuario | undefined) {
  return (estado && ESTADOS[estado]) || { label: '—', variant: 'neutral' as BadgeVariant }
}
