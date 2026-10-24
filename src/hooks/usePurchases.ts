import { listarCompras, type FiltrosCompra } from '../services/compraService'
import { useApiQuery } from './useApiQuery'

export function usePurchases(filtros: FiltrosCompra) {
  const { respuesta, ...estado } = useApiQuery(listarCompras, filtros)

  return {
    compras: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    ...estado,
  }
}
