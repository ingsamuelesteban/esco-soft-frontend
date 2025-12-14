<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center gap-3 flex-wrap">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar por título, grado o sección..." />
        <div class="ml-auto text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiantes</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="a in filtered" :key="a.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ a.titulo?.nombre || '' }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
              <div class="flex items-center">
                <span class="text-base font-semibold">{{ gradoLabel(a.grado_cardinal) }}</span>
                <span v-if="a.seccion" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {{ a.seccion }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <svg class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span class="font-medium text-gray-900">{{ getEstudiantesCount(a.id) }}</span>
                </div>
                <div v-if="a.capacidad" class="flex items-center">
                  <span class="text-gray-400">/</span>
                  <span class="text-gray-600 ml-1">{{ a.capacidad }}</span>
                </div>
                <div v-if="a.capacidad" class="ml-2">
                  <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                    :title="`${Math.round((getEstudiantesCount(a.id) / a.capacidad) * 100)}% ocupado`">
                    <div class="h-full transition-all duration-300"
                      :class="getOccupancyColor(getEstudiantesCount(a.id), a.capacidad)"
                      :style="{ width: `${Math.min((getEstudiantesCount(a.id) / a.capacidad) * 100, 100)}%` }"></div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="a.activo ? 'text-green-600' : 'text-red-600'">{{ a.activo ? 'Activa' : 'Inactiva' }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <button @click="$emit('viewStudents', a)"
                class="inline-flex items-center justify-center p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                title="Ver estudiantes">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button @click="$emit('edit', a)"
                class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Editar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="a.activo" @click="$emit('delete', a.id)"
                class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Desactivar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
              <span v-else class="inline-flex items-center justify-center p-1.5 text-gray-400" title="Inactiva">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </span>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { useEstudiantesStore } from '../../stores/estudiantes'

interface Props {
  statusFilter?: 'active' | 'inactive' | 'all'
}

const props = withDefaults(defineProps<Props>(), {
  statusFilter: 'active'
})

defineEmits<{
  edit: [aula: Aula]
  delete: [id: number]
  viewStudents: [aula: Aula]
}>()

const store = useAulasStore()
const estudiantesStore = useEstudiantesStore()
const query = ref('')

// onMounted removed - data fetching is handled by the parent page
// onMounted(() => {
//   if (store.items.length === 0) {
//     store.fetchAll()
//   }
//   if (estudiantesStore.items.length === 0) {
//     estudiantesStore.fetchAll('active')
//   }
// })

const loading = computed(() => store.loading)

const filtered = computed<Aula[]>(() => {
  const q = query.value.toLowerCase()

  let items = store.items

  // Filtrar por estado según el statusFilter
  if (props.statusFilter === 'active') {
    items = items.filter((a: Aula) => a.activo === true)
  } else if (props.statusFilter === 'inactive') {
    items = items.filter((a: Aula) => a.activo === false)
  }
  // Si es 'all', no filtramos por estado

  // Filtrar por búsqueda de texto
  return items.filter((a: Aula) =>
    (a.titulo?.nombre?.toLowerCase().includes(q) ?? false) ||
    String(a.grado_cardinal ?? '').toLowerCase().includes(q) ||
    a.seccion.toLowerCase().includes(q)
  )
})

const getEstudiantesCount = (aulaId: number): number => {
  return estudiantesStore.items.filter(estudiante => estudiante.aula_id === aulaId).length
}

const getOccupancyColor = (current: number, capacity: number): string => {
  if (!capacity) return 'bg-gray-400'
  const percentage = (current / capacity) * 100

  if (percentage <= 60) return 'bg-green-500'      // Verde: <= 60%
  if (percentage <= 85) return 'bg-yellow-500'    // Amarillo: 60-85%
  if (percentage <= 100) return 'bg-orange-500'   // Naranja: 85-100%
  return 'bg-red-500'                              // Rojo: > 100% (sobreocupado)
}

const gradoLabel = (n: number | null) => {
  if (!n) return ''
  if (n === 1) return '1ro'
  if (n === 2) return '2do'
  if (n === 3) return '3ro'
  if (n === 4) return '4to'
  if (n === 5) return '5to'
  if (n === 6) return '6to'
  return String(n)
}
</script>
