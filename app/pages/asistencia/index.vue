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
          <button @click="navigateTo('/asistencia/estadisticas')"
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
        <!-- Selector de asignación/aula -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ (authStore.isAdmin || authStore.isMaster) ? 'Aula' : 'Materia y Aula' }}
          </label>

          <!-- Para Administradores/Masters: Selector directo de Aulas -->
          <select v-if="authStore.isAdmin || authStore.isMaster" v-model="selectedAulaId"
            @change="selectedAssignmentId = null"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            :disabled="aulasStore.loading">
            <option :value="null">Seleccionar aula...</option>
            <option v-for="option in aulasStore.paraSelect" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <!-- Para Administradores/Masters: Selector de Clase/Asignatura del día -->
          <div v-if="(authStore.isAdmin || authStore.isMaster) && selectedAulaId" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Clase / Asignatura</label>
            <select v-model="selectedAssignmentId" @change="loadAttendance"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              :disabled="attendanceStore.loadingDailyClasses">
              <option :value="null">
                {{ attendanceStore.loadingDailyClasses ? 'Cargando horario...' : (attendanceStore.dailyClasses.length ?
                  'Seleccionar clase...' : 'No hay clases programadas hoy') }}
              </option>
              <option v-for="entry in attendanceStore.dailyClasses" :key="entry.id" :value="entry.assignment_id">
                {{ entry.period?.start_time?.slice(0, 5) }} - {{ entry.period?.end_time?.slice(0, 5) }} |
                {{ entry.assignment?.materia?.nombre }}
                <span v-if="entry.assignment?.profesor">({{ entry.assignment.profesor.nombres }} {{
                  entry.assignment.profesor.apellidos }})</span>
                <span v-if="entry.attendance_summary?.attendance_taken" class="ml-2 text-green-600 font-bold">✓</span>
              </option>
            </select>
          </div>

          <!-- Para Profesores: Selector de Asignaciones (Filtrado por día) -->
          <div v-else-if="!(authStore.isAdmin || authStore.isMaster)">
            <select v-model="selectedAssignmentId" @change="onAssignmentChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              :disabled="attendanceStore.loadingDailyClasses">
              <option :value="null">
                {{ attendanceStore.loadingDailyClasses ? 'Cargando horario...' : (attendanceStore.dailyClasses.length ?
                  'Seleccionar clase...' : 'No hay clases programadas hoy') }}
              </option>
              <option v-for="entry in attendanceStore.dailyClasses" :key="entry.id" :value="entry.assignment_id">
                {{ entry.period?.start_time?.slice(0, 5) }} - {{ entry.period?.end_time?.slice(0, 5) }} |
                {{ entry.assignment?.materia?.nombre }} - {{ entry.assignment?.aula?.grado_cardinal }}-{{
                  entry.assignment?.aula?.seccion }}
                <span v-if="entry.attendance_summary?.attendance_taken" class="ml-2 text-green-600 font-bold">✓</span>
              </option>
            </select>
          </div>
        </div>

        <!-- Botón para clase actual (Solo visible en horario escolar activo, si hay clases y es hoy) -->
        <div class="flex items-end" v-if="isInPeriod && attendanceStore.dailyClasses.length > 0 && isToday">
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

    <!-- Loading State -->
    <div v-if="attendanceStore.loading" class="bg-white shadow-sm rounded-lg p-12 flex justify-center items-center">
      <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <span class="text-gray-700 font-medium">Cargando lista de estudiantes...</span>
    </div>

    <!-- Componente de lista de asistencia -->
    <AttendanceGrid v-else-if="hasData && selectedDate && selectedAulaId && selectedAssignmentId" :fecha="selectedDate"
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
import { useAttendanceStore } from '~/stores/attendance'
import { useAulasStore } from '~/stores/aulas'
import { useAuthStore } from '~/stores/auth' // Import auth store
import { useLiveSchedule } from '~/composables/useLiveSchedule'
import AttendanceGrid from '~/components/attendance/AttendanceGrid.vue'
import { isWeekend } from '~/utils/dateValidation'
import Swal from 'sweetalert2'

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
const authStore = useAuthStore() // Initialize auth store

// Composable de horario en vivo
const { isInPeriod } = useLiveSchedule()

