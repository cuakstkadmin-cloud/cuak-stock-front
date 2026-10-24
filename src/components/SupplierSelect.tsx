import { useSuppliers } from '../hooks/useSuppliers'
import SelectField from './SelectField'

interface SupplierSelectProps {
  id: string
  label: string
  value: string | null // id del proveedor
  nombreActual?: string | null // Por si el elegido no viene en la lista (p. ej. pasó del límite)
  onChange: (proveedorId: string | null) => void
}

const SIN_PROVEEDOR = ''

// Elige un proveedor registrado en Clientes y proveedores.
function SupplierSelect({ id, label, value, nombreActual, onChange }: SupplierSelectProps) {
  const { proveedores, cargando } = useSuppliers()

  const opciones = [
    { value: SIN_PROVEEDOR, label: cargando ? 'Cargando proveedores…' : 'Sin proveedor' },
    ...proveedores.map((proveedor) => ({ value: proveedor.id, label: proveedor.nombre })),
  ]
  // Conserva el elegido aunque no esté en la lista, para no perderlo al guardar
  if (value && !proveedores.some((proveedor) => proveedor.id === value)) {
    opciones.push({ value, label: nombreActual ?? 'Proveedor actual' })
  }

  return (
    <SelectField
      id={id}
      label={label}
      options={opciones}
      value={value ?? SIN_PROVEEDOR}
      onChange={(e) => onChange(e.target.value === SIN_PROVEEDOR ? null : e.target.value)}
    />
  )
}

export default SupplierSelect
