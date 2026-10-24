import { useEffect, useState } from 'react'
import { mensajeDeError } from '../services/api'

interface Estado<R> {
  clave: string
  claveFiltros: string
  respuesta?: R
  error?: string
}

// Ejecuta una consulta al backend cada vez que cambian sus parámetros. Mantiene la
// respuesta anterior mientras llega la nueva, para que la pantalla no parpadee.
// `consulta` debe ser una función estable (las de services/ lo son).
// `recargarCon`: cuando cambia, vuelve a consultar sin mandarlo al backend (p. ej. un
// contador que el componente padre sube tras registrar algo).
export function useApiQuery<F, R>(consulta: (filtros: F) => Promise<R>, filtros: F, recargarCon: number = 0) {
  const [version, setVersion] = useState(0)
  const claveFiltros = JSON.stringify(filtros)
  // Cambia con cada filtro o recarga; el estado guarda a qué clave corresponde la respuesta.
  const clave = JSON.stringify([claveFiltros, version, recargarCon])
  const [estado, setEstado] = useState<Estado<R>>({ clave: '', claveFiltros: '' })

  useEffect(() => {
    let vigente = true
    const [filtrosJson] = JSON.parse(clave) as [string, number]

    consulta(JSON.parse(filtrosJson) as F)
      .then((respuesta) => {
        if (vigente) setEstado({ clave, claveFiltros: filtrosJson, respuesta })
      })
      .catch((e) => {
        if (vigente) {
          setEstado((anterior) => ({ clave, claveFiltros: filtrosJson, respuesta: anterior.respuesta, error: mensajeDeError(e) }))
        }
      })

    return () => {
      vigente = false
    }
  }, [consulta, clave])

  const actual = estado.clave === clave

  return {
    respuesta: estado.respuesta,
    cargando: estado.claveFiltros !== claveFiltros, // Cambiaron los filtros: los datos en pantalla no corresponden
    actualizando: !actual, // Cualquier carga en curso, incluida una recarga con los mismos filtros
    error: actual ? estado.error : undefined,
    recargar: () => setVersion((v) => v + 1),
  }
}
