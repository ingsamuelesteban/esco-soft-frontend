<template>
  <div v-if="modelValue" class="fixed inset-0 z-[60] overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="close"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start sm:items-center">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Transferir Estudiantes
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Trasladar {{ estudiantes.length }} estudiante(s) a otra aula.
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
          <form @submit.prevent="submit" class="space-y-4">
            <!-- Destino -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aula de Destino <span class="text-red-500">*</span>
              </label>
              <select v-model="form.aula_destino_id" required :disabled="loadingAulas || loading"
                class="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors py-2 px-3">
                <option value="" disabled>Seleccione el aula destino</option>
                <option v-for="aula in aulasDisponibles" :key="aula.id" :value="aula.id">
                  {{ aula.grado_cardinal }}° {{ aula.seccion }} 
                  {{ aula.titulo ? '- ' + aula.titulo.nombre : '' }}
                  ({{ aula.estudiantes_count || 0 }}/{{ aula.capacidad || '?' }})
                </option>
              </select>
              <p v-if="loadingAulas" class="mt-1 text-xs text-gray-500">Cargando aulas...</p>
            </div>

            <!-- Motivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motivo (Opcional)
              </label>
              <textarea v-model="form.motivo" rows="2" :disabled="loading"
                class="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors py-2 px-3"
                placeholder="Ej. Reestructuración de matrícula, solicitud del tutor..."></textarea>
            </div>
            
            <!-- Resumen de estudiantes -->
            <div class="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estudiantes a transferir</h4>
              <ul class="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="est in estudiantes" :key="est.id" class="py-1 text-gray-700 dark:text-gray-300">
                  {{ est.nombres }} {{ est.apellidos }}
                </li>
              </ul>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="submit" :disabled="!isFormValid || loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Transfiriendo...' : 'Confirmar Transferencia' }}
          </button>
          <button type="button" @click="close" :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { api } from '../../utils/api'
import { showToast, showErrorAlert } from '../../utils/sweetalert'
import type { Estudiante } from '../../stores/estudiantes'
import type { Aula } from '../../stores/aulas'

const props = defineProps<{
  modelValue: boolean
  estudiantes: Estudiante[]
  aulaOrigen: Aula | null
  anioLectivoId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'transferred': []
}>()

const form = ref({
  aula_destino_id: '' as string | number,
  motivo: ''
})

const loading = ref(false)
const loadingAulas = ref(false)
const aulasDisponibles = ref<Aula[]>([])

const isFormValid = computed(() => {
  return form.value.aula_destino_id && props.estudiantes.length > 0 && props.aulaOrigen
})

const fetchAulas = async () => {
  loadingAulas.value = true
  try {
    const params: any = {}
    if (props.anioLectivoId) params.anio_lectivo_id = props.anioLectivoId
    const response = await api.get('/api/aulas', { params })
    
    // Filtrar aulas disponibles (activas y excluyendo la de origen)
    aulasDisponibles.value = response.data.filter(
      (a: Aula) => a.activo && a.id !== props.aulaOrigen?.id
    )
  } catch (error) {
    console.error('Error al cargar aulas:', error)
    showErrorAlert('Error al cargar las aulas disponibles')
  } finally {
    loadingAulas.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.value.aula_destino_id = ''
    form.value.motivo = ''
    fetchAulas()
  }
})

const close = () => {
  if (!loading.value) {
    emit('update:modelValue', false)
  }
}

const submit = async () => {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  try {
    await api.post('/api/aulas/transferir-estudiantes', {
      estudiante_ids: props.estudiantes.map(e => e.id),
      aula_origen_id: props.aulaOrigen?.id,
      aula_destino_id: form.value.aula_destino_id,
      anio_lectivo_id: props.anioLectivoId,
      motivo: form.value.motivo
    })

    showToast('Estudiantes transferidos exitosamente', 'success')
    emit('transferred')
    close()
  } catch (error: any) {
    console.error('Error al transferir estudiantes:', error)
    showErrorAlert(error.response?.data?.message || 'Error al transferir estudiantes')
  } finally {
    loading.value = false
  }
}
</script>
