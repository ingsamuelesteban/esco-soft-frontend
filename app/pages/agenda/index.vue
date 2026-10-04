<template>
  <div class="h-full flex flex-col p-4 sm:p-6 lg:p-8">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda Escolar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona las actividades y eventos institucionales.</p>
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

        <button @click="openModal" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 w-full sm:w-auto">
          + Nueva Actividad
        </button>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="flex-grow bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Added a wrapper to ensure FullCalendar handles height correctly -->
      <div class="h-full min-h-[600px]">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </div>

    <AgendaActivityModal v-model="isModalOpen" @save="saveActivity" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, shallowRef } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
if (authStore.user?.role === 'Estudiante') {
  navigateTo('/student/agenda')
}
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'

// Check breakpoints for responsive view
import { useMediaQuery } from '@vueuse/core'
const isDesktop = useMediaQuery('(min-width: 768px)')

const fullCalendar = ref(null)
const isModalOpen = ref(false)
const academicYear = ref('2024-2025')

const events = ref([
  { id: '1', title: 'Inicio de Clases', start: '2024-09-01', backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  { id: '2', title: 'Día de la Independencia', start: '2024-10-09', backgroundColor: '#f59e0b', borderColor: '#d97706', allDay: true }
])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: isDesktop.value ? 'dayGridMonth' : 'listMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: isDesktop.value ? 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' : 'listMonth,listWeek'
  },
  events: events.value,
  editable: true,
  selectable: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventContent: (arg) => {
    if (!arg.event.extendedProps?.es_privada) {
      return undefined; // default rendering for non-private events
    }
    
    // Only for private events
    const content = document.createElement('div');
    content.className = 'fc-event-main-frame w-full flex items-center overflow-hidden';
    
    let innerHTML = '';
    if (arg.timeText) {
      innerHTML += `<div class="fc-event-time mr-1 font-semibold text-xs whitespace-nowrap">${arg.timeText}</div>`;
    }
    innerHTML += `<div class="fc-event-title-container truncate text-xs flex items-center"><span class="mr-1" title="Privado">🔒</span><span class="truncate">${arg.event.title}</span></div>`;
    
    content.innerHTML = innerHTML;
    return { domNodes: [content] };
  },
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

const openModal = () => {
  isModalOpen.value = true
}

const handleDateSelect = (selectInfo) => {
  // Could pre-fill modal with dates
  openModal()
}

const handleEventClick = (clickInfo) => {
  // Could open modal for editing
  // clickInfo.event
  openModal()
}

const saveActivity = (activity) => {
  // Save activity logic
  const isPrivate = activity.es_privada;
  events.value.push({
    id: String(Date.now()),
    title: activity.title || 'Nueva Actividad',
    start: activity.startDate,
    backgroundColor: isPrivate ? '#8b5cf6' : '#3b82f6',
    borderColor: isPrivate ? '#7c3aed' : '#2563eb',
    classNames: isPrivate ? ['private-event'] : [],
    extendedProps: {
      es_privada: isPrivate
    }
  })
}
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
.private-event {
  @apply border-dashed !bg-purple-100 !border-purple-400 !text-purple-800 dark:!bg-purple-950/40 dark:!border-purple-800 dark:!text-purple-200;
}
</style>
