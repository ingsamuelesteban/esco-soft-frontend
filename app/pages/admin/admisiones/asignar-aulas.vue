<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Asignación de Aulas</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Asigna a los estudiantes preadmitidos a sus aulas de 4to grado basándose en los resultados vocacionales.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <!-- Toggle de modo -->
        <div class="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-semibold">
          <button @click="accion = 'asignar'" :class="accion === 'asignar' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors flex items-center gap-1.5">
            <CheckCircleIcon class="w-4 h-4" /> Asignar Aulas
          </button>
          <button @click="accion = 'no-admitir'" :class="accion === 'no-admitir' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700">
            <NoSymbolIcon class="w-4 h-4" /> No Admitir
          </button>
        </div>

        <!-- Botón de acción contextual -->
        <button v-if="accion === 'asignar'" @click="confirmarTodo" :disabled="!puedeConfirmar || saving"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50">
          <CheckIcon v-if="!saving" class="w-4 h-4" />
          <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Confirmar Asignaciones ({{ asignacionesPendientes.length }})
        </button>

        <button v-else @click="marcarNoAdmitidos" :disabled="seleccionados.length === 0 || saving"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50">
          <NoSymbolIcon v-if="!saving" class="w-4 h-4" />
          <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Marcar No Admitidos ({{ seleccionados.length }})
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="glass-card p-4 rounded-xl flex flex-wrap items-center gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500 uppercase">Año Lectivo Destino</label>
        <select v-model="anioLectivoId" @change="cargar"
          class="input-field text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option v-for="a in aniosLectivos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
        </select>
      </div>
      
      <div class="flex-1 min-w-[200px]">
        <label class="text-xs font-semibold text-gray-500 uppercase">Buscar Estudiante</label>
        <input v-model="busqueda" type="text" placeholder="Nombre o número de folder..."
          class="input-field w-full text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
      </div>

      <div class="flex flex-col gap-1 min-w-[200px]">
        <label class="text-xs font-semibold text-gray-500 uppercase">Filtrar por Área</label>
        <select v-model="filterArea"
          class="input-field text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option value="">Todas las áreas</option>
          <option v-for="area in areasList" :key="area" :value="area">{{ area }}</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-xl overflow-hidden">
      <!-- Banner modo No Admitir -->
      <div v-if="accion === 'no-admitir'" class="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
        <NoSymbolIcon class="w-4 h-4 flex-shrink-0" />
        Selecciona los estudiantes que <strong class="mx-1">NO serán admitidos</strong> y pulsa "Marcar No Admitidos".
      </div>
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
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">#Folder</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área Recomendada</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aula de 4to Grado</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="filtrados.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                No hay estudiantes preadmitidos para asignar en este año lectivo.
              </td>
            </tr>
            <tr v-for="est in filtrados" :key="est.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': isSelected(est.id) && accion === 'asignar', 'bg-red-50/40 dark:bg-red-900/10': isSelected(est.id) && accion === 'no-admitir' }">
              <!-- Folder -->
              <td class="px-4 py-3">
                <span class="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                  #{{ est.no_folder || '—' }}
                </span>
              </td>
              <!-- Estudiante -->
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ est.nombres }} {{ est.apellidos }}
                </div>
                <div class="text-xs text-gray-400">{{ est.cedula || 'Sin cédula' }}</div>
              </td>
              <!-- Área recomendada -->
              <td class="px-4 py-3">
                <span class="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                  {{ est.area_examen }}
                </span>
              </td>
              <!-- Selección de Aula -->
              <td class="px-4 py-3">
                <select v-model="asignaciones[est.id]"
                  class="w-full text-sm rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500">
                  <option :value="null">-- Seleccionar Aula --</option>
                  <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                    {{ aulaLabel(aula) }}
                  </option>
                </select>
                <div v-if="est.aula_recomendada_id && asignaciones[est.id] === est.aula_recomendada_id" class="text-[10px] text-green-600 mt-0.5 ml-1 flex items-center gap-1">
                  <CheckCircleIcon class="w-3 h-3" /> Sugerencia óptima
                </div>
              </td>
              <!-- Checkbox -->
              <td class="px-4 py-3 text-center">
                <input type="checkbox" :value="est.id" v-model="seleccionados"
                  :disabled="accion === 'asignar' && !asignaciones[est.id]"
                  :class="accion === 'no-admitir' ? 'text-red-600 focus:ring-red-500' : 'text-indigo-600 focus:ring-indigo-500'"
                  class="rounded border-gray-300 disabled:opacity-20" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '~/utils/api'
import { CheckIcon, CheckCircleIcon, NoSymbolIcon } from '@heroicons/vue/24/solid'
import { showToast } from '~/utils/sweetalert'
import Swal from 'sweetalert2'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const loading = ref(true)
const saving = ref(false)
const anioLectivoId = ref<number | null>(null)
const aniosLectivos = ref<any[]>([])
const estudiantes = ref<any[]>([])
const aulas = ref<any[]>([])
const busqueda = ref('')
const filterArea = ref('')

