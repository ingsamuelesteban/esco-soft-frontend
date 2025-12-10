<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/images/logo.png?v=2" alt="EscoSoft Logo" class="h-32 w-auto" @error="logoError = true" />
          <!-- Fallback si hay error cargando el logo -->
          <div v-if="logoError" class="h-32 w-32 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-4xl font-bold">ES</span>
          </div>
        </div>

        <p class="mt-2 text-center text-sm text-gray-600">
          Inicia sesión en tu cuenta
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Usuario</label>
            <input id="username" v-model="form.username" name="username" type="text" autocomplete="username" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Usuario" :disabled="isLoading" />
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <div class="relative">
              <input id="password" v-model="form.password" name="password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Contraseña" :disabled="isLoading" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center z-20 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Checkbox Recordarme -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember" v-model="form.remember" name="remember" type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="remember" class="ml-2 block text-sm text-gray-900">
              Recordarme
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 leading-5">
                {{ error }}
              </p>
            </div>
            <div class="ml-auto pl-3">
              <div class="-mx-1.5 -my-1.5">
                <button @click="error = ''"
                  class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50">
                  <span class="sr-only">Cerrar</span>
                  <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="isSuccess" class="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700 leading-5">
                ¡Inicio de sesión exitoso! Redirigiendo...
              </p>
            </div>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading || isSuccess" :class="[
            'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed transition-colors',
            isSuccess
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          ]">
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
            <span v-if="isSuccess" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clip-rule="evenodd" />
              </svg>
            </span>
            {{ isSuccess ? '¡Éxito!' : (isLoading ? 'Iniciando sesión...' : 'Iniciar sesión') }}
          </button>
        </div>
      </form>

      <!-- Modal de cambio de contraseña obligatorio -->
      <div v-if="showPasswordChange"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                Cambio de contraseña obligatorio
              </h3>
            </div>

            <p class="text-sm text-gray-600 mb-6">
              Por seguridad, debes cambiar tu contraseña antes de continuar. Esta es tu primera vez ingresando o tu
              contraseña fue reseteada.
            </p>

            <form @submit.prevent="handlePasswordChange" class="space-y-4">
              <div>
                <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input id="new-password" v-model="passwordChangeData.newPassword" type="password" required minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 8 caracteres" :disabled="isLoading" />
              </div>

              <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input id="confirm-password" v-model="passwordChangeData.newPasswordConfirmation" type="password"
                  required minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirma tu nueva contraseña" :disabled="isLoading" />
              </div>

              <div class="flex space-x-3 pt-4">
                <button type="submit" :disabled="isLoading"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="isLoading" class="inline-flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </span>
                  <span v-else>Cambiar contraseña</span>
                </button>

                <button type="button" @click="showPasswordChange = false; error = ''" :disabled="isLoading"
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

// Meta de la página
definePageMeta({
  layout: false, // Sin layout para la página de login
  middleware: 'guest' // Solo usuarios no autenticados
})

// Estado reactivo
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const error = ref('')
const isLoading = ref(false)
const logoError = ref(false)
const isSuccess = ref(false)
const showPassword = ref(false)
const showPasswordChange = ref(false)
const passwordChangeData = ref({
  userId: null,
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: ''
})

// Store de autenticación
const authStore = useAuthStore()

// Función para traducir errores técnicos a mensajes amigables
const getErrorMessage = (error) => {
  if (!error) return 'Error al iniciar sesión'

  const errorText = typeof error === 'string' ? error : error.message || error.data?.message || ''
  const lowerError = errorText.toLowerCase()

  // Priorizar errores de credenciales primero (más específicos)
  if (lowerError.includes('credenciales') || lowerError.includes('credentials') ||
    lowerError.includes('username') || lowerError.includes('password') ||
    lowerError.includes('contraseña') || lowerError.includes('incorrectas') ||
    lowerError.includes('invalid') || lowerError.includes('wrong')) {
    return 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.'
  }

  // Errores de validación 422 (credenciales incorrectas)
  if (lowerError.includes('422') || lowerError.includes('unprocessable content') ||
    lowerError.includes('validation')) {
    return 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  }

  // Errores de autenticación 401
  if (lowerError.includes('unauthenticated') || lowerError.includes('401') ||
    lowerError.includes('unauthorized')) {
    return 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  }

  // Error 419 - CSRF Token Mismatch (común en credenciales incorrectas)
  if (lowerError.includes('419') || lowerError.includes('unknown status')) {
    return 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  }

  // Cuenta desactivada
  if (lowerError.includes('cuenta está desactivada') || lowerError.includes('inactive') ||
    lowerError.includes('desactivada')) {
    return 'Tu cuenta está desactivada. Contacta al administrador.'
  }

  // Rate limiting
  if (lowerError.includes('too many attempts') || lowerError.includes('429') ||
    lowerError.includes('demasiados intentos')) {
    return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.'
  }

  // CSRF - En login, tratarlo como credenciales incorrectas
  if (lowerError.includes('csrf token mismatch') || lowerError.includes('csrf')) {
    // Si estamos en login y solo hay "csrf token mismatch", probablemente son credenciales incorrectas
    if (lowerError === 'csrf token mismatch.' || lowerError === 'csrf token mismatch') {
      return 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
    }
    // Para otros casos de CSRF más complejos
    return 'Tu sesión ha expirado. Por favor, recarga la página e intenta nuevamente.'
  }

  // Errores de conexión
  if (lowerError.includes('network error') || lowerError.includes('fetch') ||
    lowerError.includes('conexión') || lowerError.includes('connection')) {
    return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
  }


  // Si no reconocemos el error, mostrar un mensaje genérico
  return 'Error al iniciar sesión. Si el problema persiste, contacta al administrador.'
}

