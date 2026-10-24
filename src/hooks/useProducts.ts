import { listarProductos, type FiltrosProducto } from '../services/productoService'
import { useApiQuery } from './useApiQuery'

export function useProducts(filtros: FiltrosProducto) {
  const { respuesta, ...estado } = useApiQuery(listarProductos, filtros)

  return {
    productos: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    resumenCatalogo: respuesta?.resumenCatalogo,
    ...estado,
  }
}
