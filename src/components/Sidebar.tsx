import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import type { Usuario } from '../services/authService'
import UserCard from './UserCard'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

interface SidebarProps {
  header: ReactNode
  sections: NavSection[]
  usuario: Usuario
}

function Sidebar({ header, sections, usuario }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-[200px] shrink-0 flex-col border-r border-line bg-white px-2.5 py-4">
      <div className="px-2">{header}</div>

      <nav className="mt-6 flex flex-col gap-5">
        {sections.map((section, i) => (
          <div key={section.title ?? i} className="flex flex-col gap-1">
            {section.title && (
              <span className="px-3 pb-1 text-[11px] font-bold tracking-wider text-subtle uppercase">{section.title}</span>
            )}
            {section.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-secondary font-semibold text-white' : 'text-muted hover:bg-surface hover:text-ink'
                  }`
                }
              >
                <Icon className="size-[18px]" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto">
        <UserCard usuario={usuario} />
      </div>
    </aside>
  )
}

export default Sidebar
