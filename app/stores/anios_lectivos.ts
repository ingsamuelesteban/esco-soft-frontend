import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface AnioLectivo {
    id: number
    nombre: string
    descripcion?: string | null
    activo: boolean
    fecha_inicio?: string | null
    fecha_fin?: string | null
}

export const useAniosLectivosStore = defineStore('anios_lectivos', {
    state: () => ({
        items: [] as AnioLectivo[],
        loading: false as boolean,
        error: null as string | null
    }),
    getters: {
        total: (state) => state.items.length,
        activos: (state) => state.items.filter(item => item.activo),
        paraSelect: (state) => state.items
            .filter(item => item.activo)
            .map(item => ({
                value: item.id,
                label: item.nombre,
                object: item
            }))
    },
    actions: {
        async fetchAll(params: { activo?: boolean } = {}) {
            this.loading = true
            this.error = null
            startLoading()
            try {
                const query: Record<string, any> = {}
                if (params.activo !== undefined) query.activo = params.activo

                const data = await api.get<AnioLectivo[]>('/api/anios-lectivos', { params: query })

                if (Array.isArray(data)) {
                    this.items = data
                } else {
                    console.warn('Unexpected anios response', data)
                    this.items = []
                }
            } catch (e) {
                this.error = 'No se pudieron cargar los años lectivos'
                console.error(e)
            } finally {
                this.loading = false
                finishLoading()
            }
        },

        async create(payload: Omit<AnioLectivo, 'id'>) {
            this.loading = true
            startLoading()
            try {
                const created = await api.post<AnioLectivo>('/api/anios-lectivos', payload)
                this.items.unshift(created) // Add to top
                return created
            } catch (e) {
                console.error(e)
                throw e
            } finally {
                this.loading = false
                finishLoading()
            }
        },

        async update(id: number, payload: Partial<AnioLectivo>) {
            this.loading = true
            startLoading()
            try {
                const updated = await api.put<AnioLectivo>(`/api/anios-lectivos/${id}`, payload)
                const idx = this.items.findIndex(a => a.id === id)
                if (idx !== -1) this.items[idx] = updated
                return updated
            } catch (e) {
                console.error(e)
                throw e
            } finally {
                this.loading = false
                finishLoading()
            }
        },

        async delete(id: number) {
            this.loading = true
            startLoading()
            try {
                await api.delete(`/api/anios-lectivos/${id}`)
                const idx = this.items.findIndex(a => a.id === id)
                if (idx !== -1) this.items.splice(idx, 1)
            } catch (e) {
                console.error(e)
                throw e
            } finally {
                this.loading = false
                finishLoading()
            }
        },

        async clone(id: number, payload: { nombre: string; fecha_inicio?: string; fecha_fin?: string; descripcion?: string }) {
            this.loading = true
            startLoading()
            try {
                const response = await api.post<{ anio: AnioLectivo }>(`/api/anios-lectivos/${id}/clonar`, payload)
                this.items.unshift(response.anio)
                return response
            } catch (e) {
                console.error(e)
                throw e
            } finally {
                this.loading = false
                finishLoading()
            }
        }
    }
})
