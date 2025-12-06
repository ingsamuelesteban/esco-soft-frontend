<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Configuración</h1>
      <p class="text-gray-600 mt-1">Gestiona la configuración de tu cuenta y preferencias del sistema.</p>
    </div>

    <div class="bg-white shadow rounded-lg">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button v-for="tab in tabs" :key="tab.id" 
            @click="tab.id === 'tenants' ? navigateTo('/settings/tenants') : activeTab = tab.id" 
            :class="[
            'py-2 px-4 text-sm font-medium border-b-2',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]">
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Perfil -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900">Información del Perfil</h3>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" v-model="profile.name"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" v-model="profile.email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="saveProfile"
              class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              Guardar Cambios
            </button>
          </div>
        </div>

        <!-- Contraseña -->
        <div v-if="activeTab === 'password'" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña Actual</label>
              <input type="password" v-model="passwordForm.current"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input type="password" v-model="passwordForm.new"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
              <input type="password" v-model="passwordForm.confirm"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="changePassword"
              class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              Cambiar Contraseña
            </button>
          </div>
        </div>

        <!-- Preferencias -->
        <div v-if="activeTab === 'preferences'" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900">Preferencias del Sistema</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
                <p class="text-sm text-gray-500">Recibir notificaciones sobre actividades del sistema.</p>
              </div>
              <ToggleSwitch v-model="preferences.emailNotifications" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Modo Oscuro</h4>
                <p class="text-sm text-gray-500">Cambiar la apariencia del sistema.</p>
              </div>
              <ToggleSwitch v-model="preferences.darkMode" />
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="savePreferences"
              class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              Guardar Preferencias
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Definir el meta para la página
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Configuración de las pestañas
const tabs = computed(() => {
  const baseTabs = [
    { id: 'profile', name: 'Perfil' },
    { id: 'password', name: 'Contraseña' },
    { id: 'preferences', name: 'Preferencias' }
  ]
  
  if (authStore.isMaster) {
    baseTabs.push({ id: 'tenants', name: 'Instituciones' })
  }
  
  return baseTabs
})

const activeTab = ref('profile')
const authStore = useAuthStore()

// Datos del perfil
const profile = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
})

// Formulario de contraseña
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

// Preferencias
const preferences = reactive({
  emailNotifications: true,
  darkMode: false
})

// Funciones
const saveProfile = () => {
  // TODO: Implementar guardar perfil
}

const changePassword = () => {
  if (passwordForm.new !== passwordForm.confirm) {
    alert('Las contraseñas no coinciden')
    return
  }
  // TODO: Implementar cambio de contraseña
}

const savePreferences = () => {
  // TODO: Implementar guardar preferencias
}
</script>

<style scoped>
/* Estilos específicos para la página de configuración */
</style>