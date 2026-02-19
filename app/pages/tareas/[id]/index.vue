<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <NuxtLink to="/tareas" class="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
                    ← Volver a mis clases
                </NuxtLink>
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ classAssignment?.materia?.nombre }}
                        </h1>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">
                            {{ classAssignment?.aula?.titulo?.nombre || '' }}
                            {{ classAssignment?.aula?.grado_cardinal || '' }}{{ classAssignment?.aula?.seccion || '' }}
                        </p>
                    </div>
                    <button v-if="!isReadOnly" @click="showCreateModal = true"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Tarea
                    </button>
                </div>
            </div>

            <!-- Filters -->
            <div class="mb-6 flex gap-2">
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
                <div v-for="homework in filteredHomeworks" :key="homework.id"
                    @click="router.push(`/tareas/${classAssignmentId}/${homework.id}`)"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {{ homework.title }}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {{ homework.description }}
                            </p>

                            <!-- Metadata -->
                            <div class="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                <span v-if="homework.due_date" class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {{ formatDate(homework.due_date) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {{ homework.submission_count || 0 }} entregas
                                </span>
                                <span v-if="homework.is_overdue" class="text-red-600 dark:text-red-400 font-medium">
                                    Vencida
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="ml-4 flex items-center gap-2">
                            <button v-if="!isReadOnly" @click.stop="editHomework(homework)"
                                class="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                Editar
                            </button>
                            <button v-if="!isReadOnly" @click.stop="deleteHomework(homework)"
                                class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                                Eliminar
                            </button>
                            <!-- 'Ver Entregas' button is redundant if the whole card click works, but let's keep it for clarity or replace with chevron -->
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="filteredHomeworks.length === 0" class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay tareas</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Comienza creando una nueva tarea para esta clase.
                    </p>
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <HomeworkFormModal v-if="showCreateModal" :class-assignment-id="classAssignmentId"
                :homework="editingHomework" @close="closeModal" @saved="handleHomeworkSaved" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['profesor', 'admin', 'master']
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface ClassAssignment {
    id: number
    materia?: {
        nombre?: string
    }
    aula?: {
        titulo?: {
            nombre?: string
        }
        grado_cardinal?: string
        seccion?: string
    }
    profesor_id?: number
}

interface Homework {
    id: number
    title: string
    description: string
    due_date?: string
    submission_count?: number
    is_overdue?: boolean
}

const classAssignmentId = computed(() => {
    const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    return id || ''
})

const loading = ref(true)
const classAssignment = ref<ClassAssignment | null>(null)
const homeworks = ref<Homework[]>([])
const showCreateModal = ref(false)
const editingHomework = ref<Homework | null>(null)
const currentFilter = ref('all')

const isReadOnly = computed(() => {
    // Admin/Master can always view, but if they are not the assigned teacher, it's read-only
    // Unless we assume admins can edit everything. 
    // The requirement is "read access for admin and master to supervise".
    // So let's enforcing read-only if not the assigned teacher, OR if we want admins to edit, we can relax this.
    // The prompt says "darle acceso a las tareas a modo lectura a los admin y master".
    // So explicit read-only (no edit).
    
    if (!classAssignment.value) return true // default safe
    
    const user = authStore.user
    if (!user) return true

    // If user is the assigned teacher, they can edit
    if (user.personal_id === classAssignment.value.profesor_id) return false
    
    // Otherwise (Admin/Master supervising, or another teacher), read-only
    return true
})

const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Activas', value: 'active' },
    { label: 'Vencidas', value: 'overdue' },
    { label: 'Próximas', value: 'upcoming' }
]

const filteredHomeworks = computed(() => {
    if (currentFilter.value === 'all') return homeworks.value
    if (currentFilter.value === 'active') return homeworks.value.filter(h => !h.is_overdue)
    if (currentFilter.value === 'overdue') return homeworks.value.filter(h => h.is_overdue)
    if (currentFilter.value === 'upcoming') {
        return homeworks.value.filter(h => {
            if (!h.due_date) return false
            return dayjs(h.due_date).isAfter(dayjs())
        })
    }
    return homeworks.value
})

onMounted(async () => {
    await Promise.all([
        fetchClassAssignment(),
        fetchHomeworks()
    ])
})

async function fetchClassAssignment() {
    try {
        const response = await api.get(`/api/class-assignments/${classAssignmentId.value}`)
        classAssignment.value = response
    } catch (error) {
        console.error('Error fetching class assignment:', error)
    }
}

async function fetchHomeworks() {
    try {
        loading.value = true
        const response = await api.get('/api/homeworks', {
            params: {
                class_assignment_id: classAssignmentId.value
            }
        })
        homeworks.value = response.data || response || []
    } catch (error) {
        console.error('Error fetching homeworks:', error)
    } finally {
        loading.value = false
    }
}

function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY')
}

function editHomework(homework: any) {
    editingHomework.value = homework
    showCreateModal.value = true
}

async function deleteHomework(homework: any) {
    if (!confirm(`¿Estás seguro de eliminar la tarea "${homework.title}"?`)) return

    try {
        await api.delete(`/api/homeworks/${homework.id}`)
        await fetchHomeworks()
    } catch (error) {
        console.error('Error deleting homework:', error)
        alert('Error al eliminar la tarea')
    }
}

function closeModal() {
    showCreateModal.value = false
    editingHomework.value = null
}

async function handleHomeworkSaved() {
    closeModal()
    await fetchHomeworks()
}
</script>
