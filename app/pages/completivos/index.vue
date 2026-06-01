<template>
  <div>
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Completivos</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <template v-if="isProfesor">
              Selecciona los estudiantes de tu aula para marcar como completivo.
            </template>
            <template v-else>
              Listado de estudiantes en estado completivo. Filtra por aula o imprime el reporte.
            </template>
          </p>
        </div>

        <!-- Admin controls: aula filter + print -->
        <div v-if="!isProfesor" class="flex items-center gap-3 flex-wrap">
          <select
            v-model="filterAulaId"
            @change="loadAdminData"
            class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option :value="null">Todas las aulas</option>
            <option v-for="a in aulasFiltro" :key="a.id" :value="a.id">
              {{ a.grado_cardinal }}° {{ a.seccion }}<template v-if="a.titulo"> – {{ a.titulo.nombre }}</template>
            </option>
          </select>

          <button
            @click="printPdf"
            :disabled="printLoading || estudiantes.length === 0"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg v-if="printLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir PDF
          </button>
        </div>

        <!-- Profesor controls: save button -->
        <div v-if="isProfesor" class="flex items-center gap-3">
          <button
            @click="saveChanges"
            :disabled="saving || !hasChanges"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar Cambios
          </button>
        </div>
      </div>

      <!-- Profesor: aula info badge -->
      <div v-if="isProfesor && aulaProfesor" class="mt-3 flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Aula: {{ aulaProfesor.grado_cardinal }}° {{ aulaProfesor.seccion }}
          <template v-if="aulaProfesor.titulo"> – {{ aulaProfesor.titulo }}</template>
        </span>
      </div>
    </header>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" :class="[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Main content -->
    <div class="p-6">

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- No aula assigned (profesor) -->
      <div v-else-if="isProfesor && !aulaProfesor" class="text-center py-20">
        <div class="mx-auto w-16 h-16 bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Sin aula asignada</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No tienes un aula asignada para el año lectivo activo.</p>
      </div>

      <!-- Empty state (admin) -->
      <div v-else-if="!isProfesor && estudiantes.length === 0" class="text-center py-20">
        <div class="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Sin estudiantes completivos</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No hay estudiantes en estado completivo actualmente.</p>
      </div>

      <!-- ── PROFESOR VIEW ── -->
      <div v-else-if="isProfesor">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Marca los estudiantes que deben quedar en estado <strong class="text-amber-600">completivo</strong>.
            Los estudiantes marcados no podrán ser promovidos a otra aula mientras tengan este estado.
          </p>
          <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {{ completivosSeleccionados.size }} completivo(s)
          </span>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 w-10">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate="someSelected && !allSelected"
                    @change="toggleAll"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">#</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Apellidos</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Nombres</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">RNE</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Estado Actual</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(est, idx) in estudiantes"
                :key="est.id"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer',
                  completivosSeleccionados.has(est.id) ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                ]"
                @click="toggleEstudiante(est.id)"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="completivosSeleccionados.has(est.id)"
                    @click.stop
                    @change="toggleEstudiante(est.id)"
                    class="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ est.apellidos }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ est.nombres }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ est.rne || '—' }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="estadoBadge(est.estado)">
                    {{ estadoLabel(est.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── ADMIN/DIRECTOR/COORDINATOR VIEW ── -->
      <div v-else>
        <!-- Summary -->
        <div class="mb-4 flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold border border-amber-200 dark:border-amber-700">
            Total: {{ estudiantes.length }} estudiante(s) en completivo
          </span>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">#</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Apellidos</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Nombres</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">RNE</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Aula</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Fecha Completivo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(est, idx) in estudiantes"
                :key="est.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ est.apellidos }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ est.nombres }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ est.rne || '—' }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                  <template v-if="est.aula">
                    {{ est.aula.grado_cardinal }}° {{ est.aula.seccion }}
                    <span v-if="est.aula.titulo" class="text-gray-400 dark:text-gray-500 text-xs"> – {{ est.aula.titulo }}</span>
                  </template>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  {{ est.fecha_completivo ? formatDate(est.fecha_completivo) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import { usePrint } from '~/composables/usePrint'

definePageMeta({
  middleware: ['auth']
})

// ── Auth ──────────────────────────────────────────────────────────────────────
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role?.toLowerCase() ?? '')
const isProfesor = computed(() => userRole.value === 'profesor')

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const saving = ref(false)
const printLoading = ref(false)

const estudiantes = ref<any[]>([])
const aulaProfesor = ref<any>(null)
const aulasFiltro = ref<any[]>([])
const filterAulaId = ref<number | null>(null)

/** Set of student IDs currently marked as completivo (teacher's selection) */
const completivosSeleccionados = ref<Set<number>>(new Set())
/** Original set at load time (to compute diff) */
const originalCompletivos = ref<Set<number>>(new Set())

const toast = ref({ show: false, type: 'success', message: '' })

const { printPdfBlob } = usePrint()

// ── Computed ──────────────────────────────────────────────────────────────────
const allSelected = computed(() => {
  const elegibles = estudiantes.value.filter(e => !['retirado'].includes(e.estado))
  return elegibles.length > 0 && elegibles.every(e => completivosSeleccionados.value.has(e.id))
})

const someSelected = computed(() => {
  return estudiantes.value.some(e => completivosSeleccionados.value.has(e.id))
})

const hasChanges = computed(() => {
  // Check if current selection differs from original
  const cur = completivosSeleccionados.value
  const orig = originalCompletivos.value
  if (cur.size !== orig.size) return true
  for (const id of cur) { if (!orig.has(id)) return true }
  return false
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Block secre/secretaria
  if (['secre', 'secretaria'].includes(userRole.value)) {
    await navigateTo('/')
    return
  }
  await loadData()
})

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    if (isProfesor.value) {
      await loadProfesorData()
    } else {
      await loadAdminData()
    }
  } finally {
    loading.value = false
  }
}

async function loadProfesorData() {
  const res = await api.get<any>('/api/completivos')
  if (res.success) {
    estudiantes.value = res.data ?? []
    aulaProfesor.value = res.aula ?? null

    // Build initial selection from those already marked as completivo
    const sel = new Set<number>(
      (res.data ?? []).filter((e: any) => e.estado === 'completivo').map((e: any) => e.id)
    )
    completivosSeleccionados.value = new Set(sel)
    originalCompletivos.value = new Set(sel)
  }
}

async function loadAdminData() {
  const params: Record<string, any> = {}
  if (filterAulaId.value) params.aula_id = filterAulaId.value

  const query = filterAulaId.value ? `?aula_id=${filterAulaId.value}` : ''
  const res = await api.get<any>(`/api/completivos${query}`)
  if (res.success) {
    estudiantes.value = res.data ?? []
    // aulasFiltro always comes from the unfiltered list — update only when loading all
    if (!filterAulaId.value && res.aulas) {
      aulasFiltro.value = res.aulas
    } else if (!aulasFiltro.value.length && res.aulas) {
      aulasFiltro.value = res.aulas
    }
  }
}

// ── Teacher actions ───────────────────────────────────────────────────────────
function toggleEstudiante(id: number) {
  const est = estudiantes.value.find(e => e.id === id)
  if (!est || est.estado === 'retirado') return

  if (completivosSeleccionados.value.has(id)) {
    completivosSeleccionados.value.delete(id)
  } else {
    completivosSeleccionados.value.add(id)
  }
  // Force reactivity
  completivosSeleccionados.value = new Set(completivosSeleccionados.value)
}

function toggleAll() {
  const elegibles = estudiantes.value.filter(e => !['retirado'].includes(e.estado))
  if (allSelected.value) {
    completivosSeleccionados.value = new Set()
  } else {
    completivosSeleccionados.value = new Set(elegibles.map(e => e.id))
  }
}

async function saveChanges() {
  if (!hasChanges.value) return
  saving.value = true

  try {
    const cur = completivosSeleccionados.value
    const orig = originalCompletivos.value

    // IDs to assign (in cur but not in orig)
    const toAssign = [...cur].filter(id => !orig.has(id))
    // IDs to remove (in orig but not in cur)
    const toRemove = [...orig].filter(id => !cur.has(id))

    const promises: Promise<any>[] = []

    if (toAssign.length > 0) {
      promises.push(api.post('/api/completivos/assign', { estudiante_ids: toAssign }))
    }
    if (toRemove.length > 0) {
      promises.push(api.post('/api/completivos/remove', { estudiante_ids: toRemove }))
    }

    await Promise.all(promises)

    // Reload to reflect server state
    await loadProfesorData()
    showToast('success', 'Cambios guardados correctamente.')
  } catch (e: any) {
    showToast('error', e?.data?.message ?? 'Error al guardar los cambios.')
  } finally {
    saving.value = false
  }
}

// ── Admin: print ──────────────────────────────────────────────────────────────
async function printPdf() {
  printLoading.value = true
  try {
    const query = filterAulaId.value ? `?aula_id=${filterAulaId.value}` : ''
    const blob = await api.getBlob(`/api/completivos/pdf${query}`)
    printPdfBlob(blob, 'completivos.pdf', 'Preparando listado de completivos...')
  } catch (e) {
    showToast('error', 'No se pudo generar el PDF.')
  } finally {
    printLoading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    activo: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completivo: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    retirado: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[estado] ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

function estadoLabel(estado: string) {
  const labels: Record<string, string> = {
    activo: 'Activo',
    completivo: 'Completivo',
    retirado: 'Retirado',
    'pre-admitido': 'Pre-admitido',
  }
  return labels[estado] ?? estado
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3500)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
