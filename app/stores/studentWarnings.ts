import { defineStore } from 'pinia'
import type { StudentWarning, StudentWarningEntry } from '~/types/warnings'
import { api } from '../utils/api'

interface StudentWarningsState {
    warnings: StudentWarning[]
    selectedWarning: StudentWarning | null
    loading: boolean
    error: string | null
    counts: {
        open: number
        closed: number
        total: number
    }
    reporters: { id: number, name: string, email: string }[]
}

export const useStudentWarningsStore = defineStore('studentWarnings', {
    state: (): StudentWarningsState => ({
        warnings: [],
        selectedWarning: null,
        loading: false,
        error: null,
        counts: {
            open: 0,
            closed: 0,
            total: 0
        },
        reporters: []
    }),

    actions: {
        async fetchReporters() {
            try {
                const response = await api.get('/api/student-warnings/reporters')
                if (response.data) {
                    // If response is wrapped in data, use response.data, otherwise response
                    // The controller returns response()->json($reporters) which is a direct array usually
                    // But api.get might unwrap or not. Let's assume response (from api.get) is the data or has .data
                    // Checking other calls: api.get returns { data: ... } usually if wrapper?
                    // In fetchCounts: this.counts = response. 
                    // In fetchWarnings: this.warnings = response.data.map...
                    // api.ts usually returns the response body directly if using $fetch extended.
                    // Let's safe check.
                    this.reporters = Array.isArray(response) ? response : (response.data || [])
                } else {
                    this.reporters = response || []
                }
                return { success: true, data: this.reporters }
            } catch (error: any) {
                console.error('Error fetching reporters:', error)
                return { success: false, error: error.message }
            }
        },

        async fetchWarnings(filters?: {
            status?: 'open' | 'closed'
            search?: string
            reported_by?: string | 'me'
            date_from?: string
            date_to?: string
            limit?: number
        }) {
            this.loading = true
            this.error = null

            try {
                const params: any = {}

                if (filters?.status) params.status = filters.status
                if (filters?.search) params.search = filters.search
                if (filters?.reported_by) params.reported_by = filters.reported_by
                if (filters?.date_from) params.date_from = filters.date_from
                if (filters?.date_to) params.date_to = filters.date_to
                if (filters?.limit) params.limit = filters.limit

                const response = await api.get('/api/student-warnings', { params })

                if (response.data) {
                    this.warnings = response.data.map((w: any) => ({
                        ...w,
                        reportedBy: w.reportedBy || w.reported_by,
                        warningType: w.warningType || w.warning_type
                    }))
                }

                return { success: true, data: response.data }
            } catch (error: any) {
                this.error = error.message || 'Error al cargar advertencias'
                console.error('Error fetching warnings:', error)
                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        async fetchCounts(filters?: { anio_lectivo_id?: number | string }) {
            try {
                const params: any = {}
                if (filters?.anio_lectivo_id) {
                    params.anio_lectivo_id = filters.anio_lectivo_id
                }

                const response = await api.get('/api/student-warnings/counts', { params })
                this.counts = response
                return { success: true, data: response }
            } catch (error: any) {
                console.error('Error fetching warning counts:', error)
                return { success: false, error: error.message }
            }
        },

        async createWarning(data: {
            student_id: number
            warning_type_id?: number | null
            title: string
            initial_comment: string
        }) {
            try {
                const response = await api.post('/api/student-warnings', data)

                if (response) {
                    // Optionally refresh the list
                    return { success: true, data: response }
                }
            } catch (error: any) {
                console.error('Error creating warning:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al crear advertencia'
                }
            }
        },

        async showWarning(id: number) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get(`/api/student-warnings/${id}`)

                if (response) {
                    this.selectedWarning = {
                        ...response,
                        reportedBy: response.reportedBy || response.reported_by,
                        warningType: response.warningType || response.warning_type
                    }
                }

                return { success: true, data: response }
            } catch (error: any) {
                this.error = error.message || 'Error al cargar advertencia'
                console.error('Error showing warning:', error)
                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        async updateWarning(id: number, data: {
            title?: string
            status?: 'open' | 'closed'
        }) {
            try {
                const response = await api.put(`/api/student-warnings/${id}`, data)

                if (response.data && this.selectedWarning?.id === id) {
                    this.selectedWarning = response.data
                }

                return { success: true, data: response.data }
            } catch (error: any) {
                console.error('Error updating warning:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al actualizar advertencia'
                }
            }
        },

        async deleteWarning(id: number) {
            try {
                await api.delete(`/api/student-warnings/${id}`)

                // Remove from list
                const index = this.warnings.findIndex((w: StudentWarning) => w.id === id)
                if (index !== -1) {
                    this.warnings.splice(index, 1)
                }

                return { success: true }
            } catch (error: any) {
                console.error('Error deleting warning:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al eliminar advertencia'
                }
            }
        },

        async createEntry(data: {
            warning_id: number
            content: string
            date_of_event: string
            attachments?: any[]
        }) {
            try {
                const response = await api.post('/api/student-warning-entries', data)

                // Add entry to selected warning if it's loaded
                if (response.data && this.selectedWarning?.id === data.warning_id) {
                    this.selectedWarning.entries = [
                        response.data,
                        ...(this.selectedWarning.entries || [])
                    ]
                }

                return { success: true, data: response.data }
            } catch (error: any) {
                console.error('Error creating entry:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al crear entrada'
                }
            }
        },

        async updateEntry(id: number, data: {
            content?: string
            date_of_event?: string
            attachments?: any[]
        }) {
            try {
                const response = await api.put(`/api/student-warning-entries/${id}`, data)

                // Update entry in selected warning
                if (response.data && this.selectedWarning?.entries) {
                    const index = this.selectedWarning.entries.findIndex((e: StudentWarningEntry) => e.id === id)
                    if (index !== -1) {
                        this.selectedWarning.entries[index] = response.data
                    }
                }

                return { success: true, data: response.data }
            } catch (error: any) {
                console.error('Error updating entry:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al actualizar entrada'
                }
            }
        },

        async deleteEntry(id: number) {
            try {
                await api.delete(`/api/student-warning-entries/${id}`)

                // Remove entry from selected warning
                if (this.selectedWarning?.entries) {
                    const index = this.selectedWarning.entries.findIndex((e: StudentWarningEntry) => e.id === id)
                    if (index !== -1) {
                        this.selectedWarning.entries.splice(index, 1)
                    }
                }

                return { success: true }
            } catch (error: any) {
                console.error('Error deleting entry:', error)
                return {
                    success: false,
                    error: error.data?.message || 'Error al eliminar entrada'
                }
            }
        },
    },
})
