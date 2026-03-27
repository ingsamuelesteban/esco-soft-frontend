<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white">
                        {{ homework ? 'Editar Tarea' : 'Nueva Tarea' }}
                    </h2>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Title -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Título *
                        </label>
                        <input v-model="form.title" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Ej: Investigación sobre..." />
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea v-model="form.description" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Descripción breve de la tarea..."></textarea>
                    </div>

                    <!-- Instructions -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Instrucciones
                        </label>
                        <textarea v-model="form.instructions" rows="4"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Instrucciones detalladas para los estudiantes..."></textarea>
                    </div>

                    <!-- Due Date and Max Score -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                <span>Programar Publicación</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400 font-normal self-end">(Opcional)</span>
                            </label>
                            <input v-model="form.published_at" type="datetime-local"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                title="Si se deja vacío, la tarea se publicará inmediatamente." />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha de entrega
                            </label>
                            <input v-model="form.due_date" type="datetime-local"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Puntuación máxima
                            </label>
                            <input v-model.number="form.max_score" type="number" min="1" max="100"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>

                    <!-- Submission Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de entrega
                        </label>
                        <select v-model="form.submission_type"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="any">Cualquiera</option>
                            <option value="file">Solo archivos</option>
                            <option value="text">Solo texto</option>
                            <option value="link">Solo enlaces</option>
                        </select>
                    </div>

                    <!-- File Attachment -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Archivo adjunto
                        </label>
                        <DropZone v-model="form.attachment" label="Arrastra tu archivo aquí o haz clic para seleccionar"
                            :max-size="10 * 1024 * 1024" />
                        <p v-if="homework?.attachment_path && !form.attachment"
                            class="text-sm text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                            Archivo actual: <strong>{{ homework.attachment_path.split('/').pop() }}</strong>
                        </p>
                    </div>

                    <!-- Allow Late Submission -->
                    <div class="flex items-center">
                        <input v-model="form.allow_late_submission" type="checkbox" id="allow_late"
                            class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500" />
                        <label for="allow_late" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Permitir entregas tardías
                        </label>
                    </div>

                    <!-- Suggested Additional Classes -->
                    <div v-if="!homework && suggestedClasses.length > 0" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                        <div class="flex flex-col sm:flex-row items-start">
                            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div class="flex-1">
                                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    Tienes otros {{ suggestedClasses.length }} grupos de {{ currentClass?.materia?.nombre }}
                                </h3>
                                <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                    ¿Deseas asignar esta misma tarea a ellos también? Al hacer esto, la tarea se enviará a todos los estudiantes.
                                </p>
                                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label v-for="sc in suggestedClasses" :key="sc.id" class="flex items-center p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                        <input type="checkbox" :value="sc.id" v-model="selectedAdditionalClasses" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {{ sc.aula?.grado_cardinal }}° {{ sc.aula?.seccion }}
                                            <span class="block text-xs text-gray-500 dark:text-gray-400 truncate">{{ sc.aula?.titulo?.nombre }}</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Assign to all switch -->
                    <div class="flex items-center justify-between">
                        <span class="flex flex-col">
                            <span class="text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white">Asignar a todos</span>
                            <span class="text-sm text-gray-500 dark:text-gray-400">Si se desactiva, podrás seleccionar
                                estudiantes específicos</span>
                        </span>
                        <button type="button" @click="form.assign_to_all = !form.assign_to_all"
                            :disabled="selectedAdditionalClasses.length > 0"
                            :class="[
                                form.assign_to_all ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
                                selectedAdditionalClasses.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                            class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                            <span aria-hidden="true" :class="form.assign_to_all ? 'translate-x-5' : 'translate-x-0'"
                                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition duration-200 ease-in-out"></span>
                        </button>
                    </div>

                    <!-- Student Selector -->
                    <div v-if="!form.assign_to_all" class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Seleccionar Estudiantes
                        </label>
                        <div v-if="loadingStudents" class="text-sm text-gray-500 dark:text-gray-400">Cargando estudiantes...</div>
                        <div v-else
                            class="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                            <label v-for="student in students" :key="student.id"
                                class="flex items-center p-2 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input type="checkbox" :value="student.id" v-model="form.student_ids"
                                    class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500" />
                                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {{ student.user?.name || student.primer_nombre + ' ' + student.primer_apellido }}
                                </span>
                            </label>
                            <div v-if="students.length === 0" class="text-sm text-gray-500 dark:text-gray-400 p-2">
                                No se encontraron estudiantes en esta clase.
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ form.student_ids.length }} estudiantes seleccionados
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" @click="$emit('close')"
                            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="saving"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ saving ? 'Guardando...' : (homework ? 'Actualizar' : 'Crear') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { api } from '~/utils/api'
import DropZone from '~/components/ui/DropZone.vue'

const props = defineProps<{
    classAssignmentId: string | number
    homework?: any
}>()

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)

