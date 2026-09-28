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

    return {
        unreadCount,
        unopenedHomeworks,
        isLoading,
        fetchUnreadData,
        markAsOpened
    }
})
