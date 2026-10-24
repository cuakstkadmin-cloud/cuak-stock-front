import { useState } from 'react'
import { Check, ShoppingCart, TrendingUp } from 'lucide-react'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import InfoNote from '../components/InfoNote'
import Pagination from '../components/Pagination'
import type { ToastData } from '../components/Toast'
import { DIAS_VENTAS_REPOSICION, useRestock } from '../hooks/useRestock'
import { useSelection } from '../hooks/useSelection'
import type { ItemReposicion } from '../services/compraService'
import { infoEstadoStock } from '../utils/estadosStock'
import { formatearMoneda, plural } from '../utils/format'
import RegisterPurchaseModal from './RegisterPurchaseModal'

// Cuántos productos se ven antes de "Ver los N productos", y cuántos por página después
const PRODUCTOS_RESUMEN = 7
const PRODUCTOS_POR_PAGINA = 20

const thClass = 'px-3 py-3 text-[13px] leading-tight font-medium first:pl-5 last:pr-5'
const tdClass = 'px-3 py-3 first:pl-5 last:pr-5'

interface RestockSectionProps {
  moneda: string
  version: number // Cambia cuando el historial recibe o anula una compra, para recargar
  onAviso: (aviso: ToastData) => void
}

// Pestaña "Reposición": productos bajo el mínimo, lista de compra y registro de la compra.
function RestockSection({ moneda, version, onAviso }: RestockSectionProps) {
  const moneyOf = (valor: number) => formatearMoneda(valor, moneda)

  const [verTodos, setVerTodos] = useState(false)
  const [pagina, setPagina] = useState(1)
  const { items, paginacion, resumen, cargando, error, recargar } = useRestock({
    pagina: verTodos ? pagina : 1,
    porPagina: verTodos ? PRODUCTOS_POR_PAGINA : PRODUCTOS_RESUMEN,
  }, version)

  const seleccion = useSelection<ItemReposicion>((item) => item.producto.id)
  const unidades = seleccion.elegidos.reduce((suma, item) => suma + item.compraSugerida, 0)
  const costoEstimado = seleccion.elegidos.reduce((suma, item) => suma + item.compraSugerida * item.producto.costoUnitario, 0)

  const [comprando, setComprando] = useState(false)

  function alternarVerTodos() {
    setVerTodos(!verTodos)
    setPagina(1)
  }

  const cargaInicial = cargando && !paginacion

  return (
    <div className="flex flex-col gap-5">
      {resumen && (
        <p className="text-sm text-muted">
          {resumen.total > 0 ? (
            <>
              <strong className="font-semibold text-amber-700">
                {resumen.total === 1 ? '1 producto necesita' : `${resumen.total} productos necesitan`} reposición
              </strong>{' '}
              · {resumen.StockBajo} con stock bajo y {plural(resumen.Agotado, 'agotado', 'agotados')}
            </>
          ) : (
            'Todo tu inventario está por encima del stock mínimo.'
          )}
        </p>
      )}

      <InfoNote icon={TrendingUp}>
        La <strong className="text-ink">compra sugerida</strong> considera tu stock actual, tu stock mínimo y lo que vendiste en
        los últimos {DIAS_VENTAS_REPOSICION} días, para que no te quedes sin producto la próxima semana.
      </InfoNote>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Productos que necesitan reposición */}
        <section className="rounded-2xl border border-line bg-white">
          <h2 className="px-5 pt-5 pb-1 text-base font-bold">Productos que necesitan reposición</h2>

          {error ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <p className="text-muted">{error}</p>
              <Button variant="secondary" onClick={recargar}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-subtle">
                    <th className="w-10 pl-5">
                      <span className="sr-only">Elegir</span>
                    </th>
                    <th className={thClass}>Producto</th>
                    <th className={`${thClass} text-right`}>Stock actual</th>
                    <th className={`${thClass} text-right`}>Stock mínimo</th>
                    <th className={`${thClass} text-right`}>Ventas {DIAS_VENTAS_REPOSICION} días</th>
                    <th className={`${thClass} text-right`}>Compra sugerida</th>
                  </tr>
                </thead>
                <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                  {cargaInicial || items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-muted">
                        {cargaInicial ? 'Cargando…' : 'Ningún producto necesita reposición por ahora.'}
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const { producto } = item
                      const elegido = seleccion.estaElegido(item)
                      return (
                        <tr
                          key={producto.id}
                          onClick={() => seleccion.alternar(item)}
                          className={`cursor-pointer border-b border-line transition last:border-0 ${elegido ? 'bg-primary/5' : 'hover:bg-surface/60'}`}
                        >
                          <td className="pl-5">
                            <Checkbox
                              aria-label={`Agregar ${producto.nombre} a la lista de compra`}
                              checked={elegido}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => seleccion.alternar(item)}
                            />
                          </td>
                          <td className={`${tdClass} font-semibold`}>{producto.nombre}</td>
                          <td className={`${tdClass} text-right font-bold tabular-nums ${infoEstadoStock(producto.estado).stockClass}`}>
                            {producto.stockActual}
                          </td>
                          <td className={`${tdClass} text-right text-muted tabular-nums`}>{producto.stockMinimo}</td>
                          <td className={`${tdClass} text-right text-muted tabular-nums`}>{item.ventasPeriodo}</td>
                          <td className={`${tdClass} text-right`}>
                            <span className="inline-flex items-baseline gap-1 rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary tabular-nums">
                              {item.compraSugerida}
                              <span className="text-xs font-semibold">uds</span>
                            </span>
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
            <p>Basado en ventas recientes y stock actual.</p>
            <div className="flex items-center gap-3">
              {verTodos && paginacion && (
                <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />
              )}
              {paginacion && paginacion.total > PRODUCTOS_RESUMEN && (
                <button type="button" onClick={alternarVerTodos} className="cursor-pointer font-semibold text-primary hover:underline">
                  {verTodos ? 'Ver menos' : `Ver los ${paginacion.total} productos`}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Lista de compra */}
        <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-bold">Lista de compra</h2>
            {seleccion.elegidos.length > 0 && (
              <span className="text-[13px] text-subtle">{plural(seleccion.elegidos.length, 'producto', 'productos')}</span>
            )}
          </header>

          {seleccion.elegidos.length === 0 ? (
            <p className="text-sm text-muted">Marca productos de la lista, o registra una compra de cualquier producto.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2.5">
                {seleccion.elegidos.map((item) => (
                  <li key={item.producto.id} className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      aria-label={`Quitar ${item.producto.nombre} de la lista`}
                      checked
                      onChange={() => seleccion.alternar(item)}
                    />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {item.producto.nombre} — {item.compraSugerida}
                    </span>
                    <span className="text-muted tabular-nums">{moneyOf(item.compraSugerida * item.producto.costoUnitario)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-0.5 border-t border-line pt-4">
                <span className="text-[13px] text-subtle">Costo estimado</span>
                <span className="text-[28px] leading-tight font-bold tabular-nums">{moneyOf(costoEstimado)}</span>
                <span className="text-xs text-subtle">{plural(unidades, 'unidad', 'unidades')} · según tu costo unitario</span>
              </div>
            </>
          )}

          <Button size="lg" onClick={() => setComprando(true)}>
            {seleccion.elegidos.length > 0 ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
            {seleccion.elegidos.length > 0 ? 'Marcar como comprado' : 'Comprar productos'}
          </Button>
        </aside>
      </div>

      {comprando && (
        <RegisterPurchaseModal
          lineasIniciales={seleccion.elegidos.map((item) => ({
            producto: item.producto,
            cantidad: item.compraSugerida,
            costoUnitario: item.producto.costoUnitario,
          }))}
          moneda={moneda}
          onClose={() => setComprando(false)}
          onRegistrada={(compra) => {
            setComprando(false)
            seleccion.limpiar()
            onAviso({ mensaje: `Compra registrada por ${moneyOf(compra.costoTotal)}. El stock ya se actualizó.` })
            recargar()
          }}
        />
      )}
    </div>
  )
}

export default RestockSection