const form = reactive({
    title: '',
    description: '',
    instructions: '',
    published_at: '',
    due_date: '',
    max_score: 100,
    submission_type: 'any',
    allow_late_submission: true,
    attachment: null as File | null,
    assign_to_all: true,
    student_ids: [] as number[]
})

const students = ref<any[]>([])
const loadingStudents = ref(false)
const currentClass = ref<any>(null)
const suggestedClasses = ref<any[]>([])
const selectedAdditionalClasses = ref<number[]>([])

watch(selectedAdditionalClasses, (newVal) => {
    if (newVal.length > 0) {
        form.assign_to_all = true
    }
})

onMounted(async () => {
    if (props.homework) {
        form.title = props.homework.title || ''
        form.description = props.homework.description || ''
        form.instructions = props.homework.instructions || ''
        form.published_at = props.homework.published_at ? formatDateTimeLocal(props.homework.published_at) : ''
        form.due_date = props.homework.due_date ? formatDateTimeLocal(props.homework.due_date) : ''
        form.max_score = props.homework.max_score || 100
        form.submission_type = props.homework.submission_type || 'any'
        form.allow_late_submission = props.homework.allow_late_submission ?? true
        // Backend returns 1/0 for boolean sometimes, so ensure types
        form.assign_to_all = props.homework.assign_to_all !== false && props.homework.assign_to_all !== 0

        // If not assigned to all, we need to populate student_ids
        if (!form.assign_to_all && props.homework.assignees) {
            form.student_ids = props.homework.assignees.map((s: any) => s.id)
        }
    }
    
    await fetchClassDetails()
    if (!props.homework) {
        await fetchSuggestedClasses()
    }
    await fetchStudents()
})

async function fetchClassDetails() {
    try {
        const response = await api.get(`/api/class-assignments/${props.classAssignmentId}`)
        currentClass.value = response.data || response
    } catch (error) {
        console.error('Error fetching class details:', error)
    }
}

async function fetchSuggestedClasses() {
    if (!currentClass.value || !currentClass.value.materia_id) return
    
    try {
        const response = await api.get('/api/class-assignments', {
            params: {
                materia_id: currentClass.value.materia_id,
                profesor_id: currentClass.value.profesor_id,
                only_active: 1
            }
        })
        const allRelated = response.data?.data || response.data || []
        suggestedClasses.value = allRelated.filter((c: any) => c.id !== Number(props.classAssignmentId))
    } catch (error) {
        console.error('Error fetching suggested classes:', error)
    }
}

async function fetchStudents() {
    try {
        loadingStudents.value = true
        const aulaId = currentClass.value?.aula_id

        if (aulaId) {
            const response = await api.get('/api/estudiantes', {
                params: {
                    aula_id: aulaId,
                    per_page: 200 // Fetch all
                }
            })
            students.value = response.data?.data || response.data || []
        }
    } catch (error) {
        console.error('Error fetching students:', error)
    } finally {
        loadingStudents.value = false
    }
}

function formatDateTimeLocal(dateString: string) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}


async function handleSubmit() {
    try {
        saving.value = true

        // Validation: if not assign_to_all, must select at least one student
        if (!form.assign_to_all && form.student_ids.length === 0) {
            alert('Por favor selecciona al menos un estudiante')
            saving.value = false
            return
        }

        const formData = new FormData()
        
        // Multi-course assignment logic
        const allClassIds = [props.classAssignmentId, ...selectedAdditionalClasses.value]
        allClassIds.forEach(id => {
            formData.append('class_assignment_ids[]', String(id))
        })
        formData.append('title', form.title)
        if (form.description) formData.append('description', form.description)
        if (form.instructions) formData.append('instructions', form.instructions)
        if (form.published_at) formData.append('published_at', form.published_at)
        if (form.due_date) formData.append('due_date', form.due_date)
        formData.append('max_score', String(form.max_score))
        formData.append('submission_type', form.submission_type)
        formData.append('allow_late_submission', form.allow_late_submission ? '1' : '0')
        if (form.attachment) formData.append('attachment', form.attachment)

        // New fields
        const isMultiple = selectedAdditionalClasses.value.length > 0
        const finalAssignToAll = isMultiple ? true : form.assign_to_all
        
        formData.append('assign_to_all', finalAssignToAll ? '1' : '0')
        if (!finalAssignToAll) {
            form.student_ids.forEach(id => {
                formData.append('students[]', String(id))
            })
        }

        if (props.homework) {
            // Update existing homework (no multiple updates supported via one request yet, usually edit is context to one course)
            formData.append('_method', 'PUT')
            await api.post(`/api/homeworks/${props.homework.id}`, formData)
        } else {
            // Create new homework(s)
            await api.post('/api/homeworks', formData)
        }

        emit('saved')
    } catch (error) {
        console.error('Error saving homework:', error)
        alert('Error al guardar la tarea')
    } finally {
        saving.value = false
    }
}
</script>
