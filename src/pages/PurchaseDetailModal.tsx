import { useState } from 'react'
import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { anularCompra, recibirCompra, type Compra } from '../services/compraService'
import { infoEstadoCompra } from '../utils/estadosCompra'
import { formatearFechaLarga, formatearHora, formatearMoneda, nombreAutor, plural } from '../utils/format'

interface PurchaseDetailModalProps {
  compra: Compra
  moneda: string
  onClose: () => void
  onCambio: (aviso: ToastData) => void // Tras recibirla o anularla
}

const thClass = 'pb-2 text-[13px] font-medium text-subtle'

// Lo que se compró en una compra: una fila del historial agrupa todos sus productos.
function PurchaseDetailModal({ compra, moneda, onClose, onCambio }: PurchaseDetailModalProps) {
  const [confirmando, setConfirmando] = useState(false)
  const anular = useAsyncAction(() => anularCompra(compra.id))
  const recibir = useAsyncAction(() => recibirCompra(compra.id))
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)
  const unidades = compra.detalle.reduce((suma, linea) => suma + linea.cantidad, 0)
  const recibida = compra.estado === 'Recibida'
  const estado = infoEstadoCompra(compra.estado)

  async function confirmarAnulacion() {
    const resultado = await anular.ejecutar()
    if (resultado.ok) onCambio({ mensaje: recibida ? 'Compra anulada. Se restó su stock del inventario.' : 'Compra anulada.' })
  }

  async function marcarRecibida() {
    const resultado = await recibir.ejecutar()
    if (resultado.ok) onCambio({ mensaje: `Compra recibida. El inventario sumó ${plural(unidades, 'unidad', 'unidades')}.` })
  }

  if (confirmando) {
    return (
      <ConfirmDialog
        title="Anular compra"
        message={
          recibida
            ? `Se restarán ${plural(unidades, 'unidad', 'unidades')} del inventario y la compra saldrá del historial. No se puede deshacer.`
            : 'La compra saldrá del historial. No se puede deshacer.'
        }
        confirmLabel="Anular compra"
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
      title="Detalle de la compra"
      onClose={onClose}
      footerAside={
        <Button variant="dangerOutline" size="sm" onClick={() => setConfirmando(true)} disabled={recibir.cargando}>
          Anular compra
        </Button>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={recibir.cargando}>
            Cerrar
          </Button>
          {/* Una compra pendiente todavía no sumó stock */}
          {!recibida && (
            <Button onClick={marcarRecibida} disabled={recibir.cargando}>
              {recibir.cargando ? 'Guardando…' : 'Marcar como recibida'}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-2 text-sm text-muted">
          <span className="flex flex-col">
            <span>
              {formatearFechaLarga(compra.fecha)} · {formatearHora(compra.fecha)}
            </span>
            <span className="text-[13px] text-subtle">
              {compra.proveedor ? `Proveedor: ${compra.proveedor} · ` : ''}Registrada por {nombreAutor(compra.usuario)}
            </span>
          </span>
          <Badge variant={estado.variant} dot>
            {estado.label}
          </Badge>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className={thClass}>Producto</th>
              <th className={`${thClass} text-right`}>Cant.</th>
              <th className={`${thClass} text-right`}>Costo</th>
              <th className={`${thClass} text-right`}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {compra.detalle.map((linea) => (
              <tr key={linea.id} className="border-t border-line">
                <td className="py-2.5 font-semibold">{linea.producto?.nombre ?? '—'}</td>
                <td className="py-2.5 text-right tabular-nums">{linea.cantidad}</td>
                <td className="py-2.5 text-right text-muted tabular-nums">{moneyOf(linea.costoUnitario)}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{moneyOf(linea.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-surface px-4 py-3 text-sm">
          <dt className="text-muted">Unidades</dt>
          <dd className="text-right tabular-nums">{unidades}</dd>
          <dt className="text-muted">Total de la compra</dt>
          <dd className="text-right text-base font-bold tabular-nums">{moneyOf(compra.costoTotal)}</dd>
        </dl>

        {recibir.error && <Alert>{recibir.error}</Alert>}
      </div>
    </Modal>
  )
}

export default PurchaseDetailModal
