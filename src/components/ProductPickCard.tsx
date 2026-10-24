interface ProductPickCardProps {
  nombre: string
  precio: string // Ya formateado en la moneda del negocio
  cantidad: number // Cuántas unidades ya están en la venta
  agotado: boolean // Sin stock, o con todo el stock ya agregado
  onClick: () => void
}

// Tarjeta de la grilla de productos: tocarla agrega una unidad.
function ProductPickCard({ nombre, precio, cantidad, agotado, onClick }: ProductPickCardProps) {
  const elegido = cantidad > 0

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={agotado}
      aria-label={`Agregar ${nombre}`}
      className={`relative flex min-h-[62px] cursor-pointer flex-col items-start justify-center rounded-xl border bg-white px-3.5 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        elegido ? 'border-primary ring-1 ring-primary' : 'border-line hover:border-subtle/50'
      }`}
    >
      <span className="pr-6 text-sm font-semibold">{nombre}</span>
      <span className="text-[13px] text-subtle">{agotado && !elegido ? 'Agotado' : precio}</span>
      {elegido && (
        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {cantidad}
        </span>
      )}
    </button>
  )
}

export default ProductPickCard
