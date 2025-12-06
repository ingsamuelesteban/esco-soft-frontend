<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
          <p class="text-sm text-gray-600 mt-1">Registro diario de asistencia de estudiantes</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Botón de estadísticas -->
          <button @click="showStatistics = !showStatistics"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estadísticas
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Selector de fecha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input v-model="selectedDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>

        <!-- Selector de asignación/aula -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Materia y Aula</label>
          <select v-model="selectedAssignmentId" @change="onAssignmentChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            :disabled="attendanceStore.loadingAssignments">
            <option value="">{{ assignmentSelectLabel }}</option>
            <option v-for="assignment in attendanceStore.teacherAssignments" :key="assignment.id"
              :value="assignment.id">
              {{ assignment.materia }} - {{ assignment.aula_nombre }}
            </option>
          </select>
        </div>

        <!-- Botón para clase actual (Solo visible en horario escolar activo) -->
        <div class="flex items-end" v-if="isInPeriod">
          <button @click="loadCurrentClass" :disabled="attendanceStore.loadingCurrentClass"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            <svg v-if="attendanceStore.loadingCurrentClass" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Clase Actual
          </button>
        </div>

        <!-- Botón de cargar -->
        <div class="flex items-end">
          <button @click="loadAttendance" :disabled="!selectedDate || !selectedAulaId || attendanceStore.loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="attendanceStore.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ attendanceStore.loading ? 'Cargando...' : 'Cargar Lista' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alerta de clase actual -->
    <div v-if="attendanceStore.currentClass" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800">Clase Activa</h3>
          <p class="text-sm text-green-700 mt-1">
            <span class="font-medium">{{ attendanceStore.currentClass.materia }}</span> en
            <span class="font-medium">{{ attendanceStore.currentClass.aula_nombre }}</span>
            ({{ attendanceStore.currentClass.period }}: {{ attendanceStore.currentClass.hora_inicio }} - {{
              attendanceStore.currentClass.hora_fin }})
          </p>
        </div>
        <button @click="useCurrentClass"
          class="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
          Usar Esta Clase
        </button>
      </div>
    </div>

    <!-- Panel de estadísticas -->
    <div v-if="showStatistics && hasData"
      class="bg-white shadow-sm rounded-lg p-6 sticky top-20 z-30 transition-all duration-300 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen del Día</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ attendanceStore.totalStudents }}</div>
          <div class="text-sm text-gray-600">Total</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ attendanceStore.presentCount }}</div>
          <div class="text-sm text-gray-600">Presentes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ attendanceStore.absentCount }}</div>
          <div class="text-sm text-gray-600">Ausentes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ attendanceStore.excusedCount }}</div>
          <div class="text-sm text-gray-600">Excusas</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ attendanceStore.lateCount }}</div>
          <div class="text-sm text-gray-600">Tardanzas</div>
        </div>
      </div>

      <!-- Porcentaje de asistencia -->
      <div class="mt-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Porcentaje de Asistencia</span>
          <span>{{ attendancePercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${attendancePercentage}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Componente de lista de asistencia -->
    <AttendanceGrid v-if="hasData && selectedDate && selectedAulaId && selectedAssignmentId" :fecha="selectedDate"
      :aula-id="selectedAulaId" :aula-name="selectedAulaName" :assignment-id="selectedAssignmentId" />

    <!-- Estado inicial -->
    <div v-else-if="!attendanceStore.loading" class="bg-white shadow-sm rounded-lg p-12 text-center">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Selecciona una fecha y aula</h3>
      <p class="text-gray-600">Para comenzar a tomar asistencia, selecciona la fecha y el aula correspondiente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAttendanceStore } from '../stores/attendance'
import { useAulasStore } from '../stores/aulas'
import { useLiveSchedule } from '../composables/useLiveSchedule'
import AttendanceGrid from '../components/attendance/AttendanceGrid.vue'

// Título de la página
useHead({
  title: 'Control de Asistencia - EscoSoft'
})

// Definir layout
definePageMeta({
  layout: 'default'
})

// Stores
const attendanceStore = useAttendanceStore()
const aulasStore = useAulasStore()

// Composable de horario en vivo
const { isInPeriod } = useLiveSchedule()

// Estado reactivo
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedAulaId = ref<number | null>(null)
const selectedAssignmentId = ref<number | null>(null)
const showStatistics = ref(true)

// Computed properties
const hasData = computed(() =>
  selectedDate.value &&
  selectedAulaId.value &&
  attendanceStore.records.length > 0
)

const selectedAulaName = computed(() => {
  if (!selectedAulaId.value) return ''
  const aula = aulasStore.items.find((a: any) => a.id === selectedAulaId.value)
  return aula ? aulaName(aula) : ''
})

const attendancePercentage = computed(() => {
  const total = attendanceStore.totalStudents
  if (total === 0) return 0
  return Math.round((attendanceStore.presentCount / total) * 100)
})

const assignmentSelectLabel = computed(() =>
  attendanceStore.loadingAssignments
    ? 'Cargando asignaciones...'
    : 'Seleccionar materia y aula'
)

// Métodos
const loadAttendance = async () => {
  if (!selectedDate.value || !selectedAulaId.value) return

  await attendanceStore.fetchAttendance(
    selectedDate.value,
    selectedAulaId.value,
    selectedAssignmentId.value ?? 0 // Siempre pasar un número
  )
}

const loadCurrentClass = async () => {
  try {
    await attendanceStore.getCurrentClass()
  } catch (error) {
    console.error('Error al cargar clase actual:', error)
  }
}

const useCurrentClass = () => {
  if (attendanceStore.currentClass) {
    // Buscar la asignación correspondiente
    const assignment = attendanceStore.teacherAssignments.find(
      a => a.id === attendanceStore.currentClass?.assignment_id
    )

    if (assignment) {
      selectedAssignmentId.value = assignment.id
      selectedAulaId.value = assignment.aula_id
      loadAttendance()
    }
  }
}

const onAssignmentChange = () => {
  if (selectedAssignmentId.value) {
    const assignment = attendanceStore.teacherAssignments.find(
      a => a.id === selectedAssignmentId.value
    )
    if (assignment) {
      selectedAulaId.value = assignment.aula_id
    }
  } else {
    selectedAulaId.value = null
  }
}

const aulaName = (aula: any) => {
  const grado = aula.grado_cardinal ? `${aula.grado_cardinal}º` : ''
  const seccion = aula.seccion || ''
  const titulo = aula.titulo?.nombre ? ` - ${aula.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${aula.id}`
}

// Watchers
watch([selectedDate, selectedAulaId], ([newDate, newAulaId]) => {
  // Limpiar registros cuando cambien los filtros
  if (newDate && newAulaId) {
    attendanceStore.resetRecords()
  }
})

// Lifecycle
onMounted(async () => {
  // Cargar asignaciones del profesor
  await attendanceStore.getTeacherAssignments()

  // Cargar aulas al montar el componente (para administradores)
  if (aulasStore.items.length === 0) {
    await aulasStore.fetchAll()
  }

  // Intentar cargar la clase actual si estamos en periodo activo
  if (isInPeriod.value) {
    await loadCurrentClass()
  }
})
</script>
