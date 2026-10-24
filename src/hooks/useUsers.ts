import { listarUsuarios, type FiltrosUsuario } from '../services/usuarioService'
import { useApiQuery } from './useApiQuery'

export function useUsers(filtros: FiltrosUsuario) {
  const { respuesta, ...estado } = useApiQuery(listarUsuarios, filtros)

  return {
    usuarios: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    ...estado,
  }
}
