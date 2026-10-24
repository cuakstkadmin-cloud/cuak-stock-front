import { listarMovimientos } from '../services/inventarioService'
import { obtenerProducto } from '../services/productoService'
import { useApiQuery } from './useApiQuery'

// Funciones estables para useApiQuery: reciben un objeto de parámetros
const consultarProducto = ({ id }: { id: string }) => obtenerProducto(id)

export function useProductDetail(id: string, paginaMovimientos: number) {
  const producto = useApiQuery(consultarProducto, { id })
  const movimientos = useApiQuery(listarMovimientos, { productoId: id, pagina: paginaMovimientos })

  return {
    producto: producto.respuesta,
    cargandoProducto: producto.cargando,
    errorProducto: producto.error,
    movimientos: movimientos.respuesta?.datos ?? [],
    paginacionMovimientos: movimientos.respuesta?.paginacion,
    cargandoMovimientos: movimientos.cargando,
    errorMovimientos: movimientos.error,
    recargar: () => {
      producto.recargar()
      movimientos.recargar()
    },
  }
}
