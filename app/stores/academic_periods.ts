import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface AcademicPeriod {
    id?: number
    numero: number
    nombre: string
    fecha_publicacion: string
    fecha_inicio?: string
    fecha_fin?: string
    anio_lectivo_id: number
}

export const useAcademicPeriodsStore = defineStore('academic_periods', {
    state: () => ({
        periods: [] as AcademicPeriod[],
        loading: false,
        error: null as string | null
    }),

    actions: {
        async fetchByAnio(anioId: number) {
            this.loading = true
            this.error = null
            try {
                // The backend endpoint filters by tenant globally, 
                // but we might want to filter by specific Anio if we had an endpoint for it.
                // Currently `AcademicPeriodController@index` returns ALL for tenant.
                // We should probably filter on client side or update backend to accept anio_lectivo_id.
                // Backend controller DOES NOT filter by anio currently in index(), it returns all for tenant.
                // Let's assume for now we filter in frontend or better, add param to backend index.
                // Actually `index` in controller doesn't accept param. 
                // I will filter here for now.

                const response = await api.get('/api/academic-periods')
                const all: AcademicPeriod[] = response.data || []

                this.periods = all.filter(p => p.anio_lectivo_id == anioId)

                // If empty, generate default 4
                if (this.periods.length === 0) {
                    this.periods = [1, 2, 3, 4].map(n => ({
                        numero: n,
                        nombre: n === 1 ? 'Primer Periodo' : (n === 2 ? 'Segundo Periodo' : (n === 3 ? 'Tercer Periodo' : 'Cuarto Periodo')),
                        fecha_publicacion: '',
                        anio_lectivo_id: anioId
                    }))
                }
            } catch (e: any) {
                console.error(e)
                this.error = e.response?.data?.message || 'Error al cargar periodos'
            } finally {
                this.loading = false
            }
        },

        async bulkUpdate(periods: AcademicPeriod[], anioId: number) {
            this.loading = true
            this.error = null
            try {
                const payload = {
                    anio_lectivo_id: anioId,
                    periods: periods
                }
                const response = await api.post('/api/academic-periods/bulk', payload)
                this.periods = response.data || []
            } catch (e: any) {
                this.error = e.response?.data?.message || 'Error al guardar periodos'
                throw e
            } finally {
                this.loading = false
            }
        },

        async getAll() {
            try {
                const response = await api.get('/api/academic-periods')
                return response.data || []
            } catch (e: any) {
                console.error(e)
                return []
            }
        }
    }
})
