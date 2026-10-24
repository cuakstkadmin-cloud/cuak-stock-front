import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import SelectField from '../components/SelectField'
import TextAreaField from '../components/TextAreaField'
import TextField from '../components/TextField'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { actualizarContacto, crearContacto, type Contacto, type TipoContacto } from '../services/contactoService'
import { infoTipoContacto } from '../utils/contactos'
import { TIPOS_DOCUMENTO, type TipoDocumento } from '../utils/documentos'
import { LARGO_MAXIMO_NOTAS } from '../utils/validaciones'

interface ContactFormModalProps {
  tipo: TipoContacto
  contacto?: Contacto // Si viene, el modal edita; si no, crea
  onClose: () => void
  onGuardado: (aviso: ToastData) => void
}

const FORM_ID = 'contact-form'
const SIN_DOCUMENTO = ''

// Campo de texto opcional vacío = null
const textoOpcional = (valor: string) => valor.trim() || null

function ContactFormModal({ tipo, contacto, onClose, onGuardado }: ContactFormModalProps) {
  const info = infoTipoContacto(tipo)
  const [nombre, setNombre] = useState(contacto?.nombre ?? '')
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento | typeof SIN_DOCUMENTO>(contacto?.tipoDocumento ?? SIN_DOCUMENTO)
  const [numeroDocumento, setNumeroDocumento] = useState(contacto?.numeroDocumento ?? '')
  const [telefono, setTelefono] = useState(contacto?.telefono ?? '')
  const [email, setEmail] = useState(contacto?.email ?? '')
  const [notas, setNotas] = useState(contacto?.notas ?? '')

  const sinDocumento = tipoDocumento === SIN_DOCUMENTO

  const guardar = useAsyncAction(async (): Promise<ToastData> => {
    const datos = {
      nombre: nombre.trim(),
      tipoDocumento: sinDocumento ? null : tipoDocumento,
      numeroDocumento: sinDocumento ? null : textoOpcional(numeroDocumento),
      telefono: textoOpcional(telefono),
      email: textoOpcional(email),
      notas: textoOpcional(notas),
    }

    if (contacto) {
      await actualizarContacto(contacto.id, datos)
      return { mensaje: 'Cambios guardados.' }
    }
    await crearContacto({ ...datos, tipo })
    return { mensaje: `${datos.nombre} se agregó a tus ${info.label.toLowerCase()}.` }
  })

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const resultado = await guardar.ejecutar()
    if (resultado.ok) onGuardado(resultado.valor)
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  return (
    <Modal
      title={contacto ? `Editar ${info.singular}` : info.boton}
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando}>
            {guardar.cargando ? 'Guardando…' : contacto ? 'Guardar cambios' : `Crear ${info.singular}`}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            id="nombre"
            label="Nombre o razón social *"
            placeholder={tipo === 'Cliente' ? 'Ej.: Ana María Pérez' : 'Ej.: Distribuidora Bella'}
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <SelectField
          id="tipoDocumento"
          label="Tipo de documento"
          options={[{ value: SIN_DOCUMENTO, label: 'Sin documento' }, ...TIPOS_DOCUMENTO]}
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento | typeof SIN_DOCUMENTO)}
        />
        <TextField
          id="numeroDocumento"
          label="Número de documento"
          placeholder={sinDocumento ? '—' : 'Ej.: 1.090.456.789'}
          disabled={sinDocumento}
          required={!sinDocumento}
          value={sinDocumento ? '' : numeroDocumento}
          onChange={(e) => setNumeroDocumento(e.target.value)}
        />
        <TextField
          id="telefono"
          label="Teléfono"
          type="tel"
          autoComplete="off"
          placeholder="Ej.: 311 555 0156"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <TextField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="off"
          placeholder="Opcional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            id="notas"
            label="Notas"
            placeholder={tipo === 'Cliente' ? 'Opcional: preferencias, dirección de entrega…' : 'Opcional: días de pedido, condiciones de pago…'}
            maxLength={LARGO_MAXIMO_NOTAS}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {guardar.error && (
          <div className="sm:col-span-2">
            <Alert>{guardar.error}</Alert>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default ContactFormModal
