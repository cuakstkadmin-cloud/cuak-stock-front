interface ComingSoonProps {
  title: string
  description: string
}

// Marcador para los módulos que todavía no están construidos.
function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center text-muted">
        {description}
      </div>
    </div>
  )
}

export default ComingSoon
