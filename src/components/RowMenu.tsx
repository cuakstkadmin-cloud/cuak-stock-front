import { MoreHorizontal } from 'lucide-react'
import Dropdown, { type DropdownItem } from './Dropdown'

interface RowMenuProps {
  label: string
  items: DropdownItem[]
}

function RowMenu({ label, items }: RowMenuProps) {
  return (
    <Dropdown
      items={items}
      trigger={(props) => (
        <button
          type="button"
          aria-label={label}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink aria-expanded:bg-tile"
          {...props}
        >
          <MoreHorizontal className="size-[18px]" />
        </button>
      )}
    />
  )
}

export default RowMenu
