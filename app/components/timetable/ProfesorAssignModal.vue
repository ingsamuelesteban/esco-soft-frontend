<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="close">
        <div class="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
      </div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                Asignar Horario - {{ dayLabel }} {{ periodLabel }}
              </h3>
              <div class="mt-4">
                <!-- Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
                  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button @click="tab = 'existing'" :class="[tab === 'existing' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300', 'whitespace-nowrap py-2 border-b-2 font-medium text-sm']">
                      Asignación Existente
                    </button>
                    <button @click="tab = 'new'" :class="[tab === 'new' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300', 'whitespace-nowrap py-2 border-b-2 font-medium text-sm']">
                      Nueva Asignación Rápida
                    </button>
                  </nav>
                </div>

                <!-- Tab Content: Existing -->
                <div v-if="tab === 'existing'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar Asignación</label>
                    <select v-model="selectedAssignmentId" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option :value="undefined">Seleccionar...</option>
                      <option v-for="a in sortedAssignments" :key="a.id" :value="a.id">
                        {{ a.materia?.nombre }} - {{ aulaName(a.aula) }} (Faltan: {{ remainingHours(a) }})
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Tab Content: New -->
                <div v-if="tab === 'new'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Aula</label>
                    <select v-model="newAulaId" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option :value="undefined">Seleccionar...</option>
                      <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                        {{ aulaName(aula) }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Módulo Formativo / Asignatura</label>
                    <select v-model="newMateriaId" :disabled="!newAulaId" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option :value="undefined">Seleccionar...</option>
                      <option v-for="materia in materias" :key="materia.id" :value="materia.id">
                        {{ materia.nombre }}
                      </option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" @click="save" :disabled="isSaving || !isValid" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Guardar
          </button>
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAulasStore } from '~/stores/aulas'
import { useModulosFormativosApiStore } from '~/stores/modulos-formativos-api'
import { useClassAssignmentsStore } from '~/stores/class_assignments'
import { useTimetableEntriesStore } from '~/stores/timetable_entries'
import { usePeriodsStore } from '~/stores/periods'

const props = defineProps<{
  show: boolean
  profesorId?: number
  anioId?: number
  dia?: number
  periodId?: number
  profesorAssignments: any[]
}>()

const emit = defineEmits(['update:show', 'assigned'])

const aulasStore = useAulasStore()
const materiasStore = useModulosFormativosApiStore()
const assignmentsStore = useClassAssignmentsStore()
const entriesStore = useTimetableEntriesStore()
const periodsStore = usePeriodsStore()

const tab = ref<'existing' | 'new'>('existing')
const isSaving = ref(false)

// Option A
const selectedAssignmentId = ref<number | undefined>(undefined)

// Option B
const newAulaId = ref<number | undefined>(undefined)
const newMateriaId = ref<number | undefined>(undefined)

onMounted(async () => {
  if (aulasStore.items.length === 0) await aulasStore.fetchAll({ anioLectivoId: props.anioId })
  if (materiasStore.items.length === 0) await materiasStore.fetchAll('active')
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    selectedAssignmentId.value = undefined
    newAulaId.value = undefined
    newMateriaId.value = undefined
    tab.value = 'existing'
  }
})

const aulas = computed(() => aulasStore.items)
const materias = computed(() => materiasStore.items)

const sortedAssignments = computed(() => {
  return [...props.profesorAssignments].sort((a, b) => {
    const nameA = `${a.materia?.nombre || ''} - ${aulaName(a.aula)}`
    const nameB = `${b.materia?.nombre || ''} - ${aulaName(b.aula)}`
    return nameA.localeCompare(nameB)
  })
})

const isValid = computed(() => {
  if (tab.value === 'existing') return !!selectedAssignmentId.value
  return !!newAulaId.value && !!newMateriaId.value
})

const aulaName = (aula?: any) => {
  if (!aula) return '—'
  const grado = aula.grado_cardinal ? `${aula.grado_cardinal}º` : ''
  const seccion = aula.seccion || ''
  return `${grado}${seccion}`.trim() || `Aula ${aula.id}`
}

const remainingHours = (assignment: any) => {
  const programados = assignment.periodos_programados || 0
  const asignados = assignment.horas_semanales || 0
  return Math.max(0, asignados - programados)
}

const dayLabel = computed(() => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return props.dia !== undefined ? days[props.dia] : ''
})

const periodLabel = computed(() => {
  const p = periodsStore.items.find(p => p.id === props.periodId)
  return p ? p.label : ''
})

const close = () => {
  emit('update:show', false)
}

const save = async () => {
  if (!isValid.value || !props.profesorId || !props.anioId || props.dia === undefined || props.periodId === undefined) return
  
  isSaving.value = true
  let assignId = selectedAssignmentId.value

  try {
    if (tab.value === 'new') {
      const created = await assignmentsStore.create({
        materia_id: newMateriaId.value!,
        profesor_id: props.profesorId,
        aula_id: newAulaId.value!,
        anio_lectivo_id: props.anioId,
        horas_semanales: 2 // Default
      })
      assignId = created.id
    }

    await entriesStore.create({
      assignment_id: assignId!,
      dia: props.dia,
      period_id: props.periodId
    })

    emit('assigned')
    close()
  } catch (e: any) {
    console.error('Error saving assignment:', e)
    let title = 'Error al Asignar Horario'
    let message = 'No se pudo completar la asignación'
    let icon: 'error' | 'warning' = 'error'

    const status = e.statusCode || e.status || e.response?.status
    if (status === 422) {
      if (e.data?.message || e.response?.data?.message) {
        message = e.data?.message || e.response?.data?.message
        icon = 'warning'
        title = 'Conflicto de Horario'
      } else {
        message = 'Conflicto de horario: el profesor o el aula ya están ocupados en este período'
        icon = 'warning'
        title = 'Conflicto de Horario'
      }
    }

    await Swal.fire({
      title,
      text: message,
      icon,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3B82F6'
    })
  } finally {
    isSaving.value = false
  }
}
</script>
