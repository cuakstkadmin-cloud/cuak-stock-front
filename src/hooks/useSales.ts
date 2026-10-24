import { listarVentas, type FiltrosVenta } from '../services/ventaService'
import { useApiQuery } from './useApiQuery'

export function useSales(filtros: FiltrosVenta) {
  const { respuesta, ...estado } = useApiQuery(listarVentas, filtros)

  return {
    ventas: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    ...estado,
  }
}
