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

        <div v-else class="space-y-6">

          <!-- TABLA DE CALIFICACIONES ACADÉMICAS -->
          <div v-if="academicSubjects.length > 0" class="glass-card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Calificaciones Académicas</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Módulos Formativos
                    </th>
                    <!-- Headers provided by user -->
                    <th scope="col"
                      class="px-2 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[140px] border-l border-gray-200">
                      Comunicativa
                      <div class="mt-1 font-normal text-gray-400">P1 | P2 | P3 | P4</div>
                    </th>
                    <th scope="col"
                      class="px-2 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[140px] border-l border-gray-200">
                      Pens. Lógico, Creativo y Crítico | Res. Problemas
                      <div class="mt-1 font-normal text-gray-400">P1 | P2 | P3 | P4</div>
                    </th>
                    <th scope="col"
                      class="px-2 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[140px] border-l border-gray-200">
                      Ética y Ciudadana | Des. Personal y Espiritual
                      <div class="mt-1 font-normal text-gray-400">P1 | P2 | P3 | P4</div>
                    </th>
                    <th scope="col"
                      class="px-2 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[140px] border-l border-gray-200">
                      Científica y Tec. | Ambiental y Salud
                      <div class="mt-1 font-normal text-gray-400">P1 | P2 | P3 | P4</div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="subject in academicSubjects" :key="subject.materia_id" class="hover:bg-gray-50">
                    <!-- Subject Name -->
                    <td class="px-4 py-3 whitespace-normal align-top">
                      <div class="text-xs font-bold text-gray-900">{{ subject.materia }}</div>
                      <div class="text-[10px] text-gray-500 mt-1">Prom: {{ subject.promedio ?
                        subject.promedio.toFixed(0) : '-' }}</div>
                    </td>

                    <!-- Block Columns 1-4 -->
                    <td v-for="bloqueNum in 4" :key="bloqueNum" class="px-2 py-2 border-l border-gray-200 align-top">
                      <div v-if="getBlockData(subject, bloqueNum)" class="space-y-3">
                        <div v-for="comp in getBlockData(subject, bloqueNum).competencias" :key="comp.codigo"
                          class="text-center">
                          <!-- Code Removed -->
                          <div class="flex justify-center space-x-1">
                            <!-- P1-P4 Grid for this Competency -->
                            <span v-for="p in 4" :key="p" class="w-6 text-center">
                              <div class="text-xs font-bold" :class="getGradeColor(getNotaValue(comp, `P${p}`))">
                                {{ getNotaDisplay(comp, `P${p}`) }}
                              </div>
                              <!-- Recovery underneath if exists -->
                              <div v-if="getNotaDisplay(comp, `RP${p}`) !== '-'"
                                class="text-[9px] text-orange-600 font-bold -mt-0.5">
                                {{ getNotaDisplay(comp, `RP${p}`) }}
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center text-gray-200 text-xs py-2">-</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MÓDULOS TÉCNICOS (Solo RAs) - Render como Cards -->
          <div v-if="technicalSubjects.length > 0">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 pl-1">Módulos Técnicos</h3>
            <div class="space-y-4">
              <div v-for="subject in technicalSubjects" :key="subject.materia_id"
                class="glass-card p-5 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="font-bold text-gray-800 text-lg">{{ subject.materia }}</h4>
                    <span
                      class="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded mt-1 inline-block">Módulo
                      Técnico</span>
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
                  <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resultados de
                    Aprendizaje</h5>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <div v-for="raItem in subject.notas_ra" :key="raItem.ra"
                      class="bg-gray-50 rounded p-2 text-center border border-gray-100 flex flex-col items-center">
                      <div class="text-xs text-gray-500 mb-1">RA {{ raItem.ra }}</div>
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
  return dashboardData.value.schedule[selectedDay.value] || []
})

// Computed filter for Academic Subjects (Have Competencies)
const academicSubjects = computed(() => {
  if (!dashboardData.value?.grades) return []
  return dashboardData.value.grades.filter((s: any) => s.notas_competencia && s.notas_competencia.length > 0)
})

// Computed filter for Technical Subjects (Only RA, No Competencies)
const technicalSubjects = computed(() => {
  if (!dashboardData.value?.grades) return []
  return dashboardData.value.grades.filter((s: any) => !s.notas_competencia || s.notas_competencia.length === 0)
})

// Helper to get Data for a specific Block from a Subject
const getBlockData = (subject: any, bloqueNum: number) => {
  if (!subject.notas_competencia) return null
  return subject.notas_competencia.find((b: any) => b.bloque === bloqueNum)
}

// Helper to get specific P-grade from a Competency
const getNotaDisplay = (comp: any, type: string) => {
  const grade = comp.notas.find((n: any) => n.tipo === type)
  return grade ? grade.nota : '-'
}

const getNotaValue = (comp: any, type: string) => {
  const grade = comp.notas.find((n: any) => n.tipo === type)
  return grade ? Number(grade.nota) : null
}

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-400'
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const getGradeColor = (score: number | null) => {
  if (score === null) return 'text-gray-300'
  if (score < 70) return 'text-red-600'
  return 'text-gray-900'
}

const formatTime = (time: string) => {
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
