import { useState } from 'react'
import type { Producto } from '../services/productoService'

export interface LineaVenta {
  producto: Producto
  cantidad: number
}

// Productos de la venta que se está armando. La cantidad va de 1 al stock disponible.
// Los totales son una vista previa: el backend los recalcula con los precios vigentes.
export function useSaleCart() {
  const [lineas, setLineas] = useState<LineaVenta[]>([])

  function fijar(producto: Producto, cantidad: number) {
    const acotada = Math.min(Math.max(cantidad, 0), producto.stockActual)
    setLineas((actuales) => {
      const sinEste = actuales.filter((linea) => linea.producto.id !== producto.id)
      if (acotada === 0) return sinEste
      const existe = actuales.some((linea) => linea.producto.id === producto.id)
      // Conserva el orden en que se agregaron
      return existe
        ? actuales.map((linea) => (linea.producto.id === producto.id ? { ...linea, cantidad: acotada } : linea))
        : [...sinEste, { producto, cantidad: acotada }]
    })
  }

  const cantidadDe = (productoId: string) => lineas.find((linea) => linea.producto.id === productoId)?.cantidad ?? 0

  const unidades = lineas.reduce((suma, { cantidad }) => suma + cantidad, 0)
  const total = lineas.reduce((suma, { producto, cantidad }) => suma + producto.precioVenta * cantidad, 0)
  const costo = lineas.reduce((suma, { producto, cantidad }) => suma + producto.costoUnitario * cantidad, 0)

  return {
    lineas,
    cantidadDe,
    agregar: (producto: Producto) => fijar(producto, cantidadDe(producto.id) + 1),
    fijar,
    quitar: (producto: Producto) => fijar(producto, 0),
    unidades,
    total,
    costo,
    ganancia: total - costo,
  }
}
