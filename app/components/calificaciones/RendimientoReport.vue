<template>
  <div class="space-y-6">
    <!-- Filtros y Descarga General -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Reporte de Rendimiento</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">Estadísticas de estudiantes aprobados y aplazados</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Selector de Año Lectivo -->
          <div class="relative min-w-[200px]">
            <select v-model="selectedYearId" @change="fetchData" :disabled="loadingYears"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed transition-colors duration-300">
              <option value="" disabled>{{ loadingYears ? 'Cargando años...' : 'Seleccionar año...' }}</option>
              <option v-for="year in years" :key="year.id" :value="year.id">
                Año Lectivo: {{ year.nombre }} {{ year.activo ? '(Activo)' : '' }}
              </option>
            </select>
          </div>

          <!-- Botón PDF General -->
          <button @click="downloadGeneralPDF" :disabled="loadingData || !selectedYearId"
            class="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF General
          </button>
        </div>
      </div>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="loadingData" class="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-h-[300px] transition-colors duration-300">
      <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z"></path>
      </svg>
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Procesando y calculando calificaciones...</span>
    </div>

    <div v-else class="space-y-6">
      <!-- Tarjetas de Resumen Global -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <!-- Total Estudiantes -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white transform hover:scale-[1.01] transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Estudiantes</p>
              <h3 class="text-3xl font-extrabold mt-1">{{ stats.total }}</h3>
            </div>
            <div class="p-3 bg-white/10 rounded-lg backdrop-blur-md">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 text-xs text-blue-100">
            Estudiantes activos en el año lectivo
          </div>
        </div>

        <!-- Aprobados -->
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-6 text-white transform hover:scale-[1.01] transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Aprobados</p>
              <h3 class="text-3xl font-extrabold mt-1">{{ stats.aprobados }}</h3>
            </div>
            <div class="p-3 bg-white/10 rounded-lg backdrop-blur-md">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-xs text-emerald-100">Pasaron todas las materias</span>
            <span class="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">{{ stats.aprobadosPorcentaje }}%</span>
          </div>
        </div>

        <!-- Aplazados -->
        <div class="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-md p-6 text-white transform hover:scale-[1.01] transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-rose-100 uppercase tracking-wider">Aplazados / Por Definir</p>
              <h3 class="text-3xl font-extrabold mt-1">{{ stats.aplazados }}</h3>
            </div>
            <div class="p-3 bg-white/10 rounded-lg backdrop-blur-md">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-xs text-rose-100">Tienen materias pendientes o reprobadas</span>
            <span class="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">{{ stats.aplazadosPorcentaje }}%</span>
          </div>
        </div>
      </div>

      <!-- Grid de Aulas (Responsive Layout) -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Desglose por Aulas</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">Total aulas: {{ aulasCalculadas.length }}</span>
        </div>

        <div v-if="aulasCalculadas.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          No se encontraron aulas configuradas con estudiantes asignados para este año lectivo.
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="aula in aulasCalculadas" :key="aula.id" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-300">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <!-- Info del Aula -->
              <div class="space-y-1 flex-1">
                <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span class="px-2.5 py-1 text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md transition-colors duration-300">
                    {{ aula.grado_cardinal }}° {{ aula.seccion }}
                  </span>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {{ aula.titulo?.nombre || 'General' }}
                  </span>
                </div>
                <p v-if="aula.dueno" class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Profesor Guía: {{ aula.dueno.nombre_completo }}
                </p>
              </div>

              <!-- Estadísticas del Aula -->
              <div class="flex flex-wrap items-center gap-6 lg:justify-end text-sm">
                <!-- Estudiantes totales -->
                <div class="text-center min-w-[70px]">
                  <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Estudiantes</span>
                  <span class="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">{{ aula.total }}</span>
                </div>

                <!-- Aprobados -->
                <div class="text-center min-w-[70px]">
                  <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Aprobados</span>
                  <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-300">{{ aula.aprobados }}</span>
                </div>

                <!-- Aplazados -->
                <div class="text-center min-w-[70px]">
                  <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Aplazados</span>
                  <span class="text-lg font-bold transition-colors duration-300" :class="aula.aplazados > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'">
                    {{ aula.aplazados }}
                  </span>
                </div>

                <!-- Barra de Rendimiento Visual -->
                <div class="w-32 lg:w-40 flex flex-col space-y-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-medium text-right transition-colors duration-300">{{ aula.aprobadosPorcentaje }}% Aprobación</span>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden flex transition-colors duration-300">
                    <div class="bg-emerald-500 h-full" :style="{ width: `${aula.aprobadosPorcentaje}%` }" title="Aprobados"></div>
                    <div class="bg-rose-500 h-full" :style="{ width: `${aula.aplazadosPorcentaje}%` }" title="Aplazados"></div>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button @click="verDetalleAula(aula)" :disabled="aula.aplazados === 0"
                    class="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300">
                    Ver Aplazados
                  </button>
                  <button @click="downloadClassroomPDF(aula.id, aula.grado_cardinal, aula.seccion)"
                    class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-300"
                    title="Descargar PDF de esta sección">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Aplazados del Aula -->
    <Transition name="fade">
      <div v-if="showDetailModal && selectedAula" class="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[85vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between transition-colors duration-300">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
                Estudiantes Aplazados - {{ selectedAula.grado_cardinal }}° {{ selectedAula.seccion }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ selectedAula.titulo?.nombre || 'General' }} | {{ selectedAula.aplazados }} estudiantes con pendientes
              </p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg p-1 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            <div v-for="row in selectedAula.aplazadosList" :key="row.estudiante.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30 transition-colors duration-300">
              <div class="flex items-center space-x-3 mb-3">
                <div class="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-sm transition-colors duration-300">
                  {{ row.estudiante.numero_orden || '?' }}
                </div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {{ row.estudiante.apellidos }}, {{ row.estudiante.nombres }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    RNE: {{ row.estudiante.rne }}
                  </p>
                </div>
              </div>

              <!-- Listado de materias reprobadas -->
              <div class="pl-11 space-y-2 border-l-2 border-rose-200 dark:border-rose-900/40">
                <div v-for="(subj, idx) in row.failed_subjects" :key="idx" class="flex items-center justify-between text-xs py-1">
                  <div class="space-y-0.5">
                    <span class="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">{{ subj.materia }}</span>
                    <span class="block text-[10px] text-gray-400 uppercase font-semibold">{{ subj.tipo }}</span>
                  </div>
                  <span class="px-2 py-0.5 font-bold rounded transition-colors duration-300" :class="subj.final === 'Por Definir' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'">
                    {{ subj.final }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 transition-colors duration-300">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none">
              Cerrar
            </button>
            <button @click="downloadClassroomPDF(selectedAula.id, selectedAula.grado_cardinal, selectedAula.seccion)"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 focus:outline-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

// Estado
const loadingYears = ref(false)
const loadingData = ref(false)
const years = ref([])
const selectedYearId = ref('')

const rawAulas = ref([])
const reportDataMap = ref({}) // mapping: classroomId => list of postponed students

// Modal
const showDetailModal = ref(false)
const selectedAula = ref(null)

// Stats Globales
const stats = computed(() => {
  let total = 0
  let aplazados = 0

  aulasCalculadas.value.forEach(aula => {
    total += aula.total
    aplazados += aula.aplazados
  })

  const aprobados = total - aplazados
  const aprobadosPorcentaje = total > 0 ? Math.round((aprobados / total) * 100) : 0
  const aplazadosPorcentaje = total > 0 ? Math.round((aplazados / total) * 100) : 0

  return {
    total,
    aprobados,
    aplazados,
    aprobadosPorcentaje,
    aplazadosPorcentaje
  }
})

// Aulas procesadas con combinatoria de APIs
const aulasCalculadas = computed(() => {
  return rawAulas.value.map(aula => {
    const totalEstudiantes = aula.estudiantes_count || 0
    const reportItem = reportDataMap.value[aula.id] || null
    const aplazados = reportItem ? reportItem.data.length : 0
    const aprobados = totalEstudiantes - aplazados
    const aprobadosPorcentaje = totalEstudiantes > 0 ? Math.round((aprobados / totalEstudiantes) * 100) : 100
    const aplazadosPorcentaje = totalEstudiantes > 0 ? Math.round((aplazados / totalEstudiantes) * 100) : 0

    return {
      ...aula,
      total: totalEstudiantes,
      aprobados,
      aplazados,
      aprobadosPorcentaje,
      aplazadosPorcentaje,
      aplazadosList: reportItem ? reportItem.data : []
    }
  }).filter(aula => aula.total > 0) // Filtrar aulas vacías para el año lectivo
})

// Cargar Años Lectivos
const loadYears = async () => {
  loadingYears.value = true
  try {
    const response = await api.get('/api/anios-lectivos')
    years.value = response || []

    // Encontrar año activo por defecto
    const active = years.value.find(y => y.activo)
    if (active) {
      selectedYearId.value = active.id
    } else if (years.value.length > 0) {
      selectedYearId.value = years.value[0].id
    }
  } catch (error) {
    console.error('Error al cargar años lectivos:', error)
  } finally {
    loadingYears.value = false
  }
}

// Cargar Datos de Aulas y Aplazados
const fetchData = async () => {
  if (!selectedYearId.value) return

  loadingData.value = true
  try {
    // 1. Obtener todas las aulas con sus overrides y estudiantes_count para el año seleccionado
    const aulasResponse = await api.get(`/api/aulas?anio_lectivo_id=${selectedYearId.value}`)
    rawAulas.value = aulasResponse || []

    // 2. Obtener reporte general de aplazados en JSON para el año seleccionado
    const reportResponse = await api.get(`/api/reports/grades/aplazados?aula_id=all&format=json&year_id=${selectedYearId.value}`)
    const reports = reportResponse?.reports || []

    // Mapear por ID de aula para acceso directo O(1)
    const map = {}
    reports.forEach(report => {
      if (report && report.aula) {
        map[report.aula.id] = report
      }
    })
    reportDataMap.value = map

  } catch (error) {
    console.error('Error al cargar reporte de rendimiento:', error)
    rawAulas.value = []
    reportDataMap.value = {}
  } finally {
    loadingData.value = false
  }
}

// PDF Descarga
const downloadGeneralPDF = () => {
  if (!selectedYearId.value) return
  const token = localStorage.getItem('auth_token') || ''
  const url = `${api.defaults?.baseURL || ''}/api/reports/grades/aplazados?aula_id=all&year_id=${selectedYearId.value}&token=${token}`
  window.open(url, '_blank')
}

const downloadClassroomPDF = (aulaId, grado, seccion) => {
  if (!selectedYearId.value) return
  const token = localStorage.getItem('auth_token') || ''
  const url = `${api.defaults?.baseURL || ''}/api/reports/grades/aplazados?aula_id=${aulaId}&year_id=${selectedYearId.value}&token=${token}`
  window.open(url, '_blank')
}

// Detalle Modal
const verDetalleAula = (aula) => {
  selectedAula.value = aula
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
  selectedAula.value = null
}

// Montaje
onMounted(async () => {
  await loadYears()
  await fetchData()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
