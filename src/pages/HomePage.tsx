import { lazy, Suspense, useState } from 'react'
import { CircleMinus, Sparkles, TrendingDown, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react'
import AttentionItem, { type TonoAtencion } from '../components/AttentionItem'
import Card from '../components/Card'
import PeriodTabs from '../components/PeriodTabs'
import RankedList from '../components/RankedList'
import StatTile from '../components/StatTile'
import Toast, { type ToastData } from '../components/Toast'
import Trend from '../components/Trend'
import { useAppContext } from '../hooks/useAppContext'
import { useDashboard } from '../hooks/useDashboard'
import type { ResumenProductos } from '../services/productoService'
import type { ProductoTop, ResumenVentas } from '../services/ventaService'
import { coloresDeSerie } from '../utils/colors'
import { formatearFechaCompleta, formatearMoneda, formatearMonedaCompacta, formatearPorcentaje, plural } from '../utils/format'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import { agrupacionDe, etiquetaTramo, PERIODO_POR_DEFECTO, type Periodo } from '../utils/periodos'
import { RUTAS } from '../utils/routes'
import { gananciaClass } from '../utils/styles'

// Desde cuánto cambio vale la pena avisar
const UMBRAL_TENDENCIA = 0.1 // 10 % en las unidades del producto más vendido
const UMBRAL_MARGEN = 0.01 // 1 punto de margen

// Chart.js pesa: se descarga solo al entrar a Inicio, no con el resto de la app
const BarChart = lazy(() => import('../components/BarChart'))

const AVISO_IA: ToastData = { mensaje: 'El asistente de IA está en mantenimiento. Pronto estará disponible.', tipo: 'aviso' }

interface Aviso {
  id: string
  icon: LucideIcon
  tono: TonoAtencion
  titulo: string
  accion: string
  to: string
}

const margenDe = (resumen: ResumenVentas) => (resumen.totalVentas > 0 ? resumen.gananciaBruta / resumen.totalVentas : null)

// Variación relativa, o null si no hay base para comparar
const variacion = (actual: number, anterior: number) => (anterior > 0 ? (actual - anterior) / anterior : null)

// Lo que merece atención en el periodo, en orden de urgencia
function armarAvisos(
  stock: ResumenProductos | undefined,
  masVendido: ProductoTop | undefined,
  resumen: ResumenVentas | undefined,
  resumenAnterior: ResumenVentas | undefined,
): Aviso[] {
  const avisos: Aviso[] = []

  if (stock && stock.StockBajo > 0) {
    avisos.push({
      id: 'stock-bajo',
      icon: TriangleAlert,
      tono: 'aviso',
      titulo: `${stock.StockBajo === 1 ? '1 producto tiene' : `${stock.StockBajo} productos tienen`} stock bajo`,
      accion: 'Ver qué comprar',
      to: RUTAS.compras,
    })
  }
  if (stock && stock.Agotado > 0) {
    avisos.push({
      id: 'agotados',
      icon: CircleMinus,
      tono: 'peligro',
      titulo: `${stock.Agotado === 1 ? '1 producto está agotado' : `${stock.Agotado} productos están agotados`}`,
      accion: 'Revisar inventario',
      to: RUTAS.inventario,
    })
  }

  const cambioTop = masVendido ? variacion(masVendido.unidades, masVendido.unidadesAnterior) : null
  if (masVendido && cambioTop !== null && Math.abs(cambioTop) >= UMBRAL_TENDENCIA) {
    const sube = cambioTop > 0
    avisos.push({
      id: 'mas-vendido',
      icon: sube ? TrendingUp : TrendingDown,
      tono: sube ? 'exito' : 'aviso',
      titulo: `${masVendido.producto.nombre}, tu más vendido, ${sube ? 'subió' : 'bajó'} ${formatearPorcentaje(Math.abs(cambioTop))} frente al periodo anterior`,
      accion: 'Ver ventas',
      to: RUTAS.ventas,
    })
  }

  const margen = resumen ? margenDe(resumen) : null
  const margenAnterior = resumenAnterior ? margenDe(resumenAnterior) : null
  if (margen !== null && margenAnterior !== null && margenAnterior - margen >= UMBRAL_MARGEN) {
    avisos.push({
      id: 'margen',
      icon: TrendingDown,
      tono: 'aviso',
      titulo: `Tu margen bajó de ${formatearPorcentaje(margenAnterior)} a ${formatearPorcentaje(margen)}`,
      accion: 'Revisar precios y costos',
      to: RUTAS.inventario,
    })
  }

  return avisos
}

function HomePage() {
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)
  const tickOf = (valor: number) => formatearMonedaCompacta(valor, moneda)

  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_POR_DEFECTO)
  const datos = useDashboard(periodo)
  const { resumen, resumenAnterior } = datos

  // Se calculan una vez: dependen del tema, no de los datos
  const [colores] = useState(coloresDeSerie)
  const [verTabla, setVerTabla] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const agrupacion = agrupacionDe(periodo)
  const etiquetas = datos.serie.map((punto, i) => etiquetaTramo(punto.inicio, agrupacion, i))
  const series = [
    { label: 'Ventas', data: datos.serie.map((punto) => punto.totalVentas), color: colores.claro },
    { label: 'Ganancia bruta', data: datos.serie.map((punto) => punto.gananciaBruta), color: colores.oscuro },
  ]

  const cambioVentas = resumen && resumenAnterior ? variacion(resumen.totalVentas, resumenAnterior.totalVentas) : null
  const margen = resumen ? margenDe(resumen) : null
  const margenAnterior = resumenAnterior ? margenDe(resumenAnterior) : null
  const avisos = armarAvisos(datos.stock, datos.masVendidos[0], resumen, resumenAnterior)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">{formatearFechaCompleta(new Date())}</span>
          <h1 className="text-4xl font-bold">{negocio?.nombre ?? 'Inicio'}</h1>
        </div>
        <PeriodTabs value={periodo} onChange={setPeriodo} />
      </header>

      {/* Cifras del periodo */}
      <section className="grid gap-5 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line lg:[&>*]:px-6 lg:[&>*:first-child]:pl-0">
        <StatTile
          label="Ventas"
          value={resumen ? moneyOf(resumen.totalVentas) : '—'}
          caption={
            cambioVentas !== null && (
              <Trend sube={cambioVentas >= 0} texto={`${formatearPorcentaje(Math.abs(cambioVentas))} vs. periodo anterior`} />
            )
          }
        />
        <StatTile label="Costo de lo vendido" value={resumen ? moneyOf(resumen.costoTotal) : '—'} />
        <StatTile
          label="Ganancia bruta"
          value={resumen ? moneyOf(resumen.gananciaBruta) : '—'}
          valueClass={resumen ? gananciaClass(resumen.gananciaBruta) : undefined}
        />
        <StatTile
          label="Margen"
          value={margen !== null ? formatearPorcentaje(margen) : '—'}
          caption={
            margen !== null &&
            margenAnterior !== null &&
            margen !== margenAnterior && <Trend sube={margen > margenAnterior} texto={`antes ${formatearPorcentaje(margenAnterior)}`} />
          }
        />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="flex flex-col gap-5">
          {/* Ventas vs. ganancia por tramo */}
          <Card
            title="Ventas vs. Ganancia bruta"
            aside={
              <div className="flex flex-wrap items-center gap-4">
                {series.map((serie) => (
                  <span key={serie.label} className="flex items-center gap-1.5 text-[13px] text-muted">
                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: serie.color }} aria-hidden="true" />
                    {serie.label}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setVerTabla(!verTabla)}
                  className="cursor-pointer text-[13px] font-semibold text-primary hover:underline"
                >
                  {verTabla ? 'Ver gráfico' : 'Ver como tabla'}
                </button>
              </div>
            }
          >
            {datos.errorSerie ? (
              <p className="py-10 text-center text-sm text-muted">{datos.errorSerie}</p>
            ) : datos.serie.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">{datos.cargandoSerie ? 'Cargando…' : 'Sin ventas en el periodo.'}</p>
            ) : verTabla ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[13px] text-subtle">
                    <th className="pb-2 font-medium">Tramo</th>
                    {series.map((serie) => (
                      <th key={serie.label} className="pb-2 text-right font-medium">
                        {serie.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {etiquetas.map((etiqueta, i) => (
                    <tr key={etiqueta} className="border-t border-line">
                      <td className="py-2">{etiqueta}</td>
                      {series.map((serie) => (
                        <td key={serie.label} className="py-2 text-right tabular-nums">
                          {moneyOf(serie.data[i])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Suspense fallback={<div className="h-64" />}>
                <BarChart
                  labels={etiquetas}
                  series={series}
                  formatValue={moneyOf}
                  formatTick={tickOf}
                  ariaLabel="Gráfico de barras de ventas y ganancia bruta por tramo del periodo"
                />
              </Suspense>
            )}
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card title="Productos más vendidos">
              <RankedList
                items={datos.masVendidos.map((item) => ({
                  id: item.producto.id,
                  label: item.producto.nombre,
                  valor: item.unidades,
                  valorTexto: `${item.unidades} uds`,
                }))}
                barClass="bg-muted"
                vacio="Sin ventas en el periodo."
              />
            </Card>
            <Card title="Más ganancia bruta">
              <RankedList
                items={datos.masGanancia.map((item) => ({
                  id: item.producto.id,
                  label: item.producto.nombre,
                  valor: Math.max(item.gananciaBruta, 0),
                  valorTexto: moneyOf(item.gananciaBruta),
                }))}
                barClass="bg-primary"
                valorClass="text-primary"
                vacio="Sin ventas en el periodo."
              />
            </Card>
          </div>
        </div>

        {/* Lo que requiere atención */}
        <Card title="Atención" aside={avisos.length > 0 ? plural(avisos.length, 'pendiente', 'pendientes') : undefined}>
          {avisos.length === 0 ? (
            <p className="text-sm text-muted">Todo en orden por ahora.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {avisos.map(({ id, ...aviso }) => (
                <AttentionItem key={id} {...aviso} />
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setToast(AVISO_IA)}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-semibold transition hover:bg-tile"
          >
            <Sparkles className="size-4" />
            Preguntar a la IA
            <span className="text-xs font-normal text-subtle">· Próximamente</span>
          </button>
        </Card>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default HomePage
