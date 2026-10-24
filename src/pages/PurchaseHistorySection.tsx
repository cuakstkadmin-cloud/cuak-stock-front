import { useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Pagination from '../components/Pagination'
import PeriodTabs from '../components/PeriodTabs'
import type { ToastData } from '../components/Toast'
import { usePurchases } from '../hooks/usePurchases'
import type { Compra } from '../services/compraService'
import { infoEstadoCompra } from '../utils/estadosCompra'
import { formatearHora, formatearMoneda, nombreAutor, plural } from '../utils/format'
import { columnaMomento, descripcionDe, formateadorMomento, PERIODO_POR_DEFECTO, rangoDe, type Periodo } from '../utils/periodos'
import PurchaseDetailModal from './PurchaseDetailModal'

interface PurchaseHistorySectionProps {
  moneda: string
  onCambio: (aviso: ToastData) => void // Tras recibir o anular una compra
}

const thClass = 'px-3 py-3 font-medium first:pl-5 last:pr-5'
const tdClass = 'px-3 py-3.5 first:pl-5 last:pr-5'

// Historial de compras agrupado: una fila por compra, con todos sus productos.
function PurchaseHistorySection({ moneda, onCambio }: PurchaseHistorySectionProps) {
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_POR_DEFECTO)
  const [pagina, setPagina] = useState(1)
  const { compras, paginacion, resumen, cargando, error, recargar } = usePurchases({ ...rangoDe(periodo), pagina })
  const [detalle, setDetalle] = useState<Compra | null>(null)

  function cambiarPeriodo(nuevo: Periodo) {
    setPeriodo(nuevo)
    setPagina(1)
  }

  const formatearMomento = formateadorMomento(periodo)
  const cargaInicial = cargando && !paginacion

  return (
    <section className="rounded-2xl border border-line bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex flex-col">
          <h2 className="text-base font-bold">Historial de compras</h2>
          {resumen && (
            <span className="text-[13px] text-subtle">
              {plural(resumen.cantidadCompras, 'compra', 'compras')} · {moneyOf(resumen.costoTotal)} ·{' '}
              {plural(resumen.unidades, 'unidad', 'unidades')}
            </span>
          )}
        </div>
        <PeriodTabs value={periodo} onChange={cambiarPeriodo} />
      </header>

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
                <th className={thClass}>Proveedor</th>
                <th className={thClass}>Productos</th>
                <th className={`${thClass} text-right`}>Cantidad</th>
                <th className={`${thClass} text-right`}>Total</th>
                <th className={thClass}>Estado</th>
                <th className={thClass}>Registró</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
              {cargaInicial || compras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    {cargaInicial ? 'Cargando…' : `No hay compras ${descripcionDe(periodo)}.`}
                  </td>
                </tr>
              ) : (
                compras.map((compra) => {
                  const estado = infoEstadoCompra(compra.estado)
                  return (
                    <tr
                      key={compra.id}
                      tabIndex={0}
                      aria-label={`Ver detalle de la compra de las ${formatearHora(compra.fecha)}`}
                      onClick={() => setDetalle(compra)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setDetalle(compra)
                        }
                      }}
                      className="cursor-pointer border-b border-line transition last:border-0 hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none"
                    >
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatearMomento(compra.fecha)}</td>
                      <td className={`${tdClass} text-muted`}>{compra.proveedor ?? '—'}</td>
                      <td className={`${tdClass} max-w-[260px] truncate font-semibold`}>
                        {compra.detalle.map((linea) => linea.producto?.nombre ?? '—').join(', ')}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>
                        {compra.detalle.reduce((suma, linea) => suma + linea.cantidad, 0)}
                      </td>
                      <td className={`${tdClass} text-right font-bold tabular-nums`}>{moneyOf(compra.costoTotal)}</td>
                      <td className={tdClass}>
                        <Badge variant={estado.variant} dot>
                          {estado.label}
                        </Badge>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{nombreAutor(compra.usuario)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3 text-[13px] text-subtle">
        <p>
          {paginacion && `Mostrando ${compras.length} de ${plural(paginacion.total, 'compra', 'compras')} ${descripcionDe(periodo)}`}
        </p>
        {paginacion && <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />}
      </div>

      {detalle && (
        <PurchaseDetailModal
          compra={detalle}
          moneda={moneda}
          onClose={() => setDetalle(null)}
          onCambio={(aviso) => {
            setDetalle(null)
            recargar()
            onCambio(aviso)
          }}
        />
      )}
    </section>
  )
}

export default PurchaseHistorySection
