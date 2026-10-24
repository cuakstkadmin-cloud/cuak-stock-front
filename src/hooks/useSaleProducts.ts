import { listarMasVendidos, listarProductos } from '../services/productoService'
import { useApiQuery } from './useApiQuery'

// Cuántos productos muestra la grilla del modal de venta
export const PRODUCTOS_EN_GRILLA = 8

// Sin búsqueda: los más vendidos. Con búsqueda: coincidencias por nombre entre los activos.
const consultar = ({ nombre }: { nombre: string }) =>
  nombre
    ? listarProductos({ nombre, activo: 'true', porPagina: PRODUCTOS_EN_GRILLA }).then((pagina) => pagina.datos)
    : listarMasVendidos(PRODUCTOS_EN_GRILLA)

export function useSaleProducts(nombre: string) {
  const { respuesta, cargando, error } = useApiQuery(consultar, { nombre })

  return { productos: respuesta ?? [], cargando, error }
}
