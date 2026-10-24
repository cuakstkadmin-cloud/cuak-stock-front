import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatearDia } from '../utils/format'
import { PERIODOS_PREDEFINIDOS, rangoDe, type Periodo } from '../utils/periodos'
import DateRangeModal from './DateRangeModal'
import Tabs from './Tabs'

interface PeriodTabsProps {
  value: Periodo
  onChange: (periodo: Periodo) => void
}

type TabPeriodo = Periodo['tipo']

// Hoy / 7 días / 30 días / Personalizado. "Personalizado" abre el selector de fechas
// y, una vez elegido, muestra el rango en la pestaña.
function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  const [eligiendoRango, setEligiendoRango] = useState(false)

  function cambiar(tipo: TabPeriodo) {
    if (tipo === 'personalizado') setEligiendoRango(true)
    else onChange({ tipo })
  }

  const rango = rangoDe(value)
  const etiquetaPersonalizado =
    value.tipo === 'personalizado' ? `${formatearDia(rango.desde)} – ${formatearDia(rango.hasta)}` : 'Personalizado'

  return (
    <>
      <Tabs<TabPeriodo>
        value={value.tipo}
        onChange={cambiar}
        items={[
          ...PERIODOS_PREDEFINIDOS.map(({ tipo, label }) => ({ value: tipo, label })),
          { value: 'personalizado', label: etiquetaPersonalizado, icon: CalendarDays },
        ]}
      />

      {eligiendoRango && (
        <DateRangeModal
          desde={value.tipo === 'personalizado' ? value.desde : undefined}
          hasta={value.tipo === 'personalizado' ? value.hasta : undefined}
          onClose={() => setEligiendoRango(false)}
          onAplicar={(rangoElegido) => {
            setEligiendoRango(false)
            onChange({ tipo: 'personalizado', ...rangoElegido })
          }}
        />
      )}
    </>
  )
}

export default PeriodTabs
