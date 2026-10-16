import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'

export const useHomeworkStore = defineStore('homework', () => {
    const unreadCount = ref(0)
    const unopenedHomeworks = ref<any[]>([])
    const isLoading = ref(false)

    async function fetchUnreadData() {
        isLoading.value = true
        try {
            // Fetch unread count
            const countResponse = await api.get<{unread_count: number}>('/api/student/homeworks/unread-count')
            if (countResponse && countResponse.unread_count !== undefined) {
                unreadCount.value = countResponse.unread_count
            }

            // Fetch unopened list
            const unopenedResponse = await api.get<{data: any[]}>('/api/student/homeworks/unopened')
            if (unopenedResponse && unopenedResponse.data) {
                unopenedHomeworks.value = unopenedResponse.data
            }
        } catch (error) {
            console.error('Error fetching homework unread data:', error)
        } finally {
            isLoading.value = false
        }
    }

    function markAsOpened(homeworkId: string | number) {
        // Decrease count
        if (unreadCount.value > 0) {
            unreadCount.value--
        }
        
        // Remove from unopened list
        unopenedHomeworks.value = unopenedHomeworks.value.filter(
            hw => hw.id !== Number(homeworkId) && hw.id !== String(homeworkId)
        )
    }

    // ---- Tareas agrupadas por asignatura ----
    const subjects = ref<any[]>([])
    const subjectsLoading = ref(false)

    async function fetchSubjects() {
        subjectsLoading.value = true
        try {
            const res = await api.get<{ data: any[] }>('/api/student/homeworks/by-subject')
            subjects.value = res?.data || []
        } catch (error) {
            console.error('Error fetching homework subjects:', error)
        } finally {
            subjectsLoading.value = false
        }
    }

    /**
     * Descuenta de inmediato la tarea del contador de "nuevas" en la UI.
     * El registro persistente lo hace la vista de detalle (mark-as-viewed)
     * para no duplicar el view_count.
     */
    function marcarComoVista(homeworkId: string | number) {
        const id = Number(homeworkId)
        for (const s of subjects.value) {
            const t = s.tareas?.find((x: any) => x.id === id)
            if (t && t.es_nueva) {
                t.es_nueva = false
                s.total_nuevas = Math.max(0, s.total_nuevas - 1)
            }
        }
    }

    return {
        unreadCount,
        unopenedHomeworks,
        isLoading,
        subjects,
        subjectsLoading,
        fetchUnreadData,
        fetchSubjects,
        marcarComoVista,
        markAsOpened
    }
})

