import { defineStore } from 'pinia'
import { api } from '../app/utils/api'
import { startLoading, finishLoading } from '../utils/loading'

export interface Period {
  id: number
  order_index: number
  period_number: number | null
  label: string
  start_time: string
  end_time: string
  type: 'class' | 'break'
  is_active: boolean
}

export const usePeriodsStore = defineStore('periods', {
  state: () => ({
    items: [] as Period[],
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    total: (s) => s.items.length,
    activas: (s) => s.items.filter(p => p.is_active),
    clases: (s) => s.items.filter(p => p.type === 'class' && p.is_active),
    recesos: (s) => s.items.filter(p => p.type === 'break' && p.is_active),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      startLoading()
      try {
        const data = await api.get<{ count: number; data: Period[] }>('/api/periods')
        this.items = data.data
      } catch (e) {
        this.error = 'No se pudieron cargar los períodos'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<Period, 'id' | 'order_index'>) {
      startLoading()
      try {
        const created = await api.post<Period>('/api/periods', payload)
        this.items.push(created)
        // Re-sort locally
        this.items.sort((a, b) => a.order_index - b.order_index)
        return created
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<Omit<Period, 'id' | 'order_index'>>) {
      startLoading()
      try {
        const updated = await api.put<Period>(`/api/periods/${id}`, payload)
        const idx = this.items.findIndex(p => p.id === id)
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
        const updated = await api.delete<Period>(`/api/periods/${id}`)
        const idx = this.items.findIndex(p => p.id === id)
        if (idx !== -1) this.items[idx] = updated
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async reorder(orderedIds: number[]) {
      startLoading()
      try {
        const res = await api.post<{ message: string; data: Period[] }>('/api/periods/reorder', { order: orderedIds })
        this.items = res.data
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },
  },
})
