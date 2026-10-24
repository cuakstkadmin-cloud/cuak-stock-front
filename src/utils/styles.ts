export const labelClass = 'text-[13px] font-semibold'

// Ganancias en verde; en rojo si son negativas (vender bajo costo)
export const gananciaClass = (valor: number) => (valor < 0 ? 'text-red-600' : 'text-primary')

export const fieldClass =
  'h-12 w-full rounded-lg border border-line bg-white px-3.5 text-[15px] outline-none transition placeholder:text-subtle/70 focus:border-primary focus:ring-3 focus:ring-primary/15'
