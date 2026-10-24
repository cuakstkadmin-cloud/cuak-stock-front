import type { ReactNode } from 'react'
import { Mail, type LucideIcon } from 'lucide-react'

interface InfoNoteProps {
  icon?: LucideIcon
  children: ReactNode
}

function InfoNote({ icon: Icon = Mail, children }: InfoNoteProps) {
  return (
    <div className="flex gap-2.5 rounded-lg bg-surface px-3.5 py-3 text-sm text-muted">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  )
}

export default InfoNote
