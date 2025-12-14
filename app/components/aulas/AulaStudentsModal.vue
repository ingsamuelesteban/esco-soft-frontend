<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Estudiantes - {{ aulaLabel }}
                </h3>
                <p class="text-sm text-gray-500">
                  Gestiona los estudiantes asignados a esta aula
                </p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white px-4 pb-4 sm:p-6 sm:pt-0">
          <!-- Stats -->
          <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-semibold text-blue-900">{{ estudiantesAsignados.length }}</div>
              <div class="text-sm text-blue-700">Estudiantes asignados</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-2xl font-semibold text-gray-900">{{ estudiantesSinAula.length }}</div>
              <div class="text-sm text-gray-700">Sin aula asignada</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-semibold text-green-900">{{ aula?.capacidad || '—' }}</div>
              <div class="text-sm text-green-700">Capacidad máxima</div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button @click="activeTab = 'assigned'" :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]">
                Estudiantes Asignados ({{ estudiantesAsignados.length }})
              </button>
              <button @click="activeTab = 'unassigned'" :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'unassigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]">
                Sin Aula ({{ estudiantesSinAula.length }})
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div v-if="activeTab === 'assigned'" class="space-y-4">
            <div v-if="loading" class="text-center py-8 text-gray-500">
              Cargando estudiantes...
            </div>
            <div v-else-if="estudiantesAsignados.length === 0" class="text-center py-8 text-gray-500">
              No hay estudiantes asignados a esta aula
            </div>
            <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RNE</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="estudiante in estudiantesAsignados" :key="estudiante.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ estudiante.numero_orden }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ estudiante.nombres }} {{ estudiante.apellidos }}
                      </div>
                      <div class="text-sm text-gray-500">{{ estudiante.cedula }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ estudiante.rne }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button @click="removerDeAula(estudiante)"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Remover
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'unassigned'" class="space-y-4">
            <div v-if="loadingUnassigned" class="text-center py-8 text-gray-500">
              Cargando estudiantes...
            </div>
            <div v-else-if="estudiantesSinAula.length === 0" class="text-center py-8 text-gray-500">
              Todos los estudiantes tienen aula asignada
            </div>
            <div v-else>
              <!-- Barra de acciones múltiples -->
              <div v-if="estudiantesSinAula.length > 0"
                class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <label class="flex items-center">
                    <input type="checkbox" :checked="todosSeleccionados"
                      :indeterminate="algunosSeleccionados && !todosSeleccionados" @change="toggleSeleccionTodos"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span class="ml-2 text-sm text-gray-700">
                      {{ estudiantesSeleccionados.size > 0 ? `${estudiantesSeleccionados.size} seleccionado(s)` :
                        'Seleccionar todos' }}
                    </span>
                  </label>
                </div>
                <button v-if="estudiantesSeleccionados.size > 0" @click="asignarSeleccionadosAAula"
                  :disabled="asignandoMultiple"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  <svg v-if="asignandoMultiple" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  {{ asignandoMultiple ? 'Asignando...' : `Asignar ${estudiantesSeleccionados.size} estudiante(s)` }}
                </button>
              </div>

              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" :checked="todosSeleccionados"
                          :indeterminate="algunosSeleccionados && !todosSeleccionados" @change="toggleSeleccionTodos"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RNE
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="estudiante in estudiantesSinAula" :key="estudiante.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" :checked="estudiantesSeleccionados.has(estudiante.id)"
                          @change="toggleSeleccionEstudiante(estudiante.id)"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ estudiante.nombres }} {{ estudiante.apellidos }}
                        </div>
                        <div class="text-sm text-gray-500">{{ estudiante.cedula }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ estudiante.rne }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button @click="asignarAAula(estudiante)"
                          class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Asignar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="$emit('close')" type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEstudiantesStore, type Estudiante } from '../../stores/estudiantes'
import { showConfirm, showToast, showError } from '../../utils/sweetalert'
import type { Aula } from '../../stores/aulas'

interface Props {
  open: boolean
  aula: Aula | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: []
}>()

const config = useRuntimeConfig()
const estudiantesStore = useEstudiantesStore()
const activeTab = ref<'assigned' | 'unassigned'>('assigned')
const loading = ref(false)
const loadingUnassigned = ref(false)
const estudiantesAsignados = ref<Estudiante[]>([])
const estudiantesSinAula = ref<Estudiante[]>([])
const estudiantesSeleccionados = ref<Set<number>>(new Set())
const asignandoMultiple = ref(false)

const aulaLabel = computed(() => {
  if (!props.aula) return ''
  return `${props.aula.grado_cardinal}° ${props.aula.seccion}${props.aula.titulo ? ` - ${props.aula.titulo.nombre}` : ''}`
})

const todosSeleccionados = computed(() => {
  return estudiantesSinAula.value.length > 0 && estudiantesSinAula.value.every(e => estudiantesSeleccionados.value.has(e.id))
})

const algunosSeleccionados = computed(() => {
  return estudiantesSinAula.value.some(e => estudiantesSeleccionados.value.has(e.id))
})

