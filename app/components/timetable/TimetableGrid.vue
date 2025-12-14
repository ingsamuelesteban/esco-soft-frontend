<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Año lectivo</label>
        <select v-model.number="anioId" class="border rounded px-2 py-1 text-sm h-8">
          <option :value="undefined">Seleccionar...</option>
          <option v-for="a in aniosLectivosStore.activos" :key="a.id" :value="a.id">
            {{ a.nombre }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Aula</label>
        <select v-model.number="aulaId" class="border rounded px-2 py-1 text-sm h-8">
          <option :value="undefined">Seleccionar…</option>
          <option v-for="a in aulas" :key="a.id" :value="a.id">{{ aulaName(a) }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Asignación</label>
        <select v-model.number="selectedAssignmentId" class="border rounded px-2 py-1 text-sm h-8 min-w-[220px]"
          :disabled="!aulaId || !anioId">
          <option :value="undefined">Seleccionar asignación…</option>
          <option v-for="a in assignmentsForAula" :key="a.id" :value="a.id">
            {{ a.materia?.nombre }} — {{ teacherName(a) }} ({{ getAssignmentHours(a) }})
          </option>
        </select>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button @click="reload"
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto" :class="{ 'overflow-y-auto': fitViewport }" :style="wrapperStyle">
      <table class="min-w-full table-fixed divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Período
            </th>
            <th v-for="d in days" :key="d.value"
              class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ d.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="p in classPeriods" :key="p.id" class="align-top">
            <td class="px-2 py-2 text-sm text-gray-600 w-44">
              <div class="font-medium text-gray-900">{{ p.label }}</div>
              <div class="text-xs">{{ formatTime12h(p.start_time) }} - {{ formatTime12h(p.end_time) }}</div>
            </td>
            <td v-for="d in days" :key="d.value" class="px-1 py-1">
              <div class="h-20 border rounded p-1 text-xs relative group min-w-0">
                <template v-if="entryAt(d.value, p.id)">
                  <div class="h-full w-full min-w-0 flex flex-col justify-between">
                    <div class="font-semibold truncate" :title="entryAt(d.value, p.id)?.assignment?.materia?.nombre">
                      {{
                        entryAt(d.value, p.id)?.assignment?.materia?.nombre }}</div>
                    <div class="text-gray-500 truncate" :title="teacherName(entryAt(d.value, p.id)?.assignment)">{{
                      teacherName(entryAt(d.value, p.id)?.assignment) }}</div>
                  </div>
                  <button @click="remove(entryAt(d.value, p.id)?.id as number)"
                    class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 inline-flex items-center justify-center p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                    title="Eliminar">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <button @click="assignHere(d.value, p.id)"
                    class="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600"
                    :disabled="!selectedAssignmentId || !aulaId" title="Asignar aquí">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="!aulaId">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Selecciona un aula para ver y editar
              el
              horario
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAulasStore, type Aula } from '~/stores/aulas'
import { usePeriodsStore } from '~/stores/periods'
import { useClassAssignmentsStore, type ClassAssignment } from '~/stores/class_assignments'
import { useTimetableEntriesStore } from '~/stores/timetable_entries'
import { useAniosLectivosStore } from '~/stores/anios_lectivos'
import { formatTime12h } from '~/utils/timeFormat'
import Swal from 'sweetalert2'

// Opcional: hacer que el grid se ajuste a la altura de la pantalla en pantallas grandes
const props = defineProps<{
  fitViewport?: boolean
  // Offset en px para descontar encabezados/controles superiores de la altura de la ventana
  viewportOffset?: number
}>()

const aulasStore = useAulasStore()
const periodsStore = usePeriodsStore()
const assignments = useClassAssignmentsStore()
const entries = useTimetableEntriesStore()
const aniosLectivosStore = useAniosLectivosStore()

const anioId = ref<number | undefined>(undefined)
const aulaId = ref<number | undefined>(undefined)
const selectedAssignmentId = ref<number | undefined>(undefined)

const days = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
]

