<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Acceso Generado Exitosamente
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Se han generado las siguientes credenciales. Por favor, compártalas con el usuario.
              </p>
              
              <div class="mt-4 bg-gray-50 p-4 rounded-md text-left">
                <div class="mb-3">
                  <label class="block text-xs font-medium text-gray-500 uppercase">Usuario</label>
                  <div class="mt-1 flex justify-between items-center">
                    <span class="text-lg font-mono font-bold text-gray-900">{{ credentials.username }}</span>
                    <button @click="copyToClipboard(credentials.username)" class="text-blue-600 hover:text-blue-800 text-sm">Copiar</button>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="block text-xs font-medium text-gray-500 uppercase">Email (Login alternativo)</label>
                  <div class="mt-1 flex justify-between items-center">
                    <span class="text-md font-mono text-gray-700">{{ credentials.email }}</span>
                    <button @click="copyToClipboard(credentials.email)" class="text-blue-600 hover:text-blue-800 text-sm">Copiar</button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase">Contraseña Temporal</label>
                  <div class="mt-1 flex justify-between items-center">
                    <span class="text-lg font-mono font-bold text-gray-900">{{ credentials.password }}</span>
                    <button @click="copyToClipboard(credentials.password)" class="text-blue-600 hover:text-blue-800 text-sm">Copiar</button>
                  </div>
                </div>
              </div>
              
              <p class="mt-4 text-xs text-red-500">
                Nota: El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-6">
          <button type="button"
            class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            @click="close">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  credentials: {
    username: string
    email: string
    password: string
  }
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  // Opcional: mostrar toast
}
</script>
