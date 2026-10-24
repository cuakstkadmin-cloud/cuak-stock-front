import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import { urlImagen } from '../utils/imagenes'
import { labelClass } from '../utils/styles'
import { IMAGEN_FORMATOS, IMAGEN_MAX_MB, IMAGEN_TIPOS, validarImagen } from '../utils/validaciones'

// Qué pasa con la imagen al guardar
export type CambioImagen = { tipo: 'conservar' } | { tipo: 'nueva'; archivo: File } | { tipo: 'quitar' }

interface ImagePickerProps {
  label: string
  imagenActual: string | null // La que ya tiene el producto, si tiene
  cambio: CambioImagen
  onCambio: (cambio: CambioImagen) => void
  sugerencia?: string // Consejo dentro del recuadro vacío
}

// Recuadro para elegir o arrastrar una imagen, con vista previa antes de guardar.
function ImagePicker({ label, imagenActual, cambio, onCambio, sugerencia }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [arrastrando, setArrastrando] = useState(false)

  const archivo = cambio.tipo === 'nueva' ? cambio.archivo : null
  const vistaPrevia = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo])
  // La URL temporal del archivo se libera al cambiarlo o al cerrar el formulario
  useEffect(
    () => () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia)
    },
    [vistaPrevia],
  )

  const mostrada = cambio.tipo === 'nueva' ? vistaPrevia : cambio.tipo === 'quitar' ? null : urlImagen(imagenActual)

  function elegir(elegido: File | undefined) {
    if (!elegido) return
    const invalida = validarImagen(elegido)
    setError(invalida)
    if (!invalida) onCambio({ tipo: 'nueva', archivo: elegido })
  }

  function soltar(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setArrastrando(false)
    elegir(e.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={soltar}
        aria-label={mostrada ? 'Cambiar imagen' : 'Elegir imagen'}
        className={`flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border bg-tile p-4 text-center transition ${
          arrastrando ? 'border-primary ring-3 ring-primary/15' : 'border-line hover:border-subtle/50'
        }`}
      >
        {mostrada ? (
          <img src={mostrada} alt="Vista previa del producto" className="size-full object-contain" />
        ) : (
          <>
            <ImageIcon className="size-7 text-subtle" aria-hidden="true" />
            <span className="text-xs text-subtle">
              {IMAGEN_FORMATOS} · hasta {IMAGEN_MAX_MB} MB
              {sugerencia && (
                <>
                  <br />
                  {sugerencia}
                </>
              )}
            </span>
          </>
        )}
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-sm font-semibold transition hover:bg-surface"
        >
          <Upload className="size-4" />
          {mostrada ? 'Cambiar' : 'Subir imagen'}
        </button>
        {mostrada && (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={() => onCambio(imagenActual ? { tipo: 'quitar' } : { tipo: 'conservar' })}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-red-700 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGEN_TIPOS.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          elegir(e.target.files?.[0])
          e.target.value = '' // Permite volver a elegir el mismo archivo
        }}
      />
    </div>
  )
}

export default ImagePicker
