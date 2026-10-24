import type { Negocio } from '../services/negocioService'

interface BusinessBrandProps {
  negocio: Negocio
}

// Cabecera del sidebar para los usuarios de una empresa: inicial y nombre del negocio.
function BusinessBrand({ negocio }: BusinessBrandProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-primary text-base font-bold text-white">
        {negocio.nombre.trim()[0]?.toUpperCase()}
      </div>
      <span className="min-w-0 truncate text-base leading-tight font-bold">{negocio.nombre}</span>
    </div>
  )
}

export default BusinessBrand
