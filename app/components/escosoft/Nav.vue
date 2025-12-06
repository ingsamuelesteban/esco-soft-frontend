<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <!-- Botón hamburguesa móvil -->
      <div class="flex items-center space-x-4">
        <button @click="toggleSidebar"
          class="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <!-- Nombre de la Institución -->
        <div class="flex items-center text-gray-800 font-bold text-lg">
          <img v-if="tenantLogo" :src="tenantLogo" alt="Logo" class="h-8 w-auto mr-3 object-contain" />
          <span v-if="tenantName" class="hidden sm:block">{{ tenantName }}</span>
          <span v-if="tenantName" class="sm:hidden text-base truncate max-w-[150px]">{{ tenantName }}</span>
        </div>
      </div>

      <!-- Navegación derecha -->
      <div class="flex items-center space-x-4">
        <!-- Notificaciones -->
        <button class="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <!-- Badge de notificaciones -->
          <span class="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <!-- Menú de usuario -->
        <div class="relative">
          <button @click="toggleUserMenu" class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <div
              class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
              {{ userInitials }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userRole }}</p>
            </div>
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown del usuario -->
          <Transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <div v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
              <div class="py-1">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</a>
                <NuxtLink v-if="authStore.isMaster" to="/settings/tenants"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Configuración
                </NuxtLink>
              </div>
              <div class="py-1">
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Definir el emit
const emit = defineEmits(['toggleSidebar'])

// Store de autenticación
const authStore = useAuthStore()

// Estado del menú de usuario
const isUserMenuOpen = ref(false)

// Datos del usuario desde el store
const userName = computed(() => {
  if (!process.client) return 'Usuario'
  return authStore.user?.name || 'Usuario'
})
const userRole = computed(() => {
  if (!process.client) return 'Usuario'
  if (authStore.isAdmin) return 'Administrador'
  if (authStore.isProfesor) return 'Profesor'
  return 'Usuario'
})
const userInitials = computed(() => {
  if (!process.client) return 'U'
  if (authStore.user?.name) {
    return authStore.user.name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }
  return 'U'
})

const tenantName = computed(() => {
  if (!process.client) return ''
  return authStore.tenant?.name || 'EscoSoft'
})

const tenantLogo = computed(() => {
  if (!process.client || !authStore.tenant?.logo_url) return null
  // Si ya es una URL absoluta, devolverla
  if (authStore.tenant.logo_url.startsWith('http')) return authStore.tenant.logo_url
  
  // Si es relativa, prepender la URL base de la API
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  // Asegurar que no haya doble slash
  const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  const path = authStore.tenant.logo_url.startsWith('/') ? authStore.tenant.logo_url : `/${authStore.tenant.logo_url}`
  
  return `${baseUrl}${path}`
})

// Funciones
const toggleSidebar = () => {
  emit('toggleSidebar')
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const logout = async () => {
  isUserMenuOpen.value = false
  await authStore.logout()
}

// Cerrar menú al hacer click fuera
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// Listener global para cerrar menú
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      closeUserMenu()
    }
  })
}
</script>
