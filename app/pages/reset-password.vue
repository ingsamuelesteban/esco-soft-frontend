<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/images/logo.png?v=2" alt="EscoSoft Logo" class="h-32 w-auto" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Nueva contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu nueva contraseña para recuperar el acceso.
        </p>
      </div>

      <div v-if="status.message" :class="[
        'rounded-md p-4 mb-4 shadow-sm border',
        status.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
      ]">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="status.success" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ status.message }}</p>
            <div v-if="status.success" class="mt-3">
              <NuxtLink to="/login" class="text-sm font-semibold text-green-700 hover:text-green-600 flex items-center">
                Regresar al inicio de sesión
                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <form v-if="!status.success" class="mt-8 space-y-6" @submit.prevent="handleReset">
        <div class="space-y-5">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
            <div class="relative">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': form.password && !isPasswordLengthValid,
                  'border-green-300 focus:ring-green-500 focus:border-green-500': isPasswordLengthValid,
                  'border-gray-300 dark:border-gray-600': !form.password
                }"
                placeholder="Mínimo 8 caracteres" :disabled="status.loading" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 focus:outline-none">
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <!-- Validation indicator -->
            <div class="mt-1 flex items-center text-xs" 
              :class="isPasswordLengthValid ? 'text-green-600' : (form.password ? 'text-red-600' : 'text-gray-500 dark:text-gray-400')">
              <svg v-if="isPasswordLengthValid" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg v-else-if="form.password" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span v-else class="w-4 h-4 mr-1">•</span>
              Mínimo 8 caracteres
            </div>
          </div>

          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
            <div class="relative">
              <input id="password_confirmation" v-model="form.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'" required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': form.password_confirmation && !doPasswordsMatch,
                  'border-green-300 focus:ring-green-500 focus:border-green-500': doPasswordsMatch,
                  'border-gray-300 dark:border-gray-600': !form.password_confirmation
                }"
                placeholder="Confirma tu nueva contraseña" :disabled="status.loading" />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 focus:outline-none">
                <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <!-- Match indicator -->
            <div class="mt-1 flex items-center text-xs"
              :class="doPasswordsMatch ? 'text-green-600' : (form.password_confirmation ? 'text-red-600' : 'text-gray-500 dark:text-gray-400')">
              <svg v-if="doPasswordsMatch" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg v-else-if="form.password_confirmation" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span v-else class="w-4 h-4 mr-1">•</span>
              Las contraseñas coinciden
            </div>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="status.loading || !canSubmit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            <span v-if="status.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
            {{ status.loading ? 'Restableciendo...' : 'Restablecer contraseña' }}
          </button>
        </div>
      </form>
      
      <div v-else class="text-center mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <p class="text-sm text-gray-600 dark:text-gray-400">Puedes volver a <NuxtLink to="/login" class="text-blue-600 font-semibold hover:underline">iniciar sesión</NuxtLink> con tu nueva contraseña.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const route = useRoute()
const config = useRuntimeConfig()

const form = reactive({
  token: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const status = reactive({
  loading: false,
  message: '',
  success: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validaciones en tiempo real
const isPasswordLengthValid = computed(() => {
  return form.password && form.password.length >= 8
})

const doPasswordsMatch = computed(() => {
  return isPasswordLengthValid.value && 
         form.password_confirmation && 
         form.password === form.password_confirmation
})

const canSubmit = computed(() => {
  return isPasswordLengthValid.value && doPasswordsMatch.value && !status.loading
})

onMounted(() => {
  form.token = route.query.token || ''
  form.email = route.query.email || ''

  if (!form.token || !form.email) {
    status.message = 'El enlace de recuperación es inválido o faltan datos necesarios.'
  }
})

const handleReset = async () => {
  if (!canSubmit.value) return

  status.loading = true
  status.message = ''

  try {
    const response = await $fetch('/api/password/reset', {
      method: 'POST',
      body: form,
      baseURL: config.public.apiBase
    })

    if (response.success) {
      status.success = true
      status.message = response.message
    } else {
      status.message = response.message || 'Error al restablecer la contraseña. Es posible que el enlace haya expirado.'
    }
  } catch (err) {
    status.message = err.data?.message || 'Hubo un problema al procesar tu solicitud. Por favor, solicita un nuevo enlace de recuperación.'
    console.error('Reset error:', err)
  } finally {
    status.loading = false
  }
}
</script>
