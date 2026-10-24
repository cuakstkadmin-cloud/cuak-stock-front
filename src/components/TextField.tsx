import type { InputHTMLAttributes, ReactNode } from 'react'
import { fieldClass, labelClass } from '../utils/styles'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  hideLabel?: boolean // La etiqueta queda solo para lectores de pantalla (p. ej. dentro de una tabla)
  trailing?: ReactNode
}

function TextField({ id, label, hideLabel = false, trailing, className = '', ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : labelClass}>
        {label}
      </label>
      <div className="relative">
        <input id={id} className={`${fieldClass} ${trailing ? 'pr-12' : ''} ${className}`} {...props} />
        {trailing && <div className="absolute top-0.5 right-0.5">{trailing}</div>}
      </div>
    </div>
  )
}

export default TextField
