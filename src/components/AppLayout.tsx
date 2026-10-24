import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Building2, Contact, House, Package, ReceiptText, ShoppingCart, Tag, Users } from 'lucide-react'
import type { AppContext } from '../hooks/useAppContext'
import { obtenerSesion, type Usuario } from '../services/authService'
import { obtenerNegocio, type Negocio, type NegocioBase } from '../services/negocioService'
import { esAdminNegocio, esAdminPlataforma } from '../utils/roles'
import { RUTAS } from '../utils/routes'
import { getUsuario, updateSession } from '../utils/session'
import AppLogo from './AppLogo'
import BusinessBrand from './BusinessBrand'
import Sidebar, { type NavSection } from './Sidebar'

const SECCIONES_PLATAFORMA: NavSection[] = [{ items: [{ to: RUTAS.empresas, label: 'Empresas', icon: Building2 }] }]

const SECCION_NEGOCIO: NavSection = {
  items: [
    { to: RUTAS.inicio, label: 'Inicio', icon: House },
    { to: RUTAS.inventario, label: 'Inventario', icon: Package },
    { to: RUTAS.ventas, label: 'Ventas', icon: ReceiptText },
    { to: RUTAS.compras, label: 'Comprar', icon: ShoppingCart },
  ],
}

const SECCION_REGISTROS: NavSection = {
  title: 'Registros',
  items: [
    { to: RUTAS.productos, label: 'Productos', icon: Tag },
    { to: RUTAS.contactos, label: 'Clientes y proveedores', icon: Contact },
  ],
}

const SECCION_ADMINISTRACION: NavSection = {
  title: 'Administración',
  items: [{ to: RUTAS.usuarios, label: 'Usuarios', icon: Users }],
}

function seccionesDe(usuario: Usuario): NavSection[] {
  if (esAdminPlataforma(usuario.rol)) return SECCIONES_PLATAFORMA
  const secciones = [SECCION_NEGOCIO, SECCION_REGISTROS]
  return esAdminNegocio(usuario.rol) ? [...secciones, SECCION_ADMINISTRACION] : secciones
}

function AppLayout() {
  const [usuario, setUsuario] = useState(getUsuario)
  const [negocio, setNegocio] = useState<Negocio | null>(null)
  const negocioId = usuario?.negocioId

  // Valida el token una vez al entrar; si venció, request() cierra la sesión.
  useEffect(() => {
    obtenerSesion().catch(() => {})
  }, [])

  useEffect(() => {
    if (!negocioId) return
    let vigente = true
    obtenerNegocio(negocioId)
      .then((respuesta) => {
        if (vigente) setNegocio(respuesta)
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [negocioId])

  if (!usuario) return <Navigate to={RUTAS.login} replace />

  const contexto: AppContext = {
    usuario,
    negocio,
    actualizarUsuario: (nuevo, token) => {
      updateSession(nuevo, token)
      setUsuario(nuevo)
    },
    actualizarNegocio: (cambios: NegocioBase) => setNegocio((actual) => (actual ? { ...actual, ...cambios } : actual)),
  }

  const plataforma = esAdminPlataforma(usuario.rol)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        header={plataforma || !negocio ? <AppLogo subtitle={plataforma ? 'Administración general' : undefined} /> : <BusinessBrand negocio={negocio} />}
        sections={seccionesDe(usuario)}
        usuario={usuario}
      />
      <main className="min-w-0 flex-1 bg-surface">
        <Outlet context={contexto} />
      </main>
    </div>
  )
}

export default AppLayout
