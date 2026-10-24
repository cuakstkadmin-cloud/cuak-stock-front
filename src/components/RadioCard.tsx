interface RadioCardProps<T extends string> {
  name: string
  value: T
  checked: boolean
  onChange: (value: T) => void
  title: string
  description: string
}

function RadioCard<T extends string>({ name, value, checked, onChange, title, description }: RadioCardProps<T>) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
        checked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-line hover:border-subtle/50'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 size-[18px] shrink-0 accent-primary"
      />
      <span className="flex flex-col">
        <span className="font-bold">{title}</span>
        <span className="text-sm text-muted">{description}</span>
      </span>
    </label>
  )
}

export default RadioCard
