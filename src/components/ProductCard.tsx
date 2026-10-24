import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { caracteristicasDe, type Producto } from '../services/productoService'
import ProductCover from './ProductCover'
import Switch from './Switch'

interface ProductCardProps {
  producto: Producto
  precio: string // Ya formateado en la moneda del negocio
  detalleUrl: string
  cambiandoActivo: boolean
  onCambiarActivo: (activo: boolean) => void
  onEditar: () => void
  onEliminar: () => void
}

const iconButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink'

// Tarjeta del catálogo: portada, datos, características, precio y acciones.
function ProductCard({ producto, precio, detalleUrl, cambiandoActivo, onCambiarActivo, onEditar, onEliminar }: ProductCardProps) {
  const subtitulo = [producto.categoria, producto.marca].filter(Boolean).join(' · ')
  const caracteristicas = caracteristicasDe(producto)

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-line ${producto.activo ? 'bg-white' : 'bg-surface/60'}`}
    >
      <div className="relative">
        <ProductCover
          nombre={producto.nombre}
          categoria={producto.categoria}
          imagenUrl={producto.imagenUrl}
          activo={producto.activo}
          className="h-36 w-full"
        />
        {producto.codigo && (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-muted">
            {producto.codigo}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col">
          <h3 className={`truncate font-bold ${producto.activo ? '' : 'text-muted'}`}>{producto.nombre}</h3>
          {subtitulo && <span className="truncate text-xs text-subtle">{subtitulo}</span>}
        </div>
        {caracteristicas.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {caracteristicas.map((caracteristica) => (
              <li key={caracteristica} className="rounded-full bg-tile px-2.5 py-0.5 text-[11px] font-medium text-muted">
                {caracteristica}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto font-bold tabular-nums">{precio}</span>
      </div>

      <footer className="flex items-center gap-2 border-t border-line px-4 py-3">
        <Switch
          checked={producto.activo}
          onChange={onCambiarActivo}
          disabled={cambiandoActivo}
          label={producto.activo ? `Sacar ${producto.nombre} del inventario` : `Activar ${producto.nombre}`}
        />
        <span className={`text-xs font-semibold ${producto.activo ? 'text-primary' : 'text-subtle'}`}>
          {producto.activo ? 'En inventario' : 'Inactivo'}
        </span>
        <div className="ml-auto flex items-center">
          <Link to={detalleUrl} aria-label={`Ver ${producto.nombre}`} className={iconButtonClass}>
            <Eye className="size-4" />
          </Link>
          <button type="button" aria-label={`Editar ${producto.nombre}`} onClick={onEditar} className={iconButtonClass}>
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Eliminar ${producto.nombre}`}
            onClick={onEliminar}
            className={`${iconButtonClass} hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </footer>
    </article>
  )
}

export default ProductCard
