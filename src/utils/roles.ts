import type { Rol } from '../services/authService'
import type { RolNegocio } from '../services/usuarioService'
import { RUTAS } from './routes'

export const ROLES_PLATAFORMA: readonly Rol[] = ['AdminGeneral', 'AdminGeneralSustituto']
export const ROLES_NEGOCIO: readonly Rol[] = ['AdminEmpresa', 'Usuario']
export const ROLES_ADMIN_NEGOCIO: readonly Rol[] = ['AdminEmpresa']

const NOMBRES_ROL: Record<Rol, string> = {
  AdminGeneral: 'Administrador general',
  AdminGeneralSustituto: 'Administrador sustituto',
  AdminEmpresa: 'Administrador de empresa',
  Usuario: 'Usuario',
}

// Roles que se asignan dentro de un negocio, con sus textos para la pantalla de Usuarios.
// `descripcion` va en el formulario; `alcance`, en la leyenda debajo de la tabla.
export const ROLES_ASIGNABLES: { rol: RolNegocio; label: string; descripcion: string; alcance: string }[] = [
  {
    rol: 'Usuario',
    label: 'Usuario',
    descripcion: 'Usa Inicio, Inventario, Ventas y Comprar.',
    alcance: 'Usa Inicio, Inventario, Ventas y Comprar. No ve esta sección.',
  },
  {
    rol: 'AdminEmpresa',
    label: 'Administrador',
    descripcion: 'Además puede registrar y desactivar personas.',
    alcance: 'Usa todos los módulos y además registra, edita o desactiva personas de la empresa.',
  },
]

export const ROL_NEGOCIO_POR_DEFECTO: RolNegocio = 'Usuario'

export function infoRolNegocio(rol: RolNegocio) {
  return ROLES_ASIGNABLES.find((r) => r.rol === rol) ?? ROLES_ASIGNABLES[0]
}

export function esAdminPlataforma(rol: Rol) {
  return ROLES_PLATAFORMA.includes(rol)
}

export function esAdminNegocio(rol: Rol) {
  return ROLES_ADMIN_NEGOCIO.includes(rol)
}

export function rutaInicio(rol: Rol) {
  return esAdminPlataforma(rol) ? RUTAS.empresas : RUTAS.inicio
}

export function nombreRol(rol: Rol) {
  return NOMBRES_ROL[rol]
}
