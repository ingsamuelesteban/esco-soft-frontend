<template>
  <div class="fixed inset-0 w-screen h-screen bg-gray-950 text-white overflow-hidden p-6 flex flex-col justify-between z-50"
    @mousemove="handleMouseMove" :class="{ 'cursor-none': isCursorHidden }">

    <!-- Botón de Pantalla Completa Flotante -->
    <button
      @click="toggleFullscreen"
      class="fixed top-6 right-6 z-50 p-3 bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 rounded-xl shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300"
      :class="{ 'opacity-0 pointer-events-none': isCursorHidden, 'opacity-100': !isCursorHidden }"
      :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla Completa'">
      <svg v-if="!isFullscreen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
      <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Cabecera Ejecutiva -->
    <header class="flex justify-between items-start mb-8">
      <div>
        <div class="text-6xl md:text-8xl font-black text-white tracking-tight leading-none mb-4">
          {{ formattedTime }}
        </div>
        <div class="text-2xl md:text-3xl font-semibold text-gray-400 capitalize flex items-center gap-4">
          {{ formattedDate }}
          
          <div v-if="isOffline" class="flex items-center gap-2 text-red-500 text-lg bg-red-950/50 px-3 py-1 rounded-full border border-red-900">
            <svg class="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Sin Conexión
          </div>
        </div>
      </div>
      
      <div class="text-right flex flex-col items-end">
        <div v-if="currentPeriods.length" class="px-6 py-3 rounded-2xl font-bold text-2xl border-2" :class="statusClass">
          {{ statusLabel }}
        </div>
        <div v-else class="px-6 py-3 rounded-2xl font-bold text-2xl bg-gray-900 border border-gray-700 text-gray-400">
          Fuera de período
        </div>
        
        <!-- Paginación Indicador -->
        <div v-if="totalPages > 1" class="mt-4 text-xl font-medium text-gray-500">
          Mostrando página {{ currentPage + 1 }} de {{ totalPages }}
        </div>
      </div>
    </header>

    <!-- Cuadrícula de Aulas y Clases en Vivo -->
    <main class="flex-1 my-6 relative min-h-[500px] flex flex-col">
      <div v-if="isRecessOrIdle" class="flex-1 flex flex-col items-center justify-center my-auto">
        <!-- Video si existe URL -->
        <video
          v-if="idleVideoUrl"
          :src="idleVideoUrl"
          autoplay
          loop
          muted
          playsinline
          class="max-w-xl max-h-[55vh] object-contain mx-auto rounded-2xl shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        ></video>

        <!-- Fallback si no hay video cargado -->
        <div v-else class="text-center text-gray-400">
          <img v-if="safeLogoUrl" :src="safeLogoUrl" class="max-w-md max-h-[40vh] object-contain mx-auto opacity-70 mb-8" alt="Logo Institucional">
          <p class="text-4xl font-bold text-white mb-4">{{ statusTitle }}</p>
          <p class="text-2xl text-gray-400">{{ statusSubtitle }}</p>
        </div>
      </div>
      
      <TransitionGroup v-else name="fade" tag="div" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        <div v-for="e in paginatedEntries" :key="e.id" 
          class="bg-gray-900/90 rounded-2xl p-6 border flex flex-col justify-between"
          :class="isClassActive(e) ? 'border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-gray-800 shadow-xl'">
          
          <div class="mb-4">
            <h2 class="text-3xl xl:text-4xl font-extrabold text-white truncate" :title="e.assignment?.materia?.nombre">
              {{ e.assignment?.materia?.nombre || '—' }}
            </h2>
          </div>
          
          <div>
            <div class="text-xl xl:text-2xl font-medium text-emerald-400 truncate mb-1">
              {{ teacherName(e.assignment) }}
            </div>
            <div class="text-lg text-gray-400 flex justify-between items-center">
              <span>{{ aulaName(e.assignment?.aula) }}</span>
              <span class="text-sm font-mono opacity-60">{{ currentPeriodRange }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </main>

    <!-- Indicador Puntos de Paginación -->
    <footer v-if="totalPages > 1" class="flex justify-center gap-3 mt-4">
      <div v-for="p in totalPages" :key="p" 
        class="w-3 h-3 rounded-full transition-colors duration-500"
        :class="p - 1 === currentPage ? 'bg-white' : 'bg-gray-700'">
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTimetableEntriesStore } from '../../stores/timetable_entries'
import { usePeriodsStore, type Period } from '../../stores/periods'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { useAniosLectivosStore } from '../../stores/anios_lectivos'
import { useAuthStore } from '../../stores/auth'
import { formatTime12h } from '../../utils/timeFormat'

