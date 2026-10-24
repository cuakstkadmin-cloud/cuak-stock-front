import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useAsyncAction } from '../hooks/useAsyncAction'
import type { CambioStock } from '../hooks/useStockDraft'
import { ajustarStockEnLote } from '../services/inventarioService'
import { formatearCantidad, plural } from '../utils/format'

interface PendingChangesModalProps {
  cambios: CambioStock[]
  onFijar: (productoId: string, cantidad: number) => void
  onQuitar: (productoId: string) => void
  onClose: () => void
  onGuardado: (cantidadAjustes: number) => void
}

type Paso = 'revisar' | 'confirmar'

function esValido({ producto, cantidad }: CambioStock) {
  return Number.isInteger(cantidad) && cantidad !== 0 && producto.stockActual + cantidad >= 0
}

// Paso 1: revisar y editar los cambios. Paso 2: confirmarlos, ya sin poder editar.
function PendingChangesModal({ cambios, onFijar, onQuitar, onClose, onGuardado }: PendingChangesModalProps) {
  const [paso, setPaso] = useState<Paso>('revisar')
  const guardar = useAsyncAction(ajustarStockEnLote)
  const todosValidos = cambios.every(esValido)

  async function confirmar() {
    const resultado = await guardar.ejecutar(cambios.map(({ producto, cantidad }) => ({ productoId: producto.id, cantidad })))
    if (resultado.ok) onGuardado(cambios.length)
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  if (paso === 'confirmar') {
    return (
      <Modal
        title="Confirmar cambios"
        onClose={cerrar}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaso('revisar')} disabled={guardar.cargando}>
              Volver
            </Button>
            <Button onClick={confirmar} disabled={guardar.cargando}>
              {guardar.cargando ? 'Guardando…' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[15px] text-muted">
            Se {cambios.length === 1 ? 'registrará' : 'registrarán'} {plural(cambios.length, 'ajuste', 'ajustes')} de inventario.
            Revisa que todo esté bien antes de confirmar.
          </p>
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
            {cambios.map(({ producto, cantidad }) => (
              <li key={producto.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-semibold">{producto.nombre}</span>
                <span className="flex items-center gap-3 tabular-nums">
                  <span className={`font-bold ${cantidad > 0 ? 'text-primary' : 'text-red-600'}`}>
                    {formatearCantidad(cantidad)}
                  </span>
                  <span className="text-subtle">
                    {producto.stockActual} → {producto.stockActual + cantidad}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {guardar.error && <Alert>{guardar.error}</Alert>}
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title="Revisar cambios"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar}>
            Cancelar
          </Button>
          <Button onClick={() => setPaso('confirmar')} disabled={!todosValidos}>
            Aceptar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-muted">Puedes corregir la cantidad de cada producto o quitar el cambio.</p>
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {cambios.map((cambio) => (
            <ChangeRow key={cambio.producto.id} cambio={cambio} onFijar={onFijar} onQuitar={onQuitar} />
          ))}
        </ul>
      </div>
    </Modal>
  )
}

interface ChangeRowProps {
  cambio: CambioStock
  onFijar: (productoId: string, cantidad: number) => void
  onQuitar: (productoId: string) => void
}

function ChangeRow({ cambio, onFijar, onQuitar }: ChangeRowProps) {
  const { producto, cantidad } = cambio
  // Texto propio para poder borrar el campo o escribir "-" sin que se pierda el cambio
  const [texto, setTexto] = useState(String(cantidad))
  const resultante = producto.stockActual + cantidad
  const error = !esValido(cambio)
    ? resultante < 0
      ? 'Dejaría el stock en negativo.'
      : 'Escribe una cantidad entera distinta de 0.'
    : null

  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{producto.nombre}</span>
          <span className="text-xs text-subtle tabular-nums">
            Stock {producto.stockActual} → {Number.isFinite(resultante) ? resultante : '—'}
          </span>
        </div>
        <input
          type="number"
          step={1}
          aria-label={`Cantidad para ${producto.nombre}`}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            onFijar(producto.id, e.target.value.trim() === '' ? 0 : Number(e.target.value))
          }}
          className={`h-10 w-24 rounded-lg border bg-white px-3 text-right text-[15px] tabular-nums outline-none focus:ring-3 ${
            error ? 'border-red-300 focus:ring-red-100' : 'border-line focus:border-primary focus:ring-primary/15'
          }`}
        />
        <button
          type="button"
          aria-label={`Quitar el cambio de ${producto.nombre}`}
          onClick={() => onQuitar(producto.id)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </li>
  )
}

export default PendingChangesModal
