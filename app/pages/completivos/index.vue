<template>
  <div>
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 no-print">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Completivos</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <template v-if="isProfesor">
              Selecciona los estudiantes por asignatura para marcar como completivo.
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
            @click="triggerPrint"
            :disabled="estudiantes.length === 0"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Reporte
          </button>
        </div>

        <!-- Profesor controls: assignment selector + save button -->
        <div v-if="isProfesor" class="flex items-center gap-3 flex-wrap">
          <select
            v-if="assignments.length > 0"
            v-model="filterAssignmentId"
            @change="loadProfesorData"
            class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option v-for="a in assignments" :key="a.id" :value="a.id">
              {{ a.materia ? a.materia.nombre : 'Materia' }} ({{ a.aula ? a.aula.grado_cardinal + '° ' + a.aula.seccion : '' }})
            </option>
          </select>

          <button
            @click="saveChanges"
            :disabled="saving || !hasChanges || !filterAssignmentId"
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

      <!-- Profesor: assignment info badge -->
      <div v-if="isProfesor && selectedAssignment" class="mt-3 flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Materia seleccionada: {{ selectedAssignment.materia ? selectedAssignment.materia.nombre : '—' }}
        </span>
      </div>
    </header>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" :class="[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all no-print',
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
    <div class="p-6 no-print">

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- No assignments assigned (profesor) -->
      <div v-else-if="isProfesor && assignments.length === 0" class="text-center py-20">
        <div class="mx-auto w-16 h-16 bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Sin asignaciones</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No tienes materias asignadas para el año lectivo activo.</p>
      </div>

      <!-- Empty state (admin) -->
      <div v-else-if="!isProfesor && estudiantes.length === 0" class="text-center py-20">
        <div class="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Sin estudiantes completivos</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No hay estudiantes registrados en completivo para este filtro.</p>
      </div>

      <!-- ── PROFESOR VIEW ── -->
      <div v-else-if="isProfesor">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Marca los estudiantes que deben quedar en estado <strong class="text-amber-600">completivo</strong> en esta asignatura.
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
                <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Estado en Materia</th>
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
        <!-- Grouped by Aula -->
        <div class="space-y-6">
          <div v-for="aulaGroup in groupedCompletivos" :key="aulaGroup.aula.id" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <!-- Header of classroom -->
            <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Aula: {{ aulaGroup.aula.grado_cardinal }}° {{ aulaGroup.aula.seccion }}
                <span v-if="aulaGroup.aula.titulo" class="text-sm font-normal text-gray-500 dark:text-gray-400"> – {{ aulaGroup.aula.titulo }}</span>
              </h2>
              <span class="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                {{ aulaGroup.materias.reduce((acc, m) => acc + m.estudiantes.length, 0) }} registros
              </span>
            </div>

            <!-- Subjects inside this classroom -->
            <div class="p-6 divide-y divide-gray-100 dark:divide-gray-700 space-y-6">
              <div v-for="matGroup in aulaGroup.materias" :key="matGroup.assignment.id" class="pt-4 first:pt-0">
                <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                  <span class="flex items-center gap-2 flex-wrap">
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {{ matGroup.assignment.materia ? matGroup.assignment.materia.nombre : 'Materia' }}
                    <span class="font-normal text-gray-400">— Prof. {{ matGroup.assignment.profesor ? matGroup.assignment.profesor.nombres + ' ' + matGroup.assignment.profesor.apellidos : 'Sin asignar' }}</span>
                  </span>
                  <span class="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded">
                    {{ matGroup.estudiantes.length }} en completivo
                  </span>
                </h3>

                <!-- Students list -->
                <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th class="px-4 py-2 w-10">#</th>
                        <th class="px-4 py-2">Apellidos, Nombres</th>
                        <th class="px-4 py-2 w-40">RNE</th>
                        <th class="px-4 py-2 w-40">Cédula</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      <tr v-for="(est, estIdx) in matGroup.estudiantes" :key="est.id" class="hover:bg-gray-50/30">
                        <td class="px-4 py-2 text-gray-400">{{ estIdx + 1 }}</td>
                        <td class="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{{ est.apellidos }}, {{ est.nombres }}</td>
                        <td class="px-4 py-2 font-mono text-gray-500">{{ est.rne || '—' }}</td>
                        <td class="px-4 py-2 text-gray-500">{{ est.cedula || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PRINT CONTAINER (HIDDEN ON SCREEN, VISIBLE ON PRINT) ── -->
    <div id="printable-completivos" class="hidden-print-element print-layout font-sans text-black bg-white p-8">
      <!-- Institutional Header -->
      <div class="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
        <div class="flex items-center gap-4">
          <img v-if="authStore.tenant?.logo_url" :src="authStore.tenant.logo_url" class="w-16 h-16 object-contain" style="max-height: 64px; max-width: 64px;" />
          <div>
            <h1 class="text-xl font-bold uppercase">{{ authStore.tenant?.name || 'Centro Educativo' }}</h1>
            <p class="text-xs text-gray-600">
              <span v-if="authStore.tenant?.departamento">Departamento: {{ authStore.tenant.departamento }}</span>
              <span v-if="authStore.tenant?.distrito" class="ml-4">Distrito: {{ authStore.tenant.distrito }}</span>
            </p>
            <p class="text-xs text-gray-600" v-if="authStore.tenant?.address">{{ authStore.tenant.address }}</p>
          </div>
        </div>
        <div class="text-right text-xs text-gray-500">
          Generado: {{ formattedDatePrint }}
        </div>
      </div>

      <div class="text-center mb-6">
        <h2 class="text-lg font-bold uppercase tracking-wider">Reporte de Estudiantes en Estado Completivo</h2>
        <p class="text-sm font-semibold text-gray-700 mt-1">Año Lectivo: {{ currentYearName }}</p>
      </div>

      <!-- Content grouped by Classroom -->
      <div class="space-y-8">
        <div v-for="aulaGroup in groupedCompletivos" :key="'print-' + aulaGroup.aula.id" class="avoid-break-inside pb-4">
          <!-- Aula header -->
          <div class="border-b-2 border-gray-800 pb-1 mb-3">
            <h3 class="text-md font-bold uppercase">
              Aula: {{ aulaGroup.aula.grado_cardinal }}° {{ aulaGroup.aula.seccion }}
              <span v-if="aulaGroup.aula.titulo" class="font-normal text-sm"> – {{ aulaGroup.aula.titulo }}</span>
            </h3>
          </div>

          <!-- Materias -->
          <div class="space-y-6 pl-4">
            <div v-for="matGroup in aulaGroup.materias" :key="'print-mat-' + matGroup.assignment.id" class="avoid-break-inside">
              <h4 class="text-xs font-bold border-b border-gray-300 pb-0.5 mb-1.5 uppercase">
                {{ matGroup.assignment.materia ? matGroup.assignment.materia.nombre : 'Materia' }} 
                <span class="text-xs font-normal text-gray-600 lowercase">— Profesor: {{ matGroup.assignment.profesor ? matGroup.assignment.profesor.nombres + ' ' + matGroup.assignment.profesor.apellidos : 'Sin asignar' }}</span>
              </h4>

              <!-- Table of students -->
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="border-b border-gray-400 text-gray-700">
                    <th class="py-1 w-8 text-left">#</th>
                    <th class="py-1 text-left">Nombre Completo</th>
                    <th class="py-1 w-32 text-left">RNE</th>
                    <th class="py-1 w-32 text-left">Cédula</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(est, estIdx) in matGroup.estudiantes" :key="'print-est-' + est.id" class="py-1">
                    <td class="py-1 text-gray-500">{{ estIdx + 1 }}</td>
                    <td class="py-1 font-medium text-black">{{ est.apellidos }}, {{ est.nombres }}</td>
                    <td class="py-1 font-mono text-black">{{ est.rne || '—' }}</td>
                    <td class="py-1 text-gray-700">{{ est.cedula || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'

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

const estudiantes = ref<any[]>([])
const assignments = ref<any[]>([])
const filterAssignmentId = ref<number | null>(null)
const aulasFiltro = ref<any[]>([])
const filterAulaId = ref<number | null>(null)

/** Set of student IDs currently marked as completivo (teacher's selection) */
const completivosSeleccionados = ref<Set<number>>(new Set())
/** Original set at load time (to compute diff) */
const originalCompletivos = ref<Set<number>>(new Set())

const toast = ref({ show: false, type: 'success', message: '' })

// ── Computed ──────────────────────────────────────────────────────────────────
const selectedAssignment = computed(() => {
  return assignments.value.find(a => a.id === filterAssignmentId.value) || null
})

const allSelected = computed(() => {
  const elegibles = estudiantes.value.filter(e => !['retirado'].includes(e.estado))
  return elegibles.length > 0 && elegibles.every(e => completivosSeleccionados.value.has(e.id))
})

const someSelected = computed(() => {
  return estudiantes.value.some(e => completivosSeleccionados.value.has(e.id))
})

const hasChanges = computed(() => {
  const cur = completivosSeleccionados.value
  const orig = originalCompletivos.value
  if (cur.size !== orig.size) return true
  for (const id of cur) { if (!orig.has(id)) return true }
  return false
})

/**
 * Group flat admin completivos by Aula -> Assignment -> Students
 */
const groupedCompletivos = computed(() => {
  const map: Record<number, { aula: any; materias: Record<number, { assignment: any; estudiantes: any[] }> }> = {}

  for (const item of estudiantes.value) {
    if (!item.estudiante || !item.aula || !item.class_assignment) continue
    const aulaId = item.aula.id
    if (!map[aulaId]) {
      map[aulaId] = {
        aula: item.aula,
        materias: {}
      }
    }
    const assignmentId = item.class_assignment.id
    if (!map[aulaId].materias[assignmentId]) {
      map[aulaId].materias[assignmentId] = {
        assignment: item.class_assignment,
        estudiantes: []
      }
    }
    const exists = map[aulaId].materias[assignmentId].estudiantes.some((e: any) => e.id === item.estudiante.id)
    if (!exists) {
      map[aulaId].materias[assignmentId].estudiantes.push(item.estudiante)
    }
  }

  return Object.values(map).map(aulaGroup => {
    return {
      aula: aulaGroup.aula,
      materias: Object.values(aulaGroup.materias).map(matGroup => {
        // Sort students alphabetically
        matGroup.estudiantes.sort((a: any, b: any) => {
          const apA = (a.apellidos || '').toLowerCase()
          const apB = (b.apellidos || '').toLowerCase()
          if (apA !== apB) return apA.localeCompare(apB)
          return (a.nombres || '').toLowerCase().localeCompare((b.nombres || '').toLowerCase())
        })
        return matGroup
      })
    }
  }).sort((a: any, b: any) => {
    if (a.aula.grado_cardinal !== b.aula.grado_cardinal) {
      return a.aula.grado_cardinal - b.aula.grado_cardinal
    }
    return a.aula.seccion.localeCompare(b.aula.seccion)
  })
})

const formattedDatePrint = computed(() => {
  return new Date().toLocaleString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
})

const currentYearName = computed(() => {
  if (groupedCompletivos.value.length > 0) {
    const firstAula = groupedCompletivos.value[0]
    if (firstAula.materias.length > 0) {
      const firstMat = firstAula.materias[0]
      if (firstMat.assignment?.anio_lectivo) {
        return firstMat.assignment.anio_lectivo.nombre || 'Activo'
      }
    }
  }
  return 'Activo'
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
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
      // First fetch teacher's active assignments
      const assocRes = await api.get<any>('/api/class-assignments?only_active=true')
      if (assocRes && assocRes.data) {
        assignments.value = assocRes.data ?? []
        if (assignments.value.length > 0) {
          filterAssignmentId.value = assignments.value[0].id
        }
      }
      await loadProfesorData()
    } else {
      await loadAdminData()
    }
  } finally {
    loading.value = false
  }
}

async function loadProfesorData() {
  if (!filterAssignmentId.value) return
  loading.value = true
  try {
    const res = await api.get<any>(`/api/completivos?assignment_id=${filterAssignmentId.value}`)
    if (res.success) {
      estudiantes.value = res.data ?? []

      // Build initial selection from those already marked as completivo
      const sel = new Set<number>(
        (res.data ?? []).filter((e: any) => e.estado === 'completivo').map((e: any) => e.id)
      )
      completivosSeleccionados.value = new Set(sel)
      originalCompletivos.value = new Set(sel)
    }
  } finally {
    loading.value = false
  }
}

async function loadAdminData() {
  const query = filterAulaId.value ? `?aula_id=${filterAulaId.value}` : ''
  const res = await api.get<any>(`/api/completivos${query}`)
  if (res.success) {
    estudiantes.value = res.data ?? []
    if (res.aulas) {
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
  completivosSeleccionados.value = new Set(completivosSeleccionados.value)
}

// Selects or deselects all eligible students
function toggleAll() {
  const elegibles = estudiantes.value.filter(e => !['retirado'].includes(e.estado))
  if (allSelected.value) {
    completivosSeleccionados.value = new Set()
  } else {
    completivosSeleccionados.value = new Set(elegibles.map(e => e.id))
  }
}

async function saveChanges() {
  if (!hasChanges.value || !filterAssignmentId.value) return
  saving.value = true

  try {
    const cur = completivosSeleccionados.value
    const orig = originalCompletivos.value

    const toAssign = [...cur].filter(id => !orig.has(id))
    const toRemove = [...orig].filter(id => !cur.has(id))

    const promises: Promise<any>[] = []

    if (toAssign.length > 0) {
      promises.push(api.post('/api/completivos/assign', {
        assignment_id: filterAssignmentId.value,
        estudiante_ids: toAssign
      }))
    }
    if (toRemove.length > 0) {
      promises.push(api.post('/api/completivos/remove', {
        assignment_id: filterAssignmentId.value,
        estudiante_ids: toRemove
      }))
    }

    await Promise.all(promises)

    await loadProfesorData()
    showToast('success', 'Cambios guardados correctamente.')
  } catch (e: any) {
    showToast('error', e?.data?.message ?? 'Error al guardar los cambios.')
  } finally {
    saving.value = false
  }
}

// ── Admin: print ──────────────────────────────────────────────────────────────
function triggerPrint() {
  window.print()
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
    activo: 'Regular/Activo',
    completivo: 'Completivo',
    retirado: 'Retirado',
  }
  return labels[estado] ?? estado
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

/* Base print element display control */
.hidden-print-element {
  display: none;
}

@media print {
  /* Hide all regular screen elements */
  .no-print,
  header,
  footer,
  aside,
  nav,
  button,
  select,
  div.p-6.no-print,
  .no-print * {
    display: none !important;
  }

  /* Show only the print layout and its children */
  .hidden-print-element.print-layout {
    display: block !important;
    visibility: visible !important;
  }

  /* Configure print margins and page size */
  @page {
    size: letter portrait;
    margin: 1.5cm;
  }

  .avoid-break-inside {
    page-break-inside: avoid;
  }

  body {
    background-color: white !important;
    color: black !important;
  }
}
</style>
