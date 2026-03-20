<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Configuración de la Institución</h1>
        <p class="text-sm text-gray-500">Gestione la información pública y visual de su institución en la web.</p>
      </div>
      <button @click="saveSettings" :disabled="saving"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
        <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>

    <!-- Tabs (Solo mostramos la de Página Pública/Director para este rol) -->
    <div class="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px px-6" aria-label="Tabs">
          <button class="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Página Pública y Director
          </button>
        </nav>
      </div>

      <div class="p-6 space-y-8">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>

        <template v-else-if="form">
          <!-- Switch de Activación -->
          <div class="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div>
              <h3 class="text-sm font-bold text-primary-900">Estado de la Página Pública</h3>
              <p class="text-xs text-primary-700">Active o desactive la visibilidad de su institución para el público general.</p>
            </div>
            <div @click="form.public_pages_enabled = !form.public_pages_enabled"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="form.public_pages_enabled ? 'bg-primary-600' : 'bg-gray-200'">
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="form.public_pages_enabled ? 'translate-x-5' : 'translate-x-0'"></span>
            </div>
          </div>

          <!-- Sección: Información de la Institución -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label class="block text-sm font-bold text-gray-700">Descripción Pública</label>
              <textarea v-model="form.public_description" rows="5"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Breve reseña sobre la institución para la web..."></textarea>
            </div>

            <div class="space-y-6">
              <!-- Logos y Fotos -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Imagen de Portada (Hero)</label>
                <div class="flex items-center space-x-4">
                  <div class="h-20 w-32 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                    <img v-if="previews.hero_image" :src="previews.hero_image" class="h-full w-full object-cover" />
                    <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <input type="file" @change="handleFileUpload($event, 'hero_image')" class="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Logo de la Institución</label>
                <div class="flex items-center space-x-4">
                   <div class="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                    <img v-if="previews.logo" :src="previews.logo" class="h-full w-full object-contain" />
                  </div>
                  <input type="file" @change="handleFileUpload($event, 'logo')" class="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Datos de Contacto -->
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900 border-l-4 border-primary-600 pl-4">Información de Contacto</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700">Dirección</label>
                <input type="text" v-model="form.address" 
                  class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700">Teléfono</label>
                <input type="text" v-model="form.phone" 
                  class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700">Correo Electrónico</label>
                <input type="email" v-model="form.email" 
                  class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700">Sitio Web</label>
                <input type="url" v-model="form.website" 
                  class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
            </div>

            <!-- Redes Sociales -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Facebook</label>
                <input type="text" v-model="form.social_media.facebook" placeholder="URL de Facebook"
                  class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Instagram</label>
                <input type="text" v-model="form.social_media.instagram" placeholder="URL de Instagram"
                  class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Twitter</label>
                <input type="text" v-model="form.social_media.twitter" placeholder="URL de Twitter"
                  class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">YouTube</label>
                <input type="text" v-model="form.social_media.youtube" placeholder="URL de YouTube"
                  class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <!-- Sección: Datos del Director -->
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900 border-l-4 border-primary-600 pl-4">Información del Director</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-1 flex flex-col items-center">
                <div class="h-40 w-40 rounded-2xl bg-gray-100 overflow-hidden border-2 border-gray-200 mb-4 group relative">
                  <img v-if="previews.director_image" :src="previews.director_image" class="h-full w-full object-cover" />
                  <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                     <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  </div>
                </div>
                <input type="file" @change="handleFileUpload($event, 'director_image')" class="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              </div>

              <div class="md:col-span-2 space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700">Nombre del Director</label>
                  <input type="text" v-model="form.director_name" 
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700">Biografía/Mensaje del Director</label>
                  <textarea v-model="form.director_bio" rows="4"
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiCall } from '~/utils/api'
import { showSuccess, showError, showLoading, closeLoading } from '~/utils/sweetalert'

const loading = ref(true)
const saving = ref(false)
const form = ref(null)
const previews = ref({
  logo: null,
  hero_image: null,
  director_image: null
})
const files = ref({
  logo: null,
  hero_image: null,
  director_image: null
})

async function fetchSettings() {
  loading.value = true
  try {
    const response = await apiCall('/institution/settings')
    if (response.success) {
      form.value = { 
        ...response.data,
        social_media: response.data.social_media || {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        }
      }
      // Initialize previews
      if (form.value.logo_url) previews.value.logo = normalizeUrl(form.value.logo_url)
      if (form.value.hero_image_url) previews.value.hero_image = normalizeUrl(form.value.hero_image_url)
      if (form.value.director_image_url) previews.value.director_image = normalizeUrl(form.value.director_image_url)
    }
  } catch (err) {
    console.error('Error fetching settings:', err)
  } finally {
    loading.value = false
  }
}

function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const config = useRuntimeConfig()
  return `${config.public.apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

function handleFileUpload(event, type) {
  const file = event.target.files[0]
  if (!file) return

  files.value[type] = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previews.value[type] = e.target.result
  }
  reader.readAsDataURL(file)
}

async function saveSettings() {
  saving.value = true
  showLoading('Guardando cambios...')
  
  try {
    const formData = new FormData()
    
    // Solo enviamos los campos que un director puede editar
    formData.append('public_pages_enabled', form.value.public_pages_enabled ? '1' : '0')
    formData.append('public_description', form.value.public_description || '')
    formData.append('address', form.value.address || '')
    formData.append('phone', form.value.phone || '')
    formData.append('email', form.value.email || '')
    formData.append('website', form.value.website || '')
    formData.append('social_media', JSON.stringify(form.value.social_media))
    
    formData.append('director_name', form.value.director_name || '')
    formData.append('director_bio', form.value.director_bio || '')

    // Archivos
    if (files.value.logo) formData.append('logo', files.value.logo)
    if (files.value.hero_image) formData.append('hero_image', files.value.hero_image)
    if (files.value.director_image) formData.append('director_image', files.value.director_image)

    const response = await apiCall('/institution/settings', {
      method: 'POST',
      body: formData
    })

    closeLoading()

    if (response.success) {
      await showSuccess('La configuración de la institución se ha actualizado correctamente.', '¡Guardado!')
      window.location.reload()
    }
  } catch (err) {
    closeLoading()
    console.error('Error saving settings:', err)
    showError('No se pudieron guardar los cambios. Por favor, revise los datos e intente de nuevo.')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>
