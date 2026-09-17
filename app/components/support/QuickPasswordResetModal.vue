<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['closed', 'reset-success'])

const isVisible = ref(false)
const isLoading = ref(false)
const step = ref(1) // 1: Search & config, 2: Success

// Formularios y selección
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<any[]>([])
const selectedUser = ref<any>(null)

const passwordType = ref<'auto'|'manual'>('auto')
const manualPassword = ref('')
const notes = ref('')

// Resultados exitosos
const tempPassword = ref('')
const ticketId = ref<number | null>(null)

let searchTimeout: any = null

const config = useRuntimeConfig()

// Expose open method
const open = () => {
  resetState()
  isVisible.value = true
}

defineExpose({ open })

const resetState = () => {
  step.value = 1
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  passwordType.value = 'auto'
  manualPassword.value = ''
  notes.value = ''
  tempPassword.value = ''
  ticketId.value = null
  isLoading.value = false
}

const close = () => {
  isVisible.value = false
  emit('closed')
}

// Búsqueda de usuarios con debounce
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (newVal.length < 2) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch('/api/admin/soporte/usuarios/buscar', {
        params: { query: newVal },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        baseURL: config.public.apiBase
      })
      searchResults.value = data || []
    } catch (e) {
      console.error('Error buscando usuarios:', e)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
})

const selectUser = (user: any) => {
  selectedUser.value = user
  searchQuery.value = ''
  searchResults.value = []
}

const handleReset = async () => {
  if (!selectedUser.value) return
  if (passwordType.value === 'manual' && manualPassword.value.length < 8) {
    alert('La contraseña manual debe tener al menos 8 caracteres.')
    return
  }

  isLoading.value = true
  try {
    const data = await $fetch('/api/admin/soporte/usuarios/quick-password-reset', {
      method: 'POST',
      body: {
        user_id: selectedUser.value.id,
        password_type: passwordType.value,
        manual_password: manualPassword.value,
        notes: notes.value
      },
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      },
      baseURL: config.public.apiBase
    })

    if (data.success) {
      tempPassword.value = data.temp_password
      ticketId.value = data.ticket_id
      step.value = 2
      emit('reset-success')
    }
  } catch (e: any) {
    console.error(e)
    alert(e.response?._data?.message || e.message || 'Ocurrió un error al restablecer la contraseña.')
  } finally {
    isLoading.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(tempPassword.value)
    alert('Contraseña copiada al portapapeles.')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span class="mr-2 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          Reseteo Rápido de Contraseña
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 flex-grow overflow-y-auto" style="max-height: 80vh;">
        <!-- Paso 1 -->
        <div v-if="step === 1">
          <div v-if="!selectedUser" class="mb-6 relative">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Usuario</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
              placeholder="Nombre, cédula, correo o matrícula..."
            />
            <div v-if="isSearching" class="absolute right-3 top-9 text-gray-400">
               <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
            
            <ul v-if="searchResults.length > 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md py-1">
              <li v-for="u in searchResults" :key="u.id" 
                  @click="selectUser(u)"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center">
                <div>
                  <div class="font-medium text-gray-800 dark:text-gray-200">{{ u.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ u.email || u.username }}</div>
                </div>
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full uppercase">{{ u.role }}</span>
              </li>
            </ul>
          </div>

          <div v-else class="space-y-5">
            <div class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
              <div class="flex items-center space-x-4">
                <div class="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold">
                  {{ selectedUser.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ selectedUser.name }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedUser.email || selectedUser.username }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full uppercase mb-1">
                  {{ selectedUser.role }}
                </span>
                <button @click="selectedUser = null" class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline">Cambiar</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opciones de Contraseña</label>
              <div class="space-y-3">
                <label class="flex items-start">
                  <input type="radio" v-model="passwordType" value="auto" class="mt-1 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2">
                    <span class="block text-sm font-medium text-gray-900 dark:text-gray-100">Generar contraseña automática (Recomendado)</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-400">Crea una contraseña segura alfanumérica.</span>
                  </span>
                </label>
                <label class="flex items-start">
                  <input type="radio" v-model="passwordType" value="manual" class="mt-1 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 w-full">
                    <span class="block text-sm font-medium text-gray-900 dark:text-gray-100">Ingresar manualmente</span>
                    <input v-if="passwordType === 'manual'" 
                           v-model="manualPassword" 
                           type="text" 
                           class="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                           placeholder="Mínimo 8 caracteres" />
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones / Motivo (Opcional)</label>
              <textarea v-model="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Ej. Solicitud presencial del estudiante..."></textarea>
            </div>
          </div>
        </div>

        <!-- Paso 2 -->
        <div v-else-if="step === 2" class="text-center">
          <div class="mb-4 text-green-500 flex justify-center">
             <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Contraseña Restablecida!</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Se ha autogenerado el Ticket <strong>#{{ ticketId }}</strong> en el historial.
          </p>
          
          <div class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-6 flex flex-col items-center">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">Nueva Contraseña</span>
            <div class="text-3xl font-mono tracking-widest text-gray-800 dark:text-white mb-3 select-all">
              {{ tempPassword }}
            </div>
            <button @click="copyToClipboard" class="flex items-center text-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar al Portapapeles
            </button>
          </div>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 text-left">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Advertencia de Seguridad:</strong> Entregue esta credencial al usuario ahora. Por seguridad, no podrá visualizarse nuevamente en el sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
        <button v-if="step === 1" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto">
          Cancelar
        </button>
        <button 
          v-if="step === 1" 
          @click="handleReset" 
          :disabled="!selectedUser || isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full sm:w-auto justify-center">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Restablecer
        </button>
        <button v-if="step === 2" @click="close" class="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
