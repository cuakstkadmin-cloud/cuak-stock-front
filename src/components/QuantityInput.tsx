import { Minus, Plus } from 'lucide-react'

interface QuantityInputProps {
  label: string // Para los aria-label ("Labial rosa")
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}

const botonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-md text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40'

// Cantidad con − / + en una sola pieza.
function QuantityInput({ label, value, min = 1, max, onChange }: QuantityInputProps) {
  return (
    <div className="flex items-center rounded-lg border border-line bg-white p-0.5">
      <button
        type="button"
        aria-label={`Restar una unidad de ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={botonClass}
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Sumar una unidad de ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={botonClass}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export default QuantityInput
