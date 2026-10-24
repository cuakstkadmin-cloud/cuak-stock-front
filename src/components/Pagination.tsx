import Button from './Button'

interface PaginationProps {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

function Pagination({ pagina, totalPaginas, onChange }: PaginationProps) {
  if (totalPaginas <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
        Anterior
      </Button>
      <Button variant="secondary" size="sm" disabled={pagina >= totalPaginas} onClick={() => onChange(pagina + 1)}>
        Siguiente
      </Button>
    </div>
  )
}

export default Pagination
