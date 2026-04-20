<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 print:hidden">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Control de Suplencias</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Registro histórico de ausencias cubiertas</p>
        </div>
        <div class="flex items-center space-x-3">
          <button v-if="authStore.isAdmin || authStore.isMaster" @click="showSubstitutionModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Cubrir Ausentes
          </button>
          <button @click="printReport"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Reporte
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 print:hidden">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
          <input v-model="selectedDate" type="date" @change="fetchSubstitutions"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <button @click="fetchSubstitutions" :disabled="loading"
            class="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors">
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="p-6">
        <div v-if="loading" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="substitutions.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">No se encontraron suplencias para la fecha seleccionada.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900/50">
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora / Periodo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clase / Materia</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aula</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Docente Ausente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suplente Asignado</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="sub in substitutions" :key="sub.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ sub.period?.label }}</div>
                  <div class="text-xs text-gray-500">{{ sub.period?.start_time.slice(0, 5) }} - {{ sub.period?.end_time.slice(0, 5) }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100">{{ sub.materia?.nombre }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ sub.aula?.grado_cardinal }}° {{ sub.aula?.seccion }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-red-600 dark:text-red-400 font-medium break-words leading-tight">{{ sub.original_profesor?.nombre }} {{ sub.original_profesor?.apellido }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400">
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3 text-sm font-medium text-green-600 dark:text-green-400 break-words leading-tight">
                      {{ sub.substitute_profesor?.nombre }} {{ sub.substitute_profesor?.apellido }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="deleteSubstitution(sub.id)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Eliminar registro">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Creación de Suplencias -->
    <TimetableSubstitutionModal 
      v-model="showSubstitutionModal" 
      :profesores-list="profesores"
      @saved="onSubstitutionsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { usePrint } from '../../composables/usePrint'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

useHead({
  title: 'Control de Suplencias - EscoSoft'
})

const authStore = useAuthStore()
const { printPdfBlob, loading: printing } = usePrint()
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const substitutions = ref<any[]>([])
const loading = ref(false)

const tenantName = computed(() => {
  return authStore.tenant?.name || 'EscoSoft'
})

const tenantLogo = computed(() => {
  if (!authStore.tenant?.logo_url) return null
  if (authStore.tenant.logo_url.startsWith('http')) return authStore.tenant.logo_url

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  const path = authStore.tenant.logo_url.startsWith('/') ? authStore.tenant.logo_url : `/${authStore.tenant.logo_url}`
  return `${baseUrl}${path}`
})

// Estado para el modal de creación
const showSubstitutionModal = ref(false)
const profesores = ref<any[]>([])

const fetchSubstitutions = async () => {
  try {
    loading.value = true
    const response = await api.get('/api/substitutions', {
      params: { date: selectedDate.value }
    })
    
    if (response.success) {
      substitutions.value = response.data
    }
  } catch (error) {
    console.error('Error fetching substitutions:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar las suplencias.'
    })
  } finally {
    loading.value = false
  }
}

const loadProfesores = async () => {
  try {
    const response = await api.get<{ success: boolean, data: any[] }>('/api/profesores')
    if (response.data) {
      profesores.value = response.data.sort((a, b) => a.nombre.localeCompare(b.nombre))
    }
  } catch (error) {
    console.error('Error cargando profesores:', error)
  }
}

const deleteSubstitution = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Eliminar suplencia?',
    text: 'Esta acción revertirá la asignación y el profesor original volverá a aparecer como ausente en el horario.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      const response = await api.delete(`/api/substitutions/${id}`)
      if (response.success) {
        Swal.fire('Eliminado', 'La suplencia ha sido eliminada.', 'success')
        fetchSubstitutions()
      }
    } catch (error) {
      console.error('Error deleting substitution:', error)
      Swal.fire('Error', 'No se pudo eliminar la suplencia.', 'error')
    }
  }
}

const onSubstitutionsSaved = () => {
  fetchSubstitutions()
}

const printReport = async () => {
  try {
    loading.value = true
    const response = await api.getBlob(`/api/substitutions/reporte/${selectedDate.value}`)
    const filename = `reporte_suplencias_${selectedDate.value}.pdf`
    printPdfBlob(response, filename, 'Generando reporte de suplencias...')
  } catch (error) {
    console.error('Error generando reporte:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el reporte PDF.'
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('dddd, D [de] MMMM [de] YYYY')
}

onMounted(() => {
  fetchSubstitutions()
  loadProfesores()
})
</script>

<style>
@media print {
  body { display: none; }
}
</style>
