import { listarProductos, type Producto } from '../services/productoService'
import { useApiQuery } from './useApiQuery'

// Cuántas coincidencias se muestran al buscar
export const RESULTADOS_BUSQUEDA = 5

// Sin texto no consulta al backend.
const consultar = ({ nombre }: { nombre: string }): Promise<Producto[]> =>
  nombre
    ? listarProductos({ nombre, activo: 'true', porPagina: RESULTADOS_BUSQUEDA }).then((pagina) => pagina.datos)
    : Promise.resolve([])

export function useProductSearch(nombre: string) {
  const { respuesta, cargando, error } = useApiQuery(consultar, { nombre })

  return { resultados: respuesta ?? [], cargando, error }
}
