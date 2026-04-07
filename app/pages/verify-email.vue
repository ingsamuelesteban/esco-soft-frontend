<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
      <div>
        <div class="flex justify-center mb-4">
          <svg v-if="status === 'loading'" class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else-if="status === 'success'" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>
      </div>

      <div class="mt-8" v-if="status !== 'loading'">
        <NuxtLink v-if="status === 'error'" to="/login"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Volver a inicio de sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('loading') // loading, success, error
const title = ref('Verificando correo electrónico...')
const message = ref('Por favor espera mientras validamos tu información.')

onMounted(async () => {
  const token = route.query.token
  const email = route.query.email

  if (!token || !email) {
    status.value = 'error'
    title.value = 'Enlace inválido'
    message.value = 'El enlace de verificación no es válido o está incompleto.'
    return
  }

  try {
    const config = useRuntimeConfig()
    const response = await $fetch('/api/verify-email/verify', {
      method: 'POST',
      body: { token, email },
      baseURL: config.public.apiBase
    })

    if (response.success) {
      status.value = 'success'
      title.value = '¡Cuenta verificada!'
      message.value = response.message || 'Tu correo ha sido verificado con éxito. Iniciando sesión...'
      
      // Manejar el auto-login con la respuesta
      authStore.user = response.data.user
      authStore.token = response.data.token
      authStore.director = response.data.director || null
      authStore.tenant = response.data.tenant || null
      authStore.isAuthenticated = true
      authStore.availableTenants = response.data.tenants || []
      
      if (process.client) {
        localStorage.setItem('auth_token', response.data.token)
        if (authStore.tenant) {
          localStorage.setItem('selected_tenant_id', authStore.tenant.id.toString())
        }
      }
      
      // Cargar menú y redirigir
      await authStore.loadUserMenu()
      
      setTimeout(() => {
        if (response.data.requires_tenant_selection) {
            // No podemos ir al dashboard si se requiere tenant, debemos mandarlos a la seleccion
            window.location.href = '/select-tenant'
        } else {
            window.location.href = '/'
        }
      }, 2000)
    } else {
      status.value = 'error'
      title.value = 'Error de verificación'
      message.value = response.message || 'No se pudo verificar tu correo electrónico.'
    }
  } catch (err) {
    status.value = 'error'
    title.value = 'Error de verificación'
    message.value = err.data?.message || 'El enlace de verificación es inválido o ha expirado.'
  }
})
</script>
