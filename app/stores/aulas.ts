import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface AulaDueno {
  personal_id: number
  nombre: string
  apellido: string
  nombre_completo: string
}

export interface Aula {
  id: number
  titulo_id: number | null
  grado_cardinal: number | null
  seccion: string
  capacidad: number | null
  activo: boolean
  estudiantes_count?: number
  tiene_config_anio?: boolean
  titulo?: { id: number; nombre: string; familia?: { id: number; nombre: string } }
  dueno?: AulaDueno | null
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
    async fetchAll(params: { tituloId?: number; search?: string; anioLectivoId?: number } = {}) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const query: Record<string, any> = {}
        if (params.tituloId) query.titulo_id = params.tituloId
        if (params.search) query.search = params.search
        if (params.anioLectivoId) query.anio_lectivo_id = params.anioLectivoId
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
    },
    async configurarAnio(aulaId: number, payload: { anio_lectivo_id: number; titulo_id?: number | null; capacidad?: number | null }) {
      startLoading()
      try {
        await api.put(`/api/aulas/${aulaId}/configurar-anio`, payload)
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
    async setDueno(aulaId: number, payload: { anio_lectivo_id: number; personal_id: number }) {
      startLoading()
      try {
        const res = await api.put<{ success: boolean; dueno: AulaDueno }>(`/api/aulas/${aulaId}/dueno`, payload)
        const idx = this.items.findIndex(a => a.id === aulaId)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], dueno: res.dueno }
        return res
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
    async removeDueno(aulaId: number, anioLectivoId: number) {
      startLoading()
      try {
        await api.delete(`/api/aulas/${aulaId}/dueno`, { params: { anio_lectivo_id: anioLectivoId } })
        const idx = this.items.findIndex(a => a.id === aulaId)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], dueno: null }
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    }
  }
})
