import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { History, PackagePlus, type LucideIcon } from 'lucide-react'
import Tabs from '../components/Tabs'
import Toast, { type ToastData } from '../components/Toast'
import { useAppContext } from '../hooks/useAppContext'
import { MONEDA_POR_DEFECTO } from '../utils/monedas'
import PurchaseHistorySection from './PurchaseHistorySection'
import RestockSection from './RestockSection'

type Vista = 'reposicion' | 'historial'

const VISTAS: { value: Vista; label: string; icon: LucideIcon }[] = [
  { value: 'reposicion', label: 'Reposición', icon: PackagePlus },
  { value: 'historial', label: 'Historial', icon: History },
]

const VISTA_POR_DEFECTO: Vista = 'reposicion'
// La vista elegida va en la URL (?vista=historial): sobrevive al recargar y funciona con "atrás"
const PARAMETRO_VISTA = 'vista'

const esVista = (valor: string | null): valor is Vista => VISTAS.some((vista) => vista.value === valor)

function PurchasesPage() {
  const { negocio } = useAppContext()
  const moneda = negocio?.moneda ?? MONEDA_POR_DEFECTO

  const [searchParams, setSearchParams] = useSearchParams()
  const parametro = searchParams.get(PARAMETRO_VISTA)
  const vista: Vista = esVista(parametro) ? parametro : VISTA_POR_DEFECTO

  const [toast, setToast] = useState<ToastData | null>(null)
  // Sube cuando el historial recibe o anula una compra: cambia el stock de la reposición
  const [versionReposicion, setVersionReposicion] = useState(0)

  function cambiarVista(nueva: Vista) {
    setSearchParams(nueva === VISTA_POR_DEFECTO ? {} : { [PARAMETRO_VISTA]: nueva })
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Compras</h1>
        <Tabs value={vista} onChange={cambiarVista} items={VISTAS} />
      </header>

      {/* Reposición queda montada para no perder los productos marcados al cambiar de pestaña */}
      <div hidden={vista !== 'reposicion'}>
        <RestockSection moneda={moneda} version={versionReposicion} onAviso={setToast} />
      </div>

      {vista === 'historial' && (
        <PurchaseHistorySection
          moneda={moneda}
          onCambio={(aviso) => {
            setToast(aviso)
            setVersionReposicion((v) => v + 1)
          }}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default PurchasesPage
