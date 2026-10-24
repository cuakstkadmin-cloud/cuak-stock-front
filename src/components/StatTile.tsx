import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  unit?: string
  caption?: ReactNode
  valueClass?: string
}

// Una cifra con su etiqueta. Se usa en fila dentro de una tarjeta.
function StatTile({ label, value, unit, caption, valueClass = 'text-ink' }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-subtle">{label}</span>
      <span className={`text-[26px] leading-tight font-bold tabular-nums ${valueClass}`}>
        {value}
        {unit && <span className="ml-1 text-base font-semibold">{unit}</span>}
      </span>
      {caption && <span className="text-xs text-subtle">{caption}</span>}
    </div>
  )
}

export default StatTile
