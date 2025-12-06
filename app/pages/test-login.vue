<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login de Prueba
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="sr-only">Email</label>
          <input id="email" v-model="credentials.email" name="email" type="email" required
            class="relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Email">
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input id="password" v-model="credentials.password" name="password" type="password" required
            class="relative block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Password">
        </div>
        <div>
          <button type="submit" :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </div>
        <div v-if="errorMessage" class="text-red-600 text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-green-600 text-sm">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const credentials = ref({
  email: 'sabreu@escosoft.edu',
  password: 'S44711abreu'
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const result = await authStore.login(credentials.value)

    if (result.success) {
      successMessage.value = '¡Login exitoso!'
      // Redirigir después de un momento
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1000)
    } else {
      errorMessage.value = result.message || 'Error al iniciar sesión'
    }
  } catch (error) {
    console.error('Error en login:', error)
    errorMessage.value = 'Error inesperado: ' + error.message
  } finally {
    isLoading.value = false
  }
}
</script>