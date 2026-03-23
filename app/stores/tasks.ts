import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'
import dayjs from 'dayjs'

export interface Task {
    id: number;
    title: string;
    details: string | null;
    due_date: string | null;
    is_completed: boolean;
    user_id: number;
    tenant_id: number;
    created_at: string;
    updated_at: string;
}

interface Stats {
    overdue: number;
    today: number;
    upcoming: number;
}

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([])
    const isLoading = ref(false)
    const stats = ref<Stats>({ overdue: 0, today: 0, upcoming: 0 })

    const overdueCount = computed(() => {
        return tasks.value.filter(t => !t.is_completed && t.due_date && dayjs(t.due_date).isBefore(dayjs(), 'day')).length
    })

    const todayCount = computed(() => {
        return tasks.value.filter(t => !t.is_completed && t.due_date && dayjs(t.due_date).isSame(dayjs(), 'day')).length
    })

    async function fetchTasks() {
        isLoading.value = true
        try {
            const response = await api.get<{ success: boolean, data: Task[] }>('/api/tasks')
            if (response && response.success) {
                tasks.value = response.data
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchStats() {
        try {
            const response = await api.get<{ success: boolean, data: Stats }>('/api/tasks/stats')
            if (response && response.success) {
                stats.value = response.data
            }
        } catch (error) {
            console.error('Error fetching task stats:', error)
        }
    }

    async function addTask(taskData: Partial<Task>) {
        try {
            const response = await api.post<{ success: boolean, data: Task }>('/api/tasks', taskData)
            if (response && response.success) {
                tasks.value.unshift(response.data)
                await fetchStats()
                return response.data
            }
        } catch (error) {
            console.error('Error adding task:', error)
            throw error
        }
    }

    async function updateTask(id: number, taskData: Partial<Task>) {
        try {
            const response = await api.put<{ success: boolean, data: Task }>(`/api/tasks/${id}`, taskData)
            if (response && response.success) {
                const index = tasks.value.findIndex(t => t.id === id)
                if (index !== -1) {
                    tasks.value[index] = response.data
                }
                await fetchStats()
                return response.data
            }
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    }

    async function toggleTask(id: number) {
        const task = tasks.value.find(t => t.id === id)
        if (!task) return

        return await updateTask(id, { is_completed: !task.is_completed })
    }

    async function deleteTask(id: number) {
        try {
            const response = await api.delete<{ success: boolean }>(`/api/tasks/${id}`)
            if (response && response.success) {
                tasks.value = tasks.value.filter(t => t.id !== id)
                await fetchStats()
            }
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    }

    return {
        tasks,
        isLoading,
        stats,
        overdueCount,
        todayCount,
        fetchTasks,
        fetchStats,
        addTask,
        updateTask,
        toggleTask,
        deleteTask
    }
})
