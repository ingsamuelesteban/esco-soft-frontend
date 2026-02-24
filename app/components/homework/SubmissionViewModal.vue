<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                        <span v-if="gradingMode && isRegrade">Editar Calificación</span>
                        <span v-else-if="gradingMode">Calificar Entrega</span>
                        <span v-else>Ver Entrega</span>
                    </h2>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Student Info -->
                <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {{ submission.student?.user?.name || 'Sin nombre' }}
                    </h3>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Enviado: {{ formatDate(submission.submitted_at) }}</span>
                        <span v-if="submission.is_late"
                            class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                            Entrega tardía ({{ submission.days_late }} días)
                        </span>
                    </div>
                </div>

                <!-- Submission Content -->
                <div class="space-y-4 mb-6">
                    <!-- Text Content -->
                    <div v-if="submission.text_content">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Respuesta de texto:</h4>
                        <p
                            class="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            {{ submission.text_content }}
                        </p>
                    </div>

                    <!-- Link URL -->
                    <div v-if="submission.link_url">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enlace:</h4>
                        <a :href="submission.link_url" target="_blank"
                            class="text-blue-600 dark:text-blue-400 hover:underline break-all">
                            {{ submission.link_url }}
                        </a>
                    </div>

                    <!-- File -->
                    <div v-if="submission.file_path">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivo:</h4>
                        <a href="#" @click.prevent="downloadFile"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar archivo
                        </a>
                    </div>
                </div>

                <!-- Grading Form (if in grading mode) -->
                <form v-if="gradingMode" @submit.prevent="handleGrade"
                    class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">

                    <!-- Aviso de re-calificación -->
                    <div v-if="isRegrade" class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                        </svg>
                        Calificación anterior: <strong class="ml-1">{{ submission.score }} / {{ homework.max_score }}</strong>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Calificación (0-{{ homework.max_score }}) *
                            </label>
                            <input v-model.number="form.score" type="number" :min="0" :max="homework.max_score"
                                step="0.01" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Retroalimentación
                        </label>
                        <textarea v-model="form.teacher_feedback" rows="4"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Comentarios para el estudiante..."></textarea>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button type="button" @click="$emit('close')"
                            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="saving"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {{ saving ? 'Guardando...' : (isRegrade ? 'Actualizar Calificación' : 'Guardar Calificación') }}
                        </button>
                    </div>
                </form>

                <!-- View Mode (if already graded) -->
                <div v-else-if="submission.score !== null" class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div
                        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { api } from '~/utils/api'
import dayjs from 'dayjs'

const props = defineProps<{
    submission: any
    homework: any
    gradingMode: boolean
}>()

const emit = defineEmits(['close', 'graded'])

const saving = ref(false)

// determinar si es una re-calificación
const isRegrade = computed(() => props.submission.score !== null && props.submission.score !== undefined)

const form = reactive({
    score: 0 as number,
    teacher_feedback: '' as string
})

onMounted(() => {
    if (props.submission.score !== null) {
        form.score = props.submission.score
        form.teacher_feedback = props.submission.teacher_feedback || ''
    }
})

function formatDate(date: string) {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY HH:mm')
}

async function handleGrade() {
    try {
        saving.value = true

        await api.post(`/api/homework-submissions/${props.submission.id}/grade`, {
            score: form.score,
            teacher_feedback: form.teacher_feedback
        })

        emit('graded')
    } catch (error) {
        console.error('Error grading submission:', error)
        alert('Error al calificar la entrega')
    } finally {
        saving.value = false
    }
}

async function downloadFile() {
    try {
        const url = `/api/homework-submissions/${props.submission.id}/download`
        const response = await api.getBlob(url)
        const blob = new Blob([response])
        const urlObj = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = urlObj
        const filename = props.submission.file_path?.split('/').pop() || 'download'
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
