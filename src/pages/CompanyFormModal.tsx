import { useState, type SubmitEvent } from 'react'
import Button from '../components/Button'
import InfoNote from '../components/InfoNote'
import Modal from '../components/Modal'
import RadioCard from '../components/RadioCard'
import SelectField from '../components/SelectField'
import TextField from '../components/TextField'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { actualizarNegocio, crearNegocio, type Negocio, type TipoNegocio } from '../services/negocioService'
import { MONEDA_POR_DEFECTO, MONEDAS } from '../utils/monedas'

interface CompanyFormModalProps {
  negocio?: Negocio // Si viene, el modal edita; si no, registra
  onClose: () => void
  onGuardado: (aviso: ToastData) => void
}

const TEXTOS: Record<TipoNegocio, { datos: string; nombre: string; admin: string; nota: string; boton: string }> = {
  Empresa: {
    datos: 'Datos de la empresa',
    nombre: 'Nombre de la empresa',
    admin: 'Administrador de la empresa',
    nota: 'El administrador recibirá una invitación por correo para crear su contraseña. Después podrá registrar a las personas de su empresa.',
    boton: 'Registrar empresa',
  },
  Persona: {
    datos: 'Datos del negocio',
    nombre: 'Nombre del negocio',
    admin: 'Datos de la persona',
    nota: 'Recibirá una invitación por correo para crear su contraseña y empezar a usar la app.',
    boton: 'Registrar persona',
  },
}

const FORM_ID = 'company-form'

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-xs font-bold tracking-wider text-subtle uppercase">{children}</h3>
}

function CompanyFormModal({ negocio, onClose, onGuardado }: CompanyFormModalProps) {
  const [tipo, setTipo] = useState<TipoNegocio>(negocio?.tipo ?? 'Empresa')
  const [nombre, setNombre] = useState(negocio?.nombre ?? '')
  const [moneda, setMoneda] = useState(negocio?.moneda ?? MONEDA_POR_DEFECTO)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [emailAdmin, setEmailAdmin] = useState('')

  const guardar = useAsyncAction(async (): Promise<ToastData> => {
    const datos = { tipo, nombre: nombre.trim(), moneda }

    if (negocio) {
      await actualizarNegocio(negocio.id, datos)
      return { mensaje: 'Cambios guardados.' }
    }

    const email = emailAdmin.trim()
    const { correoEnviado } = await crearNegocio({ ...datos, nombreAdmin: nombreAdmin.trim(), emailAdmin: email })
    return correoEnviado
      ? { mensaje: `Invitación enviada a ${email}.` }
      : { mensaje: 'La cuenta quedó registrada, pero el correo no salió. Reenvía la invitación desde el menú.', tipo: 'aviso' }
  })

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const resultado = await guardar.ejecutar()
    if (resultado.ok) onGuardado(resultado.valor)
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  const textos = TEXTOS[tipo]
  // Si la cuenta tiene una moneda fuera de la lista, se agrega para no perderla al editar
  const monedas = MONEDAS.some((m) => m.value === moneda) ? MONEDAS : [...MONEDAS, { value: moneda, label: moneda }]

  return (
    <Modal
      title={negocio ? 'Editar cuenta' : 'Registrar empresa'}
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando}>
            {guardar.cargando ? 'Guardando…' : negocio ? 'Guardar cambios' : textos.boton}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-semibold">Tipo de cuenta</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <RadioCard
              name="tipo"
              value="Empresa"
              checked={tipo === 'Empresa'}
              onChange={setTipo}
              title="Empresa"
              description="Negocio con varias personas."
            />
            <RadioCard
              name="tipo"
              value="Persona"
              checked={tipo === 'Persona'}
              onChange={setTipo}
              title="Persona"
              description="Alguien que maneja su negocio solo."
            />
          </div>
        </fieldset>

        <section className="flex flex-col gap-3">
          <SectionTitle>{textos.datos}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <TextField id="nombre" label={textos.nombre} required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <SelectField id="moneda" label="Moneda" options={monedas} value={moneda} onChange={(e) => setMoneda(e.target.value)} />
          </div>
        </section>

        {/* El administrador solo se define al registrar; PUT /negocio no lo cambia */}
        {!negocio && (
          <section className="flex flex-col gap-3">
            <SectionTitle>{textos.admin}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                id="nombreAdmin"
                label="Nombre"
                autoComplete="off"
                required
                value={nombreAdmin}
                onChange={(e) => setNombreAdmin(e.target.value)}
              />
              <TextField
                id="emailAdmin"
                label="Correo electrónico"
                type="email"
                autoComplete="off"
                required
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
              />
            </div>
          </section>
        )}

        {!negocio && <InfoNote>{textos.nota}</InfoNote>}

        {guardar.error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {guardar.error}
          </p>
        )}
      </form>
    </Modal>
  )
}

export default CompanyFormModal
