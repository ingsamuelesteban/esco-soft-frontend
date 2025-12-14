import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface Aula {
  id: number
  titulo_id: number | null
  grado_cardinal: number | null
  seccion: string
  capacidad: number | null
  activo: boolean
  estudiantes_count?: number
  titulo?: { id: number; nombre: string; familia?: { id: number; nombre: string } }
}

export const useAulasStore = defineStore('aulas', {
  state: () => ({
    items: [] as Aula[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    total: (state) => state.items.length,
    activas: (state) => state.items.filter(aula => aula.activo),
    paraSelect: (state) => state.items
      .filter(aula => aula.activo)
      .map(aula => ({
        value: aula.id,
        label: `${aula.grado_cardinal}° ${aula.seccion}${aula.titulo ? ` - ${aula.titulo.nombre}` : ''}`,
        aula
      }))
  },
  actions: {
    async fetchAll(params: { tituloId?: number; search?: string } = {}) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const query: Record<string, any> = {}
        if (params.tituloId) query.titulo_id = params.tituloId
        if (params.search) query.search = params.search
        const data = await api.get<Aula[]>('/api/aulas', { params: query })
        if (Array.isArray(data)) {
          this.items = data
        } else if (data && typeof data === 'object' && 'data' in (data as any) && Array.isArray((data as any).data)) {
          // Handle wrapped response just in case
          this.items = (data as any).data
        } else if (data && typeof data === 'object' && 'success' in (data as any) && (data as any).success === false) {
          // Handle error response
          console.warn('API returned error:', (data as any).message)
          this.items = []
          this.error = (data as any).message || 'No se pudieron cargar las aulas'
        } else {
          console.warn('Unexpected aulas response format:', data)
          this.items = []
        }
      } catch (e) {
        this.error = 'No se pudieron cargar las aulas'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },
    async create(payload: Omit<Aula, 'id' | 'titulo' | 'activo'> & { activo?: boolean }) {
      startLoading()
      try {
        const created = await api.post<Aula>('/api/aulas', payload)
        this.items.push(created)
        return created
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
    async update(id: number, payload: Partial<Omit<Aula, 'id' | 'titulo'>>) {
      startLoading()
      try {
        const updated = await api.put<Aula>(`/api/aulas/${id}`, payload)
        const idx = this.items.findIndex(a => a.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
    async delete(id: number) {
      startLoading()
      try {
        const updated = await api.delete<Aula>(`/api/aulas/${id}`)
        const idx = this.items.findIndex(a => a.id === id)
        if (idx !== -1) this.items[idx] = updated
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    }
  }
})
