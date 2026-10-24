import { useState } from 'react'
import { ApiError, mensajeDeError } from '../services/api'
import { asignarPassword, type RutaInvitacion } from '../services/authService'
import { clearSession } from '../utils/session'
import { PASSWORD_MINIMO, validarPasswordNueva } from '../utils/validaciones'

// Errores que dejan el link inservible: no tiene sentido volver a intentar con el mismo.
function esEnlaceInservible(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.codigo === 'INVITACION_VENCIDA' || error.codigo === 'INVITACION_INVALIDA')
  )
}

export function useSetPassword(ruta: RutaInvitacion, token: string) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enlaceInservible, setEnlaceInservible] = useState(false)
  const [exito, setExito] = useState<string | null>(null)

  async function crearPassword(password: string, confirmacion: string) {
    const invalida = validarPasswordNueva(password, confirmacion)
    if (invalida) {
      setError(invalida)
      return
    }

    setCargando(true)
    setError(null)
    try {
      const { mensaje } = await asignarPassword(ruta, token, password)
      // Si había otra sesión abierta en este navegador, se cierra para entrar con la cuenta nueva
      clearSession()
      setExito(mensaje)
    } catch (e) {
      setError(mensajeDeError(e))
      setEnlaceInservible(esEnlaceInservible(e))
    } finally {
      setCargando(false)
    }
  }

  return { crearPassword, cargando, error, enlaceInservible, exito, minimo: PASSWORD_MINIMO }
}
