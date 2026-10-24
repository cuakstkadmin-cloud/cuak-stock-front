import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import ImagePicker, { type CambioImagen } from '../components/ImagePicker'
import Modal from '../components/Modal'
import MoneyField from '../components/MoneyField'
import SupplierSelect from '../components/SupplierSelect'
import Switch from '../components/Switch'
import TextAreaField from '../components/TextAreaField'
import TextField from '../components/TextField'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { mensajeDeError } from '../services/api'
import {
  actualizarProducto,
  crearProducto,
  eliminarImagenProducto,
  subirImagenProducto,
  type DatosCatalogo,
  type Producto,
} from '../services/productoService'
import { LARGO_MAXIMO_DESCRIPCION } from '../utils/validaciones'

interface ProductFormModalProps {
  producto?: Producto // Si viene, el modal edita; si no, crea
  moneda: string
  onClose: () => void
  onGuardado: (aviso: ToastData) => void
}

const FORM_ID = 'product-form'

// Campo de texto opcional vacío = null
const textoOpcional = (valor: string) => valor.trim() || null

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-xs font-bold tracking-wider text-subtle uppercase sm:col-span-2">{children}</h3>
}

// Ficha del producto en el catálogo: qué es, cómo es y cuánto cuesta.
// Las cantidades no van acá: el stock se maneja en Inventario.
function ProductFormModal({ producto, moneda, onClose, onGuardado }: ProductFormModalProps) {
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [codigo, setCodigo] = useState(producto?.codigo ?? '')
  // Texto libre por ahora; cuando existan categorías en el backend pasa a ser un select
  const [categoria, setCategoria] = useState(producto?.categoria ?? '')
  const [marca, setMarca] = useState(producto?.marca ?? '')
  const [presentacion, setPresentacion] = useState(producto?.presentacion ?? '')
  const [variante, setVariante] = useState(producto?.variante ?? '')
  const [proveedorId, setProveedorId] = useState<string | null>(producto?.proveedorId ?? null)
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [costo, setCosto] = useState<number | null>(producto?.costoUnitario ?? null)
  const [precio, setPrecio] = useState<number | null>(producto?.precioVenta ?? null)
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [imagen, setImagen] = useState<CambioImagen>({ tipo: 'conservar' })

  const guardar = useAsyncAction(async (): Promise<ToastData> => {
    const datos: DatosCatalogo = {
      nombre: nombre.trim(),
      codigo: textoOpcional(codigo),
      categoria: categoria.trim(),
      marca: textoOpcional(marca),
      presentacion: textoOpcional(presentacion),
      variante: textoOpcional(variante),
      proveedorId,
      descripcion: textoOpcional(descripcion),
      costoUnitario: costo ?? 0,
      precioVenta: precio ?? 0,
      activo,
    }

    const guardado = producto ? await actualizarProducto(producto.id, datos) : await crearProducto(datos)
    const mensaje = producto
      ? 'Cambios guardados.'
      : `${datos.nombre} se agregó al catálogo.${activo ? ' Dale stock desde Inventario o con una compra.' : ''}`

    // La imagen va aparte (es un archivo). Si falla, el producto ya quedó guardado: se avisa sin perderlo.
    try {
      if (imagen.tipo === 'nueva') await subirImagenProducto(guardado.id, imagen.archivo)
      if (imagen.tipo === 'quitar') await eliminarImagenProducto(guardado.id)
    } catch (e) {
      return { mensaje: `${mensaje} La imagen no se pudo guardar: ${mensajeDeError(e)}`, tipo: 'aviso' }
    }
    return { mensaje }
  })

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const resultado = await guardar.ejecutar()
    if (resultado.ok) onGuardado(resultado.valor)
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  return (
    <Modal
      title={producto ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando}>
            {guardar.cargando ? 'Guardando…' : producto ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Imagen y si el producto se usa en la operación */}
        <div className="flex flex-col gap-4">
          <ImagePicker
            label="Imagen"
            imagenActual={producto?.imagenUrl ?? null}
            cambio={imagen}
            onCambio={setImagen}
            sugerencia="Fondo claro, producto centrado."
          />
          <div className="mt-auto flex items-start gap-3 rounded-xl bg-surface p-3">
            <Switch checked={activo} onChange={setActivo} label="Activo para inventario" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Activo para inventario</span>
              <span className="text-xs text-subtle">Aparece en Inventario, Ventas y Comprar.</span>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              id="nombre"
              label="Nombre *"
              placeholder="Ej.: Labial rosa mate"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <TextField
            id="codigo"
            label="Código (SKU)"
            placeholder="Ej.: LAB-001"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          />
          <TextField
            id="categoria"
            label="Categoría *"
            placeholder="Ej.: Labios"
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />

          <SectionTitle>Características</SectionTitle>
          <TextField id="marca" label="Marca" placeholder="Ej.: Bella Rosa" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <TextField
            id="presentacion"
            label="Presentación"
            placeholder="Ej.: 3,5 g · 50 ml"
            value={presentacion}
            onChange={(e) => setPresentacion(e.target.value)}
          />
          <TextField
            id="variante"
            label="Tono o variante"
            placeholder="Ej.: Rosa mate"
            value={variante}
            onChange={(e) => setVariante(e.target.value)}
          />
          <SupplierSelect
            id="proveedor"
            label="Proveedor"
            value={proveedorId}
            nombreActual={producto?.proveedor}
            onChange={setProveedorId}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              id="descripcion"
              label="Descripción"
              placeholder="Opcional: acabado, uso, ingredientes destacados…"
              maxLength={LARGO_MAXIMO_DESCRIPCION}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <SectionTitle>Precios</SectionTitle>
          <MoneyField id="costo" label="Costo unitario *" moneda={moneda} required value={costo} onChange={setCosto} />
          <MoneyField id="precio" label="Precio de venta *" moneda={moneda} required value={precio} onChange={setPrecio} />

          {guardar.error && (
            <div className="sm:col-span-2">
              <Alert>{guardar.error}</Alert>
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default ProductFormModal
