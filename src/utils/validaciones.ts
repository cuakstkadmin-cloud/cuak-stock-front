// Mismo mínimo que exige el backend (PASSWORD_DEBIL).
export const PASSWORD_MINIMO = 8

// Descripción de un producto del catálogo. Mismo límite que el backend.
export const LARGO_MAXIMO_DESCRIPCION = 500

// Notas de un cliente o proveedor. Mismo límite que el backend.
export const LARGO_MAXIMO_NOTAS = 500

// Imagen de un producto. Mismos límites que el backend.
export const IMAGEN_TIPOS = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGEN_FORMATOS = 'JPG, PNG o WebP'
export const IMAGEN_MAX_MB = 2

export function validarImagen(archivo: File): string | null {
  if (!IMAGEN_TIPOS.includes(archivo.type)) return `La imagen debe ser ${IMAGEN_FORMATOS}.`
  if (archivo.size > IMAGEN_MAX_MB * 1024 * 1024) return `La imagen no puede pesar más de ${IMAGEN_MAX_MB} MB.`
  return null
}

// Devuelve el mensaje de error, o null si la contraseña nueva es válida.
export function validarPasswordNueva(password: string, confirmacion: string): string | null {
  if (password.length < PASSWORD_MINIMO) return `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres.`
  if (password !== confirmacion) return 'Las contraseñas no coinciden.'
  return null
}
