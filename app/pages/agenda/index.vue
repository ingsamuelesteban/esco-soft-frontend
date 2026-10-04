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
    <div class="flex-grow overflow-hidden">
      <AgendaCalendar
        ref="agendaCalendar"
        :events="events"
        @date-select="handleDateSelect"
        @event-click="handleEventClick"
      />
    </div>

    <AgendaActivityModal v-model="isModalOpen" :activity="selectedActivity" :anioLectivoId="selectedAnioLectivoId" @created="loadEvents()" />
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
const events = ref([])

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
  loadEvents()
})

const loadEvents = async () => {
  if (!selectedAnioLectivoId.value) return;
  try {
    // We pass arbitrary large dates to fetch all for the year, since native calendar handles current view locally
    const response = await api.get('/api/v1/agenda', {
      params: {
        anio_lectivo_id: selectedAnioLectivoId.value,
        start: '2000-01-01',
        end: '2050-12-31'
      }
    });
    events.value = Array.isArray(response) ? response : (response?.data || []);
  } catch (e) {
    console.error(e);
  }
}

const selectedActivity = ref(null)

const openModal = () => {
  isModalOpen.value = true
}

const handleDateSelect = (selectInfo) => {
  selectedActivity.value = null
  openModal()
}

const handleEventClick = (payload) => {
  const activity = payload.event || payload
  selectedActivity.value = {
    id: activity.id,
    titulo: activity.title || activity.titulo,
    descripcion: activity.descripcion || '',
    fecha_inicio: activity.start || activity.fecha_inicio,
    fecha_fin: activity.end || activity.fecha_fin || '',
    tipo_actividad: activity.tipo_actividad || 'general',
    color: activity.color || '#2563eb',
    es_privada: Boolean(activity.es_privada),
    visible_para_estudiantes: Boolean(activity.visible_para_estudiantes),
    alerta_1: activity.alerta_1_minutos_antes || null,
    alerta_2: activity.alerta_2_minutos_antes || null,
  }
  openModal()
}
</script>

