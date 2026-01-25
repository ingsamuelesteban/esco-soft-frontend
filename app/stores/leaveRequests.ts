import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'

export interface LeaveRequest {
    id: number
    tenant_id: number
    personal_id: number
    leave_type: 'vacaciones' | 'personal' | 'medico' | 'maternidad' | 'paternidad' | 'duelo' | 'otro'
    start_date: string
    end_date: string
    days_count: number
    reason: string
    attachment_path: string | null
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
    employee_signature: string | null
    employee_signed_at: string | null
    reviewed_by: number | null
    reviewed_at: string | null
    review_notes: string | null
    admin_signature: string | null
    created_at: string
    updated_at: string
    personal?: {
        id: number
        nombre: string
        apellido: string
        cedula: string
    }
    reviewer?: {
        id: number
        name: string
    }
}

export interface LeaveRequestFilters {
    status?: string
    personal_id?: number
    leave_type?: string
    start_date?: string
    end_date?: string
}

export const useLeaveRequestsStore = defineStore('leaveRequests', () => {
    const leaveRequests = ref<LeaveRequest[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)

    const fetchAll = async (filters: LeaveRequestFilters = {}, page = 1) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get('/api/staff/leave-requests', {
                params: { ...filters, page }
            })
            leaveRequests.value = response.data
            currentPage.value = response.current_page
            lastPage.value = response.last_page
            total.value = response.total
        } catch (e: any) {
            error.value = e.message || 'Error al cargar solicitudes'
            throw e
        } finally {
            loading.value = false
        }
    }

    const fetchOne = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/api/staff/leave-requests/${id}`)
            return response
        } catch (e: any) {
            error.value = e.message || 'Error al cargar solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const create = async (data: FormData) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post('/api/staff/leave-requests', data)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al crear solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const update = async (id: number, data: Partial<LeaveRequest>) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.put(`/api/staff/leave-requests/${id}`, data)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al actualizar solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const review = async (id: number, data: { status: string; review_notes?: string; admin_signature: string }) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/api/staff/leave-requests/${id}/review`, data)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al revisar solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const cancel = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/api/staff/leave-requests/${id}/cancel`)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al cancelar solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const remove = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            await api.delete(`/api/staff/leave-requests/${id}`)
        } catch (e: any) {
            error.value = e.message || 'Error al eliminar solicitud'
            throw e
        } finally {
            loading.value = false
        }
    }

    const calculateDays = async (dates: { start_date: string, end_date: string }) => {
        try {
            const data = await api.post('/api/staff/leave-requests/calculate-days', dates)
            return data
        } catch (e: any) {
            console.error('Error calculating days:', e)
            throw e
        }
    }

    const getStatistics = async () => {
        try {
            const data = await api.get('/api/staff/leave-requests/statistics')
            return data
        } catch (e: any) {
            console.error('Error fetching statistics:', e)
            throw e
        }
    }

    return {
        leaveRequests,
        loading,
        error,
        currentPage,
        lastPage,
        total,
        fetchAll,
        fetchOne,
        create,
        update,
        review,
        cancel,
        remove,
        remove,
        calculateDays,
        getStatistics
    }
})
