import { Link } from 'react-router-dom'
import { ChevronRight, type LucideIcon } from 'lucide-react'

const tonos = {
  aviso: 'bg-amber-100 text-amber-700',
  peligro: 'bg-red-100 text-red-600',
  exito: 'bg-primary/10 text-primary',
}

export type TonoAtencion = keyof typeof tonos

interface AttentionItemProps {
  icon: LucideIcon
  tono: TonoAtencion
  titulo: string
  accion: string
  to: string
}

// Un aviso de Inicio con su acción: el ícono y el texto dicen qué pasa, no solo el color.
function AttentionItem({ icon: Icon, tono, titulo, accion, to }: AttentionItemProps) {
  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tonos[tono]}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold">{titulo}</p>
        <Link
          to={to}
          className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 text-[13px] font-semibold transition hover:bg-surface"
        >
          {accion}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </li>
  )
}

export default AttentionItem
