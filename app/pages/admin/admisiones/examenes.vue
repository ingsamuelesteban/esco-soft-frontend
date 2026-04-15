<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Exámenes Vocacionales</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Resultados del examen vocacional de los estudiantes preadmitidos
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button @click="abrirImportVocacional"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <ArrowUpTrayIcon class="w-4 h-4" />
          Vocacional
        </button>
        <button @click="abrirImportAcademico"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <ArrowUpTrayIcon class="w-4 h-4" />
          Examen de Admisión
        </button>
      </div>

    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="glass-card p-4 rounded-xl text-center">
        <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ stats.total }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Preadmitidos</div>
      </div>
      <div class="glass-card p-4 rounded-xl text-center border-l-4 border-l-green-500">
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.con_examen }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Con examen</div>
      </div>
      <div class="glass-card p-4 rounded-xl text-center border-l-4 border-l-amber-400 col-span-2 sm:col-span-1">
        <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ stats.sin_examen }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Sin examen</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3">
      <!-- Año lectivo -->
      <select v-model="filtros.anio_lectivo_id" @change="cargar"
        class="input-field text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <option v-for="a in aniosLectivos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
      </select>
      <!-- Estado examen -->
      <select v-model="filtros.estado" @change="cargar"
        class="input-field text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <option value="">Todos los estados</option>
        <option value="completado">Con examen</option>
        <option value="pendiente">Sin examen</option>
      </select>
      <!-- Búsqueda -->
      <input v-model="busqueda" @input="filtrarLocal" type="text" placeholder="Buscar por nombre o folder..."
        class="input-field text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1 min-w-[200px]" />
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-xl overflow-hidden">
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#Folder</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Examen</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Puntaje</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área Primaria</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área Secundaria</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preferencia Declarada</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>

            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                No hay registros que mostrar.
              </td>
            </tr>
            <tr v-for="est in estudiantesFiltrados" :key="est.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <!-- Folder -->
              <td class="px-4 py-3">
                <span class="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                  #{{ est.admision?.no_folder ?? est.no_folder ?? '—' }}
                </span>
              </td>
              <!-- Estudiante -->
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ est.nombres }} {{ est.apellidos }}
                </div>
                <div class="text-xs text-gray-400">{{ est.cedula || 'Sin cédula' }}</div>
              </td>
              <!-- Estado examen -->
              <td class="px-4 py-3">
                <span v-if="est.examen_id"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  Completado
                </span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  ⏳ Pendiente
                </span>
              </td>
              <!-- Puntaje Académico -->
              <td class="px-4 py-3">
                <div v-if="est.puntuacion_academica !== null" class="flex flex-col">
                  <span class="text-sm font-bold" :class="getPuntajeColor(est.puntuacion_academica)">
                    {{ est.puntuacion_academica }}
                    <span class="text-[10px] opacity-60">/100</span>
                  </span>
                </div>
                <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
              </td>

              <!-- Área Primaria -->
              <td class="px-4 py-3">
                <div v-if="est.override_area_label" class="space-y-0.5">
                  <span class="text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full block w-fit">
                    ✏️ {{ est.override_area_label }}
                  </span>
                </div>
                <span v-else-if="est.area_primaria_label"
                  class="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full block w-fit">
                  {{ est.area_primaria_label }}
                  <span class="font-normal text-green-600/70 dark:text-green-400/70"> · {{ est.area_primaria_puntaje }}pts</span>
                </span>
                <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
              </td>
              <!-- Área Secundaria -->
              <td class="px-4 py-3">
                <span v-if="est.area_secundaria_label"
                  class="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full block w-fit">
                  {{ est.area_secundaria_label }}
                  <span class="font-normal text-blue-600/70"> · {{ est.area_secundaria_puntaje }}pts</span>
                </span>
                <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
              </td>
              <!-- Preferencia declarada -->
              <td class="px-4 py-3">
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ est.preferencia_directa || '—' }}</span>
              </td>
              <!-- Acciones -->
              <td class="px-4 py-3 text-center">
                <button v-if="est.examen_id" @click="abrirDetalle(est)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg transition-colors">
                  <PencilSquareIcon class="w-3.5 h-3.5" />
                  Ver / Editar
                </button>
                <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ImportarExamenCSVModal
      v-if="showImportModal"
      :mode="importMode"
      :anio-lectivo-id="filtros.anio_lectivo_id"
      :anios-lectivos="aniosLectivos"
      @close="showImportModal = false"
      @imported="onImported"
    />


    <!-- Modal ver/editar examen -->
    <ExamenDetalleModal
      v-if="examenSeleccionado"
      :examen-id="examenSeleccionado.examen_id"
      :estudiante="examenSeleccionado"
      @close="examenSeleccionado = null"
      @updated="cargar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import { ArrowUpTrayIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import ImportarExamenCSVModal from '~/components/examenes/ImportarExamenCSVModal.vue'
