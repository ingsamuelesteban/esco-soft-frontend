import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../app/utils/api'

export interface Titulo {
  id: number
  familia_profesional_id: number
  nombre: string
  codigo: string
  activo: boolean
  familia?: { id: number; nombre: string }
}

export const useTitulosStore = defineStore('titulos', {
  state: () => ({
    items: [] as Titulo[],
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    total: (s) => s.items.length,
    byId: (s) => (id: number) => s.items.find(t => t.id === id),
    byFamilia: (s) => (familiaId: number) => s.items.filter(t => t.familia_profesional_id === familiaId),
    activas: (s) => s.items.filter(t => t.activo),
  },
  actions: {
    async fetchAll(params?: { familiaId?: number; search?: string }) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const query = new URLSearchParams()
        if (params?.familiaId) query.set('familia_id', String(params.familiaId))
        if (params?.search) query.set('search', params.search)
        const url = `/api/titulos${query.toString() ? `?${query.toString()}` : ''}`
        const data = await api.get<{ count: number; data: Titulo[] }>(url)
        this.items = data.data
      } catch (e) {
        this.error = 'No se pudieron cargar los títulos'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<Titulo, 'id' | 'familia'>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const created = await api.post<Titulo>('/api/titulos', payload)
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e.data?.message || 'Error al crear el título'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<Omit<Titulo, 'id' | 'familia'>>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const updated = await api.put<Titulo>(`/api/titulos/${id}`, payload)
        const index = this.items.findIndex(t => t.id === id)
        if (index !== -1) this.items[index] = updated
        return updated
      } catch (e: any) {
        this.error = e.data?.message || 'Error al actualizar el título'
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
        const updated = await api.delete<Titulo>(`/api/titulos/${id}`)
        const index = this.items.findIndex(t => t.id === id)
        if (index !== -1) this.items[index] = updated
      } catch (e: any) {
        this.error = e.data?.message || 'Error al desactivar el título'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },
  },
})
