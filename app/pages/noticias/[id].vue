<template>
  <div class="min-h-screen bg-gray-50 flex flex-col pt-20">
    <!-- Breadcrumbs / Back navigation -->
    <div class="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group">
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio
      </NuxtLink>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-500 font-medium italic">Cargando noticia...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-3xl p-12 text-center shadow-xl border border-red-50">
        <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Noticia no encontrada</h2>
        <p class="text-gray-600 mb-8">{{ error }}</p>
        <NuxtLink to="/" class="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25">
          Ver todas las noticias
        </NuxtLink>
      </div>

      <!-- News Content -->
      <article v-else-if="news" class="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        <!-- Feature Image (if exists) -->
        <div v-if="news.attachment_path && isImage(news.attachment_path)" class="w-full h-[400px] relative overflow-hidden bg-gray-100">
          <img :src="news.attachment_path" :alt="news.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div class="p-8 md:p-12 space-y-8">
          <!-- Header info -->
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                Institucional
              </span>
              <span class="text-sm font-medium text-gray-400">
                Publicado el {{ formatDate(news.published_at) }}
              </span>
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              {{ news.title }}
            </h1>
          </div>

          <!-- Body Text -->
          <div class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap font-inter">
            {{ news.body }}
          </div>

          <!-- Attachment (if not an image or besides the image) -->
          <div v-if="news.attachment_path" class="pt-8 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Archivo Adjunto</h4>
            <div class="flex items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-bold text-gray-900 truncate">Documento de la noticia</p>
                <p class="text-xs text-gray-500">Descargue el archivo adjunto para más información</p>
              </div>
              <button @click="downloadFile" :disabled="downloading" class="ml-4 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/10">
                {{ downloading ? 'Preparando...' : 'Descargar' }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDomain } from '~/composables/useDomain'

const route = useRoute()
const { subdomain } = useDomain()
const config = useRuntimeConfig()

const news = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const downloading = ref(false)

// Set layout to public
definePageMeta({
  layout: 'public'
})

async function fetchNewsDetail() {
  if (!subdomain.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const apiBase = config.public.apiBase.replace(/\/$/, '')
    const response = await $fetch<any>(`${apiBase}/api/${subdomain.value}/public-web/news/${route.params.id}`)
    
    if (response.success) {
      // Normalize URL for display if it's an image
      if (response.data.attachment_path) {
        response.data.attachment_path = normalizeUrl(response.data.attachment_path)
      }
      news.value = response.data
    } else {
      error.value = response.message || 'No se pudo cargar la noticia.'
    }
  } catch (err: any) {
    console.error('Error fetching news detail:', err)
    error.value = 'La noticia que busca no está disponible o ha sido retirada.'
  } finally {
    loading.value = false
  }
}

function normalizeUrl(url: string) {
  if (!url) return ''
  const apiBase = config.public.apiBase.replace(/\/$/, '')
  if (url.startsWith('http')) {
    return url.replace(/https?:\/\/(localhost:8010|127\.0\.0\.1:8010|escosoft\.online|api\.escosoft\.online)/, apiBase)
  }
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

function isImage(path: string) {
  return /\.(jpeg|jpg|gif|png|webp)$/i.test(path)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function downloadFile() {
  if (!news.value?.id || downloading.value) return
  
  downloading.value = true
  try {
    const apiBase = config.public.apiBase.replace(/\/$/, '')
    const downloadUrl = `${apiBase}/api/${subdomain.value}/public-web/news/${news.value.id}/download`
    
    // Fetch the file as a blob
    const response = await fetch(downloadUrl)
    if (!response.ok) throw new Error('Error al descargar el archivo')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Try to get filename from content-disposition or use a default
    const contentDisposition = response.headers.get('content-disposition')
    let fileName = 'adjunto-noticia'
    if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
      fileName = contentDisposition.split('filename=')[1].replace(/['"]/g, '')
    } else if (news.value.attachment_path) {
      fileName = news.value.attachment_path.split('/').pop() || fileName
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error downloading file:', err)
    alert('No se pudo descargar el archivo. Por favor, intente de nuevo.')
  } finally {
    downloading.value = false
  }
}

onMounted(fetchNewsDetail)
</script>
