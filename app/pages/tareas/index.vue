<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">
                            Gestiona las tareas de tus clases
                        </p>
                    </div>

                    <!-- Teacher Selector (Admin/Master only) -->
                    <div v-if="canSelectTeacher" class="w-full md:w-72">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Supervisar Profesor
                        </label>
                        <select v-model="selectedTeacherId"
                            class="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                            <option :value="null">Seleccionar profesor...</option>
                            <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                                {{ teacher.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

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
import { ref, onMounted, computed, watch } from 'vue'
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

interface Teacher {
    id: number
    name: string
    personal_id: number
}

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['profesor', 'admin', 'master']
})

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const classAssignments = ref<ClassAssignment[]>([])
const teachers = ref<Teacher[]>([])
const selectedTeacherId = ref<number | null>(null)

const canSelectTeacher = computed(() => {
    return authStore.user?.role === 'admin' || authStore.user?.role === 'master'
})

onMounted(async () => {
    if (canSelectTeacher.value) {
        await fetchTeachers()
        // If admin/master is also a teacher (unlikely in this model but possible), 
        // we could set selectedTeacherId to their own ID if they have one.
        // For now, let's leave it null to show "Select a teacher" prompt or show all?
        // Showing all might be too much, better to force selection or show empty state.
    } else {
        await fetchClassAssignments()
    }
})

watch(selectedTeacherId, async (newValue) => {
    if (newValue) {
        await fetchClassAssignments(newValue)
    } else {
        classAssignments.value = []
    }
})

function navigateToClass(id: number) {
    if (id) {
        router.push(`/tareas/${id}`)
    } else {
        console.error('Missing ID for navigation')
    }
}

async function fetchTeachers() {
    try {
        const response = await api.get('/api/profesores')
        // Transform user data to teacher list if needed, or use the response structure
        // Endpoint returns Personal model usually. 
        // We need the User ID for some filters or Personal ID for others.
        // ClassAssignmentController uses 'profesor_id' which typically refers to Personal ID.
        // However, we need to be careful with IDs.
        // The endpoint /api/profesores returns Personal models.
        const data = response.data || []
        // We probably need to map this to a simple list
        teachers.value = data.map((p: any) => ({
            id: p.id, // This is personal_id
            name: `${p.nombre} ${p.apellido}`,
            personal_id: p.id
        })).sort((a: any, b: any) => a.name.localeCompare(b.name))
    } catch (error) {
        console.error('Error fetching teachers:', error)
    } finally {
        loading.value = false
    }
}

async function fetchClassAssignments(teacherId?: number) {
    try {
        loading.value = true

        // Get user ID based on role
        let targetId = authStore.user?.id
        
        // If supervising, use selected teacher's Personal ID
        if (canSelectTeacher.value) {
           if (teacherId) {
               // We need to pass the Personal ID if that's what the controller expects
               // ClassAssignmentController: $profesorIdFromRequest = $request->integer('profesor_id');
               // And it filters where('profesor_id', $profesorIdFromRequest)
               // So we need to pass the Personal ID.
               targetId = teacherId
           } else {
               // No teacher selected, return empty or all?
               // Let's return empty until selected
               classAssignments.value = []
               loading.value = false
               return
           }
        } else {
             // For regular teachers, we might need to resolve their Personal ID or just rely on the controller resolving it from Auth user
             // Controller: if ($user && $user->role === 'profesor') { $profesorIdFromRequest = $user->personal_id; }
             // So we don't strictly need to send it for logged-in teacher.
        }

        const params: any = {}
        if (canSelectTeacher.value && teacherId) {
            params.profesor_id = teacherId
        } else if (!canSelectTeacher.value && authStore.user?.role === 'profesor') {
             // Optional: explicitly send ID
             params.profesor_id = authStore.user?.personal_id
        }

        const response = await api.get('/api/class-assignments', { params })

        // Handle different response structures
        const data = response.data?.data || response.data?.data || response.data || [] // paginate wrap

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
    // We should not set loading=true here to avoid flickering or loops if loading is watched
    
    const promises = classAssignments.value.map(async (assignment: ClassAssignment) => {
        try {
            const params: any = {
                class_assignment_id: assignment.id
            }
            
            // We use a separate try-catch to avoid failing all if one fails
            const response = await api.get('/api/homeworks', { params })

            const homeworks: Homework[] = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
            
            assignment.homework_count = homeworks.length

            // Count pending submissions (submitted but not graded)
            let pendingCount = 0
            for (const homework of homeworks) {
                if (homework.submission_count !== undefined && homework.graded_count !== undefined) {
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
