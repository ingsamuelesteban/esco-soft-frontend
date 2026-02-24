<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Anuncios</h1>
          <p class="text-sm text-gray-600 mt-1">Publicaciones institucionales para el personal y estudiantes</p>
        </div>
        <button @click="openModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Anuncio
        </button>
      </div>
    </header>

    <!-- Toast notification -->
    <transition name="fade">
      <div v-if="toast.show" :class="[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <div class="p-6">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="announcements.length === 0" class="text-center py-16">
        <div class="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-900">No hay anuncios publicados</h3>
        <p class="mt-1 text-sm text-gray-500">Haz clic en "Nuevo Anuncio" para publicar el primero.</p>
      </div>

      <!-- Grid of announcements -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnnouncioCard
          v-for="a in announcements"
          :key="a.id"
          :announcement="a"
          :can-delete="true"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Nuevo Anuncio</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form error -->
        <div v-if="formError" class="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ formError }}
        </div>

        <form @submit.prevent="submitAnnouncement" class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input v-model="form.title" type="text" required maxlength="255" placeholder="Ej: Reunión de docentes el viernes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <!-- Body -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea v-model="form.body" rows="5" required placeholder="Escribe el contenido del anuncio..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
          </div>

          <!-- Attachment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adjunto (opcional)</label>
            <input type="file" @change="handleFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              class="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p class="mt-1 text-xs text-gray-400">PDF, Word, Excel o imagen. Máx 20 MB.</p>
          </div>

          <!-- Visible para estudiantes -->
          <label class="flex items-center gap-3 cursor-pointer select-none bg-gray-50 rounded-lg p-3 border border-gray-200">
            <input v-model="form.visible_para_estudiantes" type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <div>
              <span class="text-sm font-medium text-gray-800">Visible para estudiantes</span>
              <p class="text-xs text-gray-500 mt-0.5">Si no se marca, sólo el personal verá este anuncio</p>
            </div>
          </label>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Publicando...' : 'Publicar Anuncio' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import AnnouncioCard from '~/components/anuncios/AnnouncioCard.vue'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['admin', 'master']
})

const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')
const announcements = ref<any[]>([])

// Toast state
const toast = ref({ show: false, type: 'success', message: '' })
function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const form = ref({
  title: '',
  body: '',
  visible_para_estudiantes: true,
  file: null as File | null
})

function openModal() {
  form.value = { title: '', body: '', visible_para_estudiantes: true, file: null }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

function handleFile(e: Event) {
  const input = e.target as HTMLInputElement
  form.value.file = input.files?.[0] ?? null
}

async function fetchAnnouncements() {
  loading.value = true
  try {
    const res = await api.get('/api/announcements?per_page=50')
    announcements.value = res.data || []
  } catch (e) {
    console.error('Error cargando anuncios', e)
  } finally {
    loading.value = false
  }
}

async function submitAnnouncement() {
  saving.value = true
  formError.value = ''
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('body', form.value.body)
    formData.append('visible_para_estudiantes', form.value.visible_para_estudiantes ? '1' : '0')
    if (form.value.file) formData.append('attachment', form.value.file)

    await api.post('/api/announcements', formData)
    await fetchAnnouncements()
    closeModal()
    showToast('success', 'Anuncio publicado exitosamente')
  } catch (e: any) {
    formError.value = e?.data?.message || e?.message || 'No se pudo publicar el anuncio'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id: number) {
  if (!window.confirm('¿Eliminar este anuncio? Esta acción no se puede deshacer.')) return
  try {
    await api.delete(`/api/announcements/${id}`)
    announcements.value = announcements.value.filter(a => a.id !== id)
    showToast('success', 'Anuncio eliminado')
  } catch (e) {
    showToast('error', 'No se pudo eliminar el anuncio')
  }
}

onMounted(fetchAnnouncements)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .3s, transform .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(0.5rem); }
</style>
