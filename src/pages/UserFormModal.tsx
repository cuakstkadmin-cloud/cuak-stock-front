import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import InfoNote from '../components/InfoNote'
import Modal from '../components/Modal'
import RadioCard from '../components/RadioCard'
import TextField from '../components/TextField'
import type { ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { actualizarUsuario, crearUsuario, type RolNegocio, type UsuarioNegocio } from '../services/usuarioService'
import { ROL_NEGOCIO_POR_DEFECTO, ROLES_ASIGNABLES } from '../utils/roles'

interface UserFormModalProps {
  usuario?: UsuarioNegocio // Si viene, el modal edita; si no, registra
  negocioNombre: string
  onClose: () => void
  onGuardado: (aviso: ToastData) => void
}

const FORM_ID = 'user-form'

function UserFormModal({ usuario, negocioNombre, onClose, onGuardado }: UserFormModalProps) {
  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [rol, setRol] = useState<RolNegocio>(usuario?.rol ?? ROL_NEGOCIO_POR_DEFECTO)

  const guardar = useAsyncAction(async (): Promise<ToastData> => {
    const datos = { nombre: nombre.trim(), email: email.trim(), rol }

    if (usuario) {
      await actualizarUsuario(usuario.id, datos)
      return { mensaje: 'Cambios guardados.' }
    }

    const { correoEnviado } = await crearUsuario(datos)
    return correoEnviado
      ? { mensaje: `Invitación enviada a ${datos.email}.` }
      : { mensaje: 'La persona quedó registrada, pero el correo no salió. Reenvía la invitación desde el menú.', tipo: 'aviso' }
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
      title={usuario ? 'Editar persona' : 'Registrar persona'}
      description={`Tendrá acceso a los datos de ${negocioNombre}.`}
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando}>
            {guardar.cargando ? 'Guardando…' : usuario ? 'Guardar cambios' : 'Registrar persona'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField id="nombre" label="Nombre" autoComplete="off" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <TextField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-semibold">Rol</legend>
          {ROLES_ASIGNABLES.map((opcion) => (
            <RadioCard
              key={opcion.rol}
              name="rol"
              value={opcion.rol}
              checked={rol === opcion.rol}
              onChange={setRol}
              title={opcion.label}
              description={opcion.descripcion}
            />
          ))}
        </fieldset>

        {!usuario && <InfoNote>Le llegará un correo de invitación para crear su contraseña.</InfoNote>}
        {guardar.error && <Alert>{guardar.error}</Alert>}
      </form>
    </Modal>
  )
}

export default UserFormModal
