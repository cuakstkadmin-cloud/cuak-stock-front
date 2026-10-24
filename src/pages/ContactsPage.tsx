import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import Tabs from '../components/Tabs'
import Toast, { type ToastData } from '../components/Toast'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useContacts } from '../hooks/useContacts'
import { useDebounce } from '../hooks/useDebounce'
import { eliminarContacto, type Contacto } from '../services/contactoService'
import { TIPO_CONTACTO_POR_DEFECTO, TIPOS_CONTACTO } from '../utils/contactos'
import { textoDocumento } from '../utils/documentos'
import { iniciales, plural } from '../utils/format'
import ContactFormModal from './ContactFormModal'

// La pestaña elegida va en la URL (?tipo=proveedores): sobrevive al recargar y funciona con "atrás"
const PARAMETRO_TIPO = 'tipo'

const thClass = 'px-3 py-3 font-medium first:pl-5 last:pr-5'
const tdClass = 'px-3 py-3 first:pl-5 last:pr-5'
const iconButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition hover:bg-tile hover:text-ink'

function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const info = TIPOS_CONTACTO.find((t) => t.param === searchParams.get(PARAMETRO_TIPO)) ?? TIPO_CONTACTO_POR_DEFECTO

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const buscar = useDebounce(busqueda.trim())
  const { contactos, paginacion, resumen, cargando, error, recargar } = useContacts({
    tipo: info.tipo,
    buscar: buscar || undefined,
    pagina,
  })

  const [formulario, setFormulario] = useState<{ contacto?: Contacto } | null>(null)
  const [porEliminar, setPorEliminar] = useState<Contacto | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const eliminar = useAsyncAction((contacto: Contacto) => eliminarContacto(contacto.id))

  function cambiarTipo(param: string) {
    setSearchParams(param === TIPO_CONTACTO_POR_DEFECTO.param ? {} : { [PARAMETRO_TIPO]: param })
    setBusqueda('')
    setPagina(1)
  }

  async function confirmarEliminacion(contacto: Contacto) {
    const resultado = await eliminar.ejecutar(contacto)
    if (!resultado.ok) return // El error se muestra en el diálogo
    setPorEliminar(null)
    setToast({ mensaje: `${contacto.nombre} se eliminó.` })
    // Si era el último de la página, se vuelve a la anterior para no quedar en una página vacía
    if (contactos.length === 1 && pagina > 1) setPagina(pagina - 1)
    recargar()
  }

  const cargaInicial = cargando && !paginacion

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">Clientes y proveedores</h1>
          <p className="text-sm text-muted">{info.descripcion}</p>
        </div>
        <Button onClick={() => setFormulario({})}>
          <Plus className="size-[18px]" />
          {info.boton}
        </Button>
      </header>

      <Tabs
        variant="underline"
        value={info.param}
        onChange={cambiarTipo}
        items={TIPOS_CONTACTO.map(({ param, label, icon, tipo }) => ({ value: param, label, icon, count: resumen?.[tipo] }))}
      />

      <SearchInput
        className="w-full sm:w-80"
        placeholder={info.buscar}
        aria-label={info.buscar}
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value)
          setPagina(1)
        }}
      />

      <div className="rounded-2xl border border-line bg-white">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-muted">{error}</p>
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-subtle">
                  <th className={thClass}>{info.columna}</th>
                  <th className={thClass}>Documento</th>
                  <th className={thClass}>Teléfono</th>
                  <th className={thClass}>Correo</th>
                  <th className={`${thClass} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                {cargaInicial || contactos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      {cargaInicial ? 'Cargando…' : buscar ? 'No hay resultados para esa búsqueda.' : info.vacio}
                    </td>
                  </tr>
                ) : (
                  contactos.map((contacto) => (
                    <tr key={contacto.id} className="border-b border-line last:border-0">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-xs font-bold">
                            {iniciales(contacto.nombre)}
                          </span>
                          <span className="truncate font-semibold">{contacto.nombre}</span>
                        </div>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>
                        {textoDocumento(contacto.tipoDocumento, contacto.numeroDocumento) ?? '—'}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{contacto.telefono ?? '—'}</td>
                      <td className={`${tdClass} text-muted`}>{contacto.email ?? '—'}</td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-0.5">
                          <button
                            type="button"
                            aria-label={`Editar ${contacto.nombre}`}
                            onClick={() => setFormulario({ contacto })}
                            className={iconButtonClass}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Eliminar ${contacto.nombre}`}
                            onClick={() => {
                              eliminar.limpiarError()
                              setPorEliminar(contacto)
                            }}
                            className={`${iconButtonClass} hover:bg-red-50 hover:text-red-700`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {paginacion && paginacion.totalPaginas > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-surface/60 px-5 py-3 text-[13px] text-subtle">
            <p>{`Mostrando ${contactos.length} de ${plural(paginacion.total, info.singular, info.label.toLowerCase())}`}</p>
            <Pagination pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onChange={setPagina} />
          </div>
        )}
      </div>

      {formulario && (
        <ContactFormModal
          tipo={info.tipo}
          contacto={formulario.contacto}
          onClose={() => setFormulario(null)}
          onGuardado={(aviso) => {
            setFormulario(null)
            setToast(aviso)
            recargar()
          }}
        />
      )}

      {porEliminar && (
        <ConfirmDialog
          title={`Eliminar ${info.singular}`}
          message={
            <>
              Se eliminará <strong className="text-ink">{porEliminar.nombre}</strong>. No se puede deshacer. {info.alEliminar}
            </>
          }
          confirmLabel="Eliminar"
          danger
          cargando={eliminar.cargando}
          error={eliminar.error}
          onConfirm={() => confirmarEliminacion(porEliminar)}
          onClose={() => setPorEliminar(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ContactsPage
