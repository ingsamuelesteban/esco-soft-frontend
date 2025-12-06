import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../app/utils/api'

export interface Cargo {
  id: number
  nombre: string
  descripcion?: string | null
}

export const useCargosStore = defineStore('cargos', {
  state: () => ({
    items: [] as Cargo[],
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    total: (state) => state.items.length,
    byId: (state) => (id: number | null | undefined) =>
      id == null ? undefined : state.items.find(c => c.id === id),
    options: (state) => state.items.map(c => ({ value: c.id, label: c.nombre })),
  },
  actions: {
    async fetchAll() {
      if (this.items.length > 0) return
      this.loading = true
      this.error = null
      startLoading()
      try {
        const data = await api.get<{ count: number; data: Cargo[] }>('/api/cargos')
        this.items = data.data
      } catch (e) {
        this.error = 'No se pudieron cargar los cargos'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },
  },
})
