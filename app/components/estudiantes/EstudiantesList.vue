<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center gap-3 flex-wrap">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar por nombres, apellidos, cédula o RNE..." />
        <select v-model="filterSexo" class="rounded-md border-gray-300 text-sm">
          <option :value="undefined">Todos</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
        <select v-model="filterAula" class="rounded-md border-gray-300 text-sm w-48">
          <option :value="undefined">Todas las aulas</option>
          <option v-for="a in aulasStore.items" :key="a.id" :value="a.id">
            {{ a.grado_cardinal }}° {{ a.seccion }}
          </option>
        </select>
        <button @click="reordenarNumeros" :disabled="loading"
          class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          title="Reordenar números de orden alfabéticamente">
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <svg v-else class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {{ loading ? 'Reordenando...' : 'Reordenar' }}
        </button>
        
        <button v-if="filterAula" @click="$emit('generate-batch', filterAula)" :disabled="loading || allUsersGenerated"
          class="ml-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          :title="allUsersGenerated ? 'Todos los estudiantes de esta aula ya tienen usuario' : 'Generar usuarios para todos los estudiantes de esta aula'">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Generar Usuarios
        </button>
        <div class="ml-auto text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RNE</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nac.</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="e in filtered" :key="e.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ e.numero_orden ?? '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ e.nombres }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">{{ e.apellidos }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ e.cedula || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">{{ e.rne || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(e.fecha_nacimiento) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ e.edad }} años</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="e.sexo === 'Masculino' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'">
                {{ e.sexo }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span v-if="e.aula"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                {{ e.aula.grado_cardinal }}° {{ e.aula.seccion }}
              </span>
              <span v-else class="text-gray-400 text-xs">Sin asignar</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <!-- Botones para registros activos -->
              <template v-if="props.statusFilter === 'active'">
                <button v-if="!e.user" @click="$emit('generate-user', e)"
                  class="inline-flex items-center justify-center p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                  title="Generar Usuario">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
                <button v-else @click="$emit('reset-password', e)"
                  class="inline-flex items-center justify-center p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors"
                  :title="'Restablecer contraseña para: ' + e.user.username">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>

                <button @click="$emit('edit', e)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', e)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>

              <!-- Botón para registros eliminados -->
              <template v-else-if="props.statusFilter === 'inactive'">
                <button @click="$emit('restore', e)"
                  class="inline-flex items-center justify-center p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Restaurar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </template>

              <!-- Botones para vista 'todos' -->
              <template v-else-if="props.statusFilter === 'all'">
                <button @click="$emit('edit', e)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', e)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="10" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading && filtered.length === 0">
            <td colspan="10" class="px-4 py-6 text-center text-sm text-gray-500">
                <div class="flex justify-center items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Loading Overlay for table updates -->
      <div v-if="loading && filtered.length > 0" class="absolute inset-x-0 bottom-0 flex justify-center py-2 bg-white/80 border-t z-10">
          <span class="inline-flex items-center text-sm text-blue-600 font-medium">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizando...
          </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEstudiantesStore, type Estudiante } from '../../stores/estudiantes'
import { useAulasStore } from '../../stores/aulas'

defineEmits<{
  edit: [estudiante: Estudiante]
  delete: [estudiante: Estudiante]
  restore: [estudiante: Estudiante]
  'generate-user': [estudiante: Estudiante]
  'generate-batch': [aulaId: number]
  'reset-password': [estudiante: Estudiante]
}>()

interface Props {
  statusFilter?: 'active' | 'inactive' | 'all'
}

const props = withDefaults(defineProps<Props>(), {
  statusFilter: 'active'
})

const store = useEstudiantesStore()
const aulasStore = useAulasStore()
const query = ref('')
const filterSexo = ref<'Masculino' | 'Femenino' | undefined>(undefined)
const filterAula = ref<number | undefined>(undefined)

onMounted(() => {
  if (store.items.length === 0) {
    store.fetchAll()
  }
  if (aulasStore.items.length === 0) {
    aulasStore.fetchAll()
  }
})

const loading = computed(() => store.loading)

const reordenarNumeros = async () => {
  try {
    // Mostrar confirmación antes de reordenar
    const { default: Swal } = await import('sweetalert2')

    const result = await Swal.fire({
      title: '¿Reordenar números?',
      text: 'Esto reordenará todos los números de orden alfabéticamente por apellidos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, reordenar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      await store.reordenarNumeros()

      await Swal.fire({
        title: '¡Reordenado!',
        text: 'Los números de orden han sido actualizados correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error('Error al reordenar números:', error)
    const { default: Swal } = await import('sweetalert2')
    await Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al reordenar los números',
      icon: 'error'
    })
  }
}

const filtered = computed<Estudiante[]>(() => {
  const q = query.value.toLowerCase()
  return store.ordenados.filter((e: Estudiante) => {
    const matchesQuery = e.nombres.toLowerCase().includes(q) ||
      e.apellidos.toLowerCase().includes(q) ||
      (e.cedula && e.cedula.toLowerCase().includes(q)) ||
      (e.rne && e.rne.toLowerCase().includes(q))

    const matchesSexo = filterSexo.value === undefined || e.sexo === filterSexo.value
    const matchesAula = filterAula.value === undefined || e.aula_id === filterAula.value

    return matchesQuery && matchesSexo && matchesAula
  })
})

const allUsersGenerated = computed(() => {
  // Solo aplica si hay filtro de aula y hay estudiantes en la lista
  if (!filterAula.value || filtered.value.length === 0) return false
  
  // Retorna true si TODOS los estudiantes filtrados tienen usuario
  return filtered.value.every(e => e.user)
})

const formatDate = (date: string) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('es-DO')
  } catch {
    return date
  }
}
</script>