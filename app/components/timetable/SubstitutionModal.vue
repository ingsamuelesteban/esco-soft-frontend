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

            <div class="grid grid-cols-1 gap-4">
              <!-- Excluir Aulas -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Excluir Aulas del Sorteo
                  <span class="text-[10px] text-gray-500 block font-normal">(Las clases en estas aulas no se cubrirán)</span>
                </label>
                <div class="border rounded-md dark:border-gray-600 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30">
                  <div v-if="loadingAulas" class="text-xs text-gray-500 p-2">Cargando aulas...</div>
                  <div v-for="a in aulasList" :key="a.id" class="flex items-center p-1">
                    <input :id="'aula-ex-' + a.id" type="checkbox" :value="a.id" v-model="form.excluded_aula_ids"
                      class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <label :for="'aula-ex-' + a.id" class="ml-2 block text-[11px] text-gray-700 dark:text-gray-300">
                      {{ a.grado_cardinal }}°{{ a.seccion }} - <span class="text-gray-500">{{ a.titulo?.nombre }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Personal Extra -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Incluir personal adicional en sorteo
                </label>
                <div class="border rounded-md dark:border-gray-600 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30">
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
            </div>

            <button @click="proposeSubstitutions" :disabled="loadingPropose || form.absent_ids.length === 0"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
              <span v-if="loadingPropose">Generando sorteo...</span>
              <span v-else>Proponer Suplencias (Sorteo Equilibrado)</span>
            </button>
          </div>

          <!-- Columna 2: Resultados del Sorteo -->
          <div class="flex flex-col h-full border-l pl-6 dark:border-gray-700 min-h-[300px]">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Propuesta de Cobertura</h4>
              <button @click="addManualRow" 
                class="text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Fila Manual
              </button>
            </div>
            
            <div v-if="proposals.length === 0" class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/10 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <div class="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                 <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               </div>
               <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">No se encontraron clases para cubrir</p>
               <p class="text-[10px] text-gray-500 max-w-[180px]">Verifica que los docentes seleccionados tengan clases programadas en el horario para la fecha {{ form.date }}.</p>
               
               <button @click="addManualRow" class="mt-4 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                 Agregar suplencia manual
               </button>
            </div>

            <div v-else class="flex-1 overflow-y-auto space-y-3 pr-2">
              <div v-for="(prop, index) in proposals" :key="index" 
                class="p-3 border rounded-lg transition-all"
                :class="[
                  prop.is_already_covered ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 
                  prop.substitute ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 
                  'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                ]">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <div class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{{ prop.entry.period?.label }}</div>
                      
                      <!-- Badges de Estado -->
                      <span v-if="prop.is_already_covered" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 uppercase">Cubierto</span>
                      <span v-else-if="prop.substitute && !prop.is_manual" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 uppercase">Sugerido</span>
                      <span v-else-if="prop.is_manual" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 uppercase">Manual</span>
                      <span v-else class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 uppercase">Pendiente</span>
                    </div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ prop.entry.assignment?.materia?.nombre || prop.entry.materia_nombre || 'N/A' }}</div>
                    <div class="text-xs text-gray-500">{{ prop.entry.aula?.grado_cardinal }}°{{ prop.entry.aula?.seccion }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-gray-400 uppercase tracking-tighter">Docente Ausente</div>
                    <div v-if="!prop.is_manual" class="text-xs text-red-500 font-medium whitespace-nowrap">{{ prop.entry.assignment?.profesor?.nombre || prop.entry.profesor_nombre || 'Docente' }}</div>
                    <div v-else>
                       <select v-model="prop.entry.profesor_id" @change="updateManualRow(index)"
                        class="block w-full text-[10px] py-0.5 mt-0.5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-red-600 font-medium">
                        <option :value="null">-- Elegir Docente --</option>
                        <option v-for="p in profesoresList" :key="p.id" :value="p.id">{{ p.nombre }} {{ p.apellido }}</option>
                      </select>
                    </div>
                    
                    <button v-if="prop.is_manual || !prop.is_already_covered" @click="removeRow(index)" class="mt-1 text-gray-400 hover:text-red-500 transition-colors">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="!prop.is_already_covered" class="mt-2 grid grid-cols-1 gap-2 border-t dark:border-gray-700 pt-2">
                  <div v-if="prop.is_manual" class="space-y-2 mb-1">
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-[9px] text-gray-500 uppercase mb-0.5">Periodo</label>
                        <select v-model="prop.entry.period_id" @change="updateManualRow(index)"
                          class="block w-full text-[10px] rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                          <option :value="null">-- Per. --</option>
                          <option v-for="p in periodsList" :key="p.id" :value="p.id">{{ p.label }}</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-[9px] text-gray-500 uppercase mb-0.5">Aula</label>
                        <select v-model="prop.entry.aula_id" @change="updateManualRow(index)"
                          class="block w-full text-[10px] rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                          <option :value="null">-- Aula --</option>
                          <option v-for="a in aulasList" :key="a.id" :value="a.id">{{ a.grado_cardinal }}°{{ a.seccion }}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[9px] text-gray-500 uppercase mb-0.5">Materia (Opcional)</label>
                      <input v-model="prop.entry.materia_nombre" @blur="updateManualRow(index)" placeholder="Nombre de la materia..."
                        class="block w-full text-[10px] rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                    </div>
                  </div>

                  <label class="block text-[10px] text-gray-500 uppercase mb-1 font-semibold tracking-tight">Asignar Suplente</label>
                  <select v-model="prop.substitute_id" @change="updateSubstitute(index, $event)"
                    class="block w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500">
                    <option :value="null">-- Seleccionar Suplente --</option>
                    <option v-for="c in (prop.all_candidates?.length ? prop.all_candidates : extraStaffList)" :key="c.id" :value="c.id"
                      :disabled="isCandidateBusy(c.id, prop.entry.period_id, index)">
                      {{ c.nombre }} {{ c.apellido }} {{ isCandidateBusy(c.id, prop.entry.period_id, index) ? '(Ocupado en esta hora)' : '' }}
                    </option>
                  </select>
                </div>
                <div v-else class="mt-2 pt-2 border-t border-green-100 dark:border-green-900 flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <div class="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <svg class="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <span class="text-xs font-bold text-green-700 dark:text-green-500">{{ prop.substitute.nombre }} {{ prop.substitute.apellido }}</span>
                  </div>
                </div>
                
                <div v-if="!prop.is_already_covered && !prop.substitute && prop.message" class="mt-2 text-[10px] text-amber-600 italic">
                  {{ prop.message }}
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
  editBatchId?: string | null
}>()

const emit = defineEmits(['update:modelValue', 'saved', 'closed'])

const currentBatchId = ref<string | null>(null)
const periodsList = ref<any[]>([])

const form = ref({
  date: new Date().toISOString().split('T')[0],
  absent_ids: [] as number[],
  extra_staff_ids: [] as number[],
  excluded_aula_ids: [] as number[]
})

const loadingPropose = ref(false)
const loadingSave = ref(false)
const loadingStaff = ref(false)
const loadingAulas = ref(false)
const proposals = ref<any[]>([])
const allStaff = ref<any[]>([])
const aulasList = ref<any[]>([])

// Filtrar el personal que no es el que ya viene como profesor (opcional para evitar duplicados visuales)
const extraStaffList = computed(() => {
  const profesorIds = new Set(props.profesoresList.map(p => p.id))
  return allStaff.value.filter(p => !profesorIds.has(p.id))
})

onMounted(async () => {
  await Promise.all([
    loadAllStaff(),
    loadAulas(),
    loadPeriods()
  ])
  
  if (props.editBatchId) {
    loadDraft(props.editBatchId)
  }
})

const loadPeriods = async () => {
  try {
    const response = await api.get('/api/periods')
    periodsList.value = response.data || response || []
  } catch (error) {
    console.error('Error cargando periodos:', error)
  }
}

const loadDraft = async (batchId: string) => {
  try {
    loadingPropose.value = true
    const response = await api.get('/api/substitutions', {
      params: { date: form.value.date, batch_id: batchId }
    })
    
    if (response.success && response.data.length > 0) {
      currentBatchId.value = batchId
      form.value.date = response.data[0].date.split('T')[0]
      proposals.value = response.data.map((s: any) => ({
        id: s.id,
        is_manual: !s.timetable_entry_id,
        is_already_covered: s.status === 'confirmed',
        entry: {
          id: s.timetable_entry_id,
          period_id: s.period_id,
          period: s.period,
          aula_id: s.aula_id,
          aula: s.aula,
          profesor_id: s.original_profesor_id,
          profesor_nombre: s.original_profesor ? `${s.original_profesor.nombre} ${s.original_profesor.apellido}` : 'Docente Ausente',
          materia_id: s.materia_id,
          materia_nombre: s.materia ? s.materia.nombre : 'Clase Manual'
        },
        substitute: s.substitute_profesor,
        substitute_id: s.substitute_profesor_id,
        all_candidates: extraStaffList.value // En edición mostramos el personal extra para todos
      }))
    }
  } catch (error) {
    console.error('Error cargando borrador:', error)
  } finally {
    loadingPropose.value = false
  }
}

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

