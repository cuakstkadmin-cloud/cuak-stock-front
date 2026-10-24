import { useState } from 'react'
import { Package, X } from 'lucide-react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import MoneyField from '../components/MoneyField'
import SearchInput from '../components/SearchInput'
import SupplierSelect from '../components/SupplierSelect'
import TextField from '../components/TextField'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDebounce } from '../hooks/useDebounce'
import { useProductSearch } from '../hooks/useProductSearch'
import { usePurchaseLines, type LineaCompraForm } from '../hooks/usePurchaseLines'
import { registrarCompra, type Compra } from '../services/compraService'
import { formatearCantidad, formatearMoneda, plural } from '../utils/format'

interface RegisterPurchaseModalProps {
  lineasIniciales: LineaCompraForm[] // Las elegidas en la lista de reposición; puede venir vacía
  moneda: string
  onClose: () => void
  onRegistrada: (compra: Compra) => void
}

const thClass = 'pb-2 text-[13px] font-medium text-subtle'

// Si todos los productos elegidos tienen el mismo proveedor, se propone ese
function proveedorComun(lineas: LineaCompraForm[]) {
  const proveedores = new Set(lineas.map((linea) => linea.producto.proveedorId))
  const [unico] = proveedores
  return proveedores.size === 1 && unico ? unico : null
}

function RegisterPurchaseModal({ lineasIniciales, moneda, onClose, onRegistrada }: RegisterPurchaseModalProps) {
  const compra = usePurchaseLines(lineasIniciales)
  const [proveedorId, setProveedorId] = useState<string | null>(() => proveedorComun(lineasIniciales))
  const [busqueda, setBusqueda] = useState('')
  const busquedaDebounced = useDebounce(busqueda.trim())
  const { resultados, cargando: buscando } = useProductSearch(busquedaDebounced)
  const resultadosNuevos = resultados.filter((producto) => !compra.tiene(producto.id))

  // "Marcar como comprado": la compra entra recibida y suma el stock de una vez
  const guardar = useAsyncAction(() =>
    registrarCompra({
      proveedorId,
      estado: 'Recibida',
      detalle: compra.lineas.map(({ producto, cantidad, costoUnitario }) => ({
        productoId: producto.id,
        cantidad: cantidad ?? 0,
        costoUnitario: costoUnitario ?? 0,
      })),
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
  const vacia = compra.lineas.length === 0

  return (
    <Modal
      title="Registrar compra"
      size="lg"
      onClose={cerrar}
      footerAside={
        compra.unidades > 0 && (
          <span className="flex items-center gap-2">
            <Package className="size-4 shrink-0" />
            El inventario sumará {formatearCantidad(compra.unidades)} {compra.unidades === 1 ? 'unidad' : 'unidades'}
          </span>
        )
      }
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!compra.validas || guardar.cargando}>
            {guardar.cargando ? 'Registrando…' : vacia ? 'Registrar compra' : `Registrar compra · ${moneyOf(compra.total)}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <SupplierSelect id="proveedor" label="Proveedor" value={proveedorId} onChange={setProveedorId} />

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wider text-subtle uppercase">Productos</h3>

          {vacia ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              Busca un producto para agregarlo a la compra.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr>
                    <th className={thClass}>Producto</th>
                    <th className={`${thClass} w-24`}>Cantidad</th>
                    <th className={`${thClass} w-40`}>Costo unitario</th>
                    <th className={`${thClass} w-28 text-right`}>Subtotal</th>
                    <th className="w-10">
                      <span className="sr-only">Quitar</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compra.lineas.map(({ producto, cantidad, costoUnitario }) => (
                    <tr key={producto.id} className="border-t border-line">
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{producto.nombre}</span>
                          <span className="text-xs text-subtle tabular-nums">
                            Stock {producto.stockActual} · mín. {producto.stockMinimo}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <TextField
                          id={`cantidad-${producto.id}`}
                          label={`Cantidad de ${producto.nombre}`}
                          hideLabel
                          type="number"
                          min={1}
                          step={1}
                          value={cantidad ?? ''}
                          onChange={(e) =>
                            compra.actualizar(producto.id, { cantidad: e.target.value === '' ? null : Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <MoneyField
                          id={`costo-${producto.id}`}
                          label={`Costo unitario de ${producto.nombre}`}
                          hideLabel
                          moneda={moneda}
                          value={costoUnitario}
                          onChange={(valor) => compra.actualizar(producto.id, { costoUnitario: valor })}
                        />
                      </td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {moneyOf((cantidad ?? 0) * (costoUnitario ?? 0))}
                      </td>
                      <td className="py-2.5 pl-2">
                        <button
                          type="button"
                          aria-label={`Quitar ${producto.nombre}`}
                          onClick={() => compra.quitar(producto.id)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink"
                        >
                          <X className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <SearchInput
              placeholder={vacia ? 'Buscar producto...' : 'Agregar otro producto...'}
              aria-label="Buscar producto para agregar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busquedaDebounced && (
              <ul className={`flex flex-col divide-y divide-line rounded-xl border border-line ${buscando ? 'opacity-60' : ''}`}>
                {resultadosNuevos.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted">
                    {buscando ? 'Buscando…' : 'No hay más productos con ese nombre.'}
                  </li>
                ) : (
                  resultadosNuevos.map((producto) => (
                    <li key={producto.id}>
                      <button
                        type="button"
                        onClick={() => {
                          compra.agregar(producto)
                          setBusqueda('')
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-surface"
                      >
                        <span className="font-semibold">{producto.nombre}</span>
                        <span className="text-xs text-subtle tabular-nums">
                          Stock {producto.stockActual} · {moneyOf(producto.costoUnitario)}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </section>

        {!vacia && (
          <div className="flex items-end justify-between border-t border-line pt-4">
            <div className="flex flex-col">
              <span className="text-[13px] text-subtle">Total de la compra</span>
              <span className="text-[28px] leading-tight font-bold tabular-nums">{moneyOf(compra.total)}</span>
            </div>
            <span className="text-[13px] text-subtle">{plural(compra.lineas.length, 'producto', 'productos')}</span>
          </div>
        )}

        {!compra.validas && !vacia && <p className="text-xs text-subtle">Cada producto necesita una cantidad mayor que 0 y un costo.</p>}
        {guardar.error && <Alert>{guardar.error}</Alert>}
      </div>
    </Modal>
  )
}

export default RegisterPurchaseModal