definePageMeta({ layout: false })

const entries = useTimetableEntriesStore()
const periods = usePeriodsStore()
const assignments = useClassAssignmentsStore()
const aulasStore = useAulasStore()
const aniosStore = useAniosLectivosStore()
const authStore = useAuthStore()

const tenant = computed(() => authStore.tenant)

const now = ref(new Date())
const isOffline = ref(false)

// ── Clock & Date ────────────────────────────────────────────────────────
let clockTimer: number | undefined
let dataTimer: number | undefined
let restartTimer: number | undefined
let paginationTimer: number | undefined
let mouseTimer: number | undefined

const formattedTime = computed(() => {
  const d = now.value
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes}:${seconds} ${ampm}`
})

const formattedDate = computed(() => {
  return now.value.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// ── Periods & Data ────────────────────────────────────────────────────────
const parseToMinutes = (hhmm: string) => {
  if (!hhmm) return -1
  const parts = hhmm.split(':')
  if (parts.length < 2) return -1
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return -1
  return h * 60 + m
}

const currentPeriods = computed<Period[]>(() => {
  if (periods.items.length === 0) return []
  const minutes = now.value.getHours() * 60 + now.value.getMinutes()
  return periods.items
    .filter(p => p.is_active)
    .filter(p => {
      const s = parseToMinutes(p.start_time)
      const e = parseToMinutes(p.end_time)
      return minutes >= s && minutes < e
    })
})

const currentPeriodRange = computed(() => {
  if (!currentPeriods.value.length) return ''
  const p = currentPeriods.value[0]!
  const range = `${formatTime12h(p.start_time)} - ${formatTime12h(p.end_time)}`
  if (p.type === 'break') {
    return `Receso: ${range}`
  }
  return range
})

const statusLabel = computed(() => {
  if (!currentPeriods.value.length) return ''
  const p = currentPeriods.value[0]!
  if (p.type === 'break') return 'Receso Escolar'
  return `Bloque en Curso: ${currentPeriodRange.value}`
})

const statusClass = computed(() => {
  if (!currentPeriods.value.length) return ''
  const p = currentPeriods.value[0]!
  if (p.type === 'break') return 'bg-orange-950/50 border-orange-600 text-orange-400'
  return 'bg-emerald-950/50 border-emerald-600 text-emerald-400'
})

const diaActual = computed(() => {
  const js = now.value.getDay()
  return js >= 1 && js <= 5 ? js : -1
})

const currentEntries = computed(() => {
  if (diaActual.value === -1 || !currentPeriods.value.length) return []
  const ids = new Set(currentPeriods.value.map(p => p.id))
  return entries.items.filter(e => e.dia === diaActual.value && ids.has(e.period_id))
})

const isRecessOrIdle = computed(() => {
  return currentEntries.value.length === 0
})

const idleVideoUrl = computed(() => {
  let url = tenant.value?.display_idle_video_url
  if (url && url.startsWith('http://') && !url.includes('localhost')) {
    url = url.replace('http://', 'https://')
  }
  console.log('Video URL:', url)
  return url || null
})

const safeLogoUrl = computed(() => {
  let url = tenant.value?.logo_url
  if (url && url.startsWith('http://') && !url.includes('localhost')) {
    url = url.replace('http://', 'https://')
  }
  return url || null
})

const statusTitle = computed(() => {
  if (currentPeriods.value.length && currentPeriods.value[0].type === 'break') {
    return '¡Hora de Receso!'
  }
  return 'Jornada Académica Finalizada'
})

const statusSubtitle = computed(() => {
  if (currentPeriods.value.length && currentPeriods.value[0].type === 'break') {
    return 'Las clases se reanudarán en el siguiente bloque.'
  }
  return 'El horario se reanudará en el próximo bloque escolar.'
})

const teacherName = (a?: ClassAssignment) => a?.profesor ? `${a.profesor.nombre} ${a.profesor.apellido}` : '—'
const aulaName = (a?: Aula) => {
  if (!a) return '—'
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${a.id}`
}

