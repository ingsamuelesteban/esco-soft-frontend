<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <!-- Top accent bar -->
    <div :class="announcement.visible_para_estudiantes ? 'bg-blue-500' : 'bg-amber-500'" class="h-1 w-full" />

    <div class="p-4">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <!-- Megaphone icon -->
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 flex-shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </span>
          <h3 class="font-semibold text-gray-900 text-sm leading-tight truncate">{{ announcement.title }}</h3>
        </div>
        <!-- Solo personal badge -->
        <span v-if="!announcement.visible_para_estudiantes"
          class="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          Solo personal
        </span>
      </div>

      <!-- Body excerpt -->
      <p class="mt-2 text-sm text-gray-600 line-clamp-3">{{ announcement.body }}</p>

      <!-- Footer -->
      <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{{ formatDate(announcement.created_at) }}</span>
        <div class="flex items-center gap-3">
          <!-- Attachment download -->
          <button v-if="announcement.attachment_path" @click="downloadFile"
            class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Adjunto
          </button>
          <!-- Delete button (admin only) -->
          <button v-if="canDelete" @click.stop="$emit('delete', announcement.id)"
            class="text-red-400 hover:text-red-600 transition-colors" title="Eliminar anuncio">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from '~/utils/api'

const props = defineProps<{
  announcement: {
    id: number
    title: string
    body: string
    attachment_path?: string | undefined | null
    visible_para_estudiantes: boolean
    created_at: string
  }
  canDelete?: boolean
}>()

defineEmits<{ delete: [id: number] }>()



async function downloadFile() {
  try {
    const res = await api.getBlob(`/api/announcements/${props.announcement.id}/download`)
    const blob = new Blob([res])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', props.announcement.attachment_path?.split('/').pop() || 'adjunto')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Error descargando adjunto:', e)
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
</script>
