import { listarReposicion, type FiltrosReposicion } from '../services/compraService'
import { useApiQuery } from './useApiQuery'

// Días de ventas que considera la compra sugerida
export const DIAS_VENTAS_REPOSICION = 7

export function useRestock(filtros: Omit<FiltrosReposicion, 'dias'>, recargarCon?: number) {
  const { respuesta, ...estado } = useApiQuery(listarReposicion, { ...filtros, dias: DIAS_VENTAS_REPOSICION }, recargarCon)

  return {
    items: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    ...estado,
  }
}
