<template>
  <div v-if="loadingRequests || requests.length > 0">
    <!-- Loading state banner -->
  <div v-if="loadingRequests" class="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
    <!-- Decorative background shapes -->
    <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
    <div class="absolute -left-4 -bottom-6 h-24 w-24 rounded-full bg-white/10"></div>
    <!-- Header strip -->
    <div class="relative flex items-center justify-between px-5 pt-4 pb-4">
      <div class="flex items-center gap-2 animate-pulse">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20"></span>
        <div class="h-4 bg-white/30 rounded w-32"></div>
      </div>
      <!-- Refresh indicator -->
      <span class="text-xs text-white/60 flex items-center gap-1">
        <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Actualizando...
      </span>
    </div>
  </div>

  <!-- Banner section -->
  <div v-else-if="requests.length > 0" class="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
    <!-- Decorative background shapes -->
    <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
    <div class="absolute -left-4 -bottom-6 h-24 w-24 rounded-full bg-white/10"></div>

    <!-- Header strip -->
    <div class="relative flex items-center justify-between px-5 pt-4 pb-2">
      <div class="flex items-center gap-2">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span class="text-sm font-bold uppercase tracking-widest text-white/90">Permisos Pendientes</span>
        <span class="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
          {{ requests.length }}
        </span>
      </div>
      <!-- Refresh indicator -->
      <span v-if="loadingRequests" class="text-xs text-white/60 flex items-center gap-1">
        <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Actualizando...
      </span>
    </div>

    <!-- Cards scroll row -->
    <div class="relative flex gap-3 overflow-x-auto px-5 pb-4 pt-1 scrollbar-hide snap-x snap-mandatory">
      <div v-for="req in requests" :key="req.id"
        class="snap-start flex-shrink-0 w-72 sm:w-80 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all cursor-default flex flex-col justify-between">
        
        <!-- Card top: title + badge -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4 class="text-sm font-bold text-white leading-snug line-clamp-1">
            {{ req.personal?.user?.name || [req.personal?.nombre, req.personal?.apellido].filter(Boolean).join(' ') || 'Personal' }}
          </h4>
          <span class="flex-shrink-0 text-[10px] font-bold uppercase bg-white/20 text-white border border-white/30 rounded px-1.5 py-0.5">
            {{ formatLeaveType(req.leave_type) }}
          </span>
        </div>
        
        <!-- Body / Reason -->
        <p class="text-xs text-white/90 line-clamp-2 leading-relaxed mb-1">{{ req.reason }}</p>
        
        <!-- Dates -->
        <div class="text-[11px] text-white/70 flex gap-1 mb-3">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(req.start_date) }} - {{ formatDate(req.end_date) }} ({{ req.days_count }} días)
        </div>

        <!-- Footer -->
        <div class="mt-auto flex items-center justify-between">
          <span class="text-[10px] text-white/60">Creado hace {{ req.created_at ? timeAgo(req.created_at) : '' }}</span>
          
          <NuxtLink to="/personal/permisos" 
            class="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-orange-600">
            Revisar
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '~/utils/api'

const requests = ref<any[]>([])
const loadingRequests = ref(false)
let refreshTimer: any = null

async function fetchRequests() {
  loadingRequests.value = true
  try {
    const res = await api.get('/api/staff/leave-requests?status=pendiente&per_page=10')
    requests.value = res?.data || []
  } catch (e) {
    console.error('Error cargando solicitudes de permiso pendientes', e)
  } finally {
    loadingRequests.value = false
  }
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (diff < 60) return rtf.format(-Math.floor(diff), 'second').replace('hace ', '')
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute').replace('hace ', '')
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour').replace('hace ', '')
  return rtf.format(-Math.floor(diff / 86400), 'day').replace('hace ', '')
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

function formatLeaveType(type: string) {
  const types: Record<string, string> = {
    'vacaciones': 'Vacaciones',
    'personal': 'Personal',
    'medico': 'Médico',
    'maternidad': 'Maternidad',
    'paternidad': 'Paternidad',
    'duelo': 'Duelo',
    'express': 'Express',
    'otro': 'Otro'
  }
  return types[type] || type
}

onMounted(() => {
  fetchRequests()
  // Refresh every 1 minute
  refreshTimer = setInterval(fetchRequests, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
