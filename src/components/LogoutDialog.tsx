import { useSession } from '../hooks/useSession'
import ConfirmDialog from './ConfirmDialog'

interface LogoutDialogProps {
  onClose: () => void
}

// Una sola confirmación para los dos accesos a cerrar sesión: el menú de la
// cuenta en el sidebar y el botón dentro del perfil.
function LogoutDialog({ onClose }: LogoutDialogProps) {
  const { cerrarSesion } = useSession()

  return (
    <ConfirmDialog
      title="Cerrar sesión"
      message="Saldrás de tu cuenta en este dispositivo y tendrás que iniciar sesión de nuevo."
      confirmLabel="Cerrar sesión"
      danger
      onConfirm={cerrarSesion}
      onClose={onClose}
    />
  )
}

export default LogoutDialog
