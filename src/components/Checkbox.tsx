import type { InputHTMLAttributes } from 'react'

// Casilla con el color de la marca.
function Checkbox({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <input type="checkbox" className={`size-[18px] shrink-0 cursor-pointer accent-primary ${className}`} {...props} />
}

export default Checkbox
