import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import CompaniesPage from './pages/CompaniesPage'
import ContactsPage from './pages/ContactsPage'
import HomePage from './pages/HomePage'
import InventoryPage from './pages/InventoryPage'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProfilePage from './pages/ProfilePage'
import PurchasesPage from './pages/PurchasesPage'
import SalesPage from './pages/SalesPage'
import SetPasswordPage from './pages/SetPasswordPage'
import UsersPage from './pages/UsersPage'
import { RUTAS_INVITACION } from './services/authService'
import { ROLES_ADMIN_NEGOCIO, ROLES_NEGOCIO, ROLES_PLATAFORMA } from './utils/roles'
import { RUTAS } from './utils/routes'

function App() {
  return (
    <Routes>
      <Route path={RUTAS.login} element={<LoginPage />} />
      {RUTAS_INVITACION.map((ruta) => (
        <Route key={ruta} path={ruta} element={<SetPasswordPage ruta={ruta} />} />
      ))}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Todos los roles */}
          <Route path={RUTAS.perfil} element={<ProfilePage />} />

          <Route element={<ProtectedRoute roles={ROLES_PLATAFORMA} />}>
            <Route path={RUTAS.admin} element={<Navigate to={RUTAS.empresas} replace />} />
            <Route path={RUTAS.empresas} element={<CompaniesPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={ROLES_NEGOCIO} />}>
            <Route path={RUTAS.inicio} element={<HomePage />} />
            <Route path={RUTAS.inventario} element={<InventoryPage />} />
            <Route path={RUTAS.detalleProducto} element={<ProductDetailPage />} />
            <Route path={RUTAS.ventas} element={<SalesPage />} />
            <Route path={RUTAS.compras} element={<PurchasesPage />} />
            <Route path={RUTAS.productos} element={<ProductsPage />} />
            <Route path={RUTAS.contactos} element={<ContactsPage />} />

            <Route element={<ProtectedRoute roles={ROLES_ADMIN_NEGOCIO} />}>
              <Route path={RUTAS.usuarios} element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={RUTAS.login} replace />} />
    </Routes>
  )
}

export default App
