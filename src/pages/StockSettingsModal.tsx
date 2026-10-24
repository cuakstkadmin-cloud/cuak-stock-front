import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import TextField from '../components/TextField'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { actualizarProducto, type Producto } from '../services/productoService'

interface StockSettingsModalProps {
  producto: Producto
  onClose: () => void
  onGuardado: (aviso: ToastData) => void
}

const FORM_ID = 'stock-settings-form'

// Configuración de stock de un producto (lado Inventario). La ficha del producto se edita en el catálogo.
function StockSettingsModal({ producto, onClose, onGuardado }: StockSettingsModalProps) {
  const [stockMinimo, setStockMinimo] = useState(String(producto.stockMinimo))
  const valor = Number(stockMinimo)
  const error = stockMinimo.trim() === '' || !Number.isInteger(valor) || valor < 0 ? 'Escribe un número entero de 0 o más.' : null

  const guardar = useAsyncAction(() => actualizarProducto(producto.id, { stockMinimo: valor }))

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (error) return
    const resultado = await guardar.ejecutar()
    if (resultado.ok) onGuardado({ mensaje: `Stock mínimo de ${producto.nombre}: ${valor}.` })
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  return (
    <Modal
      title="Configurar stock"
      description={producto.nombre}
      size="sm"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando || error !== null}>
            {guardar.cargando ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          id="stockMinimo"
          label="Stock mínimo"
          type="number"
          min={0}
          step={1}
          autoFocus
          value={stockMinimo}
          onChange={(e) => setStockMinimo(e.target.value)}
        />
        <p className="text-sm text-muted">
          Hay <strong className="text-ink tabular-nums">{producto.stockActual}</strong> en stock. Cuando quede en el mínimo o menos,
          aparecerá en Compras como producto a reponer.
        </p>
        {stockMinimo.trim() !== '' && error && <Alert>{error}</Alert>}
        {guardar.error && <Alert>{guardar.error}</Alert>}
      </form>
    </Modal>
  )
}

export default StockSettingsModal
