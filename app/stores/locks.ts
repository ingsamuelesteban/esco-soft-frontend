import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface Lock {
    id: number
    student_id: number
    student?: any
    is_locked: boolean
    reason: string
    auto_generated: boolean
    created_at: string
}

export const useLocksStore = defineStore('locks', {
    state: () => ({
        locks: [] as Lock[],
        loading: false,
        error: null as string | null
    }),

    actions: {
        async fetchAll() {
            this.loading = true
            this.error = null
            try {
                const response = await api.get('/api/psychology/locks')
                this.locks = response.data || []
            } catch (e: any) {
                this.error = e.response?.data?.message || 'Error al cargar bloqueos'
            } finally {
                this.loading = false
            }
        },

        async unlock(studentId: number) {
            try {
                // Endpoint delete by student ID is not standard REST, but controller says destroy($studentId)
                // Actually controller destroy takes $studentId as param?
                // Route: DELETE /locks/{id} -> refers to Lock ID or Student ID?
                // Controller: `destroy($studentId)` { where('student_id', $studentId) }.
                // So the route param should be student ID.
                await api.delete(`/api/psychology/locks/${studentId}`)
                this.locks = this.locks.filter(l => l.student_id !== studentId)
            } catch (e: any) {
                throw e
            }
        },

        async manualLock(studentId: number, reason: string) {
            try {
                const response = await api.post('/api/psychology/locks', {
                    student_id: studentId,
                    reason: reason
                })
                // Refresh list or add local
                await this.fetchAll()
            } catch (e: any) {
                throw e
            }
        },

        async refreshLock(studentId: number) {
            try {
                const response = await api.post(`/api/psychology/locks/${studentId}/refresh`)
                // refresh list
                await this.fetchAll()
                return response
            } catch (e: any) {
                throw e
            }
        },

        async getLockDetails(studentId: number) {
            try {
                const response = await api.get(`/api/psychology/locks/${studentId}/details`)
                return response.data
            } catch (e: any) {
                console.error("Error fetching lock details", e)
                throw e
            }
        }
    }
})
