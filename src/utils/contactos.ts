import { Truck, UserRound, type LucideIcon } from 'lucide-react'
import type { TipoContacto } from '../services/contactoService'

// Textos y comportamiento de cada pestaña de Clientes y proveedores.
// `param` es el valor de ?tipo= en la URL.
export interface InfoTipoContacto {
  tipo: TipoContacto
  param: string
  label: string
  icon: LucideIcon
  singular: string
  columna: string // Encabezado de la primera columna de la tabla
  descripcion: string
  boton: string
  buscar: string
  vacio: string
  alEliminar: string // Qué pasa con lo relacionado al eliminarlo
}

export const TIPOS_CONTACTO: InfoTipoContacto[] = [
  {
    tipo: 'Cliente',
    param: 'clientes',
    label: 'Clientes',
    icon: UserRound,
    singular: 'cliente',
    columna: 'Cliente',
    descripcion: 'A quién le vendes: datos de contacto de tus clientes.',
    boton: 'Nuevo cliente',
    buscar: 'Buscar cliente...',
    vacio: 'Todavía no hay clientes registrados.',
    alEliminar: '',
  },
  {
    tipo: 'Proveedor',
    param: 'proveedores',
    label: 'Proveedores',
    icon: Truck,
    singular: 'proveedor',
    columna: 'Proveedor',
    descripcion: 'A quién le compras: datos de contacto de tus proveedores.',
    boton: 'Nuevo proveedor',
    buscar: 'Buscar proveedor...',
    vacio: 'Todavía no hay proveedores registrados.',
    alEliminar: 'Los productos y compras que lo tienen asignado quedarán sin proveedor.',
  },
]

export const TIPO_CONTACTO_POR_DEFECTO = TIPOS_CONTACTO[0]

export function infoTipoContacto(tipo: TipoContacto) {
  return TIPOS_CONTACTO.find((t) => t.tipo === tipo) ?? TIPO_CONTACTO_POR_DEFECTO
}
