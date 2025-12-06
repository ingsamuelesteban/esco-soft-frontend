import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'

export interface Materia {
  id: number
  codigo: string
  nombre: string
  tipo: 'Academico' | 'Tecnico'
  descripcion?: string
  activo: boolean
  created_at?: string
  updated_at?: string
}

export const useMateriasStore = defineStore('materias', {
  state: () => ({
    items: [] as Materia[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    total: (state) => state.items.length
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const data = await $fetch<Materia[]>('/data/materias.json')
        this.items = data
      } catch (e) {
        this.error = 'No se pudieron cargar las materias'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    }
  }
})