// Cargar estudiantes cuando se abre el modal
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.aula) {
    estudiantesSeleccionados.value.clear()
    await cargarEstudiantesAsignados()
    await cargarEstudiantesSinAula()
  }
})

const cargarEstudiantesAsignados = async () => {
  if (!props.aula) return

  loading.value = true
  try {
    const response = await api.get<{ success: boolean; data: Estudiante[] }>(`/api/aulas/${props.aula.id}/estudiantes`)
    estudiantesAsignados.value = response.data
  } catch (error) {
    console.error('Error al cargar estudiantes asignados:', error)
    showError('Error al cargar estudiantes asignados')
  } finally {
    loading.value = false
  }
}

const cargarEstudiantesSinAula = async () => {
  loadingUnassigned.value = true
  try {
    // Obtener todos los estudiantes activos
    await estudiantesStore.fetchAll('active')

    // Filtrar los que no tienen aula asignada
    estudiantesSinAula.value = estudiantesStore.items.filter(
      estudiante => estudiante.aula_id === null
    )
  } catch (error) {
    console.error('Error al cargar estudiantes sin aula:', error)
    showError('Error al cargar estudiantes sin aula')
  } finally {
    loadingUnassigned.value = false
  }
}

const asignarAAula = async (estudiante: Estudiante) => {
  if (!props.aula) return

  const result = await showConfirm(
    `¿Asignar a ${estudiante.nombres} ${estudiante.apellidos} al aula ${aulaLabel.value}?`,
    'Asignar estudiante',
    'question',
    'Sí, asignar',
    'Cancelar'
  )

  if (!result.isConfirmed) return

  try {
    await estudiantesStore.update(estudiante.id, {
      ...estudiante,
      aula_id: props.aula.id
    })

    showToast('Estudiante asignado exitosamente', 'success')

    // Recargar datos
    await cargarEstudiantesAsignados()
    await cargarEstudiantesSinAula()
    emit('updated')
  } catch (error) {
    console.error('Error al asignar estudiante:', error)
    showError('Error al asignar estudiante')
  }
}

const removerDeAula = async (estudiante: Estudiante) => {
  const result = await showConfirm(
    `¿Remover a ${estudiante.nombres} ${estudiante.apellidos} del aula ${aulaLabel.value}?`,
    'Remover estudiante',
    'warning',
    'Sí, remover',
    'Cancelar'
  )

  if (!result.isConfirmed) return

  try {
    await estudiantesStore.update(estudiante.id, {
      ...estudiante,
      aula_id: null
    })

    showToast('Estudiante removido exitosamente', 'success')

    // Recargar datos
    await cargarEstudiantesAsignados()
    await cargarEstudiantesSinAula()
    emit('updated')
  } catch (error) {
    console.error('Error al remover estudiante:', error)
    showError('Error al remover estudiante')
  }
}

const toggleSeleccionTodos = () => {
  if (todosSeleccionados.value) {
    // Deseleccionar todos
    estudiantesSeleccionados.value.clear()
  } else {
    // Seleccionar todos
    estudiantesSinAula.value.forEach(estudiante => {
      estudiantesSeleccionados.value.add(estudiante.id)
    })
  }
}

const toggleSeleccionEstudiante = (estudianteId: number) => {
  if (estudiantesSeleccionados.value.has(estudianteId)) {
    estudiantesSeleccionados.value.delete(estudianteId)
  } else {
    estudiantesSeleccionados.value.add(estudianteId)
  }
}

const asignarSeleccionadosAAula = async () => {
  if (!props.aula || estudiantesSeleccionados.value.size === 0) return

  const estudiantesAAsignar = estudiantesSinAula.value.filter(e =>
    estudiantesSeleccionados.value.has(e.id)
  )

  const result = await showConfirm(
    `¿Asignar ${estudiantesAAsignar.length} estudiante(s) al aula ${aulaLabel.value}?`,
    'Asignar estudiantes',
    'question',
    'Sí, asignar',
    'Cancelar'
  )

  if (!result.isConfirmed) return

  asignandoMultiple.value = true
  let exitosos = 0
  let fallidos = 0

  try {
    for (const estudiante of estudiantesAAsignar) {
      try {
        await estudiantesStore.update(estudiante.id, {
          ...estudiante,
          aula_id: props.aula.id
        })
        exitosos++
      } catch (error) {
        console.error(`Error al asignar estudiante ${estudiante.id}:`, error)
        fallidos++
      }
    }

    if (exitosos > 0) {
      showToast(`${exitosos} estudiante(s) asignado(s) exitosamente`, 'success')
    }

    if (fallidos > 0) {
      showError(`${fallidos} estudiante(s) no pudieron ser asignados`)
    }

    // Limpiar selecciones y recargar datos
    estudiantesSeleccionados.value.clear()
    await cargarEstudiantesAsignados()
    await cargarEstudiantesSinAula()
    emit('updated')
  } finally {
    asignandoMultiple.value = false
  }
}
</script>