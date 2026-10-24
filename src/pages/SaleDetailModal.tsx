import { useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { anularVenta, type Venta } from '../services/ventaService'
import { formatearFechaLarga, formatearHora, formatearMoneda, formatearPorcentaje, nombreAutor, plural } from '../utils/format'
import { gananciaClass } from '../utils/styles'

interface SaleDetailModalProps {
  venta: Venta
  moneda: string
  onClose: () => void
  onAnulada: () => void
}

const thClass = 'pb-2 text-[13px] font-medium text-subtle'

// Lo que se vendió en una venta: una fila del historial agrupa todos sus productos.
function SaleDetailModal({ venta, moneda, onClose, onAnulada }: SaleDetailModalProps) {
  const [confirmando, setConfirmando] = useState(false)
  const anular = useAsyncAction(() => anularVenta(venta.id))
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)
  const unidades = venta.detalle.reduce((suma, linea) => suma + linea.cantidad, 0)

  async function confirmarAnulacion() {
    const resultado = await anular.ejecutar()
    if (resultado.ok) onAnulada()
  }

  if (confirmando) {
    return (
      <ConfirmDialog
        title="Anular venta"
        message={`Se devolverán ${plural(unidades, 'unidad', 'unidades')} al inventario y la venta saldrá del historial. No se puede deshacer.`}
        confirmLabel="Anular venta"
        danger
        cargando={anular.cargando}
        error={anular.error}
        onConfirm={confirmarAnulacion}
        onClose={() => setConfirmando(false)}
      />
    )
  }

  return (
    <Modal
      title="Detalle de la venta"
      onClose={onClose}
      footerAside={
        <Button variant="dangerOutline" size="sm" onClick={() => setConfirmando(true)}>
          Anular venta
        </Button>
      }
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
          <span className="flex flex-col">
            <span>
              {formatearFechaLarga(venta.fecha)} · {formatearHora(venta.fecha)}
            </span>
            <span className="text-[13px] text-subtle">Registrada por {nombreAutor(venta.usuario)}</span>
          </span>
          {venta.metodoPago ? <Badge>{venta.metodoPago}</Badge> : <span className="text-subtle">Sin método de pago</span>}
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className={thClass}>Producto</th>
              <th className={`${thClass} text-right`}>Cant.</th>
              <th className={`${thClass} text-right`}>Precio</th>
              <th className={`${thClass} text-right`}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalle.map((linea) => (
              <tr key={linea.id} className="border-t border-line">
                <td className="py-2.5 font-semibold">{linea.producto?.nombre ?? '—'}</td>
                <td className="py-2.5 text-right tabular-nums">{linea.cantidad}</td>
                <td className="py-2.5 text-right text-muted tabular-nums">{moneyOf(linea.precioUnitario)}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{moneyOf(linea.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-surface px-4 py-3 text-sm">
          <dt className="text-muted">Total</dt>
          <dd className="text-right text-base font-bold tabular-nums">{moneyOf(venta.totalVenta)}</dd>
          <dt className="text-muted">Costo</dt>
          <dd className="text-right tabular-nums">{moneyOf(venta.costoTotal)}</dd>
          <dt className="text-muted">Ganancia bruta</dt>
          <dd className={`text-right font-bold tabular-nums ${gananciaClass(venta.gananciaBruta)}`}>
            {moneyOf(venta.gananciaBruta)}
            {venta.totalVenta > 0 && (
              <span className="ml-1.5 text-xs font-medium text-subtle">
                ({formatearPorcentaje(venta.gananciaBruta / venta.totalVenta)})
              </span>
            )}
          </dd>
        </dl>
      </div>
    </Modal>
  )
}

export default SaleDetailModal
