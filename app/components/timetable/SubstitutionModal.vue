<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button @click="close" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
              Cubrir Ausentes
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Selecciona los profesores ausentes y el sistema sorteará los reemplazos.
            </p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Columna 1: Configuración -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input type="date" v-model="form.date"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profesores Ausentes</label>
              <div class="border rounded-md dark:border-gray-600 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30">
                <div v-for="p in profesoresList" :key="p.id" class="flex items-center p-1">
                  <input :id="'prof-' + p.id" type="checkbox" :value="p.id" v-model="form.absent_ids"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label :for="'prof-' + p.id" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {{ p.nombre }} {{ p.apellido }}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incluir personal adicional en sorteo
                <span class="text-[10px] text-gray-500 block font-normal">(Psicólogos, coordinadores, etc. disponibles para cubrir)</span>
              </label>
              <div class="border rounded-md dark:border-gray-600 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30">
                <div v-if="loadingStaff" class="text-xs text-gray-500 p-2">Cargando personal...</div>
                <div v-else-if="extraStaffList.length === 0" class="text-xs text-gray-400 p-2 italic">No hay personal adicional disponible.</div>
                <div v-for="p in extraStaffList" :key="p.id" class="flex items-center p-1">
                  <input :id="'extra-' + p.id" type="checkbox" :value="p.id" v-model="form.extra_staff_ids"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                  <label :for="'extra-' + p.id" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {{ p.nombre }} {{ p.apellido }}
                    <span class="text-[10px] text-gray-500">({{ p.cargo?.nombre || 'Personal' }})</span>
                  </label>
                </div>
              </div>
            </div>

            <button @click="proposeSubstitutions" :disabled="loadingPropose || form.absent_ids.length === 0"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
              <span v-if="loadingPropose">Generando sorteo...</span>
              <span v-else>Proponer Suplencias (Sorteo Equilibrado)</span>
            </button>
          </div>

          <!-- Columna 2: Resultados del Sorteo -->
          <div class="flex flex-col h-full border-l pl-6 dark:border-gray-700 min-h-[300px]">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Propuesta de Cobertura</h4>
            
            <div v-if="proposals.length === 0" class="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
               Genera una propuesta para ver los resultados aquí.
            </div>

            <div v-else class="flex-1 overflow-y-auto space-y-3 pr-2">
              <div v-for="(prop, index) in proposals" :key="index" class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="text-xs font-bold text-blue-600 uppercase">{{ prop.entry.period.label }}</div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ prop.entry.assignment.materia.nombre }}</div>
                    <div class="text-xs text-gray-500">{{ prop.entry.aula.grado_cardinal }}°{{ prop.entry.aula.seccion }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-gray-400">Ausente</div>
                    <div class="text-xs text-red-500 whitespace-nowrap">{{ prop.entry.assignment?.profesor?.nombre || 'Docente' }}</div>
                  </div>
                </div>

                <div v-if="prop.substitute" class="mt-2 pt-2 border-t dark:border-gray-700">
                  <label class="block text-[10px] text-gray-500 uppercase mb-1">Suplente Asignado</label>
                  <select v-model="prop.substitute.id" @change="updateSubstitute(index, $event)"
                    class="block w-full text-xs rounded border-gray-300 dark:bg-gray-700">
                    <option v-for="c in prop.all_candidates" :key="c.id" :value="c.id">
                      {{ c.nombre }} {{ c.apellido }}
                    </option>
                  </select>
                </div>
                <div v-else class="mt-2 text-xs text-amber-600 italic">
                  {{ prop.message || 'Sin profesores disponibles' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3 p-4 border-t dark:border-gray-700 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-900/30">
          <button @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 transition-colors">
            Cancelar
          </button>
          <button @click="saveSubstitutions" :disabled="loadingSave || proposals.length === 0"
            class="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2">
            <span v-if="loadingSave" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Confirmar y Notificar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '../../utils/api'
import Swal from 'sweetalert2'

const props = defineProps<{
  modelValue: boolean
  profesoresList: any[]
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const form = ref({
  date: new Date().toISOString().split('T')[0],
  absent_ids: [] as number[],
  extra_staff_ids: [] as number[]
})

const loadingPropose = ref(false)
const loadingSave = ref(false)
const loadingStaff = ref(false)
const proposals = ref<any[]>([])
const allStaff = ref<any[]>([])

// Filtrar el personal que no es el que ya viene como profesor (opcional para evitar duplicados visuales)
const extraStaffList = computed(() => {
  const profesorIds = new Set(props.profesoresList.map(p => p.id))
  return allStaff.value.filter(p => !profesorIds.has(p.id))
})

onMounted(async () => {
  await loadAllStaff()
})

const loadAllStaff = async () => {
  try {
    loadingStaff.value = true
    const response = await api.get('/api/personal')
    if (response.data) {
      allStaff.value = response.data
    }
  } catch (error) {
    console.error('Error cargando personal:', error)
  } finally {
    loadingStaff.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  // Reset state
  proposals.value = []
  form.value.absent_ids = []
  form.value.extra_staff_ids = []
}

const proposeSubstitutions = async () => {
  try {
    loadingPropose.value = true
    const response = await api.post('/api/substitutions/propose', {
      date: form.value.date,
      absent_profesor_ids: form.value.absent_ids,
      extra_staff_ids: form.value.extra_staff_ids
    })

    if (response.success) {
      proposals.value = response.data
    }
  } catch (error) {
    console.error('Error al generar propuesta:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar la propuesta de suplencias.'
    })
  } finally {
    loadingPropose.value = false
  }
}

const updateSubstitute = (propIndex: number, event: any) => {
  const selectedId = parseInt(event.target.value)
  const prop = proposals.value[propIndex]
  const newSub = prop.all_candidates.find((c: any) => c.id === selectedId)
  if (newSub) {
    prop.substitute = newSub
  }
}

const saveSubstitutions = async () => {
  const result = await Swal.fire({
    title: '¿Confirmar suplencias?',
    text: 'Se guardarán las asignaciones y se enviarán notificaciones a los docentes.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2563eb'
  })

  if (!result.isConfirmed) {
    return
  }

  try {
    loadingSave.value = true
    
    // Preparar datos para el backend
    const subsToSave = proposals.value
      .filter(p => p.substitute)
      .map(p => ({
        original_profesor_id: p.entry.profesor_id,
        substitute_profesor_id: p.substitute.id,
        period_id: p.entry.period_id,
        aula_id: p.entry.aula_id,
        materia_id: p.entry.assignment.materia_id,
        timetable_entry_id: p.entry.id
      }))

    const response = await api.post('/api/substitutions', {
      date: form.value.date,
      substitutions: subsToSave
    })

    if (response.success) {
      await Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Las suplencias han sido registradas y los docentes notificados.',
        timer: 2000,
        showConfirmButton: false
      })
      emit('saved')
      close()
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: 'Ocurrió un error inesperado al intentar guardar las suplencias.'
    })
  } finally {
    loadingSave.value = false
  }
}
</script>
