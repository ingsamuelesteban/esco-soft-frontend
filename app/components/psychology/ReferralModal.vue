<template>
    <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                @click="$emit('close')"></div>

            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <!-- Modal panel -->
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div
                            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Reportar a Orientación y Psicología
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500 mb-4">
                                    Estudiante: <span class="font-bold text-gray-800">{{ studentName }}</span>
                                </p>

                                <form @submit.prevent="handleSubmit" class="space-y-4">
                                    <div>
                                        <label for="priority"
                                            class="block text-sm font-medium text-gray-700">Prioridad</label>
                                        <select ref="priorityInput" id="priority" v-model="form.priority"
                                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="assigned_to" class="block text-sm font-medium text-gray-700">Asignar
                                            a
                                            (Opcional)</label>
                                        <select id="assigned_to" v-model="form.assigned_to"
                                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                            <option value="">Automático (Según disponibilidad)</option>
                                            <option v-for="psych in psychologists" :key="psych.id" :value="psych.id">
                                                {{ psych.name }}
                                            </option>
                                        </select>
                                        <p class="mt-1 text-xs text-gray-500">Si se deja en blanco, el sistema asignará
                                            al
                                            psicólogo con menos carga.</p>
                                    </div>

                                    <div>
                                        <label for="reason" class="block text-sm font-medium text-gray-700">Motivo del
                                            Reporte</label>
                                        <textarea id="reason" v-model="form.reason" rows="3" required
                                            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            placeholder="Describa la situación o comportamiento observado..."></textarea>
                                    </div>

                                    <div class="flex items-start">
                                        <div class="flex items-center h-5">
                                            <input id="send_student" v-model="form.send_student" type="checkbox"
                                                class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                        </div>
                                        <div class="ml-3 text-sm">
                                            <label for="send_student" class="font-medium text-gray-700">¿Enviar
                                                estudiante a psicología?</label>
                                            <p class="text-gray-500">Marque esta opción si el estudiante debe
                                                presentarse al departamento de psicología. Si no se marca, solo se
                                                abrirá el caso para seguimiento.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" @click="handleSubmit" :disabled="loading"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        <span v-if="loading">Enviando...</span>
                        <span v-else>Crear Reporte</span>
                    </button>
                    <button type="button" @click="$emit('close')" :disabled="loading"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { usePsychologyStore } from '~/stores/psychology'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

const props = defineProps<{
    studentId: number
    studentName: string
}>()

const emit = defineEmits(['close', 'saved'])

const psychologyStore = usePsychologyStore()
const loading = ref(false)
const priorityInput = ref<HTMLSelectElement | null>(null)

const form = reactive({
    priority: 'medium',
    reason: '',
    assigned_to: '',
    send_student: false
})

const psychologists = ref<Array<{ id: number, name: string }>>([])
const loadPsychologists = async () => {
    try {
        const data = await api.get('/api/users/psychologists')
        psychologists.value = data
    } catch (e) {
        console.error("Error loading psychologists", e)
    }
}

onMounted(() => {
    loadPsychologists()
    setTimeout(() => {
        priorityInput.value?.focus()
    }, 100)
})

const handleSubmit = async () => {
    if (!form.reason.trim()) {
        Swal.fire('Error', 'Debe indicar un motivo', 'warning')
        return
    }

    const res = await psychologyStore.createReferral({
        student_id: props.studentId,
        reason: form.reason,
        priority: form.priority,
        assigned_to: form.assigned_to || null,
        send_student: form.send_student
    })
    loading.value = false

    if (res.success) {
        Swal.fire({
            icon: 'success',
            title: 'Reporte Creado',
            text: 'El caso ha sido abierto y el departamento de psicología ha sido notificado.',
            timer: 2500,
            showConfirmButton: false
        })
        emit('saved')
        emit('close')
    } else {
        Swal.fire('Error', res.error || 'No se pudo crear el reporte', 'error')
    }
}
</script>
