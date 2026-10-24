import type { LucideIcon } from 'lucide-react'

interface TabItem<T extends string> {
  value: T
  label: string
  count?: number
  icon?: LucideIcon
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  // segmented: filtro sobre una lista (píldoras). underline: secciones de una misma pantalla.
  variant?: 'segmented' | 'underline'
}

const estilos = {
  segmented: {
    lista: 'inline-flex rounded-xl bg-tile p-1',
    tab: 'rounded-lg px-3 py-1.5',
    activo: 'bg-white text-ink shadow-sm',
    inactivo: 'text-muted hover:text-ink',
    contador: () => 'font-medium text-subtle',
  },
  underline: {
    lista: 'flex gap-6 border-b border-line',
    tab: '-mb-px border-b-2 px-1 pb-2.5',
    activo: 'border-ink text-ink',
    inactivo: 'border-transparent text-muted hover:text-ink',
    contador: (activo: boolean) =>
      `rounded-full px-1.5 py-0.5 text-[11px] font-bold ${activo ? 'bg-primary/10 text-primary' : 'bg-tile text-muted'}`,
  },
}

function Tabs<T extends string>({ items, value, onChange, variant = 'segmented' }: TabsProps<T>) {
  const estilo = estilos[variant]

  return (
    <div role="tablist" className={estilo.lista}>
      {items.map(({ value: valor, label, count, icon: Icon }) => {
        const activo = valor === value
        return (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(valor)}
            className={`flex cursor-pointer items-center gap-1.5 text-sm font-semibold transition ${estilo.tab} ${
              activo ? estilo.activo : estilo.inactivo
            }`}
          >
            {Icon && <Icon className="size-4" />}
            {label}
            {count !== undefined && <span className={estilo.contador(activo)}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
