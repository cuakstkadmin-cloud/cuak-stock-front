export interface ItemRanking {
  id: string
  label: string
  valor: number // Define el largo de la barra
  valorTexto: string // Lo que se lee a la derecha ("42 uds", "$450.000")
}

interface RankedListProps {
  items: ItemRanking[]
  barClass: string // Color de la barra
  valorClass?: string
  vacio: string
}

// Ranking corto: posición, nombre, valor y una barra proporcional al primero.
function RankedList({ items, barClass, valorClass = 'text-ink', vacio }: RankedListProps) {
  if (items.length === 0) return <p className="py-4 text-sm text-muted">{vacio}</p>

  const maximo = Math.max(...items.map((item) => item.valor), 1)

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-tile text-xs font-bold">{i + 1}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-semibold">{item.label}</span>
              <span className={`font-bold tabular-nums ${valorClass}`}>{item.valorTexto}</span>
            </div>
            <div className="h-1.5 rounded-full bg-tile">
              <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(item.valor / maximo) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default RankedList
