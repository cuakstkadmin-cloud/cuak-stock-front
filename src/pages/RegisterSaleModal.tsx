import { useState } from 'react'
import { Package, Sparkles, X } from 'lucide-react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import ChipGroup from '../components/ChipGroup'
import Modal from '../components/Modal'
import ProductPickCard from '../components/ProductPickCard'
import QuantityInput from '../components/QuantityInput'
import SearchInput from '../components/SearchInput'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDebounce } from '../hooks/useDebounce'
import { useSaleCart } from '../hooks/useSaleCart'
import { useSaleProducts } from '../hooks/useSaleProducts'
import { METODOS_PAGO, registrarVenta, type MetodoPago, type Venta } from '../services/ventaService'
import { formatearCantidad, formatearMoneda, plural } from '../utils/format'
import { gananciaClass } from '../utils/styles'

interface RegisterSaleModalProps {
  moneda: string
  onClose: () => void
  onRegistrada: (venta: Venta) => void
}

function RegisterSaleModal({ moneda, onClose, onRegistrada }: RegisterSaleModalProps) {
  const [busqueda, setBusqueda] = useState('')
  const nombre = useDebounce(busqueda.trim())
  const grilla = useSaleProducts(nombre)
  const carrito = useSaleCart()
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null)

  const guardar = useAsyncAction(() =>
    registrarVenta({
      metodoPago,
      detalle: carrito.lineas.map(({ producto, cantidad }) => ({ productoId: producto.id, cantidad })),
    }),
  )

  async function confirmar() {
    const resultado = await guardar.ejecutar()
    if (resultado.ok) onRegistrada(resultado.valor)
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)
  const vacia = carrito.lineas.length === 0

  return (
    <Modal
      title="Registrar venta"
      size="lg"
      flush
      onClose={cerrar}
      footerAside={
        !vacia && (
          <span className="flex items-center gap-2">
            <Package className="size-4 shrink-0" />
            El inventario se actualizará automáticamente ({formatearCantidad(-carrito.unidades)}{' '}
            {carrito.unidades === 1 ? 'unidad' : 'unidades'})
          </span>
        )
      }
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={vacia || guardar.cargando}>
            {guardar.cargando ? 'Registrando…' : vacia ? 'Registrar venta' : `Registrar venta · ${moneyOf(carrito.total)}`}
          </Button>
        </>
      }
    >
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,330px)_1fr]">
        {/* Productos para elegir */}
        <section className="flex flex-col gap-3 border-line bg-surface/60 p-5 md:border-r">
          <SearchInput
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <p className="text-[13px] text-subtle">Toca un producto para agregarlo</p>

          {grilla.error ? (
            <p className="text-sm text-muted">{grilla.error}</p>
          ) : grilla.productos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {grilla.cargando ? 'Cargando…' : nombre ? 'No hay productos con ese nombre.' : 'Todavía no hay productos.'}
            </p>
          ) : (
            <div className={`grid grid-cols-2 gap-2.5 transition-opacity ${grilla.cargando ? 'opacity-60' : ''}`}>
              {grilla.productos.map((producto) => {
                const enVenta = carrito.cantidadDe(producto.id)
                return (
                  <ProductPickCard
                    key={producto.id}
                    nombre={producto.nombre}
                    precio={moneyOf(producto.precioVenta)}
                    cantidad={enVenta}
                    agotado={enVenta >= producto.stockActual}
                    onClick={() => carrito.agregar(producto)}
                  />
                )
              })}
            </div>
          )}

          <p className="mt-auto text-xs text-subtle">
            {nombre ? `Resultados para “${nombre}”` : 'Se muestran tus productos más vendidos'}
          </p>
        </section>

        {/* La venta que se está armando */}
        <section className="flex flex-col gap-4 p-5">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-bold">Esta venta</h3>
            {!vacia && <span className="text-[13px] text-subtle">{plural(carrito.unidades, 'unidad', 'unidades')}</span>}
          </header>

          {vacia ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
              Agrega productos desde la lista.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {carrito.lineas.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">{producto.nombre}</span>
                    <span className="text-xs text-subtle">{moneyOf(producto.precioVenta)} c/u</span>
                  </div>
                  <QuantityInput
                    label={producto.nombre}
                    value={cantidad}
                    max={producto.stockActual}
                    onChange={(valor) => carrito.fijar(producto, valor)}
                  />
                  <span className="w-24 text-right text-sm font-bold tabular-nums">
                    {moneyOf(producto.precioVenta * cantidad)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar ${producto.nombre}`}
                    onClick={() => carrito.quitar(producto)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-col">
              <span className="text-[13px] text-subtle">Total</span>
              <span className="text-[32px] leading-tight font-bold tabular-nums">{moneyOf(carrito.total)}</span>
            </div>
            <div className="flex flex-col items-end gap-1 text-[13px] text-muted">
              <span>
                Costo <strong className="text-ink tabular-nums">{moneyOf(carrito.costo)}</strong>
                <span className="ml-3">
                  Ganancia bruta{' '}
                  <strong className={`tabular-nums ${gananciaClass(carrito.ganancia)}`}>{moneyOf(carrito.ganancia)}</strong>
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-subtle">
                <Sparkles className="size-3" />
                Precio, costo y ganancia se calculan solos
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">
              Método de pago <span className="font-normal text-subtle">(opcional)</span>
            </span>
            <ChipGroup label="Método de pago" options={METODOS_PAGO} value={metodoPago} onChange={setMetodoPago} />
          </div>

          {guardar.error && <Alert>{guardar.error}</Alert>}
        </section>
      </div>
    </Modal>
  )
}

export default RegisterSaleModal
