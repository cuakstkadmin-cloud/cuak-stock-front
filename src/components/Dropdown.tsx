import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'

export interface DropdownItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  danger?: boolean
}

interface TriggerProps {
  ref: Ref<HTMLButtonElement>
  onClick: () => void
  'aria-expanded': boolean
  'aria-haspopup': 'menu'
}

interface DropdownProps {
  trigger: (props: TriggerProps) => ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end'
}

const GAP = 4
const ALTO_ITEM = 40

// El menú se pinta en un portal con posición fija: así no lo recorta el
// overflow de la tabla y se abre hacia arriba si no cabe abajo.
function Dropdown({ trigger, items, align = 'end' }: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!anchor) return

    const cerrar = () => setAnchor(null)
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      cerrar()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrar()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', cerrar, true)
    window.addEventListener('resize', cerrar)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', cerrar, true)
      window.removeEventListener('resize', cerrar)
    }
  }, [anchor])

  function toggle() {
    setAnchor(anchor ? null : (triggerRef.current?.getBoundingClientRect() ?? null))
  }

  let style: CSSProperties = {}
  if (anchor) {
    const altoMenu = items.length * ALTO_ITEM + 2 * GAP
    const abreArriba = anchor.bottom + GAP + altoMenu > window.innerHeight
    style = {
      ...(abreArriba ? { bottom: window.innerHeight - anchor.top + GAP } : { top: anchor.bottom + GAP }),
      ...(align === 'end' ? { right: window.innerWidth - anchor.right } : { left: anchor.left, minWidth: anchor.width }),
    }
  }

  return (
    <>
      {trigger({ ref: triggerRef, onClick: toggle, 'aria-expanded': anchor !== null, 'aria-haspopup': 'menu' })}
      {anchor &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={style}
            className="fixed z-50 min-w-44 rounded-xl border border-line bg-white p-1 shadow-lg"
          >
            {items.map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAnchor(null)
                  onClick()
                }}
                className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition hover:bg-surface ${
                  danger ? 'text-red-700' : 'text-ink'
                }`}
              >
                {Icon && <Icon className="size-4 shrink-0" />}
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

export default Dropdown
