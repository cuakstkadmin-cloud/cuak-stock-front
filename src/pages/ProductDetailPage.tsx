import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Minus, Pencil, Plus } from 'lucide-react'
import Badge, { type BadgeVariant } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Pagination from '../components/Pagination'
import ProductCover from '../components/ProductCover'
import StatTile from '../components/StatTile'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useProductDetail } from '../hooks/useProductDetail'
import { cantidadConSigno, type Movimiento } from '../services/inventarioService'
import { caracteristicasDe } from '../services/productoService'
import { infoEstadoStock } from '../utils/estadosStock'
import { formatearCantidad, formatearFechaHora, formatearMoneda, formatearNumero, nombreAutor } from '../utils/format'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import { RUTAS } from '../utils/routes'
import AdjustStockModal, { type TipoAjuste } from './AdjustStockModal'
import ProductFormModal from './ProductFormModal'
import StockSettingsModal from './StockSettingsModal'

const MOTIVOS: Record<Movimiento['motivo'], { label: string; variant: BadgeVariant }> = {
  Venta: { label: 'Venta', variant: 'neutral' },
  Compra: { label: 'Entrada · Compra', variant: 'exito' },
  Ajuste: { label: 'Ajuste', variant: 'neutral' },
}

const thClass = 'pb-2 text-[13px] font-medium text-subtle'

function ProductDetailPage() {
  const { id = '' } = useParams()
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO

  const [paginaMovimientos, setPaginaMovimientos] = useState(1)
  const detalle = useProductDetail(id, paginaMovimientos)
  const { producto } = detalle

  const [ajuste, setAjuste] = useState<TipoAjuste | null>(null)
  const [editando, setEditando] = useState(false)
  const [configurandoStock, setConfigurandoStock] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const volver = (
    <Link to={RUTAS.inventario} className="flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
      <ChevronLeft className="size-4" />
      Inventario
    </Link>
  )

  if (!producto) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        {volver}
        <p className="text-muted">{detalle.errorProducto ?? 'Cargando…'}</p>
      </div>
    )
  }

  const estado = infoEstadoStock(producto.estado)
  const subtitulo = [
    producto.codigo,
    producto.categoria,
    producto.marca,
    producto.proveedor && `Proveedor: ${producto.proveedor}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 lg:px-10">
      {volver}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProductCover
            nombre={producto.nombre}
            categoria={producto.categoria}
            imagenUrl={producto.imagenUrl}
            activo={producto.activo}
            className="size-20 shrink-0 rounded-2xl"
          />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold">{producto.nombre}</h1>
              {producto.estado && (
                <Badge variant={estado.variant} dot>
                  {estado.label}
                </Badge>
              )}
              {!producto.activo && <Badge variant="inactivo">Inactivo</Badge>}
            </div>
            <p className="text-sm text-muted">{subtitulo}</p>
            {caracteristicasDe(producto).length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {caracteristicasDe(producto).map((caracteristica) => (
                  <li key={caracteristica} className="rounded-full bg-tile px-2.5 py-0.5 text-xs font-medium text-muted">
                    {caracteristica}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" aria-label="Editar producto" onClick={() => setEditando(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="secondary" disabled={producto.stockActual <= 0} onClick={() => setAjuste('salida')}>
            <Minus className="size-4" />
            Salida
          </Button>
          <Button onClick={() => setAjuste('entrada')}>
            <Plus className="size-4" />
            Entrada
          </Button>
        </div>
      </header>

      <section className="grid gap-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line lg:[&>*]:px-5 lg:[&>*:first-child]:pl-0">
        <StatTile label="Stock actual" value={producto.stockActual} unit="uds" valueClass={estado.stockClass} />
        <StatTile
          label="Stock mínimo"
          value={producto.stockMinimo}
          unit="uds"
          caption={
            <button
              type="button"
              onClick={() => setConfigurandoStock(true)}
              className="cursor-pointer font-semibold text-primary hover:underline"
            >
              Cambiar
            </button>
          }
        />
        <StatTile label="Costo unitario" value={formatearMoneda(producto.costoUnitario, moneda)} />
        <StatTile label="Precio de venta" value={formatearMoneda(producto.precioVenta, moneda)} />
        <StatTile
          label="Valor del inventario"
          value={formatearMoneda(producto.stockActual * producto.costoUnitario, moneda)}
          caption={`${formatearNumero(producto.stockActual)} × ${formatearMoneda(producto.costoUnitario, moneda)}`}
        />
      </section>

      <Card title="Historial de movimientos">
        {detalle.errorMovimientos ? (
          <p className="text-sm text-muted">{detalle.errorMovimientos}</p>
        ) : detalle.movimientos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            {detalle.cargandoMovimientos ? 'Cargando…' : 'Este producto todavía no tiene movimientos.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[680px] text-left text-sm transition-opacity ${detalle.cargandoMovimientos ? 'opacity-60' : ''}`}>
              <thead>
                <tr>
                  <th className={thClass}>Fecha</th>
                  <th className={thClass}>Movimiento</th>
                  <th className={`${thClass} text-right`}>Cantidad</th>
                  <th className={`${thClass} text-right`}>Stock resultante</th>
                  <th className={`${thClass} pl-6`}>Registró</th>
                </tr>
              </thead>
              <tbody>
                {detalle.movimientos.map((movimiento) => {
                  const cantidad = cantidadConSigno(movimiento)
                  const motivo = MOTIVOS[movimiento.motivo] ?? { label: movimiento.motivo, variant: 'neutral' }
                  return (
                    <tr key={movimiento.id} className="border-t border-line">
                      <td className="py-3 text-muted">{formatearFechaHora(movimiento.fecha)}</td>
                      <td className="py-3">
                        <Badge variant={motivo.variant}>{motivo.label}</Badge>
                      </td>
                      <td className={`py-3 text-right font-bold tabular-nums ${cantidad > 0 ? 'text-primary' : 'text-ink'}`}>
                        {formatearCantidad(cantidad)}
                      </td>
                      <td className="py-3 text-right tabular-nums">{movimiento.stockResultante}</td>
                      <td className="py-3 pl-6 text-muted">{nombreAutor(movimiento.usuario)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {detalle.paginacionMovimientos && (
          <div className="flex justify-end">
            <Pagination
              pagina={detalle.paginacionMovimientos.pagina}
              totalPaginas={detalle.paginacionMovimientos.totalPaginas}
              onChange={setPaginaMovimientos}
            />
          </div>
        )}
      </Card>

      {ajuste && (
        <AdjustStockModal
          producto={producto}
          tipo={ajuste}
          onClose={() => setAjuste(null)}
          onGuardado={() => {
            setAjuste(null)
            setToast({ mensaje: ajuste === 'entrada' ? 'Entrada registrada.' : 'Salida registrada.' })
            detalle.recargar()
          }}
        />
      )}

      {editando && (
        <ProductFormModal
          producto={producto}
          moneda={moneda}
          onClose={() => setEditando(false)}
          onGuardado={(aviso) => {
            setEditando(false)
            setToast(aviso)
            detalle.recargar()
          }}
        />
      )}

      {configurandoStock && (
        <StockSettingsModal
          producto={producto}
          onClose={() => setConfigurandoStock(false)}
          onGuardado={(aviso) => {
            setConfigurandoStock(false)
            setToast(aviso)
            detalle.recargar()
          }}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProductDetailPage
