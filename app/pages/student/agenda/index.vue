<template>
  <div class="h-full flex flex-col p-4 sm:p-6 lg:p-8">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Agenda Escolar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Consulta tus actividades, eventos y feriados.</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Selector Año Lectivo -->
        <select v-model="academicYear" class="block w-full sm:w-auto rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          <option value="2024-2025">Año Lectivo 2024-2025</option>
          <option value="2023-2024">Año Lectivo 2023-2024</option>
        </select>
        
        <!-- Leyendas -->
        <div class="flex items-center gap-3 text-sm">
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            <span class="text-gray-700 dark:text-gray-300">Actividades</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <span class="text-gray-700 dark:text-gray-300">Feriados</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="flex-grow bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Added a wrapper to ensure FullCalendar handles height correctly -->
      <div class="h-full min-h-[600px]">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

definePageMeta({
  layout: 'student',
  middleware: ['auth']
})
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

// Check breakpoints for responsive view
import { useMediaQuery } from '@vueuse/core'
const isDesktop = useMediaQuery('(min-width: 768px)')

const fullCalendar = ref(null)
const academicYear = ref('2024-2025')

// Solo eventos públicos
const events = ref([
  { id: '1', title: 'Inicio de Clases', start: '2024-09-01', backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  { id: '2', title: 'Día de la Independencia', start: '2024-10-09', backgroundColor: '#f59e0b', borderColor: '#d97706', allDay: true }
])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: isDesktop.value ? 'dayGridMonth' : 'listMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: isDesktop.value ? 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' : 'listMonth,listWeek'
  },
  events: events.value,
  editable: false, // Solo lectura
  selectable: false, // Solo lectura
  height: '100%',
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Agenda'
  }
}))

// Re-render when view changes based on breakpoint
watch(isDesktop, (newVal) => {
  const calendarApi = fullCalendar.value?.getApi()
  if (calendarApi) {
    if (newVal) {
      calendarApi.changeView('dayGridMonth')
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      })
    } else {
      calendarApi.changeView('listMonth')
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        right: 'listMonth,listWeek'
      })
    }
  }
})
</script>

<style>
/* Fullcalendar text color for buttons and titles to ensure they look good in dark mode */
.fc-theme-standard .fc-toolbar-title {
  @apply text-gray-900 dark:text-gray-100;
}
.fc-theme-standard .fc-button {
  @apply bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 capitalize;
}
.fc-theme-standard .fc-button:hover {
  @apply bg-gray-200 dark:bg-gray-600;
}
.fc-theme-standard .fc-button-primary:not(:disabled).fc-button-active, 
.fc-theme-standard .fc-button-primary:not(:disabled):active {
  @apply bg-blue-600 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-600;
}
.fc-theme-standard .fc-col-header-cell-cushion {
  @apply text-gray-900 dark:text-gray-200;
}
.fc-theme-standard .fc-daygrid-day-number {
  @apply text-gray-900 dark:text-gray-300;
}
.fc-theme-standard td, .fc-theme-standard th {
  @apply border-gray-200 dark:border-gray-700;
}
</style>