// Manejar el login
const handleLogin = async () => {
  error.value = ''
  isSuccess.value = false
  isLoading.value = true

  try {
    const result = await authStore.login({
      username: form.username,
      password: form.password,
      remember: form.remember
    })

    if (result.success) {
      isSuccess.value = true
      // Pequeña pausa para mostrar el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 800))

      if (result.requiresTenantSelection) {
        await navigateTo('/select-tenant', { replace: true })
        return
      }

      try {
        // Redirigir al dashboard (página principal)
        await navigateTo('/', { replace: true })
      } catch (navError) {
        console.error('Error en navegación:', navError)
        // Fallback: usar window.location si navigateTo falla
        if (process.client) {
          window.location.href = '/'
        }
      }
    } else if (result.requiresPasswordChange) {
      // Usuario necesita cambiar contraseña
      showPasswordChange.value = true
      passwordChangeData.value.userId = result.userId
      passwordChangeData.value.currentPassword = form.password // Usar la contraseña actual
      error.value = '' // Limpiar errores previos
    } else {
      error.value = getErrorMessage(result.message)
    }
  } catch (err) {
    error.value = getErrorMessage(err)
    console.error('Error en login:', err)
  } finally {
    isLoading.value = false
  }
}

// Manejar el cambio de contraseña obligatorio
const handlePasswordChange = async () => {
  error.value = ''
  isLoading.value = true

  // Validaciones básicas
  if (!passwordChangeData.value.newPassword || passwordChangeData.value.newPassword.length < 8) {
    error.value = 'La nueva contraseña debe tener al menos 8 caracteres'
    isLoading.value = false
    return
  }

  if (passwordChangeData.value.newPassword !== passwordChangeData.value.newPasswordConfirmation) {
    error.value = 'Las contraseñas nuevas no coinciden'
    isLoading.value = false
    return
  }

  if (passwordChangeData.value.newPassword === passwordChangeData.value.currentPassword) {
    error.value = 'La nueva contraseña debe ser diferente a la actual'
    isLoading.value = false
    return
  }

  try {
    const result = await authStore.changeRequiredPassword({
      userId: passwordChangeData.value.userId,
      currentPassword: passwordChangeData.value.currentPassword,
      newPassword: passwordChangeData.value.newPassword,
      newPasswordConfirmation: passwordChangeData.value.newPasswordConfirmation
    })

    if (result.success) {
      isSuccess.value = true
      showPasswordChange.value = false

      // Pequeña pausa para mostrar el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 800))

      try {
        // Redirigir al dashboard
        await navigateTo('/', { replace: true })
      } catch (navError) {
        console.error('Error en navegación:', navError)
        if (process.client) {
          window.location.href = '/'
        }
      }
    } else {
      // Manejar errores de validación específicos
      if (result.errors) {
        const errors = result.errors
        if (errors.current_password) {
          error.value = 'La contraseña actual es incorrecta'
        } else if (errors.new_password) {
          error.value = errors.new_password[0] || 'Error en la nueva contraseña'
        } else {
          error.value = result.message || 'Error al cambiar contraseña'
        }
      } else {
        error.value = result.message || 'Error al cambiar contraseña'
      }
    }
  } catch (err) {
    error.value = getErrorMessage(err.message || 'Error al cambiar contraseña')
    console.error('Error en cambio de contraseña:', err)
  } finally {
    isLoading.value = false
  }
}

// Si ya está autenticado, redirigir al dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/')
  } else {
    // Cargar datos recordados si existen
    const remembered = authStore.getRememberedCredentials()
    if (remembered.remember && remembered.username) {
      form.username = remembered.username
      form.remember = true
    }
  }
})
</script>
