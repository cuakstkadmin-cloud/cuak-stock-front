import { tonoDeCategoria } from '../utils/coloresCategoria'
import { iniciales } from '../utils/format'
import { urlImagen } from '../utils/imagenes'

interface ProductCoverProps {
  nombre: string
  categoria: string
  imagenUrl: string | null
  activo: boolean
  className?: string // Tamaño y bordes los decide quien la usa
}

// Imagen del producto o, si no tiene, sus iniciales sobre el color de su categoría.
function ProductCover({ nombre, categoria, imagenUrl, activo, className = '' }: ProductCoverProps) {
  const url = urlImagen(imagenUrl)

  if (url) {
    return <img src={url} alt={nombre} className={`object-cover ${activo ? '' : 'grayscale'} ${className}`} />
  }

  const tono = tonoDeCategoria(categoria, activo)
  return (
    <div className={`flex items-center justify-center ${tono.fondo} ${className}`} aria-hidden="true">
      <span className={`flex size-14 items-center justify-center rounded-full bg-white/70 text-lg font-bold ${tono.texto}`}>
        {iniciales(nombre)}
      </span>
    </div>
  )
}

export default ProductCover
