<template>
  <div class="h-full flex flex-col p-4 sm:p-6 lg:p-8">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Agenda Escolar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Consulta tus actividades, eventos y feriados.</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Selector AÃ±o Lectivo -->
        <select v-model="selectedAnioLectivoId" class="block w-full sm:w-auto rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"><option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">{{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}</option></select>
        
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
        <ClientOnly>
          <FullCalendar ref="fullCalendar" :options="calendarOptions" />
        </ClientOnly>
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
const selectedAnioLectivoId = ref(null)
const aniosLectivos = ref([])
import { api } from '~/utils/api'
import { onMounted } from 'vue'
onMounted(async () => {
  try {
    const response = await api.get('/api/anios-lectivos')
    aniosLectivos.value = Array.isArray(response) ? response : (response?.data || [])
    const activeYear = aniosLectivos.value.find(a => a.activo)
    if (activeYear) selectedAnioLectivoId.value = activeYear.id
    else if (aniosLectivos.value.length > 0) selectedAnioLectivoId.value = aniosLectivos.value[0].id
  } catch(e) { console.error('Error fetching anios lectivos', e) }
})

// Solo eventos pÃºblicos
watch(selectedAnioLectivoId, () => { if (fullCalendar.value) { fullCalendar.value.getApi().refetchEvents() } })

const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
  if (!selectedAnioLectivoId.value) {
    successCallback([]);
    return;
  }
  try {
    const start = fetchInfo.startStr;
    const end = fetchInfo.endStr;
    const response = await api.get('/api/v1/agenda', {
      params: {
        anio_lectivo_id: selectedAnioLectivoId.value,
        start,
        end
      }
    });
    const fetchedEvents = Array.isArray(response) ? response : (response?.data || []);
    successCallback(fetchedEvents);
  } catch (e) {
    console.error(e);
    failureCallback(e);
  }
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: isDesktop.value ? 'dayGridMonth' : 'listMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: isDesktop.value ? 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' : 'listMonth,listWeek'
  },
  events: fetchEvents,
  editable: false, // Solo lectura
  selectable: false,
    height: 'auto', // Solo lectura
  height: '100%',
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'DÃ­a',
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





