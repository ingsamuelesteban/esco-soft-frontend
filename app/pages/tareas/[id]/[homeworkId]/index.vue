<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Back Button -->
            <NuxtLink :to="`/tareas/${classId}`"
                class="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
                ← Volver a la clase
            </NuxtLink>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <div v-else>
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                        {{ homework?.title || 'Cargando...' }}
                    </h1>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">
                        Entregas de estudiantes
                    </p>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ submissions.length }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total entregas</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ pendingCount }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Por calificar</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ gradedCount }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Calificadas</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ averageScore }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                    </div>
                </div>

                <!-- Pending Extensions Alert -->
                <div v-if="pendingExtensionsCount > 0"
                    class="mb-6 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700 dark:text-yellow-200">
                                Hay <span class="font-bold">{{ pendingExtensionsCount }}</span> solicitudes de prórroga
                                pendientes de revisar.
                                <button @click="filterPendingExtensions"
                                    class="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-100">
                                    Ver solicitudes
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Submissions Table -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estudiante
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fecha de entrega
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Prórroga
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Calificación
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="submission in submissions" :key="submission.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ submission.student?.user?.name || 'Sin nombre' }}
                                    </div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">
                                        {{ submission.student?.user?.email || '' }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="getStatusBadgeClass(submission.status)"
                                        class="px-2 py-1 text-xs font-medium rounded-full">
                                        {{ getStatusLabel(submission.status) }}
                                    </span>
                                    <span v-if="submission.is_late"
                                        class="ml-2 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                                        Tardía
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {{ submission.submitted_at ? formatDate(submission.submitted_at) : '-' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <div v-if="submission.extension_status && submission.extension_status !== 'none'">
                                        <span :class="{
                                            'bg-yellow-100 text-yellow-800': submission.extension_status === 'pending',
                                            'bg-green-100 text-green-800': submission.extension_status === 'approved',
                                            'bg-red-100 text-red-800': submission.extension_status === 'rejected'
                                        }" class="px-2 py-1 text-xs font-medium rounded-full">
                                            {{ getExtensionLabel(submission.extension_status) }}
                                        </span>
                                        <button v-if="submission.extension_status === 'pending'"
                                            @click="reviewExtension(submission)"
                                            class="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium underline">
                                            Revisar
                                        </button>
                                    </div>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {{ submission.score !== null ? `${submission.score}/${homework?.max_score}` : '-' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="viewSubmission(submission)"
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                                        Ver
                                    </button>
                                    <button v-if="submission.status === 'submitted'"
                                        @click="gradeSubmission(submission)"
                                        class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                        Calificar
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div v-if="submissions.length === 0" class="text-center py-12">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay entregas</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Los estudiantes aún no han enviado sus trabajos.
                        </p>
                    </div>
                </div>
            </div>

            <!-- View/Grade Modal -->
            <SubmissionViewModal v-if="selectedSubmission" :submission="selectedSubmission" :homework="homework"
                :grading-mode="gradingMode" @close="closeModal" @graded="handleGraded" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import SubmissionViewModal from '~/components/homework/SubmissionViewModal.vue'

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['profesor', 'admin']
})

const route = useRoute()
const classId = computed(() => route.params.id)
const homeworkId = computed(() => route.params.homeworkId)

interface Homework {
    id: number
    title: string
    description?: string
    max_score: number
    end_date?: string
    // add other fields as needed
}

interface Submission {
    id: number
    status: string
    score: any // string or number based on API
    submitted_at: string | null
    is_late: boolean
    extension_status?: string
    extension_reason?: string
    student?: {
        user?: {
            name?: string
            email?: string
        }
    }
}

import Swal from 'sweetalert2'

const loading = ref(true)
const homework = ref<Homework | null>(null)
const submissions = ref<Submission[]>([])
const selectedSubmission = ref(null)
const gradingMode = ref(false)

const pendingCount = computed(() => submissions.value.filter(s => s.status === 'submitted').length)
const gradedCount = computed(() => submissions.value.filter(s => s.status === 'graded' || s.status === 'returned').length)
const averageScore = computed(() => {
    const graded = submissions.value.filter(s => s.score !== null)
    if (graded.length === 0) return '-'
    const sum = graded.reduce((acc, s) => acc + parseFloat(s.score), 0)
    return (sum / graded.length).toFixed(1)
})

const pendingExtensionsCount = computed(() => submissions.value.filter(s => s.extension_status === 'pending').length)

function filterPendingExtensions() {
    // Ideally we would add a filter state, but for now let's just sort them to top or filter the list
    // Let's implement a simple front-end filter for this view
    // Since complex filtering isn't implemented, we can just highlight them or scroll to them
    // But adding a filter state is better.
    // For now, let's just make sure they are visible.
    submissions.value.sort((a, b) => {
        if (a.extension_status === 'pending' && b.extension_status !== 'pending') return -1;
        if (a.extension_status !== 'pending' && b.extension_status === 'pending') return 1;
        return 0;
    });
}


onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            fetchHomework(),
            fetchSubmissions()
        ])
    } catch (error) {
        console.error('Error initializing page:', error)
    } finally {
        loading.value = false
    }
})

