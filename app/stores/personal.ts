import { defineStore } from 'pinia'
import type { Cargo } from './cargos'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../app/utils/api'

export interface Personal {
  id: number
  cedula: string
  nombre: string
  apellido: string
  sexo: 'M' | 'F' | null
  cargo_id: number | null
  cargo?: Cargo | null
  sueldo: string | null
  tarjeta_numero: string | null
  fecha_ingreso: string | null
  formacion_academica: string | null
  otros_titulos: string | null
  telefono: string | null
}

export const usePersonalStore = defineStore('personal', {
  state: () => ({
    items: [] as Personal[],
    loading: false as boolean,
    error: null as string | null,
    statusFilter: 'active' as 'active' | 'inactive' | 'all' // Nuevo filtro
  }),
  getters: {
    total: (state) => state.items.length,
    byId: (state) => (id: number) => state.items.find(p => p.id === id)
  },
  actions: {
    async fetchAll(status: 'active' | 'inactive' | 'all' = 'active') {
      this.loading = true
      this.error = null
      this.statusFilter = status
      startLoading()
      try {
        const url = `/api/personal?status=${status}`
        const data = await api.get<{ count: number; data: Personal[]; status: string }>(url)
        this.items = data.data
      } catch (e) {
        this.error = 'No se pudieron cargar los registros de personal'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<Personal, 'id' | 'cargo'>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const newItem = await api.post<Personal>('/api/personal', payload)
        this.items.push(newItem)
        return newItem
      } catch (e: any) {
        this.error = e.data?.message || 'Error al crear el registro'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<Omit<Personal, 'id' | 'cargo'>>) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const updated = await api.put<Personal>(`/api/personal/${id}`, payload)
        const index = this.items.findIndex(p => p.id === id)
        if (index !== -1) {
          this.items[index] = updated
        }
        return updated
      } catch (e: any) {
        this.error = e.data?.message || 'Error al actualizar el registro'
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
        await api.delete(`/api/personal/${id}`)
        this.items = this.items.filter(p => p.id !== id)
      } catch (e: any) {
        this.error = e.data?.message || 'Error al eliminar el registro'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async restore(id: number) {
      this.loading = true
      startLoading()
      try {
        const response = await api.post<{ message: string; data: Personal }>(`/api/personal/${id}/restore`)
        // Actualizar la lista después de restaurar
        await this.fetchAll(this.statusFilter)
        return response.data
      } catch (e: any) {
        this.error = e.data?.message || 'Error al restaurar el registro'
        console.error(e)
        throw e
      } finally {
        this.loading = false
        finishLoading()
      }
    }
  }
})
