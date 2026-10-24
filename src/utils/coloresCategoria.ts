// Fondo y texto de la portada de un producto sin imagen. El color sigue a la categoría
// (siempre el mismo para "Labios"), no a la posición en la lista.
const TONOS = [
  { fondo: 'bg-rose-100', texto: 'text-rose-700' },
  { fondo: 'bg-emerald-100', texto: 'text-emerald-800' },
  { fondo: 'bg-violet-100', texto: 'text-violet-700' },
  { fondo: 'bg-orange-100', texto: 'text-orange-800' },
  { fondo: 'bg-sky-100', texto: 'text-sky-800' },
  { fondo: 'bg-amber-100', texto: 'text-amber-800' },
]

const TONO_INACTIVO = { fondo: 'bg-tile', texto: 'text-subtle' }

// Hash simple y estable del texto: la misma categoría siempre cae en el mismo tono
function hashDe(texto: string) {
  let hash = 0
  for (const caracter of texto.trim().toLowerCase()) hash = (hash * 31 + caracter.charCodeAt(0)) >>> 0
  return hash
}

export function tonoDeCategoria(categoria: string, activo: boolean) {
  if (!activo) return TONO_INACTIVO
  return TONOS[hashDe(categoria) % TONOS.length]
}
