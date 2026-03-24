<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reportes de Aula</h1>
          <p class="text-sm text-gray-600 mt-1">Reporta incidencias como mobiliario dañado, equipos averiados u otros problemas en tu aula.</p>
        </div>
        <button @click="openModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Reporte
        </button>
      </div>
    </header>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" :class="[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <div class="p-6">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="reports.length === 0" class="text-center py-16">
        <div class="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-900">No tienes reportes creados</h3>
        <p class="mt-1 text-sm text-gray-500">Haz clic en "Nuevo Reporte" para reportar una incidencia.</p>
      </div>

      <!-- Lista de reportes -->
      <div v-else class="space-y-3">
        <div v-for="r in reports" :key="r.id"
          class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="openDetail(r)">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span :class="prioridadClasses[r.prioridad]" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                  {{ prioridadLabels[r.prioridad] }}
                </span>
                <span class="text-xs text-gray-500">{{ categoriaLabels[r.categoria] }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 truncate">{{ r.titulo }}</h3>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ r.aula ? `Aula ${r.aula.grado_cardinal}° ${r.aula.seccion}` : 'Sin aula' }}
              </p>
              <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ r.descripcion }}</p>
            </div>
            <div class="flex-shrink-0 text-right">
              <span :class="estadoClasses[r.estado]" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                {{ estadoLabels[r.estado] }}
              </span>
              <p class="text-xs text-gray-400 mt-2">{{ formatDate(r.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo Reporte -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 class="text-lg font-semibold text-gray-900">Nueva Incidencia de Aula</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="formError" class="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ formError }}
        </div>

        <form @submit.prevent="submitReport" class="p-6 space-y-4">
          <!-- Aula -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aula afectada</label>
            <select v-model="form.aula_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white">
              <option :value="null">Seleccionar aula (opcional)</option>
              <option v-for="a in aulas" :key="a.id" :value="a.id">{{ a.grado_cardinal }}° {{ a.seccion }}</option>
            </select>
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select v-model="form.categoria" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white">
              <option value="">Seleccionar...</option>
              <option value="mobiliario">Mobiliario</option>
              <option value="equipo">Equipo / Tecnología</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="limpieza">Limpieza</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input v-model="form.titulo" type="text" required maxlength="255"
              placeholder="Ej: Silla rota en la fila 3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea v-model="form.descripcion" rows="4" required
              placeholder="Describe el problema con el mayor detalle posible..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"></textarea>
          </div>

          <!-- Prioridad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad *</label>
            <div class="flex gap-3">
              <label v-for="p in prioridades" :key="p.value"
                :class="['flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all',
                  form.prioridad === p.value ? p.activeClass : 'border-gray-200 text-gray-500 hover:border-gray-300']">
                <input type="radio" v-model="form.prioridad" :value="p.value" class="sr-only" />
                <span>{{ p.icon }}</span>
                {{ p.label }}
              </label>
            </div>
          </div>

          <!-- Imagen -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Foto del problema (opcional)</label>
            <input type="file" accept="image/*" @change="handleImage"
              class="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Enviando...' : 'Enviar Reporte' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Detalle -->
    <div v-if="selectedReport" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 class="text-lg font-semibold text-gray-900">{{ selectedReport.titulo }}</h2>
          <button @click="selectedReport = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <!-- Status + badges -->
          <div class="flex flex-wrap gap-2">
            <span :class="estadoClasses[selectedReport.estado]" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {{ estadoLabels[selectedReport.estado] }}
            </span>
            <span :class="prioridadClasses[selectedReport.prioridad]" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {{ prioridadLabels[selectedReport.prioridad] }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {{ categoriaLabels[selectedReport.categoria] }}
            </span>
          </div>

          <!-- Info -->
          <div class="text-sm space-y-2">
            <p><span class="font-medium text-gray-700">Aula:</span>
              {{ selectedReport.aula ? `${selectedReport.aula.grado_cardinal}° ${selectedReport.aula.seccion}` : 'No especificada' }}</p>
            <p><span class="font-medium text-gray-700">Descripción:</span></p>
            <p class="text-gray-600 bg-gray-50 rounded-lg p-3">{{ selectedReport.descripcion }}</p>
          </div>

          <!-- Foto -->
          <div v-if="selectedReport.imagen_path">
            <p class="text-sm font-medium text-gray-700 mb-2">Fotografía (Evidencia)</p>
            <button @click="downloadImage(selectedReport)" :disabled="downloadingImage"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors">
              <svg v-if="downloadingImage" class="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ downloadingImage ? 'Descargando...' : 'Descargar Imagen' }}
            </button>
          </div>

          <!-- Notas de seguimiento -->
          <div v-if="selectedReport.entries && selectedReport.entries.length > 0">
            <p class="text-sm font-medium text-gray-700 mb-2">Seguimiento del equipo</p>
            <div class="space-y-2">
              <div v-for="entry in selectedReport.entries" :key="entry.id"
                class="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p class="text-sm text-blue-900">{{ entry.nota }}</p>
                <p class="text-xs text-blue-500 mt-1">{{ entry.user?.name }} · {{ formatDate(entry.created_at) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-sm text-gray-400 italic">
            Sin notas de seguimiento aún.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['profesor', 'admin', 'master', 'coordinador']
})

const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')
const reports = ref<any[]>([])
const aulas = ref<any[]>([])
const selectedReport = ref<any>(null)
const downloadingImage = ref(false)
const toast = ref({ show: false, type: 'success', message: '' })

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
  mobiliario: 'Mobiliario',
  equipo: 'Equipo',
  infraestructura: 'Infraestructura',
  limpieza: 'Limpieza',
  otro: 'Otro'
}
const prioridades = [
  { value: 'baja', label: 'Baja', icon: '🟢', activeClass: 'border-green-500 text-green-700 bg-green-50' },
  { value: 'media', label: 'Media', icon: '🟡', activeClass: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
  { value: 'alta', label: 'Alta', icon: '🔴', activeClass: 'border-red-500 text-red-700 bg-red-50' }
]

const form = ref({
  aula_id: null as number | null,
  categoria: '',
  titulo: '',
  descripcion: '',
  prioridad: 'media',
  imagen: null as File | null
})

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3500)
}

function openModal() {
  form.value = { aula_id: null, categoria: '', titulo: '', descripcion: '', prioridad: 'media', imagen: null }
  formError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false; formError.value = '' }

function handleImage(e: Event) {
  form.value.imagen = (e.target as HTMLInputElement).files?.[0] ?? null
}

function openDetail(r: any) {
  selectedReport.value = r
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchReports() {
  loading.value = true
  try {
    const res = await api.get('/api/classroom-incidents?per_page=50')
    reports.value = res.data?.data ?? res.data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function downloadImage(report: any) {
  if (downloadingImage.value) return
  downloadingImage.value = true

  try {
    const blob = await api.getBlob(`/api/classroom-incidents/${report.id}/download-image`)

    // Create blob link to download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extract format from path logic or default it
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

async function fetchAulas() {
  try {
    const res = await api.get('/api/aulas')
    // api.get de EscoSoft retorna a veces la data directo (interceptors) o en un objeto de json()
    aulas.value = res.data?.data || res.data || res || []
  } catch (e) { /* silenciar */ }
}

async function submitReport() {
  if (saving.value) return
  saving.value = true
  formError.value = ''
  try {
    const fd = new FormData()
    if (form.value.aula_id) fd.append('aula_id', String(form.value.aula_id))
    fd.append('categoria', form.value.categoria)
    fd.append('titulo', form.value.titulo)
    fd.append('descripcion', form.value.descripcion)
    fd.append('prioridad', form.value.prioridad)
    if (form.value.imagen) fd.append('imagen', form.value.imagen)

    await api.post('/api/classroom-incidents', fd)
    await fetchReports()
    closeModal()
    showToast('success', 'Reporte enviado exitosamente')
  } catch (e: any) {
    formError.value = e?.data?.message || 'No se pudo enviar el reporte'
  } finally {
    saving.value = false
  }
}

onMounted(() => { fetchReports(); fetchAulas() })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .3s, transform .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(0.5rem); }
</style>
