import { useEffect, useEffectEvent, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  description?: string // Línea debajo del título
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  footerAside?: ReactNode // Texto a la izquierda del pie, junto a los botones
  size?: 'sm' | 'md' | 'lg'
  flush?: boolean // Cuerpo sin relleno, para contenidos con paneles propios
}

const sizes = {
  sm: 'max-w-[420px]',
  md: 'max-w-[490px]',
  lg: 'max-w-[840px]',
}

function Modal({ title, description, onClose, children, footer, footerAside, size = 'md', flush = false }: ModalProps) {
  const titleId = useId()
  const onEscape = useEffectEvent(onClose)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onEscape()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-2xl bg-white shadow-xl ${sizes[size]}`}
      >
        <header className={`flex items-start justify-between gap-4 px-6 pt-6 pb-4 ${flush ? 'border-b border-line' : ''}`}>
          <div className="flex flex-col gap-0.5">
            <h2 id={titleId} className="text-2xl font-bold">
              {title}
            </h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className={flush ? 'flex min-h-0 flex-1 flex-col overflow-y-auto' : 'overflow-y-auto px-6 pb-6'}>{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
            {footerAside && <div className="mr-auto text-sm text-muted">{footerAside}</div>}
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
