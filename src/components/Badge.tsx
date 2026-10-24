import type { ReactNode } from 'react'

const variants = {
  neutral: 'bg-tile text-muted',
  exito: 'bg-primary/10 text-primary',
  aviso: 'bg-amber-100 text-amber-800',
  peligro: 'bg-red-100 text-red-700',
  inactivo: 'bg-tile text-subtle',
  destacado: 'bg-secondary text-white',
}

export type BadgeVariant = keyof typeof variants

interface BadgeProps {
  variant?: BadgeVariant
  dot?: boolean
  children: ReactNode
}

function Badge({ variant = 'neutral', dot = false, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${variants[variant]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export default Badge
