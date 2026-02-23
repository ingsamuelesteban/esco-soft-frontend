<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Back Button -->
            <NuxtLink to="/student/tareas" class="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
                ← Volver a mis tareas
            </NuxtLink>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="homework">
                <!-- Homework Details -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <!-- Header -->
                    <div class="mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                                {{ homework.title }}
                            </h1>
                            <span v-if="homework.is_overdue && !submission"
                                class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                Vencida
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            {{ homework.class_assignment?.materia?.nombre || 'Sin materia' }}
                        </p>
                    </div>

                    <!-- Metadata -->
                    <div class="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Fecha de entrega</p>
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ homework.due_date ? formatDate(homework.due_date) : 'Sin fecha límite' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Puntuación máxima</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ homework.max_score }} puntos</p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div v-if="homework.description" class="mb-4">
                        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</h3>
                        <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ homework.description }}</p>
                    </div>

                    <!-- Instructions -->
                    <div v-if="homework.instructions" class="mb-4">
                        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instrucciones</h3>
                        <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ homework.instructions }}</p>
                    </div>

                    <!-- Teacher Attachment -->
                    <div v-if="homework.attachment_path" class="mb-4">
                        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivo adjunto</h3>
                        <a href="#"
                            @click.prevent="downloadFile(`/api/homeworks/${homework.id}/download`, homework.attachment_path)"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar archivo
                        </a>
                    </div>
                </div>

                <!-- Submission Section -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Tu Entrega</h2>

                    <!-- Graded Submission View -->
                    <div v-if="submission && ['graded', 'returned'].includes(submission.status)">
                        <div
                            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">Calificación</h3>
                                <span class="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {{ submission.score }} / {{ homework.max_score }}
                                </span>
                            </div>
                            <p v-if="submission.teacher_feedback" class="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                <strong>Retroalimentación:</strong> {{ submission.teacher_feedback }}
                            </p>
                        </div>

                        <!-- Show submitted content (read-only) -->
                        <div class="space-y-4">
                            <div v-if="submission.text_content">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tu respuesta:</h4>
                                <p
                                    class="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded">
                                    {{ submission.text_content }}
                                </p>
                            </div>
                            <div v-if="submission.link_url">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enlace enviado:
                                </h4>
                                <a :href="submission.link_url" target="_blank"
                                    class="text-blue-600 dark:text-blue-400 hover:underline">
                                    {{ submission.link_url }}
                                </a>
                            </div>
                            <div v-if="submission.file_path">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivo enviado:
                                </h4>
                                <a href="#"
                                    @click.prevent="downloadFile(`/api/homework-submissions/${submission.id}/download`, submission.file_path)"
                                    class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar mi archivo
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Extension Status -->
                    <div v-if="submission?.extension_status && submission.extension_status !== 'none'" class="mb-4">
                        <div v-if="submission.extension_status === 'pending'"
                            class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-yellow-700">
                                        Solicitud de prórroga pendiente. Razón: "{{ submission.extension_reason }}"
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="submission.extension_status === 'approved'"
                            class="bg-green-50 border-l-4 border-green-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-green-700">
                                        Prórroga aprobada. Puedes enviar tu tarea.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="submission.extension_status === 'rejected'"
                            class="bg-red-50 border-l-4 border-red-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-red-700">
                                        Solicitud de prórroga rechazada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submission Form (for draft or no submission) -->
                    <form v-if="canSubmit || submission?.status === 'draft'" @submit.prevent="handleSubmit"
                        class="space-y-4">
                        <!-- Text Content -->
                        <div v-if="['text', 'any'].includes(homework.submission_type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Respuesta de texto
                            </label>
                            <textarea v-model="form.text_content" rows="6"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Escribe tu respuesta aquí..."
                                :disabled="submission?.status === 'submitted'"></textarea>
                        </div>

                        <!-- File Upload -->
                        <div v-if="['file', 'any'].includes(homework.submission_type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Archivo
                            </label>
                            <DropZone v-model="form.file" label="Arrastra tu archivo aquí para entregar"
                                :max-size="10 * 1024 * 1024" />
                            <p v-if="submission?.file_path && !form.file"
                                class="text-sm text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                Archivo enviado anteriormente: <strong>{{ submission.file_path.split('/').pop()
                                }}</strong>
                            </p>
                        </div>

                        <!-- Link URL -->
                        <div v-if="['link', 'any'].includes(homework.submission_type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Enlace (URL)
                            </label>
                            <input v-model="form.link_url" type="url"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="https://..." :disabled="submission?.status === 'submitted'" />
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 pt-4">
                            <button v-if="!submission || submission.status === 'draft'" type="button" @click="saveDraft"
                                :disabled="saving"
                                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
                                {{ saving ? 'Guardando...' : 'Guardar borrador' }}
                            </button>
                            <button v-if="!submission || submission.status === 'draft'" type="submit"
                                :disabled="saving || !hasContent"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ saving ? 'Enviando...' : 'Enviar tarea' }}
                            </button>
                            <span v-if="submission && submission.status === 'submitted'"
                                class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
                                ✓ Tarea enviada
                            </span>
                        </div>
                    </form>

                    <!-- Extension Request Button -->
                    <div v-if="showExtensionRequest" class="text-center py-6">
                        <div
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 max-w-lg mx-auto border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">La fecha de entrega ha
                                vencido</h3>
                            <p class="text-gray-500 dark:text-gray-400 mb-4">
                                Esta tarea no acepta entregas tardías. Si necesitas más tiempo, puedes solicitar una
                                prórroga al profesor.
                            </p>
                            <button @click="requestExtension"
                                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium">
                                Solicitar Prórroga
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import DropZone from '~/components/ui/DropZone.vue'

