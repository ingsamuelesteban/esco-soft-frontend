<template>
  <div class="h-full">
    <div v-if="!isLoaded" class="flex justify-center items-center h-[600px] text-gray-500">
      <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Cargando calendario...
    </div>
    <div ref="calendarEl" :class="{'hidden': !isLoaded}"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps({
  fetchEvents: { type: Function, required: true },
  editable: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false }
})

const emit = defineEmits(['date-select', 'event-click'])

const isDesktop = useMediaQuery('(min-width: 768px)')
const calendarEl = ref(null)
let calendar = null
const isLoaded = ref(false)

onMounted(async () => {
  // Load core and plugins dynamically to avoid SSR/Vite issues
  const { Calendar } = await import('@fullcalendar/core')
  const { default: dayGridPlugin } = await import('@fullcalendar/daygrid')
  const { default: timeGridPlugin } = await import('@fullcalendar/timegrid')
  const { default: listPlugin } = await import('@fullcalendar/list')
  const { default: interactionPlugin } = await import('@fullcalendar/interaction')

  if (calendarEl.value) {
    calendar = new Calendar(calendarEl.value, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: isDesktop.value ? 'dayGridMonth' : 'listMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: isDesktop.value ? 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' : 'listMonth,listWeek'
      },
      events: props.fetchEvents,
      editable: props.editable,
      selectable: props.selectable,
      height: 'auto',
      locale: 'es',
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Agenda'
      },
      select: (info) => emit('date-select', info),
      eventClick: (info) => emit('event-click', info),
      eventContent: (arg) => {
        if (!arg.event.extendedProps?.es_privada) return undefined;
        const content = document.createElement('div');
        content.className = 'fc-event-main-frame w-full flex items-center overflow-hidden';
        let innerHTML = '';
        if (arg.timeText) {
          innerHTML += `<div class="fc-event-time mr-1 font-semibold text-xs whitespace-nowrap">${arg.timeText}</div>`;
        }
        innerHTML += `<div class="fc-event-title-container truncate text-xs flex items-center"><span class="mr-1" title="Privado">🔒</span><span class="truncate">${arg.event.title}</span></div>`;
        content.innerHTML = innerHTML;
        return { domNodes: [content] };
      }
    })
    
    calendar.render()
    isLoaded.value = true
  }
})

watch(isDesktop, (newVal) => {
  if (!isLoaded.value || !calendar) return;
  if (newVal) {
    calendar.changeView('dayGridMonth')
    calendar.setOption('headerToolbar', {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    })
  } else {
    calendar.changeView('listMonth')
    calendar.setOption('headerToolbar', {
      left: 'prev,next today',
      center: 'title',
      right: 'listMonth,listWeek'
    })
  }
})

onBeforeUnmount(() => {
  if (calendar) {
    calendar.destroy()
  }
})

defineExpose({
  refetchEvents: () => {
    if (calendar) {
      calendar.refetchEvents()
    }
  }
})
</script>

<style>
.fc { width: 100%; }
.fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb; }
.dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151; }

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
