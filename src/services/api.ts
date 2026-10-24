import { API_URL } from '../utils/env'
import { RUTAS } from '../utils/routes'
import { clearSession, getToken } from '../utils/session'

export class ApiError extends Error {
  status: number
  codigo?: string

  constructor(status: number, mensaje: string, codigo?: string) {
    super(mensaje)
    this.status = status
    this.codigo = codigo
  }
}

export interface Paginacion {
  pagina: number
  porPagina: number
  total: number
  totalPaginas: number
}

export interface Pagina<T> {
  datos: T[]
  paginacion: Paginacion
}

export function mensajeDeError(error: unknown) {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado.'
}

// { buscar: 'luna', tipo: undefined } -> "?buscar=luna"
export function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== '') query.set(clave, String(valor))
  }
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

interface RequestOptions extends RequestInit {
  auth?: boolean // false = no manda el JWT, aunque haya sesión abierta
}

export async function request<T>(path: string, { auth = true, ...options }: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  // Con archivos (FormData) el navegador arma el Content-Type con su separador
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const token = auth ? getToken() : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  // Token vencido o inválido: se cierra la sesión desde cualquier pantalla.
  if (res.status === 401 && token) {
    clearSession()
    window.location.replace(RUTAS.login)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(res.status, data?.mensaje ?? 'Ocurrió un error inesperado.', data?.codigo)
  }

  return data as T
}
