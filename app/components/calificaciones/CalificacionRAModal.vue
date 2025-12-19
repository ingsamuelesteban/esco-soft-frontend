<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center mb-4">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Gestionar RA {{ raNumero }} - {{ modulo?.nombre }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ estudiante?.nombres }} {{ estudiante?.apellidos }} ({{ estudiante?.rne }})
              </p>
            </div>
          </div>

          <!-- Historial de oportunidades -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Historial de Oportunidades</h4>
            <div v-if="calificacionesExistentes.length === 0" class="text-sm text-gray-500 italic">
              No hay evaluaciones registradas para este RA
            </div>
            <div v-else class="space-y-2">
              <div v-for="cal in calificacionesOrdenadas" :key="cal.id"
                class="flex items-center justify-between p-3 border rounded-md"
                :class="cal.estado === 'Logrado' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
                <div>
                  <span class="text-sm font-medium">
                    Oportunidad {{ cal.oportunidad }}
                  </span>
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="cal.estado === 'Logrado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ cal.estado }}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(cal.fecha_evaluacion) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Estado actual -->
          <div class="mb-6 p-4 rounded-md"
            :class="estadoFinal === 'Logrado' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'">
            <div class="flex items-center">
              <svg v-if="estadoFinal === 'Logrado'" class="h-5 w-5 text-green-500 mr-2" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <svg v-else class="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium" :class="estadoFinal === 'Logrado' ? 'text-green-800' : 'text-gray-800'">
                Estado actual: {{ estadoFinal }}
              </span>
            </div>
          </div>

          <!-- Formulario para nueva evaluación -->
          <div v-if="puedeAgregarOportunidad">
            <h4 class="text-sm font-medium text-gray-900 mb-3">
              Nueva Evaluación - Oportunidad {{ proximaOportunidad }}
            </h4>
            <form @submit.prevent="guardarCalificacion">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado *</label>
                  <select v-model="form.estado" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="">Seleccionar estado...</option>
                    <option value="Logrado">Logrado</option>
                    <option value="No Logrado">No Logrado</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha de Evaluación *</label>
                  <input v-model="form.fecha_evaluacion" type="date" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea v-model="form.observaciones" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Observaciones adicionales sobre la evaluación..."></textarea>
                </div>
              </div>

              <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
            </form>
          </div>

          <div v-else class="text-center py-4">
            <div class="text-sm text-gray-500">
              <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ estadoFinal === 'Logrado' ? 'RA ya está logrado' : 'Se han agotado las 4 oportunidades' }}
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button v-if="puedeAgregarOportunidad" type="submit" @click="guardarCalificacion"
            :disabled="loading || !form.estado || !form.fecha_evaluacion"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Guardar Evaluación' }}
          </button>
          <button type="button" @click="$emit('close')" :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '~/utils/api'

const props = defineProps({
  estudiante: Object,
  modulo: Object,
  raNumero: Number,
  calificacionesExistentes: Array
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const error = ref('')

const form = ref({
  estado: '',
  fecha_evaluacion: new Date().toLocaleDateString('en-CA'),
  observaciones: ''
})

// Computed
const calificacionesOrdenadas = computed(() => {
  return [...props.calificacionesExistentes].sort((a, b) => a.oportunidad - b.oportunidad)
})

const estadoFinal = computed(() => {
  if (props.calificacionesExistentes.length === 0) return 'Sin evaluar'
  const logrado = props.calificacionesExistentes.some(cal => cal.estado === 'Logrado')
  return logrado ? 'Logrado' : 'No Logrado'
})

const proximaOportunidad = computed(() => {
  if (props.calificacionesExistentes.length === 0) return 1
  return Math.max(...props.calificacionesExistentes.map(cal => cal.oportunidad)) + 1
})

const puedeAgregarOportunidad = computed(() => {
  return estadoFinal.value !== 'Logrado' && proximaOportunidad.value <= 4
})

// Methods
const formatDate = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const guardarCalificacion = async () => {
  if (!form.value.estado || !form.value.fecha_evaluacion) {
    error.value = 'Complete los campos requeridos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload = {
      estudiante_id: props.estudiante.id,
      materia_id: props.modulo.id,
      ra_numero: props.raNumero,
      oportunidad: proximaOportunidad.value,
      estado: form.value.estado,
      fecha_evaluacion: form.value.fecha_evaluacion,
      observaciones: form.value.observaciones || null
    }

    await api.post('/api/calificaciones-ra', payload)

    emit('save')
  } catch (e) {
    console.error('Error al guardar calificación:', e)
    error.value = e?.data?.message || 'Error al guardar la calificación'
  } finally {
    loading.value = false
  }
}

// Reset form when props change
watch(() => props.calificacionesExistentes, () => {
  form.value = {
    estado: '',
    fecha_evaluacion: new Date().toLocaleDateString('en-CA'),
    observaciones: ''
  }
  error.value = ''
}, { immediate: true })
</script>