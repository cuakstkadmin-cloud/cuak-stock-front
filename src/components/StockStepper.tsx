import { Minus, Plus } from 'lucide-react'

interface StockStepperProps {
  producto: string // Para el aria-label
  stock: number
  disabled?: boolean
  onAjustar: (cantidad: 1 | -1) => void
}

const botonClass =
  'flex size-[30px] cursor-pointer items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40'

// Botones − / + para registrar una salida o entrada rápida de una unidad.
function StockStepper({ producto, stock, disabled, onAjustar }: StockStepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Restar una unidad de ${producto}`}
        disabled={disabled || stock <= 0}
        onClick={() => onAjustar(-1)}
        className={`${botonClass} border-line bg-white text-ink hover:bg-surface`}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        aria-label={`Sumar una unidad de ${producto}`}
        disabled={disabled}
        onClick={() => onAjustar(1)}
        className={`${botonClass} border-primary/25 bg-primary/10 text-primary hover:bg-primary/15`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export default StockStepper
