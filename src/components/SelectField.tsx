import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { fieldClass, labelClass } from '../utils/styles'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
  options: { value: string; label: string }[]
}

function SelectField({ id, label, options, ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select id={id} className={`${fieldClass} cursor-pointer appearance-none pr-10`} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-[18px] -translate-y-1/2 text-subtle" />
      </div>
    </div>
  )
}

export default SelectField
