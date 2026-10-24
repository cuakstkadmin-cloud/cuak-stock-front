import type { LucideIcon } from 'lucide-react'

interface FeatureItemProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

function FeatureItem({ icon: Icon, title, subtitle }: FeatureItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-tile">
        <Icon className="size-[18px]" />
      </span>
      <div className="flex flex-col">
        <span className="text-base font-bold">{title}</span>
        <span className="text-sm text-subtle">{subtitle}</span>
      </div>
    </li>
  )
}

export default FeatureItem