const loadAulas = async () => {
  try {
    loadingAulas.value = true
    const response = await api.get('/api/aulas')
    
    // El endpoint /api/aulas retorna el array directamente, no envuelto en .data
    const data = Array.isArray(response) ? response : (response?.data || [])
    
    if (data && Array.isArray(data)) {
      // Ordenar por grado y sección
      aulasList.value = data.sort((a: any, b: any) => {
        if (a.grado_cardinal !== b.grado_cardinal) return a.grado_cardinal - b.grado_cardinal
        return a.seccion.localeCompare(b.seccion)
      })
    }
  } catch (error) {
    console.error('Error cargando aulas:', error)
  } finally {
    loadingAulas.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  emit('closed')
  // Reset state
  proposals.value = []
  currentBatchId.value = null
  form.value.absent_ids = []
  form.value.extra_staff_ids = []
  form.value.excluded_aula_ids = []
}

const proposeSubstitutions = async () => {
  try {
    loadingPropose.value = true
    const response = await api.post('/api/substitutions/propose', {
      date: form.value.date,
      absent_profesor_ids: form.value.absent_ids,
      extra_staff_ids: form.value.extra_staff_ids,
      excluded_aula_ids: form.value.excluded_aula_ids
    })

    if (response.success) {
      currentBatchId.value = response.batch_id
      proposals.value = response.data.map((p: any) => ({
        id: p.id,
        is_already_covered: p.status === 'confirmed',
        entry: {
          id: p.timetable_entry_id,
          period_id: p.period_id,
          period: p.period,
          aula_id: p.aula_id,
          aula: p.aula,
          profesor_id: p.original_profesor_id,
          profesor_nombre: p.original_profesor ? `${p.original_profesor.nombre} ${p.original_profesor.apellido}` : 'Docente',
          materia_id: p.materia_id,
          materia_nombre: p.materia ? p.materia.nombre : 'N/A'
        },
        substitute: p.substitute_profesor,
        substitute_id: p.substitute_profesor_id,
        all_candidates: extraStaffList.value // Simplified for now
      }))
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

const updateSubstitute = async (propIndex: number, event: any) => {
  const selectedId = parseInt(event.target.value)
  const prop = proposals.value[propIndex]
  
  prop.substitute_id = selectedId || null
  const candidates = prop.all_candidates?.length ? prop.all_candidates : extraStaffList.value
  prop.substitute = candidates.find((c: any) => c.id === selectedId) || null

  // --- AUTO SAVE ---
  if (prop.id) {
    try {
      await api.patch(`/api/substitutions/${prop.id}`, {
        substitute_profesor_id: prop.substitute_id
      })
    } catch (error) {
      console.error('Error en auto-guardado:', error)
    }
  }
}

const updateManualRow = async (index: number) => {
  const prop = proposals.value[index]
  if (prop.id) {
    try {
      await api.patch(`/api/substitutions/${prop.id}`, {
        period_id: prop.entry.period_id,
        aula_id: prop.entry.aula_id,
        original_profesor_id: prop.entry.profesor_id
      })
    } catch (error) {
      console.error('Error actualizando fila manual:', error)
    }
  }
}

const isCandidateBusy = (candidateId: number, periodId: number, currentRowIndex: number) => {
  return proposals.value.some((p, idx) => {
    return idx !== currentRowIndex && 
           p.entry.period_id === periodId && 
           (p.substitute_id === candidateId || (p.is_already_covered && p.substitute?.id === candidateId))
  })
}

const addManualRow = async () => {
  if (!currentBatchId.value) {
    // Si no hay batch, creamos uno al vuelo o pedimos generar propuesta primero?
    // El usuario quiere que al cliquear "Proponer" genere el borrador.
    // Pero si añade una fila manual ANTES de proponer, deberíamos manejarlo.
    // Sin embargo, el flujo normal es Proponer -> Editar.
    // Si quiere empezar puramente manual, generamos un batch_id.
    currentBatchId.value = uniqid('batch_') 
  }

  try {
    const response = await api.post('/api/substitutions', {
      date: form.value.date,
      batch_id: currentBatchId.value,
      period_id: periodsList.value[0]?.id || 1, // Default to first period
      aula_id: aulasList.value[0]?.id || 1,
      status: 'draft'
    })

    if (response.success) {
      const s = response.data
      proposals.value.unshift({
        id: s.id,
        is_manual: true,
        entry: {
          period_id: s.period_id,
          aula_id: s.aula_id,
          profesor_nombre: 'Fila Manual',
          materia_nombre: 'Clase Manual'
        },
        substitute: null,
        substitute_id: null,
        all_candidates: extraStaffList.value
      })
    }
  } catch (error) {
    console.error('Error creando fila manual:', error)
  }
}

const uniqid = (prefix = '') => prefix + Math.random().toString(36).substr(2, 9)

const removeRow = async (index: number) => {
  const prop = proposals.value[index]
  if (prop.id) {
    try {
      await api.delete(`/api/substitutions/${prop.id}`)
      proposals.value.splice(index, 1)
    } catch (error) {
      console.error('Error eliminando fila:', error)
    }
  } else {
    proposals.value.splice(index, 1)
  }
}

const saveSubstitutions = async () => {
  const result = await Swal.fire({
    title: '¿Confirmar suplencias?',
    text: 'Se enviarán notificaciones a los docentes y el borrador pasará a historial.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2563eb'
  })

  if (!result.isConfirmed || !currentBatchId.value) {
    return
  }

  try {
    loadingSave.value = true
    
    const response = await api.post(`/api/substitutions/batch/${currentBatchId.value}/confirm`)

    if (response.success) {
      await Swal.fire({
        icon: 'success',
        title: '¡Confirmado!',
        text: 'Las suplencias han sido registradas y los docentes notificados.',
        timer: 2000,
        showConfirmButton: false
      })
      emit('saved')
      close()
    }
  } catch (error: any) {
    console.error('Error al confirmar:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error al confirmar',
      text: error.response?.data?.message || 'Ocurrió un error inesperado.'
    })
  } finally {
    loadingSave.value = false
  }
}
</script>
