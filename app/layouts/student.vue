<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header simple para estudiantes -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center">
            <!-- Logo -->
            <img src="/images/logo.png" alt="EscoSoft" class="h-8 w-auto mr-3" />
            <h1 class="text-xl font-bold text-gray-900">Portal Estudiantil <span v-if="authStore.tenant" class="font-normal text-gray-500">| {{ authStore.tenant.name }}</span></h1>
        </div>
        <div class="flex items-center space-x-4">
             <div class="text-sm font-medium text-gray-700">
                {{ user?.name }}
             </div>
             <button @click="logout" class="text-sm text-red-600 hover:text-red-800 font-medium">
                Cerrar Sesión
             </button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-1 py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} EscoSoft. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const router = useRouter()
const { user } = storeToRefs(authStore)

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
