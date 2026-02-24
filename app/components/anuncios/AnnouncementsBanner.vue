<template>
  <!-- Nothing if loading and no announcements yet -->
  <div v-if="loadingAnnouncements && announcements.length === 0" class="animate-pulse h-24 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100" />

  <!-- Nothing if no announcements and not loading -->
  <div v-else-if="!loadingAnnouncements && announcements.length === 0" />

  <!-- Banner section -->
  <div v-else class="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">

    <!-- Decorative background shapes -->
    <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
    <div class="absolute -left-4 -bottom-6 h-24 w-24 rounded-full bg-white/10"></div>

    <!-- Header strip -->
    <div class="relative flex items-center justify-between px-5 pt-4 pb-2">
      <div class="flex items-center gap-2">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </span>
        <span class="text-sm font-bold uppercase tracking-widest text-white/90">Anuncios</span>
        <span class="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
          {{ announcements.length }}
        </span>
      </div>
      <!-- Refresh indicator -->
      <span v-if="loadingAnnouncements" class="text-xs text-white/60 flex items-center gap-1">
        <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Actualizando...
      </span>
    </div>

    <!-- Cards scroll row -->
    <div class="relative flex gap-3 overflow-x-auto px-5 pb-4 pt-1 scrollbar-hide snap-x snap-mandatory">
      <div
        v-for="a in announcements"
        :key="a.id"
        class="snap-start flex-shrink-0 w-72 sm:w-80 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all cursor-default"
      >
        <!-- Card top: title + badge -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4 class="text-sm font-bold text-white leading-snug line-clamp-2">{{ a.title }}</h4>
          <span v-if="!a.visible_para_estudiantes"
            class="flex-shrink-0 text-[10px] font-bold uppercase bg-amber-400/30 text-amber-100 border border-amber-300/30 rounded px-1.5 py-0.5">
            Personal
          </span>
        </div>
        <!-- Body -->
        <p class="text-xs text-white/80 line-clamp-2 leading-relaxed">{{ a.body }}</p>
        <!-- Footer -->
        <div class="mt-3 flex items-center justify-between">
          <span class="text-[11px] text-white/60">{{ formatDate(a.created_at) }}</span>
          <button v-if="a.attachment_path" @click="downloadFile(a.id, a.attachment_path)"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Adjunto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '~/utils/api'

const announcements = ref<any[]>([])
const loadingAnnouncements = ref(false)
let refreshTimer: any = null

async function fetchAnnouncements() {
  loadingAnnouncements.value = true
  try {
    const res = await api.get('/api/announcements?per_page=10')
    announcements.value = res.data || []
  } catch (e) {
    console.error('Error cargando anuncios', e)
  } finally {
    loadingAnnouncements.value = false
  }
}

function formatDate(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (diff < 60) return rtf.format(-Math.floor(diff), 'seconds')
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minutes')
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hours')
  return rtf.format(-Math.floor(diff / 86400), 'days')
}

async function downloadFile(announcementId: number, attachmentPath: string) {
  try {
    const blob = await api.getBlob(`/api/announcements/${announcementId}/download`)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', attachmentPath.split('/').pop() || 'adjunto')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Error descargando adjunto:', e)
  }
}

onMounted(() => {
  fetchAnnouncements()
  // Refresh every 2 minutes to keep announcements fresh
  refreshTimer = setInterval(fetchAnnouncements, 120_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
