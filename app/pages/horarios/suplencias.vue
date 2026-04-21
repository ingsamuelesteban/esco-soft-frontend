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
    <!-- Filtros y Tabs -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
      <div class="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg w-full md:w-auto">
        <button @click="activeTab = 'confirmed'" 
          class="flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all"
          :class="activeTab === 'confirmed' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'">
          Confirmadas
        </button>
        <button @click="activeTab = 'drafts'" 
          class="flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all relative"
          :class="activeTab === 'drafts' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'">
          Borradores
          <span v-if="drafts.length > 0" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {{ drafts.length }}
          </span>
        </button>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <input v-model="selectedDate" type="date" @change="fetchAll"
          class="flex-1 md:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <button @click="fetchAll" :disabled="loading"
          class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <svg class="h-5 w-5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      <!-- Vista de Confirmadas -->
      <div v-if="activeTab === 'confirmed'" class="p-0">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-500 animate-pulse">Cargando suplencias...</span>
          </div>
        </div>

        <div v-else-if="substitutions.length === 0" class="text-center py-20 px-6">
          <div class="max-w-md mx-auto">
            <div class="mx-auto h-20 w-20 bg-gray-100 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Sin suplencias confirmadas</h3>
            <p class="text-gray-500 dark:text-gray-400">No se encontraron registros finalizados para el {{ formatDate(selectedDate) }}.</p>
            <button @click="showSubstitutionModal = true" class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-md active:scale-95">
              Crear Nueva Propuesta
            </button>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 shadow-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50">

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

      <!-- Vista de Borradores -->
      <div v-if="activeTab === 'drafts'" class="p-6">
        <div v-if="loading" class="flex justify-center py-12">
           <!-- Mismo loader -->
        </div>

        <div v-else-if="drafts.length === 0" class="text-center py-12">
          <div class="max-w-xs mx-auto text-center">
            <div class="bg-amber-50 dark:bg-amber-900/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Sin borradores pendientes</h3>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Todas las propuestas de hoy han sido confirmadas.</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="draft in drafts" :key="draft.batch_id" 
            class="group bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
            <div class="p-5 flex-1">
              <div class="flex items-center justify-between mb-3">
                <div class="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                  {{ draft.count }} Suplencias
                </div>
                <div class="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  Hace poco
                </div>
              </div>
              
              <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">Borrador: {{ draft.batch_id }}</h4>
              
              <div class="space-y-1.5 mb-4">
                <div class="text-[11px] text-gray-500 font-semibold uppercase tracking-tighter">Docentes Ausentes:</div>
                <div class="flex flex-wrap gap-1">
                  <span v-for="t in draft.teachers" :key="t" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-[10px] text-gray-600 dark:text-gray-300">
                    {{ t }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900/30 p-3 flex items-center justify-between border-t dark:border-gray-700">
              <button @click="editDraft(draft.batch_id)" 
                class="flex-1 mr-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors active:scale-95 flex items-center justify-center gap-1.5">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Continuar
              </button>
              <button @click="deleteDraft(draft.batch_id)" 
                class="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Descartar borrador">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Creación de Suplencias -->
    <TimetableSubstitutionModal 
      v-model="showSubstitutionModal" 
      :profesores-list="profesores"
      :edit-batch-id="selectedBatchId"
      @saved="onSubstitutionsSaved"
      @closed="selectedBatchId = null"
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
const drafts = ref<any[]>([])
const loading = ref(false)
const activeTab = ref<'confirmed' | 'drafts'>('confirmed')
const selectedBatchId = ref<string | null>(null)

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

const fetchAll = async () => {
  loading.value = true
  await Promise.all([
    fetchSubstitutions(),
    fetchDrafts()
  ])
  loading.value = false
}

const fetchSubstitutions = async () => {
  try {
    const response = await api.get('/api/substitutions', {
      params: { date: selectedDate.value, status: 'confirmed' }
    })
    
    if (response.success) {
      substitutions.value = response.data
    }
  } catch (error) {
    console.error('Error fetching substitutions:', error)
  }
}

const fetchDrafts = async () => {
  try {
    const response = await api.get('/api/substitutions', {
      params: { date: selectedDate.value, status: 'draft', summary: true }
    })
    
    if (response.success) {
      drafts.value = response.data
    }
  } catch (error) {
    console.error('Error fetching drafts:', error)
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

const editDraft = (batchId: string) => {
  selectedBatchId.value = batchId
  showSubstitutionModal.value = true
}

const deleteDraft = async (batchId: string) => {
  const result = await Swal.fire({
    title: '¿Descartar borrador?',
    text: 'Se eliminarán todas las propuestas guardadas en este lote.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, descartar'
  })

  if (result.isConfirmed) {
    try {
      // Eliminar por batch_id - tendríamos que implementar un destroyBatch en el backend
      // o simplemente iterar. Para simplicidad, usemos el batch_id si implementamos el endpoint.
      // Por ahora, el controlador tiene destroy($id). Implementaré destroyBatch.
      const response = await api.delete(`/api/substitutions/batch/${batchId}`)
      if (response.success) {
        Swal.fire('Descartado', 'El borrador ha sido eliminado.', 'success')
        fetchDrafts()
      }
    } catch (error) {
       // Fallback si no hay destroyBatch
       Swal.fire('Error', 'No se pudo eliminar el borrador.', 'error')
    }
  }
}

const onSubstitutionsSaved = () => {
  fetchAll()
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
  fetchAll()
  loadProfesores()
})
</script>

<style>
@media print {
  body { display: none; }
}
</style>
