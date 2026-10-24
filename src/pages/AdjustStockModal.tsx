import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import TextField from '../components/TextField'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { ajustarStock } from '../services/inventarioService'
import type { Producto } from '../services/productoService'

export type TipoAjuste = 'entrada' | 'salida'

interface AdjustStockModalProps {
  producto: Producto
  tipo: TipoAjuste
  onClose: () => void
  onGuardado: () => void
}

const FORM_ID = 'adjust-stock-form'

const TEXTOS: Record<TipoAjuste, { titulo: string; boton: string; signo: 1 | -1 }> = {
  entrada: { titulo: 'Registrar entrada', boton: 'Registrar entrada', signo: 1 },
  salida: { titulo: 'Registrar salida', boton: 'Registrar salida', signo: -1 },
}

function AdjustStockModal({ producto, tipo, onClose, onGuardado }: AdjustStockModalProps) {
  const [texto, setTexto] = useState('')
  const guardar = useAsyncAction(ajustarStock)
  const { titulo, boton, signo } = TEXTOS[tipo]

  const cantidad = Number(texto)
  const resultante = producto.stockActual + signo * cantidad
  const error =
    texto === ''
      ? null
      : !Number.isInteger(cantidad) || cantidad <= 0
        ? 'Escribe una cantidad entera mayor que 0.'
        : resultante < 0
          ? `Solo hay ${producto.stockActual} en stock.`
          : null

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (texto === '' || error) return
    const resultado = await guardar.ejecutar(producto.id, signo * cantidad)
    if (resultado.ok) onGuardado()
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  return (
    <Modal
      title={titulo}
      size="sm"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando || texto === '' || error !== null}>
            {guardar.cargando ? 'Guardando…' : boton}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          id="cantidad"
          label="Cantidad"
          type="number"
          min={1}
          step={1}
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <p className="text-sm text-muted tabular-nums">
          Stock: {producto.stockActual} → <strong className="text-ink">{error || texto === '' ? '—' : resultante}</strong>
        </p>
        {(error ?? guardar.error) && <Alert>{error ?? guardar.error}</Alert>}
      </form>
    </Modal>
  )
}

export default AdjustStockModal