definePageMeta({
    layout: 'student',
    middleware: ['auth', 'role', 'student-active'],
    roles: ['estudiante']
})

interface Submission {
    id: number
    status: string
    score: number | null
    submitted_at: string | null
    teacher_feedback: string | null
    text_content: string | null
    link_url: string | null
    file_path: string | null
    extension_status?: string
    extension_reason?: string
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
    instructions: string
    due_date: string
    max_score: number
    is_overdue: boolean
    submission_type: string
    attachment_path: string | null
    allow_late_submission: boolean
    submissions: Submission[]
    class_assignment: ClassAssignment
}

const route = useRoute()
const authStore = useAuthStore()
const homeworkId = computed(() => route.params.homeworkId)

const loading = ref(true)
const saving = ref(false)
const homework = ref<Homework | null>(null)
const submission = ref<Submission | null>(null)

const form = reactive({
    text_content: '',
    link_url: '',
    file: null as File | null
})

const hasContent = computed(() => {
    return form.text_content || form.link_url || form.file
})

onMounted(async () => {
    await fetchHomework()
})

async function fetchHomework() {
    try {
        loading.value = true
        const response = await api.get(`/api/homeworks/${homeworkId.value}`)
        homework.value = response.data

        // Load existing submission if any
        if (homework.value?.submissions && homework.value.submissions.length > 0) {
            submission.value = homework.value.submissions[0] ?? null
            if (submission.value) {
                form.text_content = submission.value.text_content || ''
                form.link_url = submission.value.link_url || ''
            }
        }
    } catch (error) {
        console.error('Error fetching homework:', error)
    } finally {
        loading.value = false
    }
}

function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const isOverdue = computed(() => {
    if (!homework.value?.due_date) return false
    return dayjs().isAfter(dayjs(homework.value.due_date))
})

const canSubmit = computed(() => {
    if (!homework.value) return false
    if (submission.value?.status === 'submitted' || submission.value?.status === 'graded') return false

    // If not overdue, can submit
    if (!isOverdue.value) return true

    // If overdue, check allow_late or extension
    if (homework.value.allow_late_submission) return true

    // If extension approved, can submit
    return submission.value?.extension_status === 'approved'
})

const showExtensionRequest = computed(() => {
    if (!homework.value || !isOverdue.value) return false
    if (homework.value.allow_late_submission) return false
    if (submission.value?.status === 'submitted' || submission.value?.status === 'graded') return false

    // Show if no extension or rejected
    return !submission.value?.extension_status || submission.value.extension_status === 'none' || submission.value.extension_status === 'rejected'
})

const extensionStatus = computed(() => submission.value?.extension_status || 'none')

async function requestExtension() {
    const { value: reason } = await Swal.fire({
        title: 'Solicitar Prórroga',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Explica por qué necesitas más tiempo...',
        inputAttributes: {
            'aria-label': 'Motivo de la solicitud'
        },
        showCancelButton: true,
        confirmButtonText: 'Solicitar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes escribir una razón'
            }
        }
    })

    if (reason) {
        try {
            loading.value = true
            const response = await api.post('/api/homework-submissions/request-extension', {
                homework_id: homeworkId.value,
                reason: reason
            })
            submission.value = response.data
            Swal.fire('Solicitud enviada', 'Tu profesor revisará tu solicitud.', 'success')
        } catch (error) {
            console.error('Error requesting extension:', error)
            Swal.fire('Error', 'No se pudo enviar la solicitud', 'error')
        } finally {
            loading.value = false
        }
    }
}

async function saveDraft() {
    await saveSubmission(false)
}

async function handleSubmit() {
    const result = await Swal.fire({
        title: '¿Estás seguro de enviar esta tarea?',
        text: "No podrás editarla después.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await saveSubmission(true)
    }
}

async function saveSubmission(submit: boolean) {
    try {
        saving.value = true

        const formData = new FormData()
        formData.append('homework_id', String(homeworkId.value))
        if (form.text_content) formData.append('text_content', form.text_content)
        if (form.link_url) formData.append('link_url', form.link_url)
        if (form.file) formData.append('file', form.file)

        // Save/update submission
        const response = await api.post('/api/homework-submissions', formData)

        submission.value = response.data

        // If submitting (not just saving draft), mark as submitted
        if (submit && submission.value) {
            await api.post(`/api/homework-submissions/${submission.value.id}/submit`)
            await fetchHomework() // Refresh to get updated status

            Swal.fire(
                '¡Enviada!',
                'Tu tarea ha sido enviada exitosamente.',
                'success'
            )
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Borrador guardado',
                showConfirmButton: false,
                timer: 1500
            })
        }
    } catch (error) {
        console.error('Error saving submission:', error)
        Swal.fire(
            'Error',
            'Hubo un problema al guardar tu entrega.',
            'error'
        )
    } finally {
        saving.value = false
    }
}

async function downloadFile(url: string, path: string) {
    try {
        const response = await api.getBlob(url)
        const blob = new Blob([response])
        const urlObj = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = urlObj
        const filename = path.split('/').pop() || 'download'
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(urlObj)
    } catch (error) {
        console.error('Error downloading file:', error)
        alert('Error al descargar el archivo')
    }
}
</script>
