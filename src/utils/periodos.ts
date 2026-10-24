import { formatearDia, formatearFechaHora, formatearHora, formatearHoraCorta, formatearMes } from './format'

// Periodos de consulta (ventas, compras). Los límites se calculan en la hora local
// del navegador y se mandan al backend como ISO completo, con zona horaria.

export type PeriodoPredefinido = 'hoy' | '7dias' | '30dias'

export type Periodo = { tipo: PeriodoPredefinido } | { tipo: 'personalizado'; desde: string; hasta: string } // 'YYYY-MM-DD'

export const PERIODOS_PREDEFINIDOS: { tipo: PeriodoPredefinido; label: string; dias: number; descripcion: string }[] = [
  { tipo: 'hoy', label: 'Hoy', dias: 1, descripcion: 'de hoy' },
  { tipo: '7dias', label: '7 días', dias: 7, descripcion: 'de los últimos 7 días' },
  { tipo: '30dias', label: '30 días', dias: 30, descripcion: 'de los últimos 30 días' },
]

export const PERIODO_POR_DEFECTO: Periodo = { tipo: 'hoy' }

function inicioDelDia(fecha: Date) {
  const copia = new Date(fecha)
  copia.setHours(0, 0, 0, 0)
  return copia
}

function finDelDia(fecha: Date) {
  const copia = new Date(fecha)
  copia.setHours(23, 59, 59, 999)
  return copia
}

// 'YYYY-MM-DD' en hora local (new Date('YYYY-MM-DD') lo interpretaría en UTC)
function deFechaLocal(texto: string) {
  const [anio, mes, dia] = texto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// Fecha local en formato 'YYYY-MM-DD', para los <input type="date">
export function fechaLocalHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

// Rango estable durante el día: termina al final de hoy, no "ahora", para no cambiar en cada render.
export function rangoDe(periodo: Periodo): { desde: string; hasta: string } {
  if (periodo.tipo === 'personalizado') {
    return {
      desde: inicioDelDia(deFechaLocal(periodo.desde)).toISOString(),
      hasta: finDelDia(deFechaLocal(periodo.hasta)).toISOString(),
    }
  }

  const { dias } = PERIODOS_PREDEFINIDOS.find((p) => p.tipo === periodo.tipo)!
  const desde = inicioDelDia(new Date())
  desde.setDate(desde.getDate() - (dias - 1))
  return { desde: desde.toISOString(), hasta: finDelDia(new Date()).toISOString() }
}

const MS_POR_DIA = 24 * 60 * 60 * 1000

// Cuántos días abarca el periodo (hoy = 1)
export function diasDe(periodo: Periodo) {
  const { desde, hasta } = rangoDe(periodo)
  return Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / MS_POR_DIA)
}

// Mismo largo, justo antes: para comparar ("↑ 15% vs. periodo anterior"). Hoy -> ayer.
export function rangoAnterior(periodo: Periodo) {
  const dias = diasDe(periodo)
  const desde = new Date(rangoDe(periodo).desde)
  const hastaAnterior = new Date(desde)
  hastaAnterior.setDate(hastaAnterior.getDate() - 1)
  const desdeAnterior = new Date(desde)
  desdeAnterior.setDate(desdeAnterior.getDate() - dias)
  return { desde: inicioDelDia(desdeAnterior).toISOString(), hasta: finDelDia(hastaAnterior).toISOString() }
}

export type Agrupacion = 'hora' | 'dia' | 'semana' | 'mes'

// Cada cuánto agrupar un gráfico según el largo del periodo (hasta N días -> agrupación)
const AGRUPACIONES: { hastaDias: number; agrupacion: Agrupacion }[] = [
  { hastaDias: 1, agrupacion: 'hora' },
  { hastaDias: 14, agrupacion: 'dia' },
  { hastaDias: 90, agrupacion: 'semana' },
]

export function agrupacionDe(periodo: Periodo): Agrupacion {
  const dias = diasDe(periodo)
  return AGRUPACIONES.find((a) => dias <= a.hastaDias)?.agrupacion ?? 'mes'
}

// Nombre de cada tramo del gráfico: "3 p. m.", "25 sep", "Semana 2", "sep 2026"
export function etiquetaTramo(inicio: string, agrupacion: Agrupacion, indice: number) {
  if (agrupacion === 'hora') return formatearHoraCorta(inicio)
  if (agrupacion === 'dia') return formatearDia(inicio)
  if (agrupacion === 'semana') return `Semana ${indice + 1}`
  return formatearMes(inicio)
}

// Zona horaria del navegador, para que el backend agrupe por días y horas locales
export const ZONA_HORARIA = Intl.DateTimeFormat().resolvedOptions().timeZone

// Hoy basta la hora; en periodos más largos hace falta también el día
export function formateadorMomento(periodo: Periodo) {
  return periodo.tipo === 'hoy' ? formatearHora : formatearFechaHora
}

// Encabezado de la columna de tiempo de los historiales
export function columnaMomento(periodo: Periodo) {
  return periodo.tipo === 'hoy' ? 'Hora' : 'Fecha'
}

// Para textos como "Mostrando 7 de 12 ventas de hoy"
export function descripcionDe(periodo: Periodo) {
  if (periodo.tipo === 'personalizado') return 'del periodo'
  return PERIODOS_PREDEFINIDOS.find((p) => p.tipo === periodo.tipo)!.descripcion
}
