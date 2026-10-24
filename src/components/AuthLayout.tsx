import type { ReactNode } from 'react'
import { House, Package, ReceiptText, ShoppingCart } from 'lucide-react'
import AppLogo from './AppLogo'
import FeatureItem from './FeatureItem'

const features = [
  { icon: House, title: '¿Cómo va mi negocio?', subtitle: 'Inicio' },
  { icon: Package, title: '¿Qué tengo?', subtitle: 'Inventario' },
  { icon: ReceiptText, title: '¿Qué vendí?', subtitle: 'Ventas' },
  { icon: ShoppingCart, title: '¿Qué necesito comprar?', subtitle: 'Comprar' },
]

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
}

// Pantallas públicas (login, crear contraseña): formulario a la izquierda, presentación a la derecha.
function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-12">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
          <AppLogo />

          <div className="flex flex-1 flex-col justify-center gap-7 py-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold">{title}</h1>
              <p className="text-muted">{description}</p>
            </div>
            {children}
          </div>

          {/* Mismo alto que el logo, para que el formulario quede centrado igual que el aside */}
          <div aria-hidden="true" className="h-[38px]" />
        </div>
      </main>

      <aside className="hidden flex-1 flex-col justify-center border-l border-line bg-surface px-12 py-10 lg:flex">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-8">
          <h2 className="text-3xl leading-tight font-bold">Inventario, ventas y compras de tu negocio en un solo lugar.</h2>
          <ul className="flex flex-col gap-3">
            {features.map((feature) => (
              <FeatureItem key={feature.subtitle} {...feature} />
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default AuthLayout