async function fetchHomework() {
    try {
        console.log('Fetching homework:', homeworkId.value)
        const response = await api.get(`/api/homeworks/${homeworkId.value}`)
        console.log('Homework response:', response.data)
        homework.value = response.data
    } catch (error) {
        console.error('Error fetching homework:', error)
        Swal.fire('Error', 'No se pudo cargar la tarea', 'error')
    } finally {
        loading.value = false
    }
}

async function fetchSubmissions() {
    try {
        const response = await api.get(`/api/homeworks/${homeworkId.value}/submissions`)
        submissions.value = response.data || []
    } catch (error) {
        console.error('Error fetching submissions:', error)
    }
}

function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY HH:mm')
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        draft: 'Borrador',
        submitted: 'Enviada',
        graded: 'Calificada',
        returned: 'Devuelta'
    }
    return labels[status] || status
}

function getExtensionLabel(status: string) {
    const labels: Record<string, string> = {
        pending: 'Pendiente',
        approved: 'Aprobada',
        rejected: 'Rechazada',
        none: 'Ninguna'
    }
    return labels[status] || status
}

function getStatusBadgeClass(status: string) {
    const classes: Record<string, string> = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        submitted: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        graded: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        returned: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    }
    return classes[status] || ''
}

function viewSubmission(submission: any) {
    selectedSubmission.value = submission
    gradingMode.value = false
}

function gradeSubmission(submission: any) {
    selectedSubmission.value = submission
    gradingMode.value = true
}

async function reviewExtension(submission: Submission) {
    const result = await Swal.fire({
        title: 'Revisar solicitud de prórroga',
        text: `Motivo: ${submission.extension_reason}`,
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Aprobar',
        denyButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10B981',
        denyButtonColor: '#EF4444'
    })

    if (result.isConfirmed || result.isDenied) {
        try {
            const status = result.isConfirmed ? 'approved' : 'rejected'
            await api.put(`/api/homework-submissions/${submission.id}/review-extension`, { status })

            Swal.fire(
                result.isConfirmed ? 'Aprobada' : 'Rechazada',
                `La prórroga ha sido ${result.isConfirmed ? 'aprobada' : 'rechazada'}.`,
                'success'
            )

            await fetchSubmissions()
        } catch (error) {
            console.error('Error reviewing extension:', error)
            Swal.fire('Error', 'No se pudo actualizar la solicitud', 'error')
        }
    }
}

function closeModal() {
    selectedSubmission.value = null
    gradingMode.value = false
}

async function handleGraded() {
    closeModal()
    await fetchSubmissions()
}
</script>
