import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'

export interface Horario {
  id: number
  materiaId: number
  aulaId: number
  profesor: string
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'
  hora_inicio: string
  hora_fin: string
  grupo: string
}

export const useHorariosStore = defineStore('horarios', {
  state: () => ({
    items: [] as Horario[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    total: (state) => state.items.length,
    porDia: (state) => {
      const map: Record<string, Horario[]> = {}
      for (const h of state.items) {
        const key = h.dia
        const arr = map[key] ?? (map[key] = [])
        arr.push(h)
      }
      return map
    }
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const data = await $fetch<Horario[]>('/data/horarios.json')
        this.items = data
      } catch (e) {
        this.error = 'No se pudieron cargar los horarios'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    }
  }
})
