import { useState, type SubmitEvent } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Modal from '../components/Modal'
import PasswordField from '../components/PasswordField'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { cambiarPassword } from '../services/authService'
import { PASSWORD_MINIMO, validarPasswordNueva } from '../utils/validaciones'

const FORM_ID = 'change-password-form'

interface ChangePasswordModalProps {
  onClose: () => void
  onCambiada: () => void
}

function ChangePasswordModal({ onClose, onCambiada }: ChangePasswordModalProps) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const guardar = useAsyncAction(() => cambiarPassword(actual, nueva))

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const invalida = validarPasswordNueva(nueva, confirmacion)
    setErrorLocal(invalida)
    if (invalida) return

    const resultado = await guardar.ejecutar()
    if (resultado.ok) onCambiada()
  }

  const cerrar = () => {
    if (!guardar.cargando) onClose()
  }

  const error = errorLocal ?? guardar.error

  return (
    <Modal
      title="Cambiar contraseña"
      size="sm"
      onClose={cerrar}
      footer={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={guardar.cargando}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={guardar.cargando}>
            {guardar.cargando ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordField
          id="passwordActual"
          label="Contraseña actual"
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <PasswordField
          id="passwordNueva"
          label="Contraseña nueva"
          autoComplete="new-password"
          placeholder={`Mínimo ${PASSWORD_MINIMO} caracteres`}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <PasswordField
          id="passwordConfirmacion"
          label="Confirma la contraseña nueva"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />
        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  )
}

export default ChangePasswordModal
