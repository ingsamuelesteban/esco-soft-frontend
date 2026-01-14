<template>
    <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
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
                                Calificar RA {{ raNumero }} - Oportunidad {{ oportunidad }}
                            </h3>
                            <p class="text-sm text-gray-500">
                                {{ estudiante?.nombres }} {{ estudiante?.apellidos }}
                            </p>
                            <p class="text-xs text-blue-600 mt-1">
                                RNE: {{ estudiante?.rne }}
                            </p>
                        </div>
                    </div>

                    <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div class="text-sm">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-blue-700 font-medium">Valor del RA:</span>
                                <span class="font-bold text-blue-900">{{ valorRa }} puntos</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-blue-700 font-medium">Nota mínima (70%):</span>
                                <span class="font-bold text-blue-900">{{ (valorRa * 0.7).toFixed(1) }}</span>
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="guardar">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Calificación obtenida
                                </label>
                                <input ref="notaInput" v-model="form.nota" type="number" min="0" :max="valorRa"
                                    step="0.1"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Ingresa la calificación" />
                                <p class="text-xs text-gray-500 mt-1">
                                    Ingresa un valor entre 0 y {{ valorRa }}
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones (opcional)
                                </label>
                                <textarea v-model="form.observaciones" rows="4"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Comentarios sobre el desempeño..."></textarea>
                            </div>
                        </div>

                        <p v-if="error" class="mt-2 text-sm text-red-600 font-medium">{{ error }}</p>

                        <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                            <button type="submit" :disabled="loading || !isValid"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z">
                                    </path>
                                </svg>
                                {{ loading ? 'Guardando...' : 'Guardar Calificación' }}
                            </button>
                            <button v-if="notaActual !== undefined && notaActual !== null && notaActual !== ''"
                                type="button" @click="eliminar" :disabled="loading"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                                Eliminar
                            </button>
                            <button type="button" @click="$emit('close')"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
import { ref, computed, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
    estudiante: Object,
    raNumero: Number,
    oportunidad: Number,
    valorRa: {
        type: Number,
        default: 0
    },
    notaActual: [Number, String],
    observacionesActuales: String,
    loading: Boolean
})

const emit = defineEmits(['close', 'save', 'delete'])

const form = ref({
    nota: '',
    observaciones: ''
})

const notaInput = ref(null)

const error = ref('')

// Computed validation
const isValid = computed(() => {
    if (form.value.nota === '' || form.value.nota === null) return false;
    const nota = parseFloat(form.value.nota);
    return !isNaN(nota) && nota >= 0 && nota <= props.valorRa;
})

onMounted(() => {
    // Focus input on mount
    setTimeout(() => {
        notaInput.value?.focus()
    }, 100)
})

// Initialize form
watch(() => props.notaActual, (newVal) => {
    form.value.nota = (newVal !== undefined && newVal !== null && newVal !== '') ? newVal : ''
}, { immediate: true })

watch(() => props.observacionesActuales, (newVal) => {
    form.value.observaciones = newVal || ''
}, { immediate: true })

watch(() => form.value.nota, (newVal) => {
    // Clear error on input
    if (error.value) error.value = '';

    // Live validation check (optional, could just rely on button disabled)
    if (newVal !== '' && parseFloat(newVal) > props.valorRa) {
        error.value = `La nota no puede ser mayor a ${props.valorRa}`;
    }
})

const guardar = () => {
    if (!isValid.value) return;

    emit('save', {
        nota: form.value.nota,
        observaciones: form.value.observaciones
    })
}

const eliminar = async () => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminará esta calificación. Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        emit('delete')
    }
}
</script>
