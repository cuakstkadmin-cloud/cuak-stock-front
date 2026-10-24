import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-line bg-white text-ink hover:bg-surface',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerOutline: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-12 px-6 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export default Button
