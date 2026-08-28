<template>
  <div class="fixed inset-0 w-screen h-screen text-white overflow-hidden p-6 flex flex-col z-50 transition-colors duration-500"
    :style="{ backgroundColor: tenant?.display_bg_color || '#030712' }"
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

    <!-- ═══ CABECERA ═══ -->
    <header class="flex-shrink-0 flex justify-between items-start mb-3">
      <div>
        <div class="text-6xl font-black text-white tracking-tight leading-none mb-2">
          {{ formattedTime }}
        </div>
        <div class="text-2xl font-semibold text-gray-400 capitalize flex items-center gap-4">
          {{ formattedDate }}
          <div v-if="isOffline" class="flex items-center gap-2 text-red-500 text-lg bg-red-950/50 px-3 py-1 rounded-full border border-red-900">
            <svg class="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Sin Conexión
          </div>
        </div>
      </div>

      <div class="text-right flex flex-col items-end gap-3">
        <div v-if="currentPeriods.length" class="px-6 py-3 rounded-2xl font-bold text-2xl border-2" :class="statusClass">
          {{ statusLabel }}
        </div>
        <div v-else class="px-6 py-3 rounded-2xl font-bold text-2xl bg-gray-900 border border-gray-700 text-gray-400">
          Fuera de período
        </div>
        <!-- Indicador de Páginas -->
        <span v-if="totalPages > 1" class="text-sm bg-white/10 px-3 py-1 rounded-full text-white/80">
          Pantalla {{ currentPage + 1 }} de {{ totalPages }}
        </span>
      </div>
    </header>

    <!-- ═══ MAIN: Estado de Receso / Cuadrícula 4×2 ═══ -->
    <main class="flex-1 w-full min-h-0 flex flex-col">

      <!-- Estado de receso o sin clases -->
      <div v-if="isRecessOrIdle" class="flex-1 flex flex-col items-center justify-center">
        <video
          v-if="idleVideoUrl"
          :src="idleVideoUrl"
          autoplay loop muted playsinline
          class="max-w-xl max-h-[55vh] object-contain mx-auto rounded-2xl shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        ></video>
        <div v-else class="text-center text-gray-400">
          <img v-if="safeLogoUrl" :src="safeLogoUrl" class="max-w-md max-h-[40vh] object-contain mx-auto opacity-70 mb-8" alt="Logo Institucional">
          <p class="text-4xl font-bold text-white mb-4">{{ statusTitle }}</p>
          <p class="text-2xl text-gray-400">{{ statusSubtitle }}</p>
        </div>
      </div>

      <!-- ═══ GRID RÍGIDO 4 COLUMNAS × 2 FILAS ═══ -->
      <!-- Sin breakpoints variables: siempre 4 cols. El carrusel limita a max 8 tarjetas. -->
      <div
        v-else
        class="flex-1 w-full grid grid-cols-4 grid-rows-2 gap-4 min-h-0"
      >
        <div
          v-for="e in paginatedEntries"
          :key="e.id"
          class="bg-gray-900/90 border border-emerald-500/60 rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-lg min-h-0"
        >
          <!-- Cabecera de la Card -->
          <div class="min-h-0 flex-1">
            <h3
              class="font-bold text-white leading-tight line-clamp-2"
              :class="getSubjectTextSize(e.assignment?.materia?.nombre)"
              :title="e.assignment?.materia?.nombre"
            >
              {{ e.assignment?.materia?.nombre || '—' }}
            </h3>
            <p class="text-sm text-gray-300 font-medium mt-1 truncate">
              {{ teacherName(e.assignment) }}
            </p>
            <p class="text-xs text-emerald-400 truncate">
              {{ aulaName(e.assignment?.aula) }}
              <span v-if="currentPeriodRange" class="text-gray-500 ml-1">· {{ currentPeriodRange }}</span>
            </p>
          </div>

          <!-- Pie de la Card: Estado de Asistencia -->
          <div class="pt-2 border-t border-gray-800/80 mt-2 flex items-center justify-between text-xs">
            <div v-if="e.asistencia_tomada" class="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
              <span class="truncate">Con {{ e.estudiantes_presentes }}/{{ e.total_estudiantes }}</span>
            </div>
            <div v-else class="flex items-center gap-1.5 text-amber-400/90 font-medium truncate">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
              <span class="truncate">Sin pasar lista ({{ e.total_estudiantes }})</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ═══ FOOTER: Puntos de Paginación ═══ -->
    <footer class="flex-shrink-0 flex justify-center gap-3 mt-3">
      <div
        v-for="p in totalPages"
        :key="p"
        class="w-3 h-3 rounded-full transition-colors duration-500"
        :class="p - 1 === currentPage ? 'bg-white' : 'bg-gray-700'"
      ></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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

const resolveMediaUrl = (url?: string) => {
  if (!url) return null
  if (url.startsWith('http')) {
    // If it's already absolute (e.g. from an external source or S3), just ensure HTTPS if not localhost
    if (url.startsWith('http://') && !url.includes('localhost')) {
      return url.replace('http://', 'https://')
    }
    return url
  }
  
  // If it's a relative path from the backend storage
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  const path = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${path}`
}

const idleVideoUrl = computed(() => {
  const url = resolveMediaUrl(tenant.value?.display_idle_video_url)
  console.log('Video URL resolved:', url)
  return url
})

const safeLogoUrl = computed(() => {
  return resolveMediaUrl(tenant.value?.logo_url)
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

const getSubjectTextSize = (name?: string) => {
  if (!name) return 'text-xl'
  if (name.length > 45) return 'text-base'
  if (name.length > 25) return 'text-lg'
  return 'text-xl'
}

// ── Pagination / Carrusel (máx 8 elementos en pantalla) ────────────────────────
const ITEMS_PER_PAGE = 8
const currentPage = ref(0)
let carouselTimer: ReturnType<typeof setInterval> | null = null

const totalPages = computed(() =>
  Math.ceil(currentEntries.value.length / ITEMS_PER_PAGE) || 1
)

// Alias para el template (nombre coherente con la spec del carrusel)
const currentPageItems = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE
  return currentEntries.value.slice(start, start + ITEMS_PER_PAGE)
})

// Mantener alias para compatibilidad (el template usa paginatedEntries en el v-for)
const paginatedEntries = currentPageItems

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

const startCarousel = () => {
  stopCarousel()
  if (totalPages.value > 1) {
    carouselTimer = setInterval(() => {
      currentPage.value = (currentPage.value + 1) % totalPages.value
    }, 12_000) // 12 segundos por pantalla
  }
}

// Reiniciar a página 0 y reanudar carrusel cuando cambian los datos
watch(currentEntries, () => {
  currentPage.value = 0
  startCarousel()
})


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

  // Arrancar carrusel (se detiene y reinicia automáticamente al cambiar currentEntries via watch)
  startCarousel()

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
  stopCarousel()
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
