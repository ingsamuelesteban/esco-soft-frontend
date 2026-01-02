<template>
  <div class="space-y-6">
    <!-- Bienvenida -->
    <div class="glass-card p-6 rounded-xl flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Hola, {{ dashboardData?.student?.nombres }}</h2>
        <p class="text-gray-600 mt-1">
          Estudiante de {{ dashboardData?.student?.aula_grado }} "{{ dashboardData?.student?.aula_seccion }}" <span
            v-if="dashboardData?.student?.numero_orden">| #{{ dashboardData?.student?.numero_orden }}</span> | Año
          Lectivo: {{ dashboardData?.academic_year }}
        </p>
      </div>
      <div class="hidden sm:block">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Estudiante Activo
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- Calificaciones (3/5 ancho) -->
      <div class="lg:col-span-3 space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mis Calificaciones
        </h3>

        <div v-if="dashboardData?.grades?.length === 0" class="glass-card p-6 text-center text-gray-500">
          No hay calificaciones registradas aún.
        </div>

        <div v-else class="space-y-4">
          <div v-for="subject in dashboardData?.grades" :key="subject.materia_id"
            class="glass-card p-5 hover:shadow-lg transition-shadow duration-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-bold text-gray-800 text-lg">{{ subject.materia }}</h4>
                <span class="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded mt-1 inline-block">Módulo
                  Formativo</span>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold" :class="getScoreColor(subject.promedio)">
                  {{ subject.promedio ? subject.promedio.toFixed(0) : '-' }}
                </div>
                <div class="text-xs text-gray-500">Total</div>
              </div>
            </div>

            <!-- Detalle de notas (RAs) -->
            <div v-if="subject.notas_ra && subject.notas_ra.length > 0">
              <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resultados de Aprendizaje
              </h5>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div v-for="raItem in subject.notas_ra" :key="raItem.ra"
                  class="bg-gray-50 rounded p-2 text-center border border-gray-100 flex flex-col items-center">
                  <div class="text-xs text-gray-500 mb-1">RA {{ raItem.ra }}</div>

                  <!-- Lista de Intentos -->
                  <div class="flex flex-wrap justify-center gap-1">
                    <span v-for="intento in raItem.intentos" :key="intento.id"
                      class="text-xs font-bold px-1.5 py-0.5 rounded border"
                      :class="intento.is_nc ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-800 border-gray-200'">
                      {{ intento.nota }}
                    </span>
                  </div>

                  <div class="text-[10px] text-gray-400 mt-1">/{{ raItem.valor_max }}</div>
                </div>
              </div>
            </div>

            <!-- Detalle de Competencias -->
            <div v-if="subject.notas_competencia && subject.notas_competencia.length > 0" class="border-t pt-3">
              <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Competencias Específicas
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="compGroup in subject.notas_competencia" :key="compGroup.codigo"
                  class="bg-blue-50/50 rounded p-2 border border-blue-100 flex flex-col items-center">
                  <div class="text-xs font-bold text-blue-700 mb-1">{{ compGroup.codigo }}</div>

                  <div class="flex flex-wrap justify-center gap-2">
                    <div v-for="periodo in compGroup.periodos" :key="periodo.label" class="flex flex-col items-center">
                      <span class="text-[9px] text-gray-500 uppercase">{{ periodo.label }}</span>
                      <span class="font-semibold text-gray-800 text-sm">{{ periodo.nota }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Horario (2/5 ancho) -->
      <div class="lg:col-span-2 space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Horario de Clases
        </h3>

        <div class="glass-card p-4">
          <!-- Selector de día simple -->
          <div class="flex space-x-1 mb-4 overflow-x-auto pb-2">
            <button v-for="(dayName, index) in days" :key="index" @click="selectedDay = index + 1"
              :class="selectedDay === index + 1 ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border border-transparent flex-shrink-0">
              {{ dayName }}
            </button>
          </div>

          <div v-if="currentSchedule.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay clases programadas para este día.
          </div>

          <div v-else class="space-y-3">
            <div v-for="(clase, idx) in currentSchedule" :key="idx"
              class="flex items-start p-3 rounded-lg border-l-4 border-purple-500 bg-purple-50/50">
              <div class="mr-3 text-center min-w-[3.5rem]">
                <div class="text-xs font-bold text-purple-800">{{ formatTime(clase.period.start_time) }}</div>
                <div class="text-[10px] text-gray-500">{{ formatTime(clase.period.end_time) }}</div>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 leading-tight">{{ clase.materia.nombre }}</p>
                <p class="text-xs text-gray-600 mt-0.5">{{ clase.docente.nombres }} {{ clase.docente.apellidos }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '../../utils/api'

definePageMeta({
  layout: 'student',
  middleware: ['auth']
})

const loading = ref(true)
const dashboardData = ref<any>(null)
const selectedDay = ref<number>(new Date().getDay() || 1) // Default to today (or Mon if Sun)

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const currentSchedule = computed(() => {
  if (!dashboardData.value?.schedule) return []
  // API returns object grouped by key "1", "2", etc.
  return dashboardData.value.schedule[selectedDay.value] || []
})

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-400'
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const formatTime = (time: string) => {
  // Assuming HH:MM:SS
  return time.substring(0, 5)
}

onMounted(async () => {
  try {
    const response = await api.get('/api/student/dashboard')
    dashboardData.value = response.data
  } catch (e) {
    console.error("Dashboard error:", e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.glass-card {
  @apply bg-white border border-gray-100 shadow-sm transition-all duration-300;
}
</style>
