import { API_URL } from './env'

// Las imágenes viven en el storage del backend y se sirven en "/storage/...".
// El backend devuelve la ruta relativa a la API ("/storage/productos/<negocio>/<archivo>.webp"),
// y acá se le antepone VITE_API_URL. Si algún día el storage pasa a la nube, el backend
// devolverá una URL completa ("https://...") y se usa tal cual, sin tocar el front.
export function urlImagen(ruta: string | null | undefined) {
  if (!ruta) return null
  return /^https?:\/\//.test(ruta) ? ruta : `${API_URL}${ruta}`
}
