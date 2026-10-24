interface ChipGroupProps<T extends string> {
  label?: string // Para lectores de pantalla
  options: readonly T[]
  value: T | null
  onChange: (value: T | null) => void // Volver a tocar el elegido lo deselecciona
}

// Opciones en forma de píldora; una sola elegida, o ninguna.
function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opcion) => {
        const activo = opcion === value
        return (
          <button
            key={opcion}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(activo ? null : opcion)}
            className={`h-10 cursor-pointer rounded-full border px-4 text-sm font-medium transition ${
              activo ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-white text-ink hover:bg-surface'
            }`}
          >
            {opcion}
          </button>
        )
      })}
    </div>
  )
}

export default ChipGroup
