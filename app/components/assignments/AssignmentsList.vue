<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Año lectivo</label>
        <select v-model="anioId" class="border rounded px-2 py-1 text-sm h-8 w-40">
           <option :value="null">Seleccione...</option>
           <option v-for="a in anios" :key="a.id" :value="a.id">
             {{ a.nombre }}
           </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Aula</label>
        <select v-model.number="aulaId" class="border rounded px-2 py-1 text-sm h-8">
          <option :value="undefined">Todas</option>
          <option v-for="a in aulas" :key="a.id" :value="a.id">
            {{ aulaLabel(a) }}
          </option>
        </select>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button @click="onRefresh"
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button @click="$emit('new')"
          class="inline-flex items-center justify-center p-1.5 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
          title="Nueva asignación">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/Sem</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="a in filtered" :key="a.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ a.materia?.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ a.profesor ? (a.profesor.nombre + ' ' +
              a.profesor.apellido) : '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ aulaName(a.aula) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-center">{{ a.horas_semanales ?? '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="a.activo ? 'text-green-600' : 'text-red-600'">{{ a.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <button @click="$emit('edit', a)"
                class="inline-flex items-center justify-center p-1.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                title="Editar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="a.activo" @click="$emit('deactivate', a.id)"
                class="inline-flex items-center justify-center p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                title="Desactivar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="!loading && filtered && filtered.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { useAniosLectivosStore } from '../../stores/anios_lectivos'

defineEmits<{
  new: []
  edit: [assignment: ClassAssignment]
  deactivate: [id: number]
  viewStudents: [assignment: ClassAssignment] // Potentially useful
}>()

const assignments = useClassAssignmentsStore()
const aulasStore = useAulasStore()
const aniosStore = useAniosLectivosStore()

const anioId = ref<number | null>(assignments.anioLectivoId)
const aulaId = ref<number | undefined>(undefined)

onMounted(async () => {
  if (aniosStore.items.length === 0) await aniosStore.fetchAll({ activo: true })
  
  // Set default if not set
  if (!anioId.value && aniosStore.items.length > 0) {
      anioId.value = aniosStore.items[0]?.id || null
      // Update global store default
      assignments.anioLectivoId = anioId.value
  }

  if (aulasStore.items.length === 0) await aulasStore.fetchAll()
  
  await fetch()
})

watch([anioId, aulaId], () => {
  if (anioId.value) {
      assignments.anioLectivoId = anioId.value // Keep global sync
      fetch()
  }
})

const fetch = () => {
    if (anioId.value) {
        assignments.fetchAll({ anio_lectivo_id: anioId.value, aula_id: aulaId.value })
    } else {
        assignments.items = [] // Clear if no year selected
    }
}

const aulas = computed(() => aulasStore.items || [])
const anios = computed(() => aniosStore.items || [])
const loading = computed(() => assignments.loading)
const filtered = computed(() => assignments.items || [])

const aulaLabel = (a: Aula) => aulaName(a)
const aulaName = (a?: Aula) => {
  if (!a) return '—'
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${a.id}`
}

const onRefresh = () => fetch()
</script>

<style scoped></style>
