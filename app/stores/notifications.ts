import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

interface NotificationData {
    title: string;
    message: string;
    type: string;
    action_url: string;
    icon?: string;
}

interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

interface NotificationsResponse {
    data: Notification[];
    // Pagination meta...
}

interface UnreadCountResponse {
    count: number;
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([])
    const unreadCount = ref(0)
    const isLoading = ref(false)

    const hasUnread = computed(() => unreadCount.value > 0)

    async function fetchNotifications() {
        isLoading.value = true
        try {
            // api.get handles tenant ID injection and Authorization header
            const response = await api.get<NotificationsResponse>('/api/notifications')
            if (response && response.data) {
                notifications.value = response.data
            } else {
                notifications.value = []
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            notifications.value = [] // Maintain safe state on error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchUnreadCount() {
        try {
            const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count')
            if (response) {
                unreadCount.value = response.count
            }
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }

    async function markAsRead(id: string) {
        try {
            await api.post(`/api/notifications/${id}/read`)

            // Update local state
            const notification = notifications.value.find(n => n.id === id)
            if (notification && !notification.read_at) {
                notification.read_at = new Date().toISOString()
                unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    async function markAllAsRead() {
        try {
            await api.post('/api/notifications/read-all')

            // Update local state
            notifications.value.forEach(n => {
                if (!n.read_at) n.read_at = new Date().toISOString()
            })
            unreadCount.value = 0
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    return {
        notifications,
        unreadCount,
        isLoading,
        hasUnread,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead
    }
})

