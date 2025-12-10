<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Horario en vivo</h1>
        <p class="mt-1 text-sm text-gray-600">Clases en curso ahora mismo por período actual.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          @click="reload" title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Controles de depuración de tiempo -->
    <div v-if="false" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Simular Fecha</label>
          <input type="date" v-model="overrideDate"
            class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Simular Hora</label>
          <input type="time" v-model="overrideTime"
            class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
        <button @click="resetTime"
          class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
          Restablecer a Ahora
        </button>
      </div>
    </div>

    <div class="mt-6">
      <div class="flex items-center gap-3 text-sm text-gray-600">
        <span class="inline-flex items-center gap-2">
          <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ nowLabel }}
          <span v-if="isOverridden" class="text-xs text-orange-600 font-medium">(Simulado)</span>
        </span>
        <span v-if="currentPeriods.length" class="px-2 py-0.5 rounded bg-green-50 text-green-700">{{ currentPeriodRange
        }}</span>
        <span v-else class="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">Fuera de período</span>
      </div>

      <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-if="!currentEntries.length" class="col-span-full p-4 text-center text-gray-500 border rounded">
          No hay clases en curso en este momento.
        </div>
        <div v-for="e in currentEntries" :key="e.id" class="border rounded p-4 flex items-start justify-between">
          <div class="min-w-0">
            <div class="font-semibold truncate" :title="e.assignment?.materia?.nombre">{{ e.assignment?.materia?.nombre
              || '—' }}</div>
            <div class="text-sm text-gray-600 truncate" :title="teacherName(e.assignment)">{{ teacherName(e.assignment)
            }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ aulaName(e.assignment?.aula) }}
              <span v-if="e.attendance_summary?.attendance_taken" class="ml-2 font-medium text-green-600">
                Trabajando con {{ e.attendance_summary.present_count }}/{{ e.attendance_summary.total_students }}
              </span>
              <span v-else-if="e.attendance_summary" class="ml-2 font-medium text-yellow-600">
                Aún sin pasar lista
              </span>
            </div>
          </div>
          <div class="text-xs text-gray-500 ml-4 whitespace-nowrap">{{ currentPeriodRange }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTimetableEntriesStore } from '../../stores/timetable_entries'
import { usePeriodsStore, type Period } from '../../stores/periods'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { formatTime12h } from '../../utils/timeFormat'

const entries = useTimetableEntriesStore()
const periods = usePeriodsStore()
const assignments = useClassAssignmentsStore()
const aulasStore = useAulasStore()

const now = ref<Date>(new Date())
const overrideDate = ref('')
const overrideTime = ref('')
let timer: number | undefined

const effectiveNow = computed(() => {
  if (overrideDate.value && overrideTime.value) {
    const [year, month, day] = overrideDate.value.split('-').map(Number)
    const [hours, minutes] = overrideTime.value.split(':').map(Number)
    if (year && month && day && hours !== undefined && minutes !== undefined) {
      return new Date(year, month - 1, day, hours, minutes)
    }
  }
  return now.value
})

const isOverridden = computed(() => !!(overrideDate.value && overrideTime.value))

const resetTime = () => {
  overrideDate.value = ''
  overrideTime.value = ''
  now.value = new Date()
}

const nowLabel = computed(() => {
  const d = effectiveNow.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.toLocaleDateString()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const diaActual = computed(() => {
  // JS: 0=Dom .. 6=Sáb; App: 1=Lun .. 5=Vie
  const js = effectiveNow.value.getDay()
  return js >= 1 && js <= 5 ? js : -1
})

const parseToMinutes = (hhmm: string) => {
  if (!hhmm) return -1
  const parts = hhmm.split(':')
  if (parts.length < 2) return -1
  const h = parseInt(parts[0]!, 10)
  const m = parseInt(parts[1]!, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return -1
  return h * 60 + m
}

const currentPeriods = computed<Period[]>(() => {
  if (periods.items.length === 0) return []
  const minutes = effectiveNow.value.getHours() * 60 + effectiveNow.value.getMinutes()
  return periods.clases.filter(p => {
    const s = parseToMinutes(p.start_time)
    const e = parseToMinutes(p.end_time)
    // Inclusivo al inicio, exclusivo al final
    return minutes >= s && minutes < e
  })
})

const currentPeriodRange = computed(() => {
  if (!currentPeriods.value.length) return ''
  const p = currentPeriods.value[0]!
  return `${formatTime12h(p.start_time)} - ${formatTime12h(p.end_time)}`
})

const teacherName = (a?: ClassAssignment) => a?.profesor ? `${a.profesor.nombre} ${a.profesor.apellido}` : '—'
const aulaName = (a?: Aula) => {
  if (!a) return '—'
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${a.id}`
}

const currentEntries = computed(() => {
  if (diaActual.value === -1 || !currentPeriods.value.length) return []
  const ids = new Set(currentPeriods.value.map(p => p.id))
  return entries.items.filter(e => e.dia === diaActual.value && ids.has(e.period_id))
})

const reload = async () => {
  if (periods.items.length === 0) await periods.fetchAll()
  if (aulasStore.items.length === 0) await aulasStore.fetchAll()
  const d = diaActual.value
  // Formato YYYY-MM-DD local
  const dateStr = effectiveNow.value.toLocaleDateString('en-CA')

  await entries.fetchAll({
    dia: d >= 1 ? d : undefined,
    anio_lectivo: assignments.anioLectivo,
    include_attendance: true,
    date: dateStr
  })
}

onMounted(async () => {
  await reload()
  timer = window.setInterval(async () => {
    now.value = new Date()
    // Refresca entradas cada 5 minutos para captar cambios del backend
    if (now.value.getMinutes() % 5 === 0) {
      const d = diaActual.value
      const dateStr = effectiveNow.value.toLocaleDateString('en-CA')
      await entries.fetchAll({
        dia: d >= 1 ? d : undefined,
        anio_lectivo: assignments.anioLectivo,
        include_attendance: true,
        date: dateStr
      })
    }
  }, 60 * 1000)
})

watch([overrideDate, overrideTime], async () => {
  if (overrideDate.value && overrideTime.value) {
    await reload()
  }
})

watch(diaActual, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await reload()
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped></style>
