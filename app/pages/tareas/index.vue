<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    Gestiona las tareas de tus clases
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <!-- Class Cards -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="assignment in classAssignments" :key="assignment.id" @click="navigateToClass(assignment.id)"
                    class="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer">
                    <div class="p-6">
                        <!-- Class Header -->
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ assignment.materia?.nombre || 'Sin nombre' }}
                                </h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {{ assignment.aula?.titulo?.nombre || '' }}
                                    {{ assignment.aula?.grado_cardinal || '' }}{{ assignment.aula?.seccion || '' }}
                                </p>
                            </div>
                            <div class="ml-4">
                                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {{ assignment.homework_count || 0 }}
                                </p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tareas</p>
                            </div>
                            <div>
                                <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {{ assignment.pending_submissions || 0 }}
                                </p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && classAssignments.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tienes clases asignadas</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Contacta al administrador para que te asigne clases.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'

// Define interfaces
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
    homework_count?: number
    pending_submissions?: number
}

interface Homework {
    id: number
    submission_count?: number
    graded_count?: number
}

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['profesor', 'admin']
})

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const classAssignments = ref<ClassAssignment[]>([])

onMounted(async () => {
    await fetchClassAssignments()
})

function navigateToClass(id: number) {
    if (id) {
        router.push(`/tareas/${id}`)
    } else {
        console.error('Missing ID for navigation')
    }
}

async function fetchClassAssignments() {
    try {
        loading.value = true

        // Get user ID safely
        const userId = authStore.user?.id
        if (!userId) {
            console.error('User not found in auth store')
            return
        }

        const response = await api.get('/api/class-assignments', {
            params: {
                profesor_id: userId
            }
        })

        // Handle different response structures
        const data = response.data?.data || response.data || []

        classAssignments.value = Array.isArray(data) ? data : []

        // Fetch homework stats for each class assignment
        await fetchHomeworkStats()

    } catch (error) {
        console.error('Error fetching class assignments:', error)
        classAssignments.value = []
    } finally {
        loading.value = false
    }
}

async function fetchHomeworkStats() {
    // Fetch homework count and pending submissions for each class
    const promises = classAssignments.value.map(async (assignment: ClassAssignment) => {
        try {
            const response = await api.get('/api/homeworks', {
                params: {
                    class_assignment_id: assignment.id
                }
            })

            const homeworks: Homework[] = response.data?.data || response.data || []
            assignment.homework_count = homeworks.length

            // Count pending submissions (submitted but not graded)
            let pendingCount = 0
            for (const homework of homeworks) {
                if (homework.submission_count && homework.graded_count) {
                    pendingCount += (homework.submission_count - homework.graded_count)
                }
            }
            assignment.pending_submissions = pendingCount

        } catch (error) {
            console.error(`Error fetching homework stats for class ${assignment.id}:`, error)
            assignment.homework_count = 0
            assignment.pending_submissions = 0
        }
    })

    await Promise.all(promises)
}
</script>
