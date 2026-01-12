<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Año lectivo</label>
        <select v-model="anioId" class="border rounded px-2 py-1 text-sm h-8 min-w-[120px]">
          <option :value="undefined">Seleccionar...</option>
          <option v-for="a in anios" :key="a.id" :value="a.id">{{ a.nombre }}</option>
        </select>
      </div>
      <!-- Selector de profesores: Visible si es admin/master -->
      <div class="flex items-center gap-2" v-if="!authStore.isProfesor">
        <label class="text-sm text-gray-600">Profesor</label>
        <select v-model.number="profesorId" class="border rounded px-2 py-1 text-sm h-8 min-w-[250px]"
          :disabled="loadingProfesores">
          <option :value="undefined">{{ loadingProfesores ? 'Cargando profesores...' : 'Seleccionar profesor…' }}
          </option>
          <option v-for="p in profesores" :key="p.id" :value="p.id">{{ profesorName(p) }}</option>
        </select>
      </div>

      <!-- Nombre del profesor si es rol profesor -->
      <div v-else class="flex items-center gap-2">
        <span class="text-sm text-gray-500 mr-1">Profesor:</span>
        <h2 class="text-base font-medium text-gray-900 border-b border-gray-300 pb-0.5">
          {{ authStore.user?.name }}
        </h2>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button @click="reload"
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          :disabled="loading" title="Refrescar">
          <svg class="h-5 w-5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading && profesorId" class="px-4 py-8 text-center border-b border-gray-200">
      <div class="flex justify-center items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-600 font-medium">Cargando horario del profesor...</span>
      </div>
    </div>

    <div class="overflow-x-auto" :class="{ 'overflow-y-auto': fitViewport }" :style="wrapperStyle">
      <table class="min-w-full table-fixed divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Período</th>
            <th v-for="d in days" :key="d.value"
              class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ d.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="p in classPeriods" :key="p.id" class="align-top">
            <td class="px-2 py-2 text-sm text-gray-600 w-44">
              <div class="font-medium text-gray-900">{{ p.label }}</div>
              <div class="text-xs">{{ formatTime12h(p.start_time) }} - {{ formatTime12h(p.end_time) }}</div>
            </td>
            <td v-for="d in days" :key="d.value" class="px-1 py-1">
              <div class="h-20 border rounded p-1 text-xs relative min-w-0"
                :class="entryAt(d.value, p.id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'">
                <template v-if="entryAt(d.value, p.id)">
                  <div class="h-full w-full min-w-0 flex flex-col justify-between">
                    <div class="font-semibold truncate text-blue-900"
                      :title="entryAt(d.value, p.id)?.assignment?.materia?.nombre">
                      {{ entryAt(d.value, p.id)?.assignment?.materia?.nombre }}
                    </div>
                    <div class="text-blue-700 truncate text-xs"
                      :title="aulaName(entryAt(d.value, p.id)?.assignment?.aula)">
                      {{ aulaName(entryAt(d.value, p.id)?.assignment?.aula) }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="w-full h-full flex items-center justify-center text-center px-1">
                    <span class="text-xs text-gray-400 leading-tight">Hora Pedagógica</span>
                  </div>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="!profesorId">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Selecciona un profesor para ver su
              horario</td>
          </tr>
          <tr v-else-if="!loading && teacherEntries.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Este profesor no tiene clases asignadas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen de asignaciones del profesor -->
    <div v-if="profesorId && profesorAssignments.length > 0" class="border-t border-gray-200 p-4 bg-gray-50">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Resumen de Asignaciones</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="assignment in profesorAssignments" :key="assignment.id" class="bg-white border rounded-lg p-3">
          <div class="font-medium text-sm text-gray-900 mb-1">
            {{ assignment.materia?.nombre }}
          </div>
          <div class="text-xs text-gray-600 mb-2">
            {{ aulaName(assignment.aula) }}
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600">Períodos:</span>
            <span class="font-medium" :class="getHoursColor(assignment)">
              {{ assignment.periodos_programados || 0 }}/{{ assignment.horas_semanales }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div class="h-1.5 rounded-full transition-all duration-300" :class="getProgressBarColor(assignment)"
              :style="{ width: getProgressPercentage(assignment) }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePeriodsStore } from '../../stores/periods'
import { useTimetableEntriesStore } from '../../stores/timetable_entries'
import { formatTime12h } from '../../utils/timeFormat'
import { useAuthStore } from '../../stores/auth'
import { useAniosLectivosStore } from '../../stores/anios_lectivos'

interface Profesor {
  id: number
  nombre: string
  apellido: string
  nombre_completo?: string
  cedula: string
  cargo_id: number
}

interface Aula {
  id: number
  grado_cardinal: number
  seccion: string
  titulo?: {
    nombre: string
  }
}

interface TimetableEntry {
  id: number
  assignment_id: number
  dia: number
  period_id: number
  assignment?: {
    id: number
    materia_id: number
    profesor_id: number
    aula_id: number
    anio_lectivo: string
    materia?: {
      nombre: string
      codigo: string
    }
    aula?: Aula
  }
}

// Props opcionales para ajustar el viewport
const props = defineProps<{
  fitViewport?: boolean
  viewportOffset?: number
}>()

const authStore = useAuthStore()
const periodsStore = usePeriodsStore()
const aniosStore = useAniosLectivosStore()
const entries = useTimetableEntriesStore()

const config = useRuntimeConfig()
const anioId = ref<number | undefined>(undefined)
const anios = computed(() => aniosStore.items)
const profesorId = ref<number | undefined>(undefined)
const profesores = ref<Profesor[]>([])
const loading = ref(false)
const loadingProfesores = ref(true)
const teacherEntries = ref<TimetableEntry[]>([])
const profesorAssignments = ref<any[]>([])

const days = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
]

const keyOf = (dia: number, periodId: number) => `${dia}-${periodId}`

onMounted(async () => {
  if (periodsStore.items.length === 0) await periodsStore.fetchAll()
  if (aniosStore.items.length === 0) await aniosStore.fetchAll()

  // Seleccionar el año activo por defecto si no hay uno seleccionado
  if (!anioId.value && aniosStore.items.length > 0) {
    const activo = aniosStore.items.find(a => a.activo)
    if (activo) anioId.value = activo.id
    else anioId.value = aniosStore.items[0]?.id
  }

  // Lógica para profesores
  if (authStore.isProfesor && authStore.user?.personal_id) {
    profesorId.value = authStore.user!.personal_id
    // No necesitamos cargar la lista de todos los profesores si solo vamos a ver uno
    loadingProfesores.value = false
  } else {
    // Solo cargar lista de profesores si es admin/master
    await loadProfesores()
  }
})

const loadProfesores = async () => {
  try {
    loadingProfesores.value = true
    // Use the dedicated professors endpoint
    const response = await api.get<{ success: boolean, data: Profesor[] }>('/api/profesores')

    if (response.data) {
      // Sort alphabetically by name (display name starts with Name)
      profesores.value = response.data.sort((a, b) => {
        return a.nombre.localeCompare(b.nombre)
      })
    }
  } catch (error) {
    console.error('Error cargando profesores:', error)
  } finally {
    loadingProfesores.value = false
  }
}

const loadTeacherSchedule = async () => {
  if (!profesorId.value || !anioId.value) {
    teacherEntries.value = []
    profesorAssignments.value = []
    return
  }

  try {
    loading.value = true

    // Cargar entradas del horario
    const entriesResponse = await api.get('/api/timetable-entries', {
      params: {
        profesor_id: profesorId.value,
        anio_lectivo_id: anioId.value,
        per_page: 1000
      }
    })

    if ((entriesResponse as any).data) {
      teacherEntries.value = (entriesResponse as any).data
    }

    // Cargar asignaciones del profesor
    const assignmentsResponse = await api.get('/api/class-assignments', {
      params: {
        profesor_id: profesorId.value,
        anio_lectivo_id: anioId.value,
        per_page: 1000
      }
    })

    if ((assignmentsResponse as any).data) {
      profesorAssignments.value = (assignmentsResponse as any).data
    }
  } catch (error) {
    console.error('Error cargando horario del profesor:', error)
    teacherEntries.value = []
    profesorAssignments.value = []
  } finally {
    loading.value = false
  }
}

watch([anioId, profesorId], async () => {
  await loadTeacherSchedule()
})

const classPeriods = computed(() => periodsStore.clases)

const entryMap = computed(() => {
  const map = new Map<string, TimetableEntry>()

  teacherEntries.value.forEach(entry => {
    const key = keyOf(entry.dia, entry.period_id)
    map.set(key, entry)
  })

  return map
})

const entryAt = (dia: number, periodId: number) => entryMap.value.get(keyOf(dia, periodId))

const profesorName = (p: Profesor) => {
  return p.nombre_completo || `${p.nombre} ${p.apellido}`
}

const aulaName = (aula?: Aula) => {
  if (!aula) return '—'

  const grado = aula.grado_cardinal ? `${aula.grado_cardinal}º` : ''
  const seccion = aula.seccion || ''
  return `${grado}${seccion}`.trim() || `Aula ${aula.id}`
}

const getHoursColor = (assignment: any) => {
  const programados = assignment.periodos_programados || 0
  const asignados = assignment.horas_semanales || 0

  if (programados === asignados) return 'text-green-600'
  if (programados > asignados) return 'text-red-600'
  return 'text-amber-600'
}

const getProgressBarColor = (assignment: any) => {
  const programados = assignment.periodos_programados || 0
  const asignados = assignment.horas_semanales || 0

  if (programados === asignados) return 'bg-green-500'
  if (programados > asignados) return 'bg-red-500'
  return 'bg-amber-500'
}

const getProgressPercentage = (assignment: any) => {
  const programados = assignment.periodos_programados || 0
  const asignados = assignment.horas_semanales || 1
  const percentage = Math.min((programados / asignados) * 100, 100)
  return `${percentage}%`
}

const reload = async () => {
  await loadTeacherSchedule()
}

// Calcula un alto máximo para el contenedor con scroll vertical cuando se desea ajustar al viewport
const wrapperStyle = computed(() => {
  if (!props.fitViewport) return {}
  const offset = typeof props.viewportOffset === 'number' ? props.viewportOffset : 260
  return { maxHeight: `calc(100vh - ${offset}px)` }
})
</script>