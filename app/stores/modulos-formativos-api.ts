import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface ModuloFormativoApi {
  id: number
  nombre: string
  codigo?: string | null
  tipo: 'Academico' | 'Tecnico'
  cantidad_ra?: number | null
  descripcion?: string | null
  activo: boolean
  deleted_at?: string | null
}

export const useModulosFormativosApiStore = defineStore('modulosFormativosApi', {
  state: () => ({
    items: [] as ModuloFormativoApi[],
    loading: false as boolean,
    error: null as string | null,
    statusFilter: 'active' as 'active' | 'inactive' | 'all' // Nuevo filtro
  }),
  getters: {
    active: (s) => s.items.filter(m => m.activo),
  },
  actions: {
    async fetchAll(status: 'active' | 'inactive' | 'all' = 'active') {
      this.loading = true
      this.error = null
      this.statusFilter = status
      startLoading()
      try {
        const url = `/api/modulos-formativos?status=${status}`
        const res = await api.get<any>(url)

        // Handle different response formats
        if (res && typeof res === 'object') {
          // Check for paginated response
          if ('data' in res && Array.isArray(res.data)) {
            this.items = res.data
          } else if (Array.isArray(res)) {
            this.items = res
          } else if ('success' in res && res.success === false) {
            // Handle error response
            console.warn('API returned error:', res.message)
            this.items = []
            this.error = res.message || 'No se pudieron cargar las materias'
          } else {
            console.error('Expected array of modulos formativos but got:', res)
            this.items = []
          }
        } else {
          console.error('Unexpected response type:', typeof res)
          this.items = []
        }
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudieron cargar las materias'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },
    async create(payload: { nombre: string; codigo?: string | null; tipo: 'Academico' | 'Tecnico'; cantidad_ra?: number | null; descripcion?: string | null; activo?: boolean }) {
      this.error = null
      startLoading()
      try {
        const created = await api.post<ModuloFormativoApi>('/api/modulos-formativos', payload)
        this.items.unshift(created)
        return created
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo crear el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },
    async update(id: number, payload: Partial<{ nombre: string; codigo: string | null; tipo: 'Academico' | 'Tecnico'; cantidad_ra: number | null; descripcion: string | null; activo: boolean }>) {
      this.error = null
      startLoading()
      try {
        const updated = await api.put<ModuloFormativoApi>(`/api/modulos-formativos/${id}`, payload)
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo actualizar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },
    async toggleActive(id: number, activo: boolean) {
      return this.update(id, { activo })
    },
    async remove(id: number) {
      this.error = null
      startLoading()
      try {
        await api.delete<void>(`/api/modulos-formativos/${id}`)
        this.items = this.items.filter(i => i.id !== id)
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo eliminar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },
    async restore(id: number) {
      this.error = null
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: ModuloFormativoApi; message: string }>(`/api/modulos-formativos/${id}/restore`, {})
        // Actualizar la lista después de restaurar
        await this.fetchAll(this.statusFilter)
        return response.data
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo restaurar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },
  }
})
