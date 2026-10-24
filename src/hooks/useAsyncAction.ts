import { useState } from 'react'
import { mensajeDeError } from '../services/api'

type Resultado<R> = { ok: true; valor: R } | { ok: false; error: string }

// Envuelve una llamada al backend con su estado de carga y su error.
export function useAsyncAction<A extends unknown[], R>(accion: (...args: A) => Promise<R>) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ejecutar(...args: A): Promise<Resultado<R>> {
    setCargando(true)
    setError(null)
    try {
      return { ok: true, valor: await accion(...args) }
    } catch (e) {
      const mensaje = mensajeDeError(e)
      setError(mensaje)
      return { ok: false, error: mensaje }
    } finally {
      setCargando(false)
    }
  }

  return { ejecutar, cargando, error, limpiarError: () => setError(null) }
}
