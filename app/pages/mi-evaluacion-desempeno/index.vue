<template>
  <div class="p-6 max-w-3xl mx-auto">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Evaluación de Desempeño</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Consulta el seguimiento de tus evaluaciones registradas por coordinación.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="evaluaciones.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Sin evaluaciones registradas</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Aún no tienes evaluaciones de desempeño registradas por coordinación.
      </p>
    </div>

    <!-- Resumen de progreso -->
    <div v-else class="space-y-6">

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ evaluaciones.length }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Total</p>
        </div>
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.evaluados }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Evaluado</p>
        </div>
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ stats.planDigital }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Plan. Digital</p>
        </div>
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-3xl font-bold text-violet-600 dark:text-violet-400">{{ stats.planFisica }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Plan. Física</p>
        </div>
      </div>

      <!-- Lista de evaluaciones -->
      <div class="space-y-3">
        <div v-for="ev in evaluaciones" :key="ev.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">

          <!-- Fecha y sección -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatDate(ev.fecha) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ ev.seccion_label }} · {{ ev.periodo_label }}
              </p>
            </div>
            <!-- Badge estado general -->
            <span v-if="ev.fue_evaluado === null"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 whitespace-nowrap">
              Pendiente
            </span>
            <span v-else-if="ev.fue_evaluado"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 whitespace-nowrap">
              Evaluado
            </span>
            <span v-else
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 whitespace-nowrap">
              No evaluado
            </span>
          </div>

          <!-- Checklist de 3 preguntas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Pregunta 1 -->
            <div class="flex items-center gap-3 p-3 rounded-xl"
              :class="ev.fue_evaluado === null
                ? 'bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700'
                : ev.fue_evaluado
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
              <div class="flex-shrink-0">
                <span v-if="ev.fue_evaluado === null" class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span v-else-if="ev.fue_evaluado" class="flex items-center justify-center w-7 h-7 rounded-full bg-green-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span v-else class="flex items-center justify-center w-7 h-7 rounded-full bg-red-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold"
                  :class="ev.fue_evaluado === null ? 'text-gray-500 dark:text-gray-400' : ev.fue_evaluado ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
                  Fue evaluado
                </p>
                <p class="text-xs mt-0.5"
                  :class="ev.fue_evaluado === null ? 'text-gray-400 dark:text-gray-500' : ev.fue_evaluado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ ev.fue_evaluado === null ? 'Pendiente' : ev.fue_evaluado ? 'Sí' : 'No' }}
                </p>
              </div>
            </div>

            <!-- Pregunta 2 -->
            <div class="flex items-center gap-3 p-3 rounded-xl"
              :class="ev.cargo_digital === null
                ? 'bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700'
                : ev.cargo_digital
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
              <div class="flex-shrink-0">
                <span v-if="ev.cargo_digital === null" class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span v-else-if="ev.cargo_digital" class="flex items-center justify-center w-7 h-7 rounded-full bg-green-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span v-else class="flex items-center justify-center w-7 h-7 rounded-full bg-red-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold"
                  :class="ev.cargo_digital === null ? 'text-gray-500 dark:text-gray-400' : ev.cargo_digital ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
                  Plan. digital
                </p>
                <p class="text-xs mt-0.5"
                  :class="ev.cargo_digital === null ? 'text-gray-400 dark:text-gray-500' : ev.cargo_digital ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ ev.cargo_digital === null ? 'Pendiente' : ev.cargo_digital ? 'Sí' : 'No' }}
                </p>
              </div>
            </div>

            <!-- Pregunta 3 -->
            <div class="flex items-center gap-3 p-3 rounded-xl"
              :class="ev.entrego_fisica === null
                ? 'bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700'
                : ev.entrego_fisica
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
              <div class="flex-shrink-0">
                <span v-if="ev.entrego_fisica === null" class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span v-else-if="ev.entrego_fisica" class="flex items-center justify-center w-7 h-7 rounded-full bg-green-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span v-else class="flex items-center justify-center w-7 h-7 rounded-full bg-red-500">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold"
                  :class="ev.entrego_fisica === null ? 'text-gray-500 dark:text-gray-400' : ev.entrego_fisica ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
                  Plan. física
                </p>
                <p class="text-xs mt-0.5"
                  :class="ev.entrego_fisica === null ? 'text-gray-400 dark:text-gray-500' : ev.entrego_fisica ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ ev.entrego_fisica === null ? 'Pendiente' : ev.entrego_fisica ? 'Sí' : 'No' }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

definePageMeta({
  middleware: ['auth', 'role']
})

interface Evaluacion {
  id: number
  fecha: string
  seccion_label: string
  periodo_label: string
  fue_evaluado: boolean | null
  cargo_digital: boolean | null
  entrego_fisica: boolean | null
}

const loading = ref(true)
const evaluaciones = ref<Evaluacion[]>([])

const stats = computed(() => ({
  evaluados:  evaluaciones.value.filter(e => e.fue_evaluado === true).length,
  planDigital: evaluaciones.value.filter(e => e.cargo_digital === true).length,
  planFisica: evaluaciones.value.filter(e => e.entrego_fisica === true).length,
}))

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-DO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}

onMounted(async () => {
  try {
    const res = await api.get<{ success: boolean; data: Evaluacion[] }>('/api/performance-evaluations/me')
    evaluaciones.value = (res as any).data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
