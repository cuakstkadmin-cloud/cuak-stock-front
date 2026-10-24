import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../components/Button'
import Pagination from '../components/Pagination'
import PeriodTabs from '../components/PeriodTabs'
import StatTile from '../components/StatTile'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useSales } from '../hooks/useSales'
import type { Venta } from '../services/ventaService'
import { formatearHora, formatearMoneda, formatearPorcentaje, nombreAutor, plural } from '../utils/format'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import {
  columnaMomento,
  descripcionDe,
  formateadorMomento,
  PERIODO_POR_DEFECTO,
  rangoDe,
  type Periodo,
} from '../utils/periodos'
import { gananciaClass } from '../utils/styles'
import RegisterSaleModal from './RegisterSaleModal'
import SaleDetailModal from './SaleDetailModal'

const thClass = 'px-3 py-3 font-medium first:pl-5 last:pr-5'
const tdClass = 'px-3 py-3.5 first:pl-5 last:pr-5'

function SalesPage() {
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)

  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_POR_DEFECTO)
  const [pagina, setPagina] = useState(1)
  const { ventas, paginacion, resumen, cargando, error, recargar } = useSales({ ...rangoDe(periodo), pagina })

  const [registrando, setRegistrando] = useState(false)
  const [detalle, setDetalle] = useState<Venta | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

  function cambiarPeriodo(nuevo: Periodo) {
    setPeriodo(nuevo)
    setPagina(1)
  }

  const formatearMomento = formateadorMomento(periodo)
  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Ventas</h1>
        <PeriodTabs value={periodo} onChange={cambiarPeriodo} />
      </header>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap gap-x-16 gap-y-4">
          <StatTile
            label="Ventas del periodo"
            value={resumen ? moneyOf(resumen.totalVentas) : '—'}
            caption={resumen && plural(resumen.cantidadVentas, 'venta', 'ventas')}
          />
          <StatTile
            label="Ganancia bruta del periodo"
            value={resumen ? moneyOf(resumen.gananciaBruta) : '—'}
            valueClass={resumen ? gananciaClass(resumen.gananciaBruta) : undefined}
            caption={resumen && resumen.totalVentas > 0 ? `Margen ${formatearPorcentaje(resumen.gananciaBruta / resumen.totalVentas)}` : undefined}
          />
        </div>
        <Button size="lg" onClick={() => setRegistrando(true)}>
          <Plus className="size-5" />
          Registrar venta
        </Button>
      </section>

      <section className="rounded-2xl border border-line bg-white">
        <h2 className="px-5 pt-5 pb-2 text-base font-bold">Historial</h2>

        {error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-muted">{error}</p>
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-subtle">
                  <th className={thClass}>{columnaMomento(periodo)}</th>
                  <th className={thClass}>Productos</th>
                  <th className={`${thClass} text-right`}>Cantidad</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={`${thClass} text-right`}>Ganancia bruta</th>
                  <th className={thClass}>Registró</th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                {cargaInicial || ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted">
                      {cargaInicial ? 'Cargando…' : `No hay ventas ${descripcionDe(periodo)}.`}
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta) => (
                    <tr
                      key={venta.id}
                      tabIndex={0}
                      aria-label={`Ver detalle de la venta de las ${formatearHora(venta.fecha)}`}
                      onClick={() => setDetalle(venta)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setDetalle(venta)
                        }
                      }}
                      className="cursor-pointer border-b border-line transition last:border-0 hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none"
                    >
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatearMomento(venta.fecha)}</td>
                      <td className={`${tdClass} max-w-[320px] truncate font-semibold`}>
                        {venta.detalle.map((linea) => linea.producto?.nombre ?? '—').join(', ')}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>
                        {venta.detalle.reduce((suma, linea) => suma + linea.cantidad, 0)}
                      </td>
                      <td className={`${tdClass} text-right font-bold tabular-nums`}>{moneyOf(venta.totalVenta)}</td>
                      <td className={`${tdClass} text-right font-semibold tabular-nums ${gananciaClass(venta.gananciaBruta)}`}>
                        {moneyOf(venta.gananciaBruta)}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{nombreAutor(venta.usuario)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3 text-[13px] text-subtle">
          <p>
            {paginacion &&
              `Mostrando ${ventas.length} de ${plural(paginacion.total, 'venta', 'ventas')} ${descripcionDe(periodo)}`}
          </p>
          {paginacion && <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />}
        </div>
      </section>

      {registrando && (
        <RegisterSaleModal
          moneda={moneda}
          onClose={() => setRegistrando(false)}
          onRegistrada={(venta) => {
            setRegistrando(false)
            setToast({ mensaje: `Venta registrada por ${moneyOf(venta.totalVenta)}.` })
            recargar()
          }}
        />
      )}

      {detalle && (
        <SaleDetailModal
          venta={detalle}
          moneda={moneda}
          onClose={() => setDetalle(null)}
          onAnulada={() => {
            setDetalle(null)
            setToast({ mensaje: 'Venta anulada. El stock volvió al inventario.' })
            recargar()
          }}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default SalesPage
