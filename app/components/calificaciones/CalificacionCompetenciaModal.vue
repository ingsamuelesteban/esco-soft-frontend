<template>
    <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="flex items-center mb-4">
                        <div
                            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                Calificar {{ tituloCompetencia }}
                            </h3>
                            <p class="text-sm text-gray-500">
                                {{ estudiante?.nombres }} {{ estudiante?.apellidos }} - {{ periodo }}
                            </p>
                        </div>
                    </div>

                    <form @submit.prevent="guardarCalificacion">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Calificación (0-100) *</label>
                                <input v-model.number="form.nota" type="number" min="0" max="100" step="1" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Ingrese la nota" @keypress="isNumber($event)" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Observaciones</label>
                                <textarea v-model="form.observaciones" rows="3"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Observaciones opcionales..."></textarea>
                            </div>
                        </div>

                        <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

                        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button type="submit"
                                :disabled="loading || form.nota === '' || form.nota < 0 || form.nota > 100"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                                {{ loading ? 'Guardando...' : 'Guardar' }}
                            </button>
                            <button type="button" @click="$emit('close')" :disabled="loading"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '~/utils/api'

const props = defineProps({
    estudiante: Object,
    modulo: Object,
    competenciaTitulo: String, // e.g., "CE-LE1"
    bloqueIndex: Number, // 1, 2, 3, 4
    periodo: String, // "P1", "P2", "P3", "P4"
    tipo: String, // "P" (Periodo) or "RP" (Recuperacion)
    calificacionActual: [Number, String],
    observacionesActuales: String
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const error = ref('')

const form = ref({
    nota: '',
    observaciones: ''
})

const tituloCompetencia = computed(() => props.competenciaTitulo)

// Initialize form
watch(() => props.calificacionActual, (newVal) => {
    form.value.nota = newVal !== undefined && newVal !== null ? newVal : ''
}, { immediate: true })

watch(() => props.observacionesActuales, (newVal) => {
    form.value.observaciones = newVal || ''
}, { immediate: true })

const guardarCalificacion = async () => {
    if (form.value.nota === '' || form.value.nota < 0 || form.value.nota > 100) {
        error.value = 'La calificación debe estar entre 0 y 100'
        return
    }

    loading.value = true
    error.value = ''

    try {
        const payload = {
            estudiante_id: props.estudiante.id,
            materia_id: props.modulo.id,
            competencia_codigo: props.competenciaTitulo,
            bloque: props.bloqueIndex,
            periodo: props.periodo,
            tipo: props.tipo, // 'P' or 'RP'
            nota: form.value.nota,
            observaciones: form.value.observaciones || null
        }

        // Assuming this endpoint exists or will be created
        await api.post('/api/calificaciones-competencias', payload)

        emit('save', {
            ...payload,
            nota: parseFloat(form.value.nota)
        })
    } catch (e) {
        console.error('Error al guardar calificación:', e)
        error.value = e?.data?.message || 'Error al guardar la calificación'
    } finally {
        loading.value = false
    }
}
const isNumber = (evt) => {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
        evt.preventDefault();
    } else {
        return true;
    }
}
</script>
