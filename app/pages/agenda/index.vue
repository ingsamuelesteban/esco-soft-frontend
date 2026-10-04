<template>
  <div class="h-full flex flex-col p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda Escolar</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona las actividades institucionales y personales.</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Selector Año Lectivo -->
        <select v-model="selectedAnioLectivoId" class="block w-full sm:w-auto rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">{{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}</option>
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
        <AgendaCalendar
          ref="agendaCalendar"
          :fetch-events="fetchEvents"
          :editable="true"
          :selectable="true"
          @date-select="handleDateSelect"
          @event-click="handleEventClick"
        />
      </div>
    </div>

    <AgendaActivityModal v-model="isModalOpen" :anioLectivoId="selectedAnioLectivoId" @created="agendaCalendar.refetchEvents()" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import AgendaCalendar from '~/components/AgendaCalendar.client.vue'
import AgendaActivityModal from '~/components/AgendaActivityModal.vue'

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
if (authStore.user?.role === 'Estudiante') {
  navigateTo('/student/agenda')
}

const agendaCalendar = ref(null)
const isModalOpen = ref(false)
const selectedAnioLectivoId = ref(null)
const aniosLectivos = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/api/anios-lectivos')
    aniosLectivos.value = Array.isArray(response) ? response : (response?.data || [])
    const activeYear = aniosLectivos.value.find(a => a.activo)
    if (activeYear) selectedAnioLectivoId.value = activeYear.id
    else if (aniosLectivos.value.length > 0) selectedAnioLectivoId.value = aniosLectivos.value[0].id
  } catch(e) { console.error('Error fetching anios lectivos', e) }
})

watch(selectedAnioLectivoId, () => { 
  if (agendaCalendar.value) { 
    agendaCalendar.value.refetchEvents() 
  } 
})

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

const openModal = () => {
  isModalOpen.value = true
}

const handleDateSelect = (selectInfo) => {
  openModal()
}

const handleEventClick = (clickInfo) => {
  openModal()
}
</script>
