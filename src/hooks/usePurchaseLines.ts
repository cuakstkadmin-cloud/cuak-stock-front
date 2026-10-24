import { useState } from 'react'
import type { Producto } from '../services/productoService'

export interface LineaCompraForm {
  producto: Producto
  cantidad: number | null // null mientras el campo está vacío
  costoUnitario: number | null
}

// Líneas del formulario de compra, editables antes de registrarla.
export function usePurchaseLines(iniciales: LineaCompraForm[]) {
  const [lineas, setLineas] = useState(iniciales)

  function actualizar(productoId: string, cambios: Partial<Omit<LineaCompraForm, 'producto'>>) {
    setLineas((actuales) => actuales.map((linea) => (linea.producto.id === productoId ? { ...linea, ...cambios } : linea)))
  }

  function agregar(producto: Producto) {
    setLineas((actuales) =>
      actuales.some((linea) => linea.producto.id === producto.id)
        ? actuales
        : [...actuales, { producto, cantidad: 1, costoUnitario: producto.costoUnitario }],
    )
  }

  function quitar(productoId: string) {
    setLineas((actuales) => actuales.filter((linea) => linea.producto.id !== productoId))
  }

  const esValida = ({ cantidad, costoUnitario }: LineaCompraForm) =>
    cantidad !== null && Number.isInteger(cantidad) && cantidad > 0 && costoUnitario !== null && costoUnitario >= 0

  return {
    lineas,
    actualizar,
    agregar,
    quitar,
    tiene: (productoId: string) => lineas.some((linea) => linea.producto.id === productoId),
    validas: lineas.length > 0 && lineas.every(esValida),
    unidades: lineas.reduce((suma, linea) => suma + (linea.cantidad ?? 0), 0),
    total: lineas.reduce((suma, linea) => suma + (linea.cantidad ?? 0) * (linea.costoUnitario ?? 0), 0),
  }
}
