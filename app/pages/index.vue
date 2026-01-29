<template>
  <section>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Panel de Control</h1>
      <p class="mt-1 text-sm text-gray-500">
        Bienvenido, {{ authStore.user?.name }}. Aquí tienes un resumen de tu actividad.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
      Error cargando el dashboard: {{ error }}
    </div>

    <!-- Render Based on Role -->
    <div v-else>
      <DashboardAdmin v-if="isAdminOrMaster" :data="dashboardData" />

      <DashboardTeacher v-else-if="isTeacher" :data="dashboardData" />

      <DashboardPsychology v-else-if="isPsychologist" :data="dashboardData" />

      <!-- Fallback or Student View -->
      <div v-else class="bg-white p-6 rounded shadow">
        <p>Bienvenido al sistema EscoSoft.</p>
        <!-- Student dashboard is usually a separate route /student/dashboard, 
             but if they land here we can redirect or show basic info -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../utils/api'

// Import Dashboard Components
// Note: Depending on your Nuxt config, you might need manual imports or they might be auto-imported.
// Assuming auto-import for components in components/ dir is standard, but specialized subdirs might need config.
// Let's import explicitly to be safe.
import DashboardAdmin from '~/components/dashboard/DashboardAdmin.vue'
import DashboardTeacher from '~/components/dashboard/DashboardTeacher.vue'
import DashboardPsychology from '~/components/dashboard/DashboardPsychology.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
const dashboardData = ref<any>(null)

// Role Helpers
const isAdminOrMaster = computed(() => authStore.isAdmin || authStore.isMaster || authStore.user?.role === 'coordinador')
const isTeacher = computed(() => authStore.isProfesor)
// We need a helper for psychologist. Usually they are admins or specific role?
// Let's assume for now they might be admins OR we check specific permissions/properties.
// If your system doesn't have explicit 'psychologist' role in 'role' enum, 
// maybe check email or extra permission. 
// For this refactor, I'll assume we can check if they have access to psychology module 
// OR if we added a specific role. 
// If 'psychologist' is NOT a role in auth store types (User interface), we might need to rely on 'admin' viewing it? 
// Or maybe user.role === 'coordinador'?
// Let's assume for now 'coordinador' might be used for Psychology or checks permission.
// We need a helper for psychologist. Check if role contains 'psico'
const isPsychologist = computed(() => {
  const role = authStore.user?.role?.toLowerCase() || ''
  return role.includes('psico')
})

const loadDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    let url = ''

    if (isAdminOrMaster.value) {
      url = '/api/dashboard/admin'
    } else if (isTeacher.value) {
      url = '/api/dashboard/teacher'
    } else if (isPsychologist.value) {
      url = '/api/psychology/stats' // Existing endpoint we verified
    } else {
      loading.value = false
      return
    }

    const res: any = await api.get(url)
    dashboardData.value = res.data || res // Some endpoints return { success: true, data: ... } others just data
    if (res.data && res.success) dashboardData.value = res.data // Standards

  } catch (e: any) {
    console.error('Dashboard load error', e)
    error.value = e.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadDashboard()
  }
})
</script>
