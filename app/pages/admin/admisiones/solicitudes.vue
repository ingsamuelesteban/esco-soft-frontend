<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
      <div>
        <nav class="flex text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin/admisiones" class="hover:text-primary-600 transition-colors">Admisiones</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-gray-900 font-medium">Solicitudes de Documentos</span>
        </nav>
        <h1 class="text-2xl font-bold text-gray-900">Solicitudes de Documentos</h1>
        <p class="text-sm text-gray-500 mt-1">Solicita documentos a preadmitidos por rango de folder. Los estudiantes los suben desde su dashboard.</p>
      </div>
      <button @click="showCreateModal = true" type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors">
        <PlusIcon class="w-5 h-5" />
        Nueva Solicitud
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="solicitudes.length === 0" class="text-center py-20 bg-white rounded-xl border border-gray-200">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay solicitudes aún</h3>
      <p class="text-gray-500 mt-1 text-sm">Crea una solicitud para que los estudiantes suban sus documentos.</p>
    </div>

    <!-- List of Solicitudes (no detail selected) -->
    <div v-else-if="!selectedSolicitud" class="space-y-4">
      <div v-for="s in solicitudes" :key="s.id"
        class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="loadDetail(s.id)">
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 text-lg leading-tight">{{ s.titulo }}</h3>
              <p v-if="s.descripcion" class="text-sm text-gray-500 mt-1 line-clamp-2">{{ s.descripcion }}</p>
              <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <FolderIcon class="w-4 h-4" />
                  Folders {{ s.folder_desde }} – {{ s.folder_hasta }}
                </span>
                <span class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4" />
                  {{ formatDate(s.created_at) }}
                </span>
                <span v-if="s.created_by">Por: {{ s.created_by }}</span>
              </div>
            </div>
            <!-- Stats -->
            <div class="flex gap-3 shrink-0">
              <div class="text-center bg-gray-50 rounded-lg px-3 py-2 min-w-[52px]">
                <div class="text-lg font-bold text-gray-800">{{ s.total }}</div>
                <div class="text-[10px] text-gray-500 uppercase">Total</div>
              </div>
              <div class="text-center bg-amber-50 rounded-lg px-3 py-2 min-w-[52px]">
                <div class="text-lg font-bold text-amber-700">{{ s.pendientes }}</div>
                <div class="text-[10px] text-amber-600 uppercase">Pend.</div>
              </div>
              <div class="text-center bg-blue-50 rounded-lg px-3 py-2 min-w-[52px]">
                <div class="text-lg font-bold text-blue-700">{{ s.subidos }}</div>
                <div class="text-[10px] text-blue-600 uppercase">Subidos</div>
              </div>
              <div class="text-center bg-green-50 rounded-lg px-3 py-2 min-w-[52px]">
                <div class="text-lg font-bold text-green-700">{{ s.recibidos }}</div>
                <div class="text-[10px] text-green-600 uppercase">Recib.</div>
              </div>
              <div class="text-center bg-red-50 rounded-lg px-3 py-2 min-w-[52px]">
                <div class="text-lg font-bold text-red-700">{{ s.rechazados || 0 }}</div>
                <div class="text-[10px] text-red-600 uppercase">Rechaz.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail View -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <button @click="selectedSolicitud = null; detail = null" type="button"
          class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon class="w-4 h-4" />
          Volver
        </button>
        <h2 class="text-xl font-bold text-gray-900">{{ detail?.solicitud?.titulo }}</h2>
        <span class="text-sm text-gray-400">| Folders {{ detail?.solicitud?.folder_desde }} – {{ detail?.solicitud?.folder_hasta }}</span>
        
        <div class="ml-auto">
          <button @click="refreshSolicitud(detail?.solicitud?.id)" type="button" :disabled="isRefreshing"
            class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors tooltip-target"
            title="Refrescar (buscar estudiantes faltantes en el rango)">
            <svg v-if="isRefreshing" class="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <ArrowPathIcon v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="detailLoading" class="flex justify-center py-10">
        <svg class="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>

      <div v-else class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Folder</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Entró a la App</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Archivo</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-if="!detail?.uploads?.length">
                <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">No hay estudiantes en este rango de folders.</td>
              </tr>
              <tr v-for="u in detail?.uploads" :key="u.id" class="hover:bg-gray-50">
                <!-- Name -->
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900">{{ u.estudiante?.nombres }} {{ u.estudiante?.apellidos }}</div>
                  <div v-if="u.last_seen_at" class="text-xs text-gray-400 mt-0.5">Última vez: {{ formatDateTime(u.last_seen_at) }}</div>
                </td>
                <!-- Folder -->
                <td class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  #{{ u.estudiante?.no_folder ?? '—' }}
                </td>
                <!-- Entró a la app -->
                <td class="px-4 py-3 text-center">
                  <span v-if="u.entro_app" class="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircleIcon class="w-4 h-4" /> Sí
                  </span>
                  <span v-else class="text-gray-300 text-sm">—</span>
                </td>
                <!-- Status Badge -->
                <td class="px-4 py-3 text-center">
                  <span :class="statusClass(u.status)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {{ statusLabel(u.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span v-if="u.file_name" class="text-xs text-gray-700 truncate max-w-[140px] block mx-auto" :title="u.file_name">
                    {{ u.file_name }}
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                  <div v-if="u.status === 'rejected' && u.notes" class="mt-1 text-[10px] text-red-600 max-w-[140px] mx-auto truncate" :title="u.notes">
                    Rechazo: {{ u.notes }}
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button v-if="['uploaded', 'received'].includes(u.status)" @click="downloadUpload(u.id, u.file_name)" type="button"
                      class="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded px-2 py-1 transition-colors">
                      <ArrowDownTrayIcon class="w-3.5 h-3.5" /> Descargar
                    </button>
                    <button v-if="u.status === 'uploaded'" @click="markReceived(u)" type="button"
                      :disabled="u._loading"
                      class="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded px-2 py-1 transition-colors disabled:opacity-50">
                      <CheckCircleIcon class="w-3.5 h-3.5" /> Recibido
                    </button>
                    <button v-if="u.status === 'uploaded'" @click="openRejectModal(u)" type="button"
                      class="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded px-2 py-1 transition-colors">
                      <XCircleIcon class="w-3.5 h-3.5" /> Rechazar
                    </button>
                    <span v-if="u.status === 'received'" class="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircleIcon class="w-4 h-4" /> Recibido
                    </span>
                    <span v-if="u.status === 'pending'" class="text-xs text-gray-400">Esperando...</span>
                    <span v-if="u.status === 'rejected'" class="text-xs text-red-500 font-medium">Rechazado</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Solicitud Button -->
      <div class="mt-4 flex justify-end">
        <button @click="deleteSolicitud" type="button"
          class="text-xs text-red-500 hover:text-red-700 underline transition-colors">
          Eliminar esta solicitud
        </button>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Nueva Solicitud de Documento</h3>
          <button @click="showCreateModal = false" type="button" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <!-- Titulo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título del documento *</label>
            <input v-model="form.titulo" type="text" placeholder="Ej: Copia de Cédula del Estudiante"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <!-- Descripcion -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea v-model="form.descripcion" rows="3" placeholder="Instrucciones adicionales..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
          </div>
          <!-- Folder Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Folder Desde *</label>
              <input v-model.number="form.folder_desde" type="number" min="1" placeholder="1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Folder Hasta *</label>
              <input v-model.number="form.folder_hasta" type="number" min="1" placeholder="999"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>
          <p class="text-xs text-gray-400">Se creará una solicitud para todos los preadmitidos cuyo número de folder esté en el rango indicado.</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button @click="showCreateModal = false" type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button @click="createSolicitud" type="button" :disabled="saving"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Crear Solicitud
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Rechazar Documento</h3>
          <button @click="showRejectModal = false" type="button" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <p class="text-sm text-gray-500">¿Por qué rechazas este documento? El estudiante verá este comentario y podrá volver a subir su archivo.</p>
          <div>
            <textarea v-model="rejectForm.notes" rows="3" placeholder="Ej: La imagen está borrosa, suba una donde se lea claramente la cédula."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button @click="showRejectModal = false" type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button @click="rejectUpload" type="button" :disabled="rejecting"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            <svg v-if="rejecting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Rechazar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'
import {
  PlusIcon,
  DocumentTextIcon,
  FolderIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ middleware: ['auth'] })

const loading = ref(true)
const saving = ref(false)
const detailLoading = ref(false)
const isRefreshing = ref(false)
const showCreateModal = ref(false)
const solicitudes = ref<any[]>([])
const selectedSolicitud = ref<number | null>(null)
const detail = ref<any>(null)

// Reject State
const showRejectModal = ref(false)
const rejecting = ref(false)
const rejectForm = ref({ uploadId: null as number | null, notes: '' })

const form = ref({ titulo: '', descripcion: '', folder_desde: 1, folder_hasta: 999 })

const loadSolicitudes = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/admision-solicitudes')
    if (res.success) solicitudes.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const loadDetail = async (id: number) => {
  selectedSolicitud.value = id
  detailLoading.value = true
  try {
    const res = await api.get(`/api/admision-solicitudes/${id}`)
    if (res.success) detail.value = res.data
  } catch (e) { console.error(e) }
  finally { detailLoading.value = false }
}

const refreshSolicitud = async (id: number) => {
  if (!id || isRefreshing.value) return

  isRefreshing.value = true
  try {
    const res = await api.post(`/api/admision-solicitudes/${id}/refresh`, {})
    if (res.success) {
      if (res.generados > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Actualización Completa',
          text: `Se agregaron ${res.generados} nuevos estudiantes faltantes asignados a esta solicitud.`,
          confirmButtonColor: '#0ea5e9'
        })
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Al Día',
          text: 'No se encontraron nuevos estudiantes dentro de este rango de folders.',
          confirmButtonColor: '#0ea5e9'
        })
      }
      await loadDetail(id)
      await loadSolicitudes()
    }
  } catch (e) {
    console.error('Error refreshing solicitud', e)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar refrescar la solicitud.',
      confirmButtonColor: '#f43f5e'
    })
  } finally {
    isRefreshing.value = false
  }
}

