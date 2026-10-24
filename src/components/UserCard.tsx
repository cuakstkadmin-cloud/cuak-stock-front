import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react'
import type { Usuario } from '../services/authService'
import { iniciales } from '../utils/format'
import { RUTAS } from '../utils/routes'
import Dropdown from './Dropdown'
import LogoutDialog from './LogoutDialog'

interface UserCardProps {
  usuario: Usuario
}

// Menú de la cuenta: perfil y cerrar sesión a un clic, sin entrar al perfil.
// Cerrar sesión sigue estando también dentro del perfil.
function UserCard({ usuario }: UserCardProps) {
  const navigate = useNavigate()
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const enPerfil = useMatch(RUTAS.perfil) !== null

  return (
    <>
      <Dropdown
        align="start"
        items={[
          { label: 'Ver perfil', icon: UserRound, onClick: () => navigate(RUTAS.perfil) },
          { label: 'Cerrar sesión', icon: LogOut, onClick: () => setCerrandoSesion(true), danger: true },
        ]}
        trigger={(props) => (
          <button
            {...props}
            type="button"
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition ${
              enPerfil ? 'bg-secondary text-white' : 'hover:bg-surface'
            }`}
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                enPerfil ? 'bg-white/15' : 'bg-tile'
              }`}
            >
              {iniciales(usuario.nombre)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold">{usuario.nombre}</span>
              <span className={`truncate text-xs ${enPerfil ? 'text-white/70' : 'text-subtle'}`}>Mi cuenta</span>
            </span>
            <ChevronsUpDown className={`size-4 shrink-0 ${enPerfil ? 'text-white/70' : 'text-subtle'}`} />
          </button>
        )}
      />

      {cerrandoSesion && <LogoutDialog onClose={() => setCerrandoSesion(false)} />}
    </>
  )
}

export default UserCard