// Estado reactivo
const selectedDate = ref((() => {
  const d = new Date()
  const day = d.getDay()
  if (day === 6) d.setDate(d.getDate() - 1) // Sábado -> Viernes
  else if (day === 0) d.setDate(d.getDate() - 2) // Domingo -> Viernes
  return d.toLocaleDateString('en-CA')
})())
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

const isToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return selectedDate.value === today
})

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

    // Si se encontró una clase actual, usarla automáticamente
    if (attendanceStore.currentClass) {
      useCurrentClass()
    }
  } catch (error) {
    console.error('Error al cargar clase actual:', error)
  }
}

const useCurrentClass = () => {
  if (attendanceStore.currentClass) {
    // Buscar la asignación correspondiente en dailyClasses
    // Esto funciona porque `loadAttendance` usa la misma lista para llenar el select
    const currentAssignmentId = attendanceStore.currentClass?.assignment_id

    const entry = attendanceStore.dailyClasses.find(
      e => e.assignment_id === currentAssignmentId
    )

    if (entry && entry.assignment) {
      selectedAssignmentId.value = entry.assignment_id
      selectedAulaId.value = entry.assignment.aula_id
      loadAttendance()
    } else {
      // Fallback: si no está en dailyClasses (ej: horario cambió), intentar cargar solo con los IDs básicos
      if (currentAssignmentId) {
        selectedAssignmentId.value = currentAssignmentId
        selectedAulaId.value = attendanceStore.currentClass.aula_id
        loadAttendance()
      }
    }
  }
}

const onAssignmentChange = () => {
  if (selectedAssignmentId.value) {
    // Buscar la entrada en dailyClasses en lugar de teacherAssignments
    const entry = attendanceStore.dailyClasses.find(
      e => e.assignment_id === selectedAssignmentId.value
    )
    if (entry && entry.assignment) {
      selectedAulaId.value = entry.assignment.aula_id
      // Cargar lista automáticamente
      loadAttendance()
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
// Watchers
watch(selectedDate, (newDate, oldDate) => {
  if (newDate && isWeekend(newDate)) {
    Swal.fire({
      icon: 'warning',
      title: 'Fecha inválida',
      text: 'No se pueden seleccionar fines de semana porque no hay clases.',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    })
    selectedDate.value = oldDate || ''
    return
  }

  if (newDate) {
    attendanceStore.resetRecords()
    selectedAssignmentId.value = null

    // Si es admin/master, cargar el horario del día para el aula si está seleccionada
    if ((authStore.isAdmin || authStore.isMaster) && selectedAulaId.value) {
      attendanceStore.fetchDailyClasses({ aulaId: selectedAulaId.value, date: newDate })
    }
    // Si es profesor, cargar su horario del día
    else if (authStore.user?.personal_id) {
      attendanceStore.fetchDailyClasses({ professorId: authStore.user.personal_id, date: newDate })
    }
  }
})

watch(selectedAulaId, (newAulaId) => {
  // Solo reaccionar a cambios de aula si es Admin/Master (que seleccionan aula manualmente)
  // Para profesores, el cambio de aula es consecuencia del cambio de asignación, así que no reseteamos
  if (authStore.isAdmin || authStore.isMaster) {
    attendanceStore.resetRecords()
    selectedAssignmentId.value = null

    if (newAulaId && selectedDate.value) {
      attendanceStore.fetchDailyClasses({ aulaId: newAulaId, date: selectedDate.value })
    }
  } else {
    // Para profesores, solo reseteamos si el aula pasa a null (ej: limpieza manual)
    // Pero si tiene valor, es porque se seleccionó una asignación. No hacemos nada.
    if (!newAulaId) {
      attendanceStore.resetRecords()
    }
  }
})

// Lifecycle
onMounted(async () => {
  // Cargar asignaciones del profesor (ya no es prioritario, usamos fetchDailyClasses)
  // await attendanceStore.getTeacherAssignments() // Comentado o eliminado si ya no se usa

  // Si es profesor, cargar horario inicial
  if (!(authStore.isAdmin || authStore.isMaster) && authStore.user?.personal_id) {
    attendanceStore.fetchDailyClasses({ professorId: authStore.user.personal_id, date: selectedDate.value })
  }

  // Cargar aulas al montar el componente (para administradores)
  await aulasStore.fetchAll()

  // Intentar cargar la clase actual si estamos en periodo activo
  if (isInPeriod.value) {
    await loadCurrentClass()
  }
})
</script>
