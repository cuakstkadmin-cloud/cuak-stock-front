import { COLOR_PRIMARY, COLOR_SECONDARY } from './env'

const COLORES = {
  '--color-primary': COLOR_PRIMARY,
  '--color-secondary': COLOR_SECONDARY,
}

// Pisa los colores por defecto de index.css con los del .env, si vienen.
export function aplicarTema() {
  for (const [variable, valor] of Object.entries(COLORES)) {
    if (valor) document.documentElement.style.setProperty(variable, valor)
  }
}
