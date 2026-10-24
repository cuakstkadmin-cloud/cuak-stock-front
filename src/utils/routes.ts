// Única fuente de las rutas del front. Para cambiar una URL, se cambia acá.
export const RUTAS = {
  login: '/login',
  perfil: '/perfil',
  admin: '/admin',
  empresas: '/admin/empresas',
  inicio: '/inicio',
  inventario: '/inventario',
  detalleProducto: '/inventario/:id',
  productos: '/productos',
  contactos: '/clientes-proveedores',
  ventas: '/ventas',
  compras: '/compras',
  usuarios: '/usuarios',
} as const

// Rutas con parámetros, armadas a partir de las de arriba
export const rutaProducto = (id: string) => RUTAS.detalleProducto.replace(':id', id)
