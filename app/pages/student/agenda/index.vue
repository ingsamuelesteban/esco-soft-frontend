<template>
  <div class="h-full flex flex-col p-4 sm:p-6 lg:p-8">
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda Escolar</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Consulta las actividades de tu institución.</p>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <select v-model="selectedAnioLectivoId" class="block w-full sm:w-auto rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">{{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}</option>
        </select>
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
    <div class="flex-grow overflow-hidden">
      <AgendaCalendar
        ref="agendaCalendar"
        :events="events"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '~/utils/api'
import AgendaCalendar from '~/components/AgendaCalendar.client.vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'student'
})

const agendaCalendar = ref(null)
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
</script>
