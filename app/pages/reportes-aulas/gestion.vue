<template>
  <div>
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Incidencias de Aulas</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Revisa, acepta y da seguimiento a los reportes enviados por los profesores.</p>
        </div>
      </div>
    </header>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" :class="[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">{{ toast.message }}</div>
    </transition>

    <div class="p-6">
      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
        <button v-for="tab in tabs" :key="tab.value"
          @click="activeTab = tab.value; fetchReports()"
          :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === tab.value
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300']">
          {{ tab.label }}
          <span v-if="tab.value === 'nuevos' && newCount > 0"
            class="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
            {{ newCount }}
          </span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-5">
        <select v-model="filters.categoria" @change="fetchReports()"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500">
          <option value="">Todas las categorías</option>
          <option value="mobiliario">Mobiliario</option>
          <option value="equipo">Equipo</option>
          <option value="infraestructura">Infraestructura</option>
          <option value="limpieza">Limpieza</option>
          <option value="otro">Otro</option>
        </select>
        <select v-model="filters.prioridad" @change="fetchReports()"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500">
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="reports.length === 0" class="text-center py-16">
        <div class="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Sin reportes en esta categoría</h3>
      </div>

      <!-- Tabla de reportes -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporte</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aula / Profesor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridad</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="r in reports" :key="r.id" class="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
              <td class="px-4 py-3">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ r.titulo }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ categoriaLabels[r.categoria] }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                <p>{{ r.aula ? `${r.aula.grado_cardinal}° ${r.aula.seccion}` : '—' }}</p>
                <p class="text-xs text-gray-400">{{ r.reported_by?.name }}</p>
              </td>
              <td class="px-4 py-3">
                <span :class="prioridadClasses[r.prioridad]"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ prioridadLabels[r.prioridad] }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span :class="estadoClasses[r.estado]"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ estadoLabels[r.estado] }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400">{{ formatDate(r.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- Botón Aceptar (solo en tab nuevos) -->
                  <button v-if="activeTab === 'nuevos'"
                    @click="acceptReport(r)"
                    :disabled="accepting === r.id"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors">
                    <svg v-if="accepting === r.id" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Aceptar
                  </button>
                  <!-- Ver detalles -->
                  <button @click="openDetail(r)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    Ver
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Detalle y Gestión -->
    <div v-if="selectedReport" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ selectedReport.titulo }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedReport.reported_by?.name }} · {{ formatDate(selectedReport.created_at) }}</p>
          </div>
          <button @click="selectedReport = null" class="text-gray-400 hover:text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Badges -->
          <div class="flex flex-wrap gap-2">
            <span :class="estadoClasses[selectedReport.estado]" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ estadoLabels[selectedReport.estado] }}
            </span>
            <span :class="prioridadClasses[selectedReport.prioridad]" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ prioridadLabels[selectedReport.prioridad] }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {{ categoriaLabels[selectedReport.categoria] }}
            </span>
          </div>

          <!-- Detalles -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Aula</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedReport.aula ? `${selectedReport.aula.grado_cardinal}° ${selectedReport.aula.seccion}` : 'No especificada' }}
              </p>
            </div>
            <div v-if="selectedReport.accepted_by">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Aceptado por</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedReport.accepted_by?.name }}</p>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">{{ selectedReport.descripcion }}</p>
          </div>

          <!-- Foto -->
          <div v-if="selectedReport.imagen_path">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fotografía (Evidencia)</p>
            <button @click="downloadImage(selectedReport)" :disabled="downloadingImage"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors">
              <svg v-if="downloadingImage" class="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ downloadingImage ? 'Descargando...' : 'Descargar Imagen' }}
            </button>
          </div>

          <!-- Cambiar estado -->
          <div class="flex gap-3">
            <button v-if="selectedReport.estado !== 'en_proceso' && selectedReport.estado !== 'resuelto'"
              @click="changeEstado('en_proceso')"
              class="flex-1 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              Marcar en proceso
            </button>
            <button v-if="selectedReport.estado !== 'resuelto'"
              @click="changeEstado('resuelto')"
              class="flex-1 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              Marcar como resuelto
            </button>
            <div v-if="selectedReport.estado === 'resuelto'"
              class="flex-1 py-2 text-center text-sm font-medium text-green-700 bg-green-50 rounded-lg">
              ✓ Resuelto
            </div>
          </div>

          <!-- Notas de seguimiento -->
          <div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Historial de seguimiento</p>
            <div v-if="selectedReport.entries && selectedReport.entries.length > 0" class="space-y-2 mb-4">
              <div v-for="entry in selectedReport.entries" :key="entry.id"
                class="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p class="text-sm text-blue-900">{{ entry.nota }}</p>
                <p class="text-xs text-blue-500 mt-1">{{ entry.user?.name }} · {{ formatDate(entry.created_at) }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 italic mb-4">Sin notas aún.</p>

            <!-- Agregar nota -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <textarea v-model="newEntry"
                rows="3"
                placeholder="Escribe una nota de seguimiento..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"></textarea>
              <div class="flex justify-end mt-2">
                <button @click="addEntry"
                  :disabled="!newEntry.trim() || savingEntry"
                  class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  <svg v-if="savingEntry" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {{ savingEntry ? 'Guardando...' : 'Agregar nota' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '~/utils/api'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['admin', 'master']
})

const route = useRoute()
const loading = ref(true)
const accepting = ref<number | null>(null)
const savingEntry = ref(false)
const reports = ref<any[]>([])
const selectedReport = ref<any>(null)
const downloadingImage = ref(false)
const newEntry = ref('')
const newCount = ref(0)
const toast = ref({ show: false, type: 'success', message: '' })
const filters = ref({ categoria: '', prioridad: '' })
const activeTab = ref((route.query.tab as string) || 'nuevos')

const tabs = [
  { value: 'nuevos', label: 'Nuevos' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resueltos', label: 'Resueltos' }
]

const estadoLabels: Record<string, string> = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' }
const estadoClasses: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-green-100 text-green-800'
}
const prioridadLabels: Record<string, string> = { baja: 'Baja', media: 'Media', alta: 'Alta' }
const prioridadClasses: Record<string, string> = {
  baja: 'bg-green-100 text-green-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-red-100 text-red-700'
}
const categoriaLabels: Record<string, string> = {
  mobiliario: 'Mobiliario', equipo: 'Equipo', infraestructura: 'Infraestructura', limpieza: 'Limpieza', otro: 'Otro'
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3500)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchReports() {
  loading.value = true
  try {
    const params = new URLSearchParams({ tab: activeTab.value, per_page: '50' })
    if (filters.value.categoria) params.append('categoria', filters.value.categoria)
    if (filters.value.prioridad) params.append('prioridad', filters.value.prioridad)
    const res = await api.get(`/api/classroom-incidents?${params}`)
    reports.value = res.data?.data ?? res.data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchNewCount() {
  try {
    const res = await api.get('/api/classroom-incidents?tab=nuevos&per_page=1')
    newCount.value = res.data?.total ?? 0
  } catch (e) { /* silenciar */ }
}

async function downloadImage(report: any) {
  if (downloadingImage.value) return
  downloadingImage.value = true

  try {
    const blob = await api.getBlob(`/api/classroom-incidents/${report.id}/download-image`)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const extension = report.imagen_path.split('.').pop() || 'jpg'
    link.setAttribute('download', `incidencia-${report.id}.${extension}`)
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (e: any) {
    showToast('error', 'Error al descargar la imagen')
    console.error(e)
  } finally {
    downloadingImage.value = false
  }
}

async function acceptReport(r: any) {
  accepting.value = r.id
  try {
    await api.post(`/api/classroom-incidents/${r.id}/accept`)
    reports.value = reports.value.filter(x => x.id !== r.id)
    if (newCount.value > 0) newCount.value--
    showToast('success', 'Reporte aceptado. Ahora está en proceso.')
  } catch (e: any) {
    showToast('error', e?.data?.message || 'No se pudo aceptar el reporte')
  } finally {
    accepting.value = null
  }
}

async function openDetail(r: any) {
  try {
    const res = await api.get(`/api/classroom-incidents/${r.id}`)
    selectedReport.value = res.data?.data ?? r
    newEntry.value = ''
  } catch { selectedReport.value = r }
}

async function changeEstado(estado: string) {
  if (!selectedReport.value) return
  try {
    const res = await api.put(`/api/classroom-incidents/${selectedReport.value.id}`, { estado })
    Object.assign(selectedReport.value, res.data.data)
    const idx = reports.value.findIndex(r => r.id === selectedReport.value.id)
    if (idx !== -1) reports.value[idx] = { ...reports.value[idx], ...res.data.data }
    showToast('success', 'Estado actualizado')
    if (activeTab.value === 'en_proceso' && estado === 'resuelto') {
      reports.value = reports.value.filter(r => r.id !== selectedReport.value.id)
      selectedReport.value = null
    }
  } catch {
    showToast('error', 'No se pudo actualizar el estado')
  }
}

async function addEntry() {
  if (!newEntry.value.trim() || savingEntry.value) return
  savingEntry.value = true
  try {
    const res = await api.post(`/api/classroom-incidents/${selectedReport.value.id}/entries`, { nota: newEntry.value })
    if (!selectedReport.value.entries) selectedReport.value.entries = []
    
    // apiCall from Nuxt parses the response implicitly. res is `{ message: '...', data: { id: ... } }`
    const entryData = res.data?.data || res.data || res
    if (entryData) {
      selectedReport.value.entries.push(entryData)
    }
    
    newEntry.value = ''
    showToast('success', 'Nota agregada')
  } catch {
    showToast('error', 'No se pudo agregar la nota')
  } finally {
    savingEntry.value = false
  }
}

onMounted(() => { fetchReports(); fetchNewCount() })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .3s, transform .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(0.5rem); }
</style>
