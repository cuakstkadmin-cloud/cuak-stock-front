import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import SearchInput from '../components/SearchInput'
import Tabs from '../components/Tabs'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDebounce } from '../hooks/useDebounce'
import { useProducts } from '../hooks/useProducts'
import { mensajeDeError } from '../services/api'
import { activarProducto, desactivarProducto, eliminarProducto, type Producto } from '../services/productoService'
import { formatearMoneda, plural } from '../utils/format'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import { rutaProducto } from '../utils/routes'
import ProductFormModal from './ProductFormModal'

type FiltroActivo = 'todos' | 'activos' | 'inactivos'

// Cada pestaña y el valor de `activo` que manda al backend
const FILTROS: { value: FiltroActivo; label: string; activo?: 'true' | 'false' }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos', activo: 'true' },
  { value: 'inactivos', label: 'Inactivos', activo: 'false' },
]

const PRODUCTOS_POR_PAGINA = 12 // Múltiplo de 2 y 3: la grilla queda pareja en todas las columnas

function ProductsPage() {
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroActivo>('todos')
  const [pagina, setPagina] = useState(1)
  const buscar = useDebounce(busqueda.trim())

  const { productos, paginacion, resumenCatalogo, cargando, error, recargar } = useProducts({
    buscar: buscar || undefined,
    activo: FILTROS.find((f) => f.value === filtro)?.activo,
    pagina,
    porPagina: PRODUCTOS_POR_PAGINA,
  })

  const [formulario, setFormulario] = useState<{ producto?: Producto } | null>(null)
  const [porEliminar, setPorEliminar] = useState<Producto | null>(null)
  const [cambiandoId, setCambiandoId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const eliminar = useAsyncAction((producto: Producto) => eliminarProducto(producto.id))

  async function cambiarActivo(producto: Producto, activo: boolean) {
    setCambiandoId(producto.id)
    try {
      await (activo ? activarProducto(producto.id) : desactivarProducto(producto.id))
      setToast({
        mensaje: activo
          ? `${producto.nombre} vuelve a estar en inventario.`
          : `${producto.nombre} ya no aparece en Inventario, Ventas ni Compras. Su historial se conserva.`,
      })
      recargar()
    } catch (e) {
      setToast({ mensaje: mensajeDeError(e), tipo: 'error' })
    } finally {
      setCambiandoId(null)
    }
  }

  async function confirmarEliminacion(producto: Producto) {
    const resultado = await eliminar.ejecutar(producto)
    if (!resultado.ok) return // El error (p. ej. 409 por movimientos) se muestra en el diálogo
    setPorEliminar(null)
    setToast({ mensaje: `${producto.nombre} se eliminó.` })
    // Si era el último de la página, se vuelve a la anterior para no quedar en una página vacía
    if (productos.length === 1 && pagina > 1) setPagina(pagina - 1)
    recargar()
  }

  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  function cambiarFiltro(valor: FiltroActivo) {
    setFiltro(valor)
    setPagina(1)
  }

  const conteos: Record<FiltroActivo, number | undefined> = {
    todos: resumenCatalogo?.total,
    activos: resumenCatalogo?.activos,
    inactivos: resumenCatalogo?.inactivos,
  }
  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">Productos</h1>
          <p className="text-sm text-muted">Catálogo de la empresa: imagen, características y si está activo para inventario.</p>
        </div>
        <Button onClick={() => setFormulario({})}>
          <Plus className="size-[18px]" />
          Nuevo producto
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          className="w-full sm:w-96"
          placeholder="Buscar por nombre, código, marca o categoría..."
          aria-label="Buscar productos"
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
        <Tabs
          value={filtro}
          onChange={cambiarFiltro}
          items={FILTROS.map(({ value, label }) => ({ value, label, count: conteos[value] }))}
        />
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-5 py-12 text-center">
          <p className="text-muted">{error}</p>
          <Button variant="secondary" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      ) : cargaInicial || productos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white px-5 py-16 text-center text-muted">
          {cargaInicial
            ? 'Cargando…'
            : buscar || filtro !== 'todos'
              ? 'No hay productos que coincidan.'
              : 'Todavía no hay productos. Crea el primero con "Nuevo producto".'}
        </p>
      ) : (
        <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${cargando ? 'opacity-60' : ''}`}>
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              precio={formatearMoneda(producto.precioVenta, moneda)}
              detalleUrl={rutaProducto(producto.id)}
              cambiandoActivo={cambiandoId === producto.id}
              onCambiarActivo={(activo) => cambiarActivo(producto, activo)}
              onEditar={() => setFormulario({ producto })}
              onEliminar={() => {
                eliminar.limpiarError()
                setPorEliminar(producto)
              }}
            />
          ))}
        </div>
      )}

      {paginacion && paginacion.total > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-subtle">
          <p>{`Mostrando ${productos.length} de ${plural(paginacion.total, 'producto', 'productos')}`}</p>
          <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />
        </footer>
      )}

      {formulario && (
        <ProductFormModal
          producto={formulario.producto}
          moneda={moneda}
          onClose={() => setFormulario(null)}
          onGuardado={(aviso) => {
            setFormulario(null)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {porEliminar && (
        <ConfirmDialog
          title="Eliminar producto"
          message={
            <>
              Se eliminará <strong className="text-ink">{porEliminar.nombre}</strong> del catálogo. No se puede deshacer. Si ya
              tuvo ventas, compras o movimientos no se podrá eliminar: en ese caso, desactívalo.
            </>
          }
          confirmLabel="Eliminar"
          danger
          cargando={eliminar.cargando}
          error={eliminar.error}
          onConfirm={() => confirmarEliminacion(porEliminar)}
          onClose={() => setPorEliminar(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProductsPage
