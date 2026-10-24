import { Package } from 'lucide-react'
import { APP_NAME } from '../utils/env'

interface AppLogoProps {
  subtitle?: string
}

function AppLogo({ subtitle }: AppLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-secondary text-white">
        <Package className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-base leading-tight font-bold">{APP_NAME}</span>
        {subtitle && <span className="truncate text-xs text-subtle">{subtitle}</span>}
      </div>
    </div>
  )
}

export default AppLogo
