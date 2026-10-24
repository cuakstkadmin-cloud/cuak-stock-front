import type { ReactNode } from 'react'

const variants = {
  error: 'border-red-200 bg-red-50 text-red-700',
  exito: 'border-primary/25 bg-primary/5 text-primary',
}

interface AlertProps {
  variant?: keyof typeof variants
  children: ReactNode
}

function Alert({ variant = 'error', children }: AlertProps) {
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3.5 py-2.5 text-sm ${variants[variant]}`}>
      {children}
    </div>
  )
}

export default Alert
