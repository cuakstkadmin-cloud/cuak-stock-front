import { useState } from 'react'
import type { Producto } from '../services/productoService'

export interface CambioStock {
  producto: Producto // Foto del producto al momento del primer cambio
  cantidad: number // Positivo suma, negativo resta
}

// Cambios de stock pendientes (los − / + de la tabla) que todavía no se guardaron.
export function useStockDraft() {
  const [cambios, setCambios] = useState<Record<string, CambioStock>>({})

  function sumar(producto: Producto, delta: number) {
    setCambios((actuales) => {
      const cantidad = (actuales[producto.id]?.cantidad ?? 0) + delta
      const siguientes = { ...actuales }
      // Volver a 0 desde la tabla equivale a no tener cambio
      if (cantidad === 0) delete siguientes[producto.id]
      else siguientes[producto.id] = { producto: actuales[producto.id]?.producto ?? producto, cantidad }
      return siguientes
    })
  }

  // Desde el modal de revisión: fija la cantidad exacta (puede quedar en 0 mientras se edita).
  function fijar(productoId: string, cantidad: number) {
    setCambios((actuales) =>
      actuales[productoId] ? { ...actuales, [productoId]: { ...actuales[productoId], cantidad } } : actuales,
    )
  }

  function quitar(productoId: string) {
    setCambios((actuales) => {
      const siguientes = { ...actuales }
      delete siguientes[productoId]
      return siguientes
    })
  }

  return {
    lista: Object.values(cambios),
    cantidadDe: (productoId: string) => cambios[productoId]?.cantidad ?? 0,
    sumar,
    fijar,
    quitar,
    descartar: () => setCambios({}),
  }
}
