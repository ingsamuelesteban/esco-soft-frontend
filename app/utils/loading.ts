import { useUiStore } from '../stores/ui'

// Control de concurrencia y visibilidad mínima (para evitar parpadeos)
let activeCount = 0
let startAt = 0
const MIN_VISIBLE_MS = 350

/**
 * Inicia la barra de carga (usa el indicador oficial de Nuxt)
 */
export const startLoading = () => {
  if (!process.client) return
  const ui = useUiStore()
  if (activeCount === 0) {
    startAt = Date.now()
    ui.setLoading(true)
  }
  activeCount++
}

/**
 * Finaliza la barra de carga (mantiene una visibilidad mínima)
 */
export const finishLoading = () => {
  if (!process.client) return
  const ui = useUiStore()
  if (activeCount > 0) activeCount--
  if (activeCount === 0) {
    const elapsed = Date.now() - startAt
    const remaining = MIN_VISIBLE_MS - elapsed
    const hide = () => ui.setLoading(false)
    if (remaining > 0) setTimeout(hide, remaining)
    else hide()
  }
}

// Utilidades opcionales (no operativas con el indicador oficial, se dejan como no-ops)
export const incrementLoading = (_amount?: number) => {}
export const setLoading = (_progress: number) => {}
