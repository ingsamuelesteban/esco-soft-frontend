import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'
import type { Aula } from './aulas'
import type { Personal } from './personal'
import type { AnioLectivo } from './anios_lectivos'

export interface MateriaRef {
  id: number
  nombre: string
  codigo?: string | null
}

export interface ClassAssignment {
  id: number
  materia_id: number
  profesor_id: number
  aula_id: number
  anio_lectivo_id: number
  horas_semanales: number | null
  activo: boolean
  compartido?: boolean
  periodos_programados?: number
  materia?: MateriaRef
  profesor?: Personal
  aula?: Aula
  anio_lectivo?: AnioLectivo
}

export const useClassAssignmentsStore = defineStore('classAssignments', {
  state: () => ({
    items: [] as ClassAssignment[],
    loading: false as boolean,
    error: null as string | null,
    anioLectivoId: null as number | null,
  }),
  getters: {
    byAula: (s) => (aulaId: number) => s.items.filter(a => a.aula_id === aulaId),
    active: (s) => s.items.filter(a => a.activo),
  },
  actions: {
    async fetchAll(params: { aula_id?: number; profesor_id?: number; materia_id?: number; anio_lectivo_id?: number; only_active?: boolean } = {}) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const query: Record<string, any> = {}
        if (params.aula_id) query.aula_id = params.aula_id
        if (params.profesor_id) query.profesor_id = params.profesor_id
        if (params.materia_id) query.materia_id = params.materia_id
        query.only_active = params.only_active ?? true
        query.anio_lectivo_id = params.anio_lectivo_id ?? this.anioLectivoId

        // Don't fetch if no year selected (optional guard, or let backend return empty)
        // if (!query.anio_lectivo_id) ... 

        const data = await api.get<any>('/api/class-assignments', {
          params: query
        })

        // Handle different response formats
        if (data && typeof data === 'object') {
          if ('data' in data && Array.isArray(data.data)) {
            this.items = data.data
          } else if (Array.isArray(data)) {
            this.items = data
          } else if ('success' in data && data.success === false) {
            console.warn('API returned error:', data.message)
            this.items = []
            this.error = data.message || 'No se pudieron cargar las asignaciones'
          } else {
            console.error('Expected array of assignments but got:', data)
            this.items = []
          }
        } else {
          console.error('Unexpected response type:', typeof data)
          this.items = []
        }
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudieron cargar las asignaciones'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<ClassAssignment, 'id' | 'materia' | 'profesor' | 'aula' | 'anio_lectivo' | 'activo'> & { activo?: boolean, compartido?: boolean }) {
      startLoading()
      try {
        const created = await api.post<ClassAssignment>('/api/class-assignments', payload)
        this.items.unshift(created)
        return created
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<Omit<ClassAssignment, 'id' | 'materia' | 'profesor' | 'aula' | 'anio_lectivo'>>) {
      startLoading()
      try {
        const updated = await api.put<ClassAssignment>(`/api/class-assignments/${id}`, payload)
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

    async deactivate(id: number) {
      startLoading()
      try {
        await api.delete(`/api/class-assignments/${id}`)
        const idx = this.items.findIndex(a => a.id === id)
        if (idx !== -1) {
          // Update immutably to avoid potential TS/reactivity issues
          const item = this.items[idx]!
          this.items[idx] = { ...item, activo: false }
        }
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async transfer(payload: { from_profesor_id: number, to_profesor_id: number, anio_lectivo_id?: number }) {
      startLoading()
      try {
        const response = await api.post<{ message: string, count: number }>('/api/class-assignments/transfer', payload)
        // Refresh all assignments to reflect changes
        // Since many items changed, it's safer to re-fetch than to update manually
        await this.fetchAll()
        return response
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
  },
})
