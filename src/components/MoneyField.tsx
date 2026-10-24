import type { InputHTMLAttributes } from 'react'
import { formatearNumero, simboloMoneda } from '../utils/format'
import { fieldClass, labelClass } from '../utils/styles'

interface MoneyFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  id: string
  label: string
  hideLabel?: boolean // La etiqueta queda solo para lectores de pantalla (p. ej. dentro de una tabla)
  moneda: string
  value: number | null
  onChange: (valor: number | null) => void
}

// Monto entero con separador de miles ("32.000") y el símbolo de la moneda del negocio.
function MoneyField({ id, label, hideLabel = false, moneda, value, onChange, className = '', ...props }: MoneyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : labelClass}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] text-muted">
          {simboloMoneda(moneda)}
        </span>
        <input
          id={id}
          inputMode="numeric"
          className={`${fieldClass} pl-8 ${className}`}
          value={value === null ? '' : formatearNumero(value)}
          onChange={(e) => {
            const digitos = e.target.value.replace(/\D/g, '')
            onChange(digitos === '' ? null : Number(digitos))
          }}
          {...props}
        />
      </div>
    </div>
  )
}

export default MoneyField
