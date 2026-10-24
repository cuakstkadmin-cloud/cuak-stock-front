import { ArrowDown, ArrowUp } from 'lucide-react'

interface TrendProps {
  sube: boolean
  texto: string
}

// Variación frente a otro periodo: flecha y texto, nunca solo el color.
function Trend({ sube, texto }: TrendProps) {
  const Icono = sube ? ArrowUp : ArrowDown
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${sube ? 'text-primary' : 'text-red-600'}`}>
      <Icono className="size-3.5" aria-hidden="true" />
      {texto}
    </span>
  )
}

export default Trend
