import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'

export interface StaffWarning {
    id: number
    tenant_id: number
    personal_id: number
    warning_type: 'verbal' | 'escrita' | 'suspension' | 'despido'
    severity: 'leve' | 'moderada' | 'grave' | 'muy_grave'
    incident_date: string
    description: string
    consequences: string | null
    attachment_path: string | null
    employee_signature: string | null
    employee_signed_at: string | null
    admin_signature: string
    status: 'activa' | 'resuelta' | 'apelada' | 'anulada'
    resolution_notes: string | null
    resolved_at: string | null
    issued_by: number
    created_at: string
    updated_at: string
    personal?: {
        id: number
        nombre: string
        apellido: string
        cedula: string
    }
    issuer?: {
        id: number
        name: string
    }
}

export interface WarningFilters {
    status?: string
    personal_id?: number
    warning_type?: string
    severity?: string
}

export const useWarningsStore = defineStore('warnings', () => {
    const warnings = ref<StaffWarning[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)

    const fetchAll = async (filters: WarningFilters = {}, page = 1) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get('/api/staff/warnings', {
                params: { ...filters, page }
            })
            warnings.value = response.data
            currentPage.value = response.current_page
            lastPage.value = response.last_page
            total.value = response.total
        } catch (e: any) {
            error.value = e.message || 'Error al cargar amonestaciones'
            throw e
        } finally {
            loading.value = false
        }
    }

    const fetchOne = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/api/staff/warnings/${id}`)
            return response
        } catch (e: any) {
            error.value = e.message || 'Error al cargar amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const create = async (data: FormData) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post('/api/staff/warnings', data)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al crear amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const update = async (id: number, data: Partial<StaffWarning>) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.put(`/api/staff/warnings/${id}`, data)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al actualizar amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const sign = async (id: number, signature: string) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/api/staff/warnings/${id}/sign`, {
                employee_signature: signature
            })
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al firmar amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const resolve = async (id: number, notes: string) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/api/staff/warnings/${id}/resolve`, {
                resolution_notes: notes
            })
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al resolver amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const nullify = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/api/staff/warnings/${id}/nullify`)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al anular amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const remove = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            await api.delete(`/api/staff/warnings/${id}`)
        } catch (e: any) {
            error.value = e.message || 'Error al eliminar amonestación'
            throw e
        } finally {
            loading.value = false
        }
    }

    const getStatistics = async () => {
        try {
            const response = await api.get('/api/staff/warnings/statistics')
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al cargar estadísticas'
            throw e
        }
    }

    const getEmployeeHistory = async (personalId: number) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/api/staff/warnings/employee/${personalId}`)
            return response.data
        } catch (e: any) {
            error.value = e.message || 'Error al cargar historial'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        warnings,
        loading,
        error,
        currentPage,
        lastPage,
        total,
        fetchAll,
        fetchOne,
        create,
        update,
        sign,
        resolve,
        nullify,
        remove,
        getStatistics,
        getEmployeeHistory
    }
})
