<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 class="text-lg font-medium text-gray-900">Configurar Periodos Académicos</h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1">
                <div v-if="loading" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-500">Cargando periodos...</p>
                </div>

                <form v-else @submit.prevent="save">
                    <div class="space-y-6">
                        <div v-for="(period, idx) in periods" :key="idx"
                            class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-md font-bold text-blue-800">{{ period.nombre }} (P{{ period.numero }})
                                </h4>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-500 uppercase">Clase Inicio
                                        (Opcional)</label>
                                    <input type="date" v-model="period.fecha_inicio"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-500 uppercase">Clase Fin
                                        (Opcional)</label>
                                    <input type="date" v-model="period.fecha_fin"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-red-600 uppercase">Fecha Publicación
                                        Boletín</label>
                                    <input type="date" v-model="period.fecha_publicacion" required
                                        class="mt-1 block w-full border-red-300 rounded-md shadow-sm text-sm focus:ring-red-500 focus:border-red-500 bg-red-50">
                                    <p class="text-xs text-red-500 mt-1">Fecha en que se muestran notas y activan
                                        bloqueos.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {{ error }}
                    </div>
                </form>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <button type="button" @click="$emit('close')"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white">
                    Cancelar
                </button>
                <button type="button" @click="save" :disabled="loading"
                    class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAcademicPeriodsStore, type AcademicPeriod } from '../../stores/academic_periods'

const props = defineProps<{
    anioId: number
}>()

const emit = defineEmits(['close'])
const store = useAcademicPeriodsStore()

const periods = ref<AcademicPeriod[]>([])
const loading = computed(() => store.loading)
const error = computed(() => store.error)

onMounted(async () => {
    await store.fetchByAnio(props.anioId)
    // Clone and format dates
    periods.value = store.periods.map(p => ({
        ...p,
        fecha_publicacion: p.fecha_publicacion ? p.fecha_publicacion.substring(0, 10) : '',
        fecha_inicio: p.fecha_inicio ? p.fecha_inicio.substring(0, 10) : '',
        fecha_fin: p.fecha_fin ? p.fecha_fin.substring(0, 10) : ''
    }))
})

import Swal from 'sweetalert2'

// ... (props and other imports)

async function save() {
    try {
        await store.bulkUpdate(periods.value, props.anioId)
        Swal.fire({
            title: '¡Guardado!',
            text: 'Periodos configurados correctamente',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
        })
        emit('close')
    } catch (e) {
        // Error handling in store, but maybe show alert here too if needed?
        // Store sets 'error' property, which is displayed in template.
    }
}
</script>
