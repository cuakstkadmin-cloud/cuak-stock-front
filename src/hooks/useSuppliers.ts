import { listarContactos } from '../services/contactoService'
import { useApiQuery } from './useApiQuery'

// Cuántos proveedores trae el select. Es el máximo de una página en el backend;
// si un negocio llega a tener más, el select pasa a ser un buscador.
export const PROVEEDORES_EN_SELECT = 100

const consultar = () => listarContactos({ tipo: 'Proveedor', porPagina: PROVEEDORES_EN_SELECT }).then((pagina) => pagina.datos)

// Proveedores del negocio, para elegir uno en productos y compras.
export function useSuppliers() {
  const { respuesta, cargando, error } = useApiQuery(consultar, {})
  return { proveedores: respuesta ?? [], cargando, error }
}
