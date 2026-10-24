// Tipos de documento de identidad que se aceptan para clientes y proveedores.
// `value` es lo que se guarda y se muestra antes del número ("CC 1.090.456.789").
export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CE', label: 'Cédula de extranjería (CE)' },
  { value: 'PAS', label: 'Pasaporte' },
] as const

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]['value']

// "CC 1.090.456.789", o null si no tiene documento
export function textoDocumento(tipo: TipoDocumento | null, numero: string | null) {
  if (!numero) return null
  return tipo ? `${tipo} ${numero}` : numero
}
