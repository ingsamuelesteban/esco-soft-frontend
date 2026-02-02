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
        <div class="relative">
          <!-- Dropdown Trigger -->
          <button @click="dropdownOpen = !dropdownOpen" class="flex items-center space-x-3 focus:outline-none group">
            <!-- User Avatar or Initials -->
            <div class="relative">
              <div v-if="user?.profile_photo_url" class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                <img :src="user.profile_photo_url" :alt="user.name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                <span class="text-sm font-bold text-white">{{ user?.initials || 'ES' }}</span>
              </div>
            </div>
            
            <!-- User Name and Chevron -->
            <div class="hidden sm:flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ user?.name }}</span>
              <svg class="h-4 w-4 text-gray-400 transition-transform" :class="{ 'rotate-180': dropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <!-- Dropdown Menu -->
          <div v-if="dropdownOpen" @click.stop class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <!-- User Info Header -->
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-900">{{ user?.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user?.username }}</p>
            </div>

            <!-- Menu Items -->
            <button @click="openProfileModal" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center space-x-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Editar Perfil</span>
            </button>

            <div class="border-t border-gray-100 my-1"></div>

            <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Profile Edit Modal -->
    <StudentProfileEditModal :is-open="profileModalOpen" @close="closeProfileModal" @updated="handleProfileUpdated" />

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
import { ref, onMounted, onUnmounted } from 'vue'
import StudentProfileEditModal from '../components/student/StudentProfileEditModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const { user } = storeToRefs(authStore)

const dropdownOpen = ref(false)
const profileModalOpen = ref(false)

const logout = async () => {
  dropdownOpen.value = false
  await authStore.logout()
  router.push('/login')
}

const openProfileModal = () => {
  dropdownOpen.value = false
  profileModalOpen.value = true
}

const closeProfileModal = () => {
  profileModalOpen.value = false
}

const handleProfileUpdated = () => {
  // Profile was updated successfully
  // The user data in the store is already updated by the auth store
  console.log('Profile updated successfully')
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (dropdownOpen.value && !target.closest('.relative')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
