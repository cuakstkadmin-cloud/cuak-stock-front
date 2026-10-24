import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-subtle" />
      <input
        type="search"
        className="h-11 w-full rounded-lg border border-line bg-white pr-3.5 pl-10 text-[15px] outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
        {...props}
      />
    </div>
  )
}

export default SearchInput