const isClassActive = (entry: any) => {
  return true // All currentEntries are active by definition
}

// ── Pagination (Carousel) ────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12
const currentPage = ref(0)

const totalPages = computed(() => Math.ceil(currentEntries.value.length / ITEMS_PER_PAGE))

const paginatedEntries = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE
  return currentEntries.value.slice(start, start + ITEMS_PER_PAGE)
})

const cyclePagination = () => {
  if (totalPages.value > 1) {
    currentPage.value = (currentPage.value + 1) % totalPages.value
  } else {
    currentPage.value = 0
  }
}

// ── Fullscreen & Cursor Hide ────────────────────────────────────────────────────────
const isFullscreen = ref(false)
const isCursorHidden = ref(false)

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Error attempting to enable fullscreen: ${err.message}`)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const handleMouseMove = () => {
  isCursorHidden.value = false
  if (mouseTimer) clearTimeout(mouseTimer)
  mouseTimer = window.setTimeout(() => {
    isCursorHidden.value = true
  }, 3000)
}

// ── Data Fetching ────────────────────────────────────────────────────────
const loadData = async () => {
  try {
    if (periods.items.length === 0) await periods.fetchAll()
    if (aulasStore.items.length === 0) await aulasStore.fetchAll()

    if (!assignments.anioLectivoId) {
      const activeYear = aniosStore.items.find(a => a.activo)
      if (activeYear) {
        assignments.anioLectivoId = activeYear.id
      } else {
        await aniosStore.fetchAll({ activo: true })
        const fetchedActive = aniosStore.items.find(a => a.activo) || aniosStore.items[0]
        if (fetchedActive) {
          assignments.anioLectivoId = fetchedActive.id
        }
      }
    }

    const d = diaActual.value
    const dateStr = now.value.toLocaleDateString('en-CA')

    await entries.fetchAll({
      dia: d >= 1 ? d : undefined,
      anio_lectivo_id: assignments.anioLectivoId || undefined,
      include_attendance: true,
      date: dateStr
    })
    
    isOffline.value = false
  } catch (error: any) {
    console.error("Error loading data:", error)
    if (error?.response?.status === 401 || error?.statusCode === 401 || error?.status === 401) {
      window.location.href = '/login'
      return
    }
    isOffline.value = true
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => {
  // Inicialización de datos
  loadData()

  // Reloj fluido (cada 1s)
  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)

  // Fetch de datos (cada 60s)
  dataTimer = window.setInterval(loadData, 60 * 1000)

  // Carrusel de paginación (cada 12s)
  paginationTimer = window.setInterval(cyclePagination, 12 * 1000)

  // Auto-reload a las 3:00 AM para prevenir memory leaks
  restartTimer = window.setInterval(() => {
    const d = new Date()
    if (d.getHours() === 3 && d.getMinutes() === 0 && d.getSeconds() < 10) {
      window.location.reload()
    }
  }, 10 * 1000)

  // Event Listeners
  document.addEventListener('fullscreenchange', onFullscreenChange)
  handleMouseMove() // Iniciar auto-hide cursor
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (dataTimer) clearInterval(dataTimer)
  if (paginationTimer) clearInterval(paginationTimer)
  if (restartTimer) clearInterval(restartTimer)
  if (mouseTimer) clearTimeout(mouseTimer)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
/* Transición Fade para el Carrusel */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-active {
  position: absolute;
}
</style>
