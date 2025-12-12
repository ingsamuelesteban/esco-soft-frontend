import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { startLoading, finishLoading } from '../utils/loading'
import type { Period } from './periods'
import type { ClassAssignment } from './class_assignments'

export interface TimetableEntry {
  id: number
  assignment_id: number
  dia: number // 0..6
  period_id: number
  profesor_id: number
  aula_id: number
  assignment?: ClassAssignment
  period?: Period
  attendance_summary?: {
    total_students: number
    present_count: number
    attendance_taken: boolean
  }
}

export const useTimetableEntriesStore = defineStore('timetableEntries', {
  state: () => ({
    items: [] as TimetableEntry[],
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    byKey: (s) => {
      const map = new Map<string, TimetableEntry>()
      for (const e of s.items) {
        map.set(`${e.dia}-${e.period_id}-${e.aula_id}`, e)
      }
      return map
    },
  },
  actions: {
    async fetchAll(params: { aula_id?: number; profesor_id?: number; dia?: number; anio_lectivo_id?: number; include_attendance?: boolean; date?: string } = {}) {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const url = `/api/timetable-entries?${new URLSearchParams(params as any).toString()}`
        const data = await api.get<any>(url)

        // Handle different response formats
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            this.items = data
          } else if ('data' in data && Array.isArray(data.data)) {
            this.items = data.data
          } else if ('success' in data && data.success === false) {
            // Handle error response (e.g., permission denied)
            console.warn('API returned error:', data.message)
            this.items = []
            this.error = data.message || 'No se pudieron cargar las entradas del horario'
          } else {
            console.error('Expected array of timetable entries but got:', data)
            this.items = []
          }
        } else {
          console.error('Unexpected response type:', typeof data)
          this.items = []
        }
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudieron cargar las entradas del horario'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: { assignment_id: number; dia: number; period_id: number }) {
      startLoading()
      try {
        const created = await api.post<TimetableEntry>('/api/timetable-entries', payload)
        this.items.push(created)
        return created
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<{ assignment_id: number; dia: number; period_id: number }>) {
      startLoading()
      try {
        const updated = await api.put<TimetableEntry>(`/api/timetable-entries/${id}`, payload)
        const idx = this.items.findIndex(e => e.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async remove(id: number) {
      startLoading()
      try {
        await api.delete(`/api/timetable-entries/${id}`)
        this.items = this.items.filter(e => e.id !== id)
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
  },
})
