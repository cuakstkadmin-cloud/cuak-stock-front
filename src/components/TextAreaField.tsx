import type { TextareaHTMLAttributes } from 'react'
import { labelClass } from '../utils/styles'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
}

// Texto largo con el mismo estilo que TextField.
function TextAreaField({ id, label, className = '', ...props }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`w-full resize-y rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-subtle/70 focus:border-primary focus:ring-3 focus:ring-primary/15 ${className}`}
        {...props}
      />
    </div>
  )
}

export default TextAreaField
