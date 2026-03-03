<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <button @click="navigateTo('/asistencia')" class="mr-4 text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Asistencia Baja Mensual</h1>
            <p class="text-sm text-gray-600 mt-1">Identificar estudiantes con menos del 80% de asistencia.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y Opciones -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mes</label>
          <select v-model="selectedMonth"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Año</label>
          <select v-model="selectedYear"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
          <select v-model="selectedAula"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            :disabled="loadingAulas">
            <option :value="null">Todas las aulas</option>
            <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
              {{ aula.grado_cardinal }} - {{ aula.seccion }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura / Materia</label>
          <select v-model="selectedAssignment"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            :disabled="loadingAssignments || !selectedAula">
            <option :value="null">{{ selectedAula ? 'Todas las asignaturas' : 'Seleccione un aula primero' }}</option>
            <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
              {{ assignment.materia?.nombre || 'Materia Desconocida' }}
            </option>
          </select>
        </div>

        <div class="flex items-end flex-col sm:flex-row gap-2">
          <button @click="onFetchAlertsClick"
            :disabled="loading"
            class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-sm">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Consultar
          </button>

          <button v-if="alerts.length > 0" @click="printReport" :disabled="printing"
            class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
            <svg v-if="printing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div v-if="loading" class="p-12 flex justify-center items-center">
        <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-3 text-gray-600 font-medium">Buscando registros de asistencia baja...</span>
      </div>

      <div v-else-if="alerts.length === 0 && hasSearched" class="p-12 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay estudiantes con asistencia baja</h3>
        <p class="mt-1 text-sm text-gray-500">Todos los estudiantes registran más del 80% de asistencia en el período seleccionado.</p>
      </div>

      <div v-else-if="alerts.length > 0">
        <div class="overflow-x-auto max-h-[60vh] relative border-b border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50 text-red-800">% Asistencia</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días Totales</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider text-red-600">Ausencias</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider text-orange-600">Tardanzas</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider text-yellow-600">Excusas</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(alert, index) in alerts" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ alert.student_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ alert.aula_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ alert.course_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-center font-bold" :class="alert.percentage < 50 ? 'text-red-700 text-lg' : 'text-orange-600 text-md'">
                  {{ alert.percentage }}%
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                {{ alert.total_registered }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                  {{ alert.counters.A }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  {{ alert.counters.T }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                  {{ alert.counters.E }}
                </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
        <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between" v-if="pagination.last_page > 1">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Anterior
            </button>
            <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando del <span class="font-medium">{{ pagination.from || 0 }}</span> al <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Página {{ pagination.current_page }} de {{ pagination.last_page }}
                </span>
                <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { api } from '~/utils/api'
import { usePrint } from '~/composables/usePrint'

// Título de la página
useHead({
  title: 'Alertas de Asistencia - EscoSoft'
})

// Layout
definePageMeta({
  layout: 'default',
  middleware: ['auth'] // Se asume que roles (admin/master) se manejan dentro si es estricto
})

const authStore = useAuthStore()
const { $api } = useNuxtApp()

// Opciones de selects
const months = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

// Estado Reactivo
const selectedMonth = ref(new Date().getMonth() === 0 ? 12 : new Date().getMonth()) // Por defecto el mes anterior
const selectedYear = ref(new Date().getMonth() === 0 ? currentYear - 1 : currentYear)
const selectedAula = ref<number | null>(null)
const selectedAssignment = ref<number | null>(null)

const loading = ref(false)
const loadingAulas = ref(false)
const loadingAssignments = ref(false)
const hasSearched = ref(false)
const alerts = ref<any[]>([])
const aulas = ref<any[]>([])
const assignments = ref<any[]>([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
})

const { printPdfBlob } = usePrint()
const printing = ref(false)

// Protección en cliente
onMounted(async () => {
  if (!authStore.isAdmin && !authStore.isMaster) {
    Swal.fire('Acceso Denegado', 'Solo administradores pueden ver esta sección.', 'error')
    navigateTo('/asistencia')
    return
  }
  
  await fetchAulas()
})

// Obtener listado de aulas
const fetchAulas = async () => {
  loadingAulas.value = true
  try {
    const data = await $api.get('/api/aulas')
    if (data) {
       aulas.value = Array.isArray(data) ? data : (data.data || [])
    }
  } catch (error) {
    console.error('Error fetching aulas:', error)
  } finally {
    loadingAulas.value = false
  }
}

// Obtener asignaturas del aula
const fetchAssignments = async () => {
  if (!selectedAula.value) {
    assignments.value = []
    return
  }
  
  loadingAssignments.value = true
  try {
    const data = await $api.get('/api/class-assignments', {
      params: { aula_id: selectedAula.value }
    })
    
    if (data) {
       let arr = Array.isArray(data) ? data : (data.data || [])
       arr.sort((a: any, b: any) => {
         const nameA = a.materia?.nombre?.toLowerCase() || ''
         const nameB = b.materia?.nombre?.toLowerCase() || ''
         return nameA.localeCompare(nameB)
       })
       assignments.value = arr
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
  } finally {
    loadingAssignments.value = false
  }
}

watch(selectedAula, () => {
  selectedAssignment.value = null
  fetchAssignments()
})

// Acciones
const fetchAlerts = async (page = 1) => {
  if (!selectedMonth.value || !selectedYear.value) return

  loading.value = true
  hasSearched.value = true
  alerts.value = []

  try {
    const params: any = {
      month: selectedMonth.value,
      year: selectedYear.value,
      page: page,
      per_page: 25
    }
    
    if (selectedAula.value) {
      params.aula_id = selectedAula.value
    }
    
    if (selectedAssignment.value) {
      params.assignment_id = selectedAssignment.value
    }

    const data = await $api.get('/api/attendance/monthly-alerts', {
      params: params
    })

    if (data && data.success) {
      alerts.value = data.alerts.data
      pagination.value = {
        current_page: data.alerts.current_page,
        last_page: data.alerts.last_page,
        total: data.alerts.total,
        from: data.alerts.from,
        to: data.alerts.to
      }
    }
  } catch (error: any) {
    console.error('Error fetching alerts:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error de Conexión',
      text: error.response?.data?.message || 'No se pudieron recuperar las alertas. Por favor verifica tu conexión.',
    })
  } finally {
    loading.value = false
  }
}

const onFetchAlertsClick = () => {
  fetchAlerts(1)
}

const changePage = (newPage: number) => {
  if (newPage > 0 && newPage <= pagination.value.last_page) {
    fetchAlerts(newPage)
  }
}

const printReport = async () => {
  if (!selectedMonth.value || !selectedYear.value) return

  printing.value = true
  try {
    const params: any = {
      month: selectedMonth.value,
      year: selectedYear.value
    }
    
    if (selectedAula.value) {
      params.aula_id = selectedAula.value
    }
    
    if (selectedAssignment.value) {
      params.assignment_id = selectedAssignment.value
    }

    const blob = await api.getBlob('/api/attendance/monthly-alerts/pdf', {
      params: params
    })
    
    // Generar nombre descriptivo
    const monthLabel = months.find(m => m.value === selectedMonth.value)?.label || selectedMonth.value
    const fileName = `asistencia_baja_${monthLabel}_${selectedYear.value}.pdf`
    
    printPdfBlob(blob, fileName, 'Preparando reporte PDF...')
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error de Impresión',
      text: 'No se pudo generar el documento PDF. Por favor verifica tu conexión.',
    })
  } finally {
    printing.value = false
  }
}
</script>
