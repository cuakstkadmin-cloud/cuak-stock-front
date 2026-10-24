import { listarProductos } from '../services/productoService'
import { obtenerResumenVentas, obtenerSerieVentas, obtenerTopProductos } from '../services/ventaService'
import { agrupacionDe, rangoAnterior, rangoDe, ZONA_HORARIA, type Periodo } from '../utils/periodos'
import { useApiQuery } from './useApiQuery'

// Cuántos productos muestran los rankings de Inicio
export const TOP_PRODUCTOS = 3

// Solo interesa el resumen de stock, no los productos
const consultarStock = () => listarProductos({ activo: 'true', porPagina: 1 }).then((pagina) => pagina.resumen)

// Todo lo que muestra Inicio para un periodo. Cada consulta va por separado,
// así una que falle no deja la pantalla entera vacía.
export function useDashboard(periodo: Periodo) {
  const rango = rangoDe(periodo)

  const actual = useApiQuery(obtenerResumenVentas, rango)
  const anterior = useApiQuery(obtenerResumenVentas, rangoAnterior(periodo))
  const serie = useApiQuery(obtenerSerieVentas, { ...rango, agrupacion: agrupacionDe(periodo), zonaHoraria: ZONA_HORARIA })
  const masVendidos = useApiQuery(obtenerTopProductos, { ...rango, orden: 'unidades', limite: TOP_PRODUCTOS })
  const masGanancia = useApiQuery(obtenerTopProductos, { ...rango, orden: 'ganancia', limite: TOP_PRODUCTOS })
  const stock = useApiQuery(consultarStock, {})

  return {
    resumen: actual.respuesta,
    resumenAnterior: anterior.respuesta,
    serie: serie.respuesta ?? [],
    cargandoSerie: serie.cargando,
    errorSerie: serie.error,
    masVendidos: masVendidos.respuesta ?? [],
    masGanancia: masGanancia.respuesta ?? [],
    stock: stock.respuesta,
  }
}
