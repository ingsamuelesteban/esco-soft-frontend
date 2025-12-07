import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface FamiliaProfesional {
  id: number
  nombre: string
  codigo: string
  activo: boolean
}

export const useFamiliasProfesionalesStore = defineStore('familias_profesionales', {
  state: () => ({
    items: [] as FamiliaProfesional[],
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    total: (state) => state.items.length,
    byId: (state) => (id: number) => state.items.find(f => f.id === id),
    activas: (state) => state.items.filter(f => f.activo),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const data = await api.get<{ count: number; data: FamiliaProfesional[] }>('/api/familias-profesionales')
        this.items = data.data
      } catch (e) {
        this.error = 'No se pudieron cargar las familias profesionales'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<FamiliaProfesional, 'id'>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const newItem = await api.post<FamiliaProfesional>('/api/familias-profesionales', payload)
        this.items.push(newItem)
        return newItem
      } catch (e: any) {
        this.error = e.data?.message || 'Error al crear la familia profesional'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<FamiliaProfesional>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const updated = await api.put<FamiliaProfesional>(`/api/familias-profesionales/${id}`, payload)
        const index = this.items.findIndex(f => f.id === id)
        if (index !== -1) {
          this.items[index] = updated
        }
        return updated
      } catch (e: any) {
        this.error = e.data?.message || 'Error al actualizar la familia profesional'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async delete(id: number) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const updated = await api.delete<FamiliaProfesional>(`/api/familias-profesionales/${id}`)
        // Actualizar con el estado real devuelto por el backend
        const index = this.items.findIndex(f => f.id === id)
        if (index !== -1) this.items[index] = updated
      } catch (e: any) {
        this.error = e.data?.message || 'Error al desactivar la familia profesional'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    }
  }
})
