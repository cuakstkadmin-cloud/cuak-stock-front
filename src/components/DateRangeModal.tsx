import { useState, type SubmitEvent } from 'react'
import { fechaLocalHoy } from '../utils/periodos'
import Alert from './Alert'
import Button from './Button'
import Modal from './Modal'
import TextField from './TextField'

interface DateRangeModalProps {
  desde?: string // 'YYYY-MM-DD'
  hasta?: string
  onClose: () => void
  onAplicar: (rango: { desde: string; hasta: string }) => void
}

const FORM_ID = 'date-range-form'

// Elige un rango de fechas para "Personalizado".
function DateRangeModal({ desde: desdeInicial, hasta: hastaInicial, onClose, onAplicar }: DateRangeModalProps) {
  const hoy = fechaLocalHoy()
  const [desde, setDesde] = useState(desdeInicial ?? hoy)
  const [hasta, setHasta] = useState(hastaInicial ?? hoy)
  // Las fechas 'YYYY-MM-DD' se pueden comparar como texto
  const error = desde && hasta && desde > hasta ? 'La fecha inicial no puede ser posterior a la final.' : null

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!error) onAplicar({ desde, hasta })
  }

  return (
    <Modal
      title="Periodo personalizado"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={error !== null}>
            Aplicar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField id="desde" label="Desde" type="date" required max={hoy} value={desde} onChange={(e) => setDesde(e.target.value)} />
          <TextField id="hasta" label="Hasta" type="date" required max={hoy} value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  )
}

export default DateRangeModal