const asignaciones = ref<{ [key: number]: number | null }>({})
const seleccionados = ref<number[]>([])
const accion = ref<'asignar' | 'no-admitir'>('asignar')

// Reset selection when switching modes
watch(accion, () => { seleccionados.value = [] })

const areasList = computed(() => {
  const areas = estudiantes.value.map(e => e.area_examen).filter(Boolean)
  return [...new Set(areas)].sort()
})

const filtrados = computed(() => {
  let result = estudiantes.value
  
  if (filterArea.value) {
    result = result.filter(e => e.area_examen === filterArea.value)
  }

  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    result = result.filter((e: any) =>
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(q) ||
      String(e.no_folder || '').includes(q)
    )
  }
  
  return result
})

const isSelected = (id: number) => seleccionados.value.includes(id)
const asignacionesPendientes = computed(() => seleccionados.value.filter(id => !!asignaciones.value[id]))
const puedeConfirmar = computed(() => asignacionesPendientes.value.length > 0)

const allSelected = computed(() => {
  const validIds = accion.value === 'no-admitir'
    ? filtrados.value.map(e => e.id)
    : filtrados.value.filter(e => !!asignaciones.value[e.id]).map(e => e.id)
  return validIds.length > 0 && validIds.every(id => seleccionados.value.includes(id))
})

function toggleAll() {
  const validIds = accion.value === 'no-admitir'
    ? filtrados.value.map(e => e.id)
    : filtrados.value.filter(e => !!asignaciones.value[e.id]).map(e => e.id)
  if (allSelected.value) {
    seleccionados.value = seleccionados.value.filter(id => !validIds.includes(id))
  } else {
    seleccionados.value = [...new Set([...seleccionados.value, ...validIds])]
  }
}

async function cargar() {
  if (!anioLectivoId.value) return
  loading.value = true
  try {
    const res = await api.get('/api/admisiones/asignaciones/preadmitidos', { 
      params: { anio_lectivo_id: anioLectivoId.value } 
    })
    
    estudiantes.value = res.data ?? []
    aulas.value = res.aulas ?? []
    
    // Inicializar asignaciones con recomendaciones
    const newAsignaciones: any = {}
    estudiantes.value.forEach(est => {
      newAsignaciones[est.id] = est.aula_recomendada_id
    })
    asignaciones.value = newAsignaciones
    seleccionados.value = [] // Reset selection
  } catch (e) {
    showToast('Error al cargar datos', 'error')
  } finally {
    loading.value = false
  }
}

async function marcarNoAdmitidos() {
  if (!anioLectivoId.value || seleccionados.value.length === 0) return

  const result = await Swal.fire({
    title: `¿Marcar ${seleccionados.value.length} estudiante(s) como No Admitidos?`,
    text: 'Esta acción cambiará su estado a No Admitido. Se puede revertir desde el perfil del estudiante.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, marcar No Admitidos',
    cancelButtonText: 'Cancelar',
  })

  if (!result.isConfirmed) return

  saving.value = true
  try {
    await api.post('/api/admisiones/asignaciones/no-admitir', {
      anio_lectivo_id: anioLectivoId.value,
      student_ids: seleccionados.value,
    })
    showToast(`${seleccionados.value.length} estudiante(s) marcados como No Admitidos.`, 'success')
    await cargar()
  } catch (e: any) {
    showToast(e?.data?.message || 'Error al procesar', 'error')
  } finally {
    saving.value = false
  }
}

async function confirmarTodo() {
  if (!anioLectivoId.value || !puedeConfirmar.value) return
  
  saving.value = true
  try {
    const payload = {
      anio_lectivo_id: anioLectivoId.value,
      assignments: asignacionesPendientes.value.map(id => ({
        student_id: id,
        aula_id: asignaciones.value[id]
      }))
    }
    
    await api.post('/api/admisiones/asignaciones/confirmar', payload)
    showToast(`${payload.assignments.length} estudiantes admitidos y asignados correctamente.`, 'success')
    await cargar()
  } catch (e: any) {
    showToast(e?.data?.message || 'Error al procesar asignaciones', 'error')
  } finally {
    saving.value = false
  }
}

function aulaLabel(aula: any) {
  const seccion = aula.seccion ? ` (${aula.seccion})` : ''
  return `${aula.grado_cardinal}° ${seccion} - ${aula.titulo?.nombre || 'General'}`
}

onMounted(async () => {
  try {
    const resAnios = await api.get('/api/anios-lectivos')
    const data: any[] = resAnios.data || resAnios || []
    aniosLectivos.value = data
    
    if (data.length > 0) {
      // Priorizar el año lectivo siguiente al activo (típico para admisiones)
      const activeAnio = data.find((a: any) => a.activo)
      const nextAnio = data.find((a: any) => !a.activo && (!activeAnio || a.nombre > activeAnio.nombre))
      
      anioLectivoId.value = nextAnio?.id || activeAnio?.id || data[0].id
      await cargar()
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.glass-card {
  @apply bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm;
}
.input-field {
  @apply focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all;
}
</style>