import ExamenDetalleModal from '~/components/examenes/ExamenDetalleModal.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const loading = ref(true)
const showImportModal = ref(false)
const importMode = ref<'vocacional' | 'academico'>('vocacional')
const examenSeleccionado = ref<any>(null)
const estudiantes = ref<any[]>([])
const stats = ref<any>(null)
const aniosLectivos = ref<any[]>([])
const busqueda = ref('')

const filtros = ref({
  anio_lectivo_id: null as number | null,
  estado: '',
})


const estudiantesFiltrados = computed(() => {
  if (!busqueda.value) return estudiantes.value
  const q = busqueda.value.toLowerCase()
  return estudiantes.value.filter((e: any) =>
    `${e.nombres} ${e.apellidos}`.toLowerCase().includes(q) ||
    String(e.admision?.no_folder ?? '').includes(q)
  )
})

async function cargar() {
  loading.value = true
  try {
    const params: any = {}
    if (filtros.value.anio_lectivo_id) params.anio_lectivo_id = filtros.value.anio_lectivo_id
    if (filtros.value.estado) params.estado = filtros.value.estado
    const res = await api.get('/api/admisiones/examenes', { params })
    estudiantes.value = res.data?.data ?? []
    stats.value = res.data?.stats ?? null
  } finally {
    loading.value = false
  }
}

function filtrarLocal() {
  // La búsqueda local no requiere nueva llamada a la API
}

function abrirDetalle(est: any) {
  examenSeleccionado.value = est
}

function abrirImportVocacional() {
  importMode.value = 'vocacional'
  showImportModal.value = true
}

function abrirImportAcademico() {
  importMode.value = 'academico'
  showImportModal.value = true
}

function getPuntajeColor(p: number) {
  if (p >= 85) return 'text-green-600 dark:text-green-400'
  if (p >= 70) return 'text-blue-600 dark:text-blue-400'
  return 'text-red-600 dark:text-red-400'
}

function onImported() {
  showImportModal.value = false
  cargar()
}


onMounted(async () => {
  // 1. Cargar años lectivos
  const resAnios = await api.get('/api/anios-lectivos')
  const data: any[] = resAnios.data || resAnios || []
  aniosLectivos.value = data


  if (data.length > 0) {
    const activeAnio = data.find((a: any) => a.activo)
    // Igual que en fechas.vue: elegir el siguiente al activo (nombre mayor que el activo)
    const nextAnio = data.find((a: any) => !a.activo && (!activeAnio || a.nombre > activeAnio.nombre))

    if (nextAnio) {
      filtros.value.anio_lectivo_id = nextAnio.id
    } else if (activeAnio) {
      filtros.value.anio_lectivo_id = activeAnio.id
    } else {
      filtros.value.anio_lectivo_id = data[0].id
    }
  }

  await cargar()
})

</script>

<style scoped>
.glass-card {
  @apply bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm;
}
</style>