const keyOf = (dia: number, periodId: number, aula?: number) => `${dia}-${periodId}-${aula ?? 0}`

onMounted(async () => {
  if (aulasStore.items.length === 0) await aulasStore.fetchAll()
  if (periodsStore.items.length === 0) await periodsStore.fetchAll()
  if (aniosLectivosStore.items.length === 0) await aniosLectivosStore.fetchAll()
})

watch([anioId, aulaId], async () => {
  if (!aulaId.value || !anioId.value) return
  await assignments.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })
  await entries.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })
})

const classPeriods = computed(() => periodsStore.clases)
const aulas = computed(() => aulasStore.items)
const assignmentsForAula = computed(() => {
  if (!aulaId.value) return []
  return assignments.items.filter(a => a.aula_id === aulaId.value)
})
const entryMap = computed(() => entries.byKey)

const entryAt = (dia: number, periodId: number) => entryMap.value.get(keyOf(dia, periodId, aulaId.value))

const teacherName = (a?: ClassAssignment) => a?.profesor ? `${a.profesor.nombre} ${a.profesor.apellido}` : '—'
const aulaName = (a: Aula) => {
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${a.id}`
}

const getAssignmentHours = (assignment: ClassAssignment) => {
  if (!assignment.periodos_programados) return `0/${assignment.horas_semanales}`
  return `${assignment.periodos_programados}/${assignment.horas_semanales}`
}

const reload = async () => {
  if (!aulaId.value || !anioId.value) return
  await assignments.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })
  await entries.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })
}

const assignHere = async (dia: number, periodId: number) => {
  if (!selectedAssignmentId.value || !aulaId.value) return

  const currentSelectedId = selectedAssignmentId.value

  try {
    await entries.create({ assignment_id: selectedAssignmentId.value, dia, period_id: periodId })

    // Actualizar las asignaciones para reflejar los nuevos períodos programados
    await assignments.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })

    // Mantener la selección actual si la asignación aún existe
    const stillExists = assignmentsForAula.value.find(a => a.id === currentSelectedId)
    if (stillExists) {
      selectedAssignmentId.value = currentSelectedId
    }
  } catch (e: any) {
    console.error('Error al asignar horario:', e)

    // Mostrar mensaje de error más específico
    let title = 'Error al Asignar Horario'
    let message = 'No se pudo completar la asignación'
    let icon: 'error' | 'warning' = 'error'

    const status = e.statusCode || e.status
    if (status === 422) {
      if (e.data?.message) {
        message = e.data.message
        icon = 'warning'
        title = 'Conflicto de Horario'
      } else {
        message = 'Conflicto de horario: el profesor o el aula ya están ocupados en este período'
        icon = 'warning'
        title = 'Conflicto de Horario'
      }
    }

    // Mostrar SweetAlert con información detallada
    await Swal.fire({
      title,
      text: message,
      icon,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3B82F6'
    })
  }
}

const remove = async (id: number) => {
  const currentSelectedId = selectedAssignmentId.value

  await entries.remove(id)

  // Actualizar las asignaciones para reflejar los cambios en períodos programados
  if (aulaId.value && anioId.value) {
    await assignments.fetchAll({ aula_id: aulaId.value, anio_lectivo_id: anioId.value })

    // Mantener la selección actual si la asignación aún existe
    const stillExists = assignmentsForAula.value.find(a => a.id === currentSelectedId)
    if (stillExists) {
      selectedAssignmentId.value = currentSelectedId
    }
  }
}

// Calcula un alto máximo para el contenedor con scroll vertical cuando se desea ajustar al viewport
const wrapperStyle = computed(() => {
  if (!props.fitViewport) return {}
  const offset = typeof props.viewportOffset === 'number' ? props.viewportOffset : 260
  return { maxHeight: `calc(100vh - ${offset}px)` }
})
</script>
