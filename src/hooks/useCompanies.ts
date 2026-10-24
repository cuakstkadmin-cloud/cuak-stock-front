import { listarNegocios, type FiltrosNegocio } from '../services/negocioService'
import { useApiQuery } from './useApiQuery'

export function useCompanies(filtros: FiltrosNegocio) {
  const { respuesta, ...estado } = useApiQuery(listarNegocios, filtros)

  return {
    negocios: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    ...estado,
  }
}
