// Idioma y región de todos los formatos de la app (fechas, números, moneda)
const LOCALE = 'es-CO'

// Intl agrega puntos en las abreviaturas ("ago."); el diseño no los lleva
const sinPuntos = (texto: string) => texto.replace(/\./g, '')

const formatoFecha = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const formatoFechaLarga = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })
const formatoDia = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const formatoHora = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true })
const formatoPorcentaje = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 })
const formatoFechaCompleta = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const formatoHoraCorta = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', hour12: true })
const formatoMes = new Intl.DateTimeFormat(LOCALE, { month: 'short', year: 'numeric' })
const formatoNumero = new Intl.NumberFormat(LOCALE)

// "12 ago 2026"
export function formatearFecha(iso: string) {
  return sinPuntos(formatoFecha.format(new Date(iso)))
}

// "12 de agosto de 2026"
export function formatearFechaLarga(iso: string) {
  return formatoFechaLarga.format(new Date(iso))
}

// "Viernes, 25 de septiembre de 2026"
export function formatearFechaCompleta(fecha: Date) {
  const texto = formatoFechaCompleta.format(fecha)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "3 p. m."
export function formatearHoraCorta(iso: string) {
  return formatoHoraCorta.format(new Date(iso))
}

// "sep 2026"
export function formatearMes(iso: string) {
  return sinPuntos(formatoMes.format(new Date(iso)))
}

// "25 sep"
export function formatearDia(iso: string) {
  return sinPuntos(formatoDia.format(new Date(iso)))
}

// "2:25 p. m."
export function formatearHora(iso: string) {
  return formatoHora.format(new Date(iso))
}

// "25 sep · 2:25 p. m."
export function formatearFechaHora(iso: string) {
  return `${formatearDia(iso)} · ${formatearHora(iso)}`
}

// formatearCantidad(1) -> "+1", formatearCantidad(-2) -> "−2"
export function formatearCantidad(cantidad: number) {
  return cantidad > 0 ? `+${cantidad}` : `−${Math.abs(cantidad)}`
}

function formatoMoneda(moneda: string) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
}

// formatearMoneda(10000, 'COP') -> "$10.000"
export function formatearMoneda(valor: number, moneda: string) {
  return formatoMoneda(moneda).format(valor).replace(/\s/g, '')
}

// formatearMonedaCompacta(1500000, 'COP') -> "$1,5 M" (para ejes de gráficos)
export function formatearMonedaCompacta(valor: number, moneda: string) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: moneda, notation: 'compact', maximumFractionDigits: 1 })
    .format(valor)
    .replace(/^([^\d\s]+)\s+/, '$1') // Solo el espacio tras el símbolo: "$ 0" -> "$0", "$1,5 M" se queda igual
}

// simboloMoneda('COP') -> "$", simboloMoneda('EUR') -> "€"
export function simboloMoneda(moneda: string) {
  return formatoMoneda(moneda).formatToParts(0).find((parte) => parte.type === 'currency')?.value ?? moneda
}

// formatearNumero(32000) -> "32.000"
export function formatearNumero(valor: number) {
  return formatoNumero.format(valor)
}

// formatearPorcentaje(0.391) -> "39,1%"
export function formatearPorcentaje(fraccion: number) {
  return formatoPorcentaje.format(fraccion).replace(/\s/g, '')
}

// Autor de un registro; los anteriores a guardar el autor llegan sin él
export function nombreAutor(usuario: { nombre: string } | null | undefined) {
  return usuario?.nombre ?? '—'
}

// "Carlos Rojas" -> "CR"
export function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

// plural(1, 'empresa', 'empresas') -> "1 empresa"
export function plural(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}
