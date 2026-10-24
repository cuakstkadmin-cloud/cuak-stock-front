import { useState } from 'react'

// Selección de elementos por id. Se conserva al cambiar de página o de filtro.
export function useSelection<T>(idDe: (elemento: T) => string) {
  const [seleccion, setSeleccion] = useState<Record<string, T>>({})

  function alternar(elemento: T) {
    const id = idDe(elemento)
    setSeleccion((actual) => {
      const siguiente = { ...actual }
      if (siguiente[id]) delete siguiente[id]
      else siguiente[id] = elemento
      return siguiente
    })
  }

  return {
    elegidos: Object.values(seleccion),
    estaElegido: (elemento: T) => idDe(elemento) in seleccion,
    alternar,
    limpiar: () => setSeleccion({}),
  }
}
