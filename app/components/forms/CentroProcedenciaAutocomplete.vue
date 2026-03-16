<template>
  <div class="relative w-full">
    <!-- Input de búsqueda -->
    <input
      type="text"
      v-model="searchQuery"
      @input="handleSearch"
      @focus="showDropdown = true"
      @blur="handleBlur"
      placeholder="Buscar o escribir centro de procedencia..."
      :class="[
        'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300',
        'focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6',
        errorMessage ? 'ring-red-500 focus:ring-red-500' : ''
      ]"
    />

    <!-- Mensaje de error -->
    <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>

    <!-- Dropdown de resultados -->
    <div
      v-if="showDropdown && (searchResults.length > 0 || searchQuery.length >= 1)"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto"
    >
      <!-- Resultados de búsqueda -->
      <button
        v-for="centro in searchResults"
        :key="centro.id"
        type="button"
        @click="selectCentro(centro)"
        class="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
      >
        <div class="font-medium text-gray-900">{{ centro.nombre }}</div>
        <div v-if="centro.descripcion" class="text-xs text-gray-500">{{ centro.descripcion }}</div>
      </button>

      <!-- Opción para crear nuevo -->
      <div v-if="searchQuery.length >= 3 && !searchResults.some(c => c.nombre.toLowerCase() === searchQuery.toLowerCase())">
        <button
          type="button"
          @click="openCreateModal"
          class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 border-t border-gray-300 text-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear: "{{ searchQuery }}"
        </button>
      </div>

      <!-- Mensaje si no hay resultados -->
      <div v-if="searchResults.length === 0 && searchQuery.length < 3" class="px-4 py-2 text-gray-500 text-sm">
        Escriba al menos 3 caracteres para buscar
      </div>
    </div>

    <!-- Centro seleccionado (badge) -->
    <div v-if="selectedCentro" class="mt-2 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
      <span>{{ selectedCentro.nombre }}</span>
      <button
        type="button"
        @click="clearSelection"
        class="hover:text-blue-600 transition-colors"
        title="Limpiar selección"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Modal de creación -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Crear nuevo centro de procedencia</h3>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Nombre *</label>
            <input
              v-model="newCentroName"
              type="text"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-600 focus:outline-none focus:ring-primary-600"
              placeholder="Nombre del centro"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Descripción (opcional)</label>
            <textarea
              v-model="newCentroDescripcion"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-600 focus:outline-none focus:ring-primary-600"
              placeholder="Descripción del centro..."
            />
          </div>

          <!-- Mensajes de estado -->
          <div v-if="createError" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {{ createError }}
          </div>
          <div v-if="createSuccess" class="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ¡Centro creado exitosamente!
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            type="button"
            @click="closeCreateModal"
            :disabled="isCreating"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="createNewCentro"
            :disabled="isCreating || !newCentroName.trim()"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="isCreating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Crear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { api } from '~/utils/api'

const props = defineProps({
  modelValue: {
    type: [Number, Object],
    default: null
  },
  required: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'centro-selected', 'centro-created'])

const searchQuery = ref('')
const searchResults = ref([])
const selectedCentro = ref(null)
const showDropdown = ref(false)
const showCreateModal = ref(false)
const newCentroName = ref('')
const newCentroDescripcion = ref('')
const isCreating = ref(false)
const isSearching = ref(false)
const errorMessage = ref('')
const createError = ref('')
const createSuccess = ref(false)

let searchTimeout = null
let blurTimeout = null

const handleSearch = async () => {
  errorMessage.value = ''
  const query = searchQuery.value.trim()

  if (query.length < 2) {
    searchResults.value = []
    return
  }

  // Debounce
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true
      const response = await api.get('/api/centros-procedencia/buscar', {
        params: { q: query }
      })

      if (response.success) {
        searchResults.value = response.data || []
      }
    } catch (error) {
      console.error('Error searching centros:', error)
      errorMessage.value = 'Error al buscar centros de procedencia'
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const selectCentro = (centro) => {
  selectedCentro.value = centro
  searchQuery.value = centro.nombre
  showDropdown.value = false
  emit('update:modelValue', centro.id)
  emit('centro-selected', centro)
}

const clearSelection = () => {
  selectedCentro.value = null
  searchQuery.value = ''
  emit('update:modelValue', null)
}

const openCreateModal = () => {
  newCentroName.value = searchQuery.value
  newCentroDescripcion.value = ''
  createError.value = ''
  createSuccess.value = false
  showCreateModal.value = true
  showDropdown.value = false
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newCentroName.value = ''
  newCentroDescripcion.value = ''
  createError.value = ''
  createSuccess.value = false
}

const createNewCentro = async () => {
  const nombre = newCentroName.value.trim()
  if (!nombre) {
    createError.value = 'El nombre es requerido'
    return
  }

  try {
    isCreating.value = true
    createError.value = ''
    createSuccess.value = false

    const response = await api.post('/api/centros-procedencia', {
      nombre,
      descripcion: newCentroDescripcion.value || null
    })

    if (response.success) {
      createSuccess.value = true
      const newCentro = response.data

      // Seleccionar automáticamente
      await nextTick()
      setTimeout(() => {
        selectCentro(newCentro)
        closeCreateModal()
        emit('centro-created', newCentro)
      }, 800)
    } else {
      createError.value = response.message || 'Error al crear el centro'
    }
  } catch (error) {
    console.error('Error creating centro:', error)
    createError.value = error.response?.data?.message || 'Error al crear el centro de procedencia'
  } finally {
    isCreating.value = false
  }
}

const handleBlur = () => {
  blurTimeout = setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Cargar dato inicial si existe (comentado - no es necesario en el setup)
// if (props.modelValue) {
//   if (typeof props.modelValue === 'object') {
//     selectedCentro.value = props.modelValue
//     searchQuery.value = props.modelValue.nombre
//   }
// }
</script>
