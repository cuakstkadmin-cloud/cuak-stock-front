import { useEffect, useEffectEvent } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

export interface ToastData {
  mensaje: string
  tipo?: 'exito' | 'aviso' | 'error'
}

interface ToastProps {
  toast: ToastData
  onClose: () => void
}

const DURACION = 5000

const iconos = {
  exito: <CircleCheck className="size-5 shrink-0 text-emerald-300" />,
  aviso: <CircleAlert className="size-5 shrink-0 text-amber-300" />,
  error: <CircleAlert className="size-5 shrink-0 text-red-300" />,
}

function Toast({ toast, onClose }: ToastProps) {
  const cerrar = useEffectEvent(onClose)

  useEffect(() => {
    const timer = setTimeout(cerrar, DURACION)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div
      role="status"
      className="fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg"
    >
      {iconos[toast.tipo ?? 'exito']}
      <p className="flex-1">{toast.mensaje}</p>
      <button type="button" aria-label="Cerrar aviso" onClick={onClose} className="cursor-pointer text-white/60 hover:text-white">
        <X className="size-4" />
      </button>
    </div>
  )
}

export default Toast
