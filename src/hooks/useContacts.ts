import { listarContactos, type FiltrosContacto } from '../services/contactoService'
import { useApiQuery } from './useApiQuery'

export function useContacts(filtros: FiltrosContacto) {
  const { respuesta, ...estado } = useApiQuery(listarContactos, filtros)

  return {
    contactos: respuesta?.datos ?? [],
    paginacion: respuesta?.paginacion,
    resumen: respuesta?.resumen,
    ...estado,
  }
}
