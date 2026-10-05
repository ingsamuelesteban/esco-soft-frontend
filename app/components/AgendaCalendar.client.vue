<template>
  <div class="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 text-gray-100 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-2">
        <button
          @click="prevMonth"
          type="button"
          class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-semibold transition"
          title="Mes anterior"
        >
          &lt;
        </button>
        <button
          @click="nextMonth"
          type="button"
          class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-semibold transition"
          title="Mes siguiente"
        >
          &gt;
        </button>
        <button
          @click="goToday"
          type="button"
          class="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
        >
          Hoy
        </button>
      </div>
      <h2 class="text-xl font-bold tracking-wide text-white capitalize">
        {{ currentMonthName }} {{ currentYear }}
      </h2>
      <div class="inline-flex rounded-lg bg-gray-800 p-1 border border-gray-700 text-sm">
        <span class="px-3 py-1 bg-primary-600 text-white rounded-md font-medium">Mes</span>
      </div>
    </div>
    
    <div class="border border-gray-700 rounded-lg overflow-hidden bg-gray-950">
      <div class="grid grid-cols-7 border-b border-gray-700 bg-gray-800/80 text-center text-xs font-semibold text-gray-400 py-3 uppercase tracking-wider">
        <div>Do</div>
        <div>Lu</div>
        <div>Ma</div>
        <div>Mi</div>
        <div>Ju</div>
        <div>Vi</div>
        <div>Sa</div>
      </div>
      <div class="grid grid-cols-7 divide-x divide-y divide-gray-700 bg-gray-900">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          @click="onDayClick(day)"
          class="transition relative flex flex-col justify-between cursor-pointer hover:bg-gray-800/60"
          :class="[
            compact ? 'min-h-[75px] p-1' : 'min-h-[110px] p-2',
            !day.isCurrentMonth ? 'bg-gray-950/60 text-gray-600' : '',
            day.isToday ? 'bg-blue-950/20' : ''
          ]"
        >
          <div class="flex justify-between items-center mb-1">
            <span 
              class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
              :class="{
                'bg-primary-600 text-white': day.isToday,
                'text-gray-200': day.isCurrentMonth && !day.isToday,
                'text-gray-600': !day.isCurrentMonth
              }"
            >
              {{ day.dayNumber }}
            </span>
          </div>
          
          <div class="flex-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
            <div
              v-for="evt in getEventsForDay(day.dateString)"
              :key="evt.id"
              @click.stop="onEventClick(evt)"
              class="text-xs px-2 py-0.5 rounded font-medium truncate shadow-sm transition hover:brightness-110"
              :style="{ backgroundColor: evt.color || '#2563eb', color: '#ffffff' }"
              :title="evt.title"
            >
              {{ evt.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  events: Array<any>
  compact?: boolean
}>()

const emit = defineEmits(['event-click', 'date-select'])

const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', { month: 'long' })
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}
const goToday = () => {
  currentDate.value = new Date()
}

interface CalendarDay {
  dayNumber: number
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = currentYear.value
  const month = currentMonth.value
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const firstDayIndex = new Date(year, month, 1).getDay()
  const lastDayCurrentMonth = new Date(year, month + 1, 0).getDate()
  const lastDayPrevMonth = new Date(year, month, 0).getDate()
  
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = lastDayPrevMonth - i
    const prevM = month === 0 ? 12 : month
    const prevY = month === 0 ? year - 1 : year
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    })
  }
  
  for (let d = 1; d <= lastDayCurrentMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr
    })
  }
  
  const totalCells = days.length <= 35 ? 35 : 42
  const nextDaysNeeded = totalCells - days.length
  
  for (let d = 1; d <= nextDaysNeeded; d++) {
    const nextM = month + 2 > 12 ? 1 : month + 2
    const nextY = month + 2 > 12 ? year + 1 : year
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    })
  }
  
  return days
})

const getEventsForDay = (dateStr: string) => {
  if (!props.events || !Array.isArray(props.events)) return []
  return props.events.filter(evt => {
    if (!evt.start) return false
    // Also handle dates with time components
    return evt.start.startsWith(dateStr)
  })
}

const onDayClick = (day: CalendarDay) => {
  emit('date-select', { dateStr: day.dateString })
}

const onEventClick = (event: any) => {
  emit('event-click', { event })
}

defineExpose({
  refetchEvents: () => {
    // Parent components call this, but Native calendar reactively updates based on props.events
  }
})
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
