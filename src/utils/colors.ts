// Colores para los gráficos, derivados de los tokens del tema (index.css / .env).
// Chart.js pinta en un <canvas>, así que necesita los valores reales, no clases de Tailwind.

// Lee el valor actual de un token CSS, p. ej. leerToken('--color-primary') -> "#1f6b4f"
export function leerToken(nombre: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

const aLineal = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const deLineal = (c: number) => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

// Matiz OKLCH (en radianes) de un color #rrggbb
function matizDe(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => aLineal(parseInt(hex.slice(i, i + 2), 16)))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return Math.atan2(bb, a)
}

function oklchAHex(L: number, C: number, H: number) {
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${rgb.map((c) => deLineal(c).toString(16).padStart(2, '0')).join('')}`
}

// Dos pasos del matiz de la marca, validados (luminosidad 0,43–0,77, croma >= 0,10,
// ΔE >= 25 entre ellos, también con daltonismo). Si el primario cambia en el .env,
// los pasos siguen su matiz y conservan esas propiedades.
const PASO_CLARO = { L: 0.74, C: 0.1 }
const PASO_OSCURO = { L: 0.48, C: 0.105 }

export function coloresDeSerie() {
  const primario = leerToken('--color-primary')
  // Si el token no es un #rrggbb, se usa el primario tal cual para las dos series
  if (!/^#[0-9a-f]{6}$/i.test(primario)) return { claro: primario, oscuro: primario }
  const H = matizDe(primario)
  return { claro: oklchAHex(PASO_CLARO.L, PASO_CLARO.C, H), oscuro: oklchAHex(PASO_OSCURO.L, PASO_OSCURO.C, H) }
}