const createSolicitud = async () => {
  if (!form.value.titulo || !form.value.folder_desde || !form.value.folder_hasta) {
    return Swal.fire('Campos requeridos', 'Completa el título y el rango de folders.', 'warning')
  }
  saving.value = true
  try {
    const res = await api.post('/api/admision-solicitudes', form.value)
    if (res.success) {
      await Swal.fire('Solicitud creada', `Se generaron solicitudes para ${res.generados} estudiante(s).`, 'success')
      showCreateModal.value = false
      form.value = { titulo: '', descripcion: '', folder_desde: 1, folder_hasta: 999 }
      await loadSolicitudes()
    }
  } catch (e: any) {
    Swal.fire('Error', e?.message || 'No se pudo crear la solicitud.', 'error')
  } finally { saving.value = false }
}

const markReceived = async (upload: any) => {
  upload._loading = true
  try {
    const res = await api.post(`/api/admision-solicitudes/uploads/${upload.id}/receive`, {})
    if (res.success) {
      upload.status = 'received'
      upload.received_at = res.data?.received_at
      await loadSolicitudes()
    }
  } catch (e) {
    Swal.fire('Error', 'No se pudo marcar como recibido.', 'error')
  } finally { upload._loading = false }
}

const openRejectModal = (upload: any) => {
  rejectForm.value = { uploadId: upload.id, notes: '' }
  showRejectModal.value = true
}

const rejectUpload = async () => {
  if (!rejectForm.value.notes.trim()) {
    return Swal.fire('Motivo requerido', 'Por favor indique por qué rechaza el documento.', 'warning')
  }
  rejecting.value = true
  try {
    const res = await api.post(`/api/admision-solicitudes/uploads/${rejectForm.value.uploadId}/reject`, {
      notes: rejectForm.value.notes
    })
    if (res.success) {
      // Find upload in detail and update it
      const upload = detail.value?.uploads?.find((u: any) => u.id === rejectForm.value.uploadId)
      if (upload) {
        upload.status = 'rejected'
        upload.notes = res.data?.notes
      }
      showRejectModal.value = false
      await loadSolicitudes()
      Swal.fire('Rechazado', 'El estudiante ha sido notificado y podrá volver a subir el archivo.', 'success')
    }
  } catch (e: any) {
    Swal.fire('Error', e?.message || 'No se pudo rechazar el documento.', 'error')
  } finally {
    rejecting.value = false
  }
}


const downloadUpload = async (uploadId: number, fileName: string) => {
  try {
    const blob = await api.getBlob(`/api/admision-solicitudes/uploads/${uploadId}/download`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || `documento_${uploadId}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    Swal.fire('Error', 'No se pudo descargar el archivo.', 'error')
  }
}

const deleteSolicitud = async () => {
  const confirm = await Swal.fire({
    title: '¿Eliminar solicitud?',
    text: 'Solo es posible si ningún estudiante ha subido archivos aún.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!confirm.isConfirmed) return
  try {
    const res = await api.delete(`/api/admision-solicitudes/${selectedSolicitud.value}`)
    if (res.success) {
      Swal.fire('Eliminada', '', 'success')
      selectedSolicitud.value = null
      detail.value = null
      await loadSolicitudes()
    } else {
      Swal.fire('No se pudo eliminar', res.message, 'warning')
    }
  } catch (e: any) {
    Swal.fire('Error', e?.message || 'No se pudo eliminar.', 'error')
  }
}

const statusLabel = (s: string) => ({ pending: 'Pendiente', uploaded: 'Subido', received: 'Recibido', rejected: 'Rechazado' }[s] ?? s)
const statusClass = (s: string) => ({
  pending:  'bg-amber-100 text-amber-800',
  uploaded: 'bg-blue-100 text-blue-800',
  received: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}[s] ?? 'bg-gray-100 text-gray-700')

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

// Helper to get tenant slug for download URL
const useTenantSlug = () => {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/')
  // The API calls go through /api/{tenant}/...
  // We grab from cookie or localStorage set by the app
  const tenant = localStorage.getItem('tenant_slug') || parts[1] || ''
  return tenant
}

onMounted(loadSolicitudes)
</script>
