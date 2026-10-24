import type { ReactNode } from 'react'
import Button from './Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  message: ReactNode
  confirmLabel: string
  danger?: boolean
  cargando?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

function ConfirmDialog({ title, message, confirmLabel, danger, cargando, error, onConfirm, onClose }: ConfirmDialogProps) {
  const cerrar = () => {
    if (!cargando) onClose()
  }

  return (
    <Modal
      title={title}
      size="sm"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={cargando}>
            {cargando ? 'Procesando…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-[15px] text-muted">
        <p>{message}</p>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}

export default ConfirmDialog
