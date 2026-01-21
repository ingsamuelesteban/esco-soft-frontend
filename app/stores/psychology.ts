import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'

export const usePsychologyStore = defineStore('psychology', () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    const createReferral = async (referralData: any) => {
        loading.value = true
        error.value = null
        try {
            await api.post('/api/psychology/referrals', referralData)
            return { success: true }
        } catch (e: any) {
            error.value = e.response?._data?.message || 'Error al crear el referimiento'
            console.error('Error creating referral:', e.response?._data || e)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const fetchReferrals = async (params: any = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/api/psychology/referrals', { params })
            return { data }
        } catch (e: any) {
            error.value = e.response?._data?.message || 'Error al cargar referimientos'
            return { data: [] }
        } finally {
            loading.value = false
        }
    }

    const updateReferralStatus = async (id: number, status: string, notes?: string) => {
        loading.value = true
        try {
            const { data } = await api.put(`/api/psychology/referrals/${id}`, { status, psychologist_notes: notes })
            return { success: true, data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const fetchCases = async (params: any = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/api/psychology/cases', { params })
            return { data }
        } catch (e: any) {
            error.value = e.response?._data?.message || 'Error al cargar casos'
            return { data: [] }
        } finally {
            loading.value = false
        }
    }

    const createCase = async (caseData: any) => {
        loading.value = true
        try {
            const res = await api.post('/api/psychology/cases', caseData)
            return { success: true, data: res.data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const fetchCase = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const data = await api.get(`/api/psychology/cases/${id}`)
            return data
        } catch (e: any) {
            error.value = e.response?._data?.message || 'Error al cargar el caso'
            return null
        } finally {
            loading.value = false
        }
    }

    const addCaseEntry = async (entryData: any) => {
        loading.value = true
        try {
            const { data } = await api.post('/api/psychology/case-entries', entryData)
            return { success: true, data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const updateCaseEntry = async (id: number, entryData: any) => {
        loading.value = true
        try {
            const { data } = await api.put(`/api/psychology/case-entries/${id}`, entryData)
            return { success: true, data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/psychology/categories')
            return res
        } catch (e: any) {
            return []
        }
    }

    const createCategory = async (categoryData: any) => {
        loading.value = true
        try {
            const res = await api.post('/api/psychology/categories', categoryData)
            return { success: true, data: res.data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const updateCategory = async (id: number, categoryData: any) => {
        loading.value = true
        try {
            const res = await api.put(`/api/psychology/categories/${id}`, categoryData)
            return { success: true, data: res.data }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        } finally {
            loading.value = false
        }
    }

    const deleteCategory = async (id: number) => {
        try {
            await api.delete(`/api/psychology/categories/${id}`)
            return { success: true }
        } catch (e: any) {
            return { success: false, error: e.response?._data?.message }
        }
    }

    const fetchStats = async () => {
        loading.value = true
        try {
            const res = await api.get('/api/psychology/stats')
            return res
        } catch (e: any) {
            return null
        } finally {
            loading.value = false
        }
    }

    const fetchPsychologists = async () => {
        try {
            const res = await api.get('/api/psychology/psychologists')
            // Verify if it is an array directly or wrapped
            return Array.isArray(res) ? res : (res as any).data || []
        } catch (e: any) {
            return []
        }
    }

    const fetchDismissals = async (params: any = {}) => {
        loading.value = true
        error.value = null
        try {
            const res = await api.get('/api/psychology/dismissals/history', { params })
            const dismissals = Array.isArray(res) ? res : (res as any).data || []
            return { success: true, data: dismissals }
        } catch (e: any) {
            error.value = e.response?.data?.message || 'Error al cargar el historial'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const createDismissal = async (data: { student_id: number, reason: string }) => {
        loading.value = true
        error.value = null
        try {
            const res = await api.post('/api/psychology/dismissals', data)
            return { success: true, data: res.data }
        } catch (e: any) {
            error.value = e.response?._data?.message || 'Error al crear el alta'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        createReferral,
        fetchReferrals,
        updateReferralStatus,
        fetchCases,
        createCase,
        fetchCase,
        addCaseEntry,
        updateCaseEntry,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        fetchStats,
        fetchPsychologists,
        createDismissal,
        fetchDismissals
    }
})
