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
        <div class="relative notifications-container">
          <button @click="toggleNotifications"
            class="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative focus:outline-none transition-colors duration-200"
            :class="{ 'bg-gray-100 text-primary-600': isNotificationsOpen }">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <!-- Badge de notificaciones -->
            <span v-if="notificationStore.hasUnread"
              class="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
              {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
            </span>
          </button>

          <!-- Dropdown Notificaciones -->
          <Transition enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95 -translate-y-2"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 -translate-y-2">
            <div v-if="isNotificationsOpen"
              class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
              <div class="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-700">Notificaciones</h3>
                <button v-if="notificationStore.hasUnread" @click="markAllRead"
                  class="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Marcar todas como leídas
                </button>
              </div>

              <div class="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div v-if="notificationStore.isLoading && notificationStore.notifications?.length === 0"
                  class="p-4 text-center text-gray-500 text-sm">
                  Cargando...
                </div>

                <div v-else-if="notificationStore.notifications?.length === 0"
                  class="p-8 text-center text-gray-500 flex flex-col items-center">
                  <svg class="h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-sm">No tienes notificaciones</p>
                </div>

                <ul v-else class="divide-y divide-gray-100">
                  <li v-for="notification in notificationStore.notifications" :key="notification.id"
                    class="hover:bg-gray-50 transition-colors duration-150 relative group">
                    <button @click="handleNotificationClick(notification)"
                      class="w-full text-left p-3 flex items-start space-x-3">
                      <div class="flex-shrink-0" :class="notification.read_at ? 'opacity-50' : ''">
                        <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg v-if="notification.data.icon === 'calendar'" class="h-4 w-4" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900" :class="{ 'font-bold': !notification.read_at }">
                          {{ notification.data.title }}
                        </p>
                        <p class="text-sm text-gray-600 line-clamp-2 mt-0.5"
                          :class="{ 'text-gray-900': !notification.read_at }" :title="notification.data.message">
                          {{ notification.data.message }}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">
                          {{ dayjs(notification.created_at).fromNow() }}
                        </p>
                      </div>
                      <div v-if="!notification.read_at" class="flex-shrink-0 self-center">
                        <span class="block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Menú de usuario -->
        <div class="relative user-menu-container">
          <button @click="toggleUserMenu"
            class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-gray-100': isUserMenuOpen }">
            <div v-if="authStore.user?.profile_photo_path"
              class="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
              <img :src="`${$config.public.apiBase}/storage/${authStore.user.profile_photo_path}`" alt="Profile"
                class="h-full w-full object-cover">
            </div>
            <div v-else
              class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {{ userInitials }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userRole }}</p>
            </div>
            <svg class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': isUserMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown del usuario -->
          <Transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <div v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
              <div class="py-1">
                <NuxtLink to="/perfil" @click="closeUserMenu"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</NuxtLink>
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

// Definir el emit
const emit = defineEmits(['toggleSidebar'])

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Estados
const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)

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
  if (authStore.tenant.logo_url.startsWith('http')) return authStore.tenant.logo_url

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
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
  if (isUserMenuOpen.value) isNotificationsOpen.value = false
}

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  if (isNotificationsOpen.value) {
    isUserMenuOpen.value = false
    notificationStore.fetchNotifications()
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id)
  }
  isNotificationsOpen.value = false

  if (notification.data?.action_url) {
    await navigateTo(notification.data.action_url)
  }
}

const markAllRead = async () => {
  await notificationStore.markAllAsRead()
}

const logout = async () => {
  isUserMenuOpen.value = false
  await authStore.logout()
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const closeNotifications = () => {
  isNotificationsOpen.value = false
}

// Cargar notificaciones iniciales
onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchUnreadCount()
    // Polling cada 60 segundos
    setInterval(() => {
      notificationStore.fetchUnreadCount()
    }, 60000)
  }
})

// Listener global
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    // Cerrar menú de usuario si clic fuera
    const userMenu = e.target.closest('.user-menu-container')
    if (!userMenu && isUserMenuOpen.value) {
      closeUserMenu()
    }

    // Cerrar notificaciones si clic fuera
    const notifMenu = e.target.closest('.notifications-container')
    if (!notifMenu && isNotificationsOpen.value) {
      closeNotifications()
    }
  })
}
</script>
