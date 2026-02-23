<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    Tareas asignadas para tu clase
                </p>
            </div>

            <!-- Filters -->
            <div class="mb-6 flex gap-2 flex-wrap">
                <button v-for="filter in filters" :key="filter.value" @click="currentFilter = filter.value" :class="[
                    'px-4 py-2 rounded-lg transition-colors',
                    currentFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]">
                    {{ filter.label }}
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <!-- Homework List -->
            <div v-else class="space-y-4">
                <NuxtLink v-for="homework in filteredHomeworks" :key="homework.id"
                    :to="`/student/tareas/${homework.id}`"
                    class="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <!-- Title and Subject -->
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ homework.title }}
                                </h3>
                                <span
                                    class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                    {{ homework.class_assignment?.materia?.nombre || 'Sin materia' }}
                                </span>
                            </div>

                            <!-- Description -->
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {{ homework.description || 'Sin descripción' }}
                            </p>

                            <!-- Metadata -->
                            <div class="flex items-center gap-4 text-sm">
                                <!-- Due Date -->
                                <span v-if="homework.due_date"
                                    class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {{ formatDate(homework.due_date) }}
                                </span>

                                <!-- Max Score -->
                                <span class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    {{ homework.max_score }} pts
                                </span>

                                <!-- Overdue Badge -->
                                <span v-if="homework.is_overdue && !getSubmissionStatus(homework)"
                                    class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                    Vencida
                                </span>
                            </div>
                        </div>

                        <!-- Status Badge -->
                        <div class="ml-4">
                            <span v-if="getSubmissionStatus(homework)" :class="getStatusBadgeClass(homework)"
                                class="px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap">
                                {{ getSubmissionStatus(homework) }}
                            </span>
                            <span v-else
                                class="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                Pendiente
                            </span>
                        </div>
                    </div>
                </NuxtLink>

                <!-- Empty State -->
                <div v-if="filteredHomeworks.length === 0" class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay tareas</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No tienes tareas asignadas en este momento.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

definePageMeta({
    layout: 'student',
    middleware: ['auth', 'role', 'student-active'],
    roles: ['estudiante']
})

const authStore = useAuthStore()
const loading = ref(true)

interface Submission {
    id: number
    status: string
    score: number | null
    submitted_at: string | null
}

interface ClassAssignment {
    id: number
    materia: {
        nombre: string
    }
}

interface Homework {
    id: number
    title: string
    description: string
    due_date: string
    max_score: number
    is_overdue: boolean
    submissions: Submission[]
    class_assignment: ClassAssignment
}

const homeworks = ref<Homework[]>([])
const currentFilter = ref('all')

const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Enviadas', value: 'submitted' },
    { label: 'Calificadas', value: 'graded' },
    { label: 'Vencidas', value: 'overdue' }
]

const filteredHomeworks = computed(() => {
    if (currentFilter.value === 'all') return homeworks.value
    if (currentFilter.value === 'pending') {
        return homeworks.value.filter(h => !h.submissions?.length || h.submissions[0]?.status === 'draft')
    }
    if (currentFilter.value === 'submitted') {
        return homeworks.value.filter(h => h.submissions?.[0]?.status === 'submitted')
    }
    if (currentFilter.value === 'graded') {
        return homeworks.value.filter(h => ['graded', 'returned'].includes(h.submissions?.[0]?.status || ''))
    }
    if (currentFilter.value === 'overdue') {
        return homeworks.value.filter(h => h.is_overdue && (!h.submissions?.length || h.submissions[0]?.status === 'draft'))
    }
    return homeworks.value
})

onMounted(async () => {
    await fetchHomeworks()
})

async function fetchHomeworks() {
    try {
        loading.value = true
        const response = await api.get('/api/homeworks')
        homeworks.value = response.data || []
    } catch (error) {
        console.error('Error fetching homeworks:', error)
    } finally {
        loading.value = false
    }
}

function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY HH:mm')
}

function getSubmissionStatus(homework: Homework) {
    if (!homework.submissions?.length) return null
    const submission = homework.submissions[0]
    if (!submission) return null

    const statusMap: Record<string, string> = {
        draft: 'Borrador',
        submitted: 'Enviada',
        graded: `Calificada: ${submission.score}/${homework.max_score}`,
        returned: `Calificada: ${submission.score}/${homework.max_score}`
    }

    return statusMap[submission.status] || null
}

function getStatusBadgeClass(homework: Homework) {
    if (!homework.submissions?.length) return ''
    const submission = homework.submissions[0]
    if (!submission) return ''

    const status = submission.status

    const classMap: Record<string, string> = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        submitted: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        graded: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        returned: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    }

    return classMap[status] || ''
}
</script>
