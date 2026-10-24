import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  aside?: ReactNode // Texto o acción a la derecha del título
  children: ReactNode
}

function Card({ title, aside, children }: CardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      {(title || aside) && (
        <header className="flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {aside && <div className="text-[13px] text-subtle">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export default Card
