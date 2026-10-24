import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, SlidersHorizontal } from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import StockStepper from '../components/StockStepper'
import Tabs from '../components/Tabs'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useDebounce } from '../hooks/useDebounce'
import { useProducts } from '../hooks/useProducts'
import { useStockDraft } from '../hooks/useStockDraft'
import type { EstadoStock, Producto } from '../services/productoService'
import { infoEstadoStock } from '../utils/estadosStock'
import { formatearCantidad, formatearMoneda, plural } from '../utils/format'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import { rutaProducto } from '../utils/routes'
import PendingChangesModal from './PendingChangesModal'
import ProductFormModal from './ProductFormModal'
import StockSettingsModal from './StockSettingsModal'

type FiltroEstado = 'Todos' | Exclude<EstadoStock, 'Disponible'>

const thClass = 'px-3 py-3.5 font-medium first:pl-5'
const tdClass = 'px-3 py-3 first:pl-5'
const iconButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink'

function InventoryPage() {
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<FiltroEstado>('Todos')
  const [pagina, setPagina] = useState(1)
  const nombre = useDebounce(busqueda.trim())

  const { productos, paginacion, resumen, cargando, error, recargar } = useProducts({
    nombre: nombre || undefined,
    estado: estado === 'Todos' ? undefined : estado,
    activo: 'true',
    pagina,
  })

  const [creando, setCreando] = useState(false)
  const [configurando, setConfigurando] = useState<Producto | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  // Los − / + no guardan al instante: se acumulan y se confirman con "Guardar cambios"
  const borrador = useStockDraft()
  const [revisando, setRevisando] = useState(false)
  const pendientes = borrador.lista.length

  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  function cambiarEstado(valor: FiltroEstado) {
    setEstado(valor)
    setPagina(1)
  }

  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">Inventario</h1>
          {pendientes > 0 ? (
            <p className="text-sm font-semibold text-amber-700">
              Tienes {plural(pendientes, 'cambio', 'cambios')} sin guardar
            </p>
          ) : (
            resumen && (
              <p className="text-sm text-muted">
                {plural(resumen.total, 'producto', 'productos')} · usa − y + para registrar una salida o entrada rápida
              </p>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {pendientes > 0 && (
            <>
              <Button variant="secondary" onClick={borrador.descartar}>
                Descartar
              </Button>
              <Button onClick={() => setRevisando(true)}>Guardar cambios ({pendientes})</Button>
            </>
          )}
          <Button variant={pendientes > 0 ? 'secondary' : 'primary'} onClick={() => setCreando(true)}>
            <Plus className="size-[18px]" />
            Agregar producto
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          className="w-full sm:w-80"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
        <Tabs
          value={estado}
          onChange={cambiarEstado}
          items={[
            { value: 'Todos', label: 'Todos', count: resumen?.total },
            { value: 'StockBajo', label: 'Stock bajo', count: resumen?.StockBajo },
            { value: 'Agotado', label: 'Agotados', count: resumen?.Agotado },
          ]}
        />
      </div>

      <div className="rounded-2xl border border-line bg-white">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-muted">{error}</p>
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-subtle">
                  <th className={thClass}>Producto</th>
                  <th className={`${thClass} text-right`}>Stock</th>
                  <th className={`${thClass} text-right`}>Stock mínimo</th>
                  <th className={`${thClass} text-right`}>Costo</th>
                  <th className={`${thClass} text-right`}>Precio de venta</th>
                  <th className={thClass}>Estado</th>
                  <th className={`${thClass} text-center`}>Ajustar</th>
                  <th className="w-20">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                {cargaInicial || productos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-muted">
                      {cargaInicial
                        ? 'Cargando…'
                        : nombre || estado !== 'Todos'
                          ? 'No hay productos que coincidan.'
                          : 'Todavía no hay productos. Agrega el primero.'}
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => {
                    const info = infoEstadoStock(producto.estado)
                    const delta = borrador.cantidadDe(producto.id)
                    return (
                      <tr key={producto.id} className="border-b border-line last:border-0">
                        <td className={tdClass}>
                          <div className="flex flex-col">
                            <span className="font-bold">{producto.nombre}</span>
                            <span className="text-xs text-subtle">{producto.categoria}</span>
                          </div>
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          <span className={`text-[15px] font-bold ${info.stockClass}`}>{producto.stockActual}</span>
                          {delta !== 0 && (
                            <span className={`ml-1.5 text-xs font-bold ${delta > 0 ? 'text-primary' : 'text-red-600'}`}>
                              {formatearCantidad(delta)}
                            </span>
                          )}
                        </td>
                        <td className={`${tdClass} text-right text-muted tabular-nums`}>{producto.stockMinimo}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatearMoneda(producto.costoUnitario, moneda)}</td>
                        <td className={`${tdClass} text-right font-bold tabular-nums`}>
                          {formatearMoneda(producto.precioVenta, moneda)}
                        </td>
                        <td className={tdClass}>
                          <Badge variant={info.variant} dot>
                            {info.label}
                          </Badge>
                        </td>
                        <td className={tdClass}>
                          <div className="flex justify-center">
                            <StockStepper
                              producto={producto.nombre}
                              stock={producto.stockActual + delta}
                              onAjustar={(cantidad) => borrador.sumar(producto, cantidad)}
                            />
                          </div>
                        </td>
                        <td className="pr-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              type="button"
                              aria-label={`Configurar stock de ${producto.nombre}`}
                              onClick={() => setConfigurando(producto)}
                              className={iconButtonClass}
                            >
                              <SlidersHorizontal className="size-4" />
                            </button>
                            <Link
                              to={rutaProducto(producto.id)}
                              aria-label={`Ver detalle de ${producto.nombre}`}
                              className={iconButtonClass}
                            >
                              <ChevronRight className="size-[18px]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3 text-[13px] text-subtle">
          <p>{paginacion && `Mostrando ${productos.length} de ${plural(paginacion.total, 'producto', 'productos')}`}</p>
          {paginacion && <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />}
        </div>
      </div>

      {creando && (
        <ProductFormModal
          moneda={moneda}
          onClose={() => setCreando(false)}
          onGuardado={(aviso) => {
            setCreando(false)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {configurando && (
        <StockSettingsModal
          producto={configurando}
          onClose={() => setConfigurando(null)}
          onGuardado={(aviso) => {
            setConfigurando(null)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {revisando && pendientes > 0 && (
        <PendingChangesModal
          cambios={borrador.lista}
          onFijar={borrador.fijar}
          onQuitar={borrador.quitar}
          onClose={() => setRevisando(false)}
          onGuardado={(cantidad) => {
            setRevisando(false)
            borrador.descartar()
            setToast({
              mensaje: `Se ${cantidad === 1 ? 'guardó' : 'guardaron'} ${plural(cantidad, 'ajuste', 'ajustes')} de inventario.`,
            })
            recargar()
          }}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default InventoryPage
