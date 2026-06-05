<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ modo === 'admitidos' ? 'Admitidos' : 'No Admitidos' }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ modo === 'admitidos' ? 'Listado de estudiantes admitidos con su aula asignada.' : 'Listado de estudiantes que no fueron admitidos.' }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Toggle Admitidos / No Admitidos -->
        <div class="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-semibold">
          <button @click="cambiarModo('admitidos')" :class="modo === 'admitidos' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Admitidos
          </button>
          <button @click="cambiarModo('no-admitidos')" :class="modo === 'no-admitidos' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            No Admitidos
          </button>
        </div>

        <div class="text-sm text-gray-500 dark:text-gray-400">
          Total: <span class="font-semibold text-gray-800 dark:text-gray-100">{{ total }}</span>
        </div>
        <button
          @click="printPdf"
          :disabled="printLoading || !anioLectivoId"
          :class="modo === 'no-admitidos' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          class="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <svg v-if="printLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {{ modo === 'admitidos' ? (aulaId ? 'Imprimir Aula' : 'Imprimir Todas') : 'Imprimir No Admitidos' }}
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="glass-card p-4 rounded-xl flex flex-wrap items-end gap-4">
      <!-- Año Lectivo -->
      <div class="min-w-[180px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Año Lectivo</label>
        <select
          v-model="anioLectivoId"
          @change="onAnioChange"
          class="input-field w-full text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option v-for="a in aniosLectivos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
        </select>
      </div>

      <!-- Búsqueda -->
      <div class="flex-1 min-w-[220px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Buscar</label>
        <input
          v-model="search"
          type="text"
          placeholder="Nombre, apellido o # folder..."
          class="input-field w-full text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          @keyup.enter="cargar(1)"
        />
      </div>

      <!-- Filtro por aula (solo admitidos) -->
      <div v-if="modo === 'admitidos'" class="min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Aula</label>
        <select
          v-model="aulaId"
          @change="cargar(1)"
          class="input-field w-full text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todas las aulas</option>
          <option v-for="a in aulas" :key="a.id" :value="a.id">{{ aulaLabel(a) }}</option>
        </select>
      </div>

      <!-- Botón buscar -->
      <div>
        <button
          @click="cargar(1)"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          Buscar
        </button>
      </div>
    </div>

    <!-- Visible en Plataforma -->
    <div
      v-if="anioLectivoId"
      class="glass-card p-4 rounded-xl border-l-4 transition-colors"
      :class="publicado ? 'border-l-green-500' : 'border-l-gray-300 dark:border-l-gray-600'"
    >
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
        <!-- Icono + texto -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="p-2 rounded-lg flex-shrink-0" :class="publicado ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'">
            <svg class="w-5 h-5" :class="publicado ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-gray-100">Visible en Plataforma</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Los estudiantes admitidos y no admitidos verán sus resultados a partir de esta fecha</p>
          </div>
          <span
            class="ml-2 flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            :class="publicado
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
          >
            {{ publicado ? '✓ Publicado' : 'No publicado' }}
          </span>
        </div>
        <!-- Controles -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <input
            v-model="fechaPublicacion"
            type="datetime-local"
            class="text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            v-if="fechaPublicacion"
            @click="fechaPublicacion = ''; guardarFechaPublicacion()"
            title="Quitar fecha"
            class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <button
            @click="guardarFechaPublicacion"
            :disabled="savingFecha"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            <svg v-if="savingFecha" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-xl overflow-hidden">
      <!-- Loading -->
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
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">#Folder</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th v-if="modo === 'admitidos'" class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aula</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="admitidos.length === 0">
              <td :colspan="modo === 'admitidos' ? 5 : 4" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                {{ modo === 'admitidos' ? 'No se encontraron estudiantes admitidos.' : 'No se encontraron estudiantes no admitidos.' }}
              </td>
            </tr>
            <tr
              v-for="est in admitidos"
              :key="est.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-red-50/30 dark:bg-red-900/10': modo === 'no-admitidos' }"
            >
              <!-- Folder -->
              <td class="px-4 py-3">
                <span :class="modo === 'no-admitidos' ? 'text-red-700 dark:text-red-400' : 'text-indigo-700 dark:text-indigo-400'"
                  class="font-mono font-bold text-sm">
                  #{{ est.admision?.no_folder ?? '—' }}
                </span>
              </td>
              <!-- Nombre -->
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ est.apellidos }}, {{ est.nombres }}
                </div>
                <div class="text-xs text-gray-400">{{ est.cedula ?? 'Sin cédula' }}</div>
              </td>
              <!-- Aula (solo admitidos) -->
              <td v-if="modo === 'admitidos'" class="px-4 py-3">
                <span v-if="est.aula" class="text-sm text-gray-800 dark:text-gray-200">
                  {{ aulaLabel(est.aula) }}
                </span>
                <span v-else class="text-xs text-gray-400 italic">Sin aula</span>
              </td>
              <!-- Área -->
              <td class="px-4 py-3">
                <span
                  v-if="est.aula?.titulo?.nombre || est.admision?.titulo?.nombre"
                  class="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  {{ est.aula?.titulo?.nombre || est.admision?.titulo?.nombre }}
                </span>
                <span v-else class="text-xs text-gray-400 italic">—</span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <NuxtLink
                    :to="`/admin/admitidos/${est.id}`"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver perfil
                  </NuxtLink>
                  <button
                    v-if="modo === 'no-admitidos'"
                    @click="openAdmitirModal(est)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg border border-green-200 dark:border-green-700 transition-colors"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Admitir a Aula
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="!loading && lastPage > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500">
          Página {{ currentPage }} de {{ lastPage }}
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage <= 1"
            @click="cargar(currentPage - 1)"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <button
            :disabled="currentPage >= lastPage"
            @click="cargar(currentPage + 1)"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Admitir Estudiante -->
    <div v-if="isAdmitirModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Admitir Estudiante</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona el aula para asignar a <span class="font-bold">{{ selectedStudentToAdmit?.nombres }} {{ selectedStudentToAdmit?.apellidos }}</span>.</p>
        </div>
        <div class="p-6 flex-1 overflow-y-auto">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aula de destino</label>
              <select v-model="selectedAulaToAdmit" class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="" disabled>Seleccione un aula</option>
                <option v-for="a in aulas" :key="a.id" :value="a.id">{{ aulaLabel(a) }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
          <button @click="isAdmitirModalOpen = false" :disabled="loadingAdmitir" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
          <button @click="confirmAdmitir" :disabled="loadingAdmitir || !selectedAulaToAdmit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
            <svg v-if="loadingAdmitir" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Admitir y Asignar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import { usePrint } from '~/composables/usePrint'
import Swal from 'sweetalert2'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const admitidos      = ref([])
const aulas          = ref([])
const aniosLectivos  = ref([])
const loading        = ref(true)
const search         = ref('')
const aulaId         = ref('')
const anioLectivoId  = ref(null)
const currentPage    = ref(1)
const lastPage       = ref(1)
const total          = ref(0)
const printLoading       = ref(false)
const modo               = ref('admitidos') // 'admitidos' | 'no-admitidos'
const fechaPublicacion   = ref('')
const savingFecha        = ref(false)
const publicado          = ref(false)

const isAdmitirModalOpen = ref(false)
const selectedStudentToAdmit = ref(null)
const selectedAulaToAdmit = ref('')
const loadingAdmitir = ref(false)

const openAdmitirModal = (est) => {
  selectedStudentToAdmit.value = est
  selectedAulaToAdmit.value = ''
  isAdmitirModalOpen.value = true
}

const confirmAdmitir = async () => {
  if (!selectedAulaToAdmit.value) {
    Swal.fire('Error', 'Debe seleccionar un aula.', 'warning')
    return
  }

  try {
    loadingAdmitir.value = true
    await api.post('/api/admisiones/asignacion/confirmar', {
      anio_lectivo_id: anioLectivoId.value,
      assignments: [
        {
          student_id: selectedStudentToAdmit.value.id,
          aula_id: selectedAulaToAdmit.value
        }
      ]
    })
    Swal.fire({ icon: 'success', title: 'Estudiante admitido', text: 'El estudiante ha sido admitido y asignado al aula.', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })
    isAdmitirModalOpen.value = false
    cargar(currentPage.value)
  } catch (e) {
    console.error(e)
    Swal.fire('Error', e.response?.data?.message || e.message || 'Error al admitir estudiante', 'error')
  } finally {
    loadingAdmitir.value = false
  }
}

const { printPdfBlob } = usePrint()

const aulaLabel = (aula) => {
  if (!aula) return ''
  const grado   = aula.grado_cardinal ?? ''
  const seccion = aula.seccion        ?? ''
  const titulo  = aula.titulo?.nombre ?? ''
  return `${grado}° ${seccion}${titulo ? ' – ' + titulo : ''}`.trim()
}

const loadAulas = async () => {
  try {
    let url = '/api/aulas'
    if (anioLectivoId.value) {
      url += `?anio_lectivo_id=${anioLectivoId.value}`
    }
    const res = await api.get(url)
    aulas.value = res.data ?? res ?? []
  } catch (e) {
    console.error('Error cargando aulas:', e)
  }
}

const onAnioChange = async () => {
  await loadAulas()
  await Promise.all([cargar(1), loadFechaPublicacion()])
}

const cambiarModo = (nuevoModo) => {
  if (modo.value === nuevoModo) return
  modo.value = nuevoModo
  search.value = ''
  aulaId.value = ''
  cargar(1)
}

const loadFechaPublicacion = async () => {
  if (!anioLectivoId.value) return
  try {
    const res = await api.get(`/api/admisiones/publicacion-resultados?anio_lectivo_id=${anioLectivoId.value}`)
    const data = res.data ?? res
    publicado.value = data.publicado ?? false
    if (data.fecha_publicacion_resultados) {
      const d = new Date(data.fecha_publicacion_resultados)
      // Format for datetime-local input: 'YYYY-MM-DDTHH:mm'
      const pad = (n) => String(n).padStart(2, '0')
      fechaPublicacion.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } else {
      fechaPublicacion.value = ''
    }
  } catch (e) {
    console.error('Error cargando fecha publicacion:', e)
  }
}

const guardarFechaPublicacion = async () => {
  if (!anioLectivoId.value) return
  savingFecha.value = true
  try {
    const payload = {
      anio_lectivo_id: anioLectivoId.value,
      fecha_publicacion_resultados: fechaPublicacion.value || null,
    }
    const res = await api.post('/api/admisiones/publicacion-resultados', payload)
    const data = res.data ?? res
    publicado.value = data.publicado ?? false
    Swal.fire({ icon: 'success', title: fechaPublicacion.value ? 'Fecha guardada' : 'Fecha eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
  } catch (e) {
    Swal.fire('Error', 'No se pudo guardar la configuración.', 'error')
  } finally {
    savingFecha.value = false
  }
}

const cargar = async (page = 1) => {
  if (modo.value === 'admitidos') {
    await loadAdmitidos(page)
  } else {
    await loadNoAdmitidos(page)
  }
}

const loadAdmitidos = async (page = 1) => {
  if (!anioLectivoId.value) return
  loading.value = true
  currentPage.value = page
  try {
    let url = `/api/admitidos?page=${page}&anio_lectivo_id=${anioLectivoId.value}`
    if (search.value.trim()) url += `&search=${encodeURIComponent(search.value.trim())}`
    if (aulaId.value)        url += `&aula_id=${aulaId.value}`

    const res = await api.get(url)
    const paginado = res.data

    admitidos.value  = paginado?.data      ?? []
    lastPage.value   = paginado?.last_page ?? 1
    total.value      = paginado?.total     ?? admitidos.value.length
  } catch (e) {
    console.error('Error cargando admitidos:', e)
    Swal.fire('Error', 'No se pudo cargar el listado de admitidos.', 'error')
  } finally {
    loading.value = false
  }
}

const loadNoAdmitidos = async (page = 1) => {
  if (!anioLectivoId.value) return
  loading.value = true
  currentPage.value = page
  try {
    let url = `/api/no-admitidos?page=${page}&anio_lectivo_id=${anioLectivoId.value}`
    if (search.value.trim()) url += `&search=${encodeURIComponent(search.value.trim())}`

    const res = await api.get(url)
    const paginado = res.data

    admitidos.value  = paginado?.data      ?? []
    lastPage.value   = paginado?.last_page ?? 1
    total.value      = paginado?.total     ?? admitidos.value.length
  } catch (e) {
    console.error('Error cargando no admitidos:', e)
    Swal.fire('Error', 'No se pudo cargar el listado de no admitidos.', 'error')
  } finally {
    loading.value = false
  }
}

const printPdf = async () => {
  if (!anioLectivoId.value) return
  printLoading.value = true
  try {
    if (modo.value === 'no-admitidos') {
      const url = `/api/no-admitidos/pdf?anio_lectivo_id=${anioLectivoId.value}`
      const blob = await api.getBlob(url)
      printPdfBlob(blob, 'no-admitidos.pdf', 'Preparando listado de no admitidos...')
    } else {
      let url = `/api/admitidos/pdf?anio_lectivo_id=${anioLectivoId.value}`
      if (aulaId.value) url += `&aula_id=${aulaId.value}`
      const blob = await api.getBlob(url)
      const filename = aulaId.value ? 'admitidos_aula.pdf' : 'admitidos_todos.pdf'
      printPdfBlob(blob, filename, 'Preparando listado de admitidos...')
    }
  } catch (e) {
    Swal.fire('Error', 'No se pudo generar el PDF.', 'error')
  } finally {
    printLoading.value = false
  }
}

onMounted(async () => {
  try {
    const resAnios = await api.get('/api/anios-lectivos')
    const data = resAnios.data ?? resAnios ?? []
    aniosLectivos.value = data
    if (data.length > 0) {
      const activeAnio = data.find((a) => a.activo)
      const nextAnio   = data.find((a) => !a.activo && (!activeAnio || a.nombre > activeAnio.nombre))
      anioLectivoId.value = nextAnio?.id ?? activeAnio?.id ?? data[0].id
      await Promise.all([loadAulas(), cargar(1), loadFechaPublicacion()])
    } else {
      await loadAulas()
    }
  } catch (e) {
    console.error('Error cargando años lectivos:', e)
  }
})
</script>
