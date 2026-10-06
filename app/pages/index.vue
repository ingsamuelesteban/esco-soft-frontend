<template>
  <div v-if="isPublicSite">
    <PublicLanding />
  </div>
  <section v-else>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white transition-colors">Panel de Control</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
        Bienvenido, {{ authStore.user?.name }}. AquÃ­ tienes un resumen de tu actividad.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
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
      <div v-else class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-gray-700 transition-colors">
        <p class="text-gray-900 dark:text-gray-100">Bienvenido al sistema EscoSoft.</p>
      </div>
      
      <!-- Agenda Escolar en Dashboard (Admins & Profesores) -->
      <div v-if="!isPublicSite && (isAdminOrMaster || isTeacher)" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <svg class="h-5 w-5 mr-2 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Agenda Escolar
          </h3>
          <router-link to="/agenda" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Ver agenda completa &rarr;</router-link>
        </div>
        <AgendaCalendar :events="agendaEvents" :compact="true" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDomain } from '../composables/useDomain'
import { api } from '../utils/api'
import PublicLanding from '~/components/public/PublicLanding.vue'

// Import Dashboard Components
// Note: Depending on your Nuxt config, you might need manual imports or they might be auto-imported.
// Assuming auto-import for components in components/ dir is standard, but specialized subdirs might need config.
// Let's import explicitly to be safe.
import DashboardAdmin from '~/components/dashboard/DashboardAdmin.vue'
import DashboardTeacher from '~/components/dashboard/DashboardTeacher.vue'
import DashboardPsychology from '~/components/dashboard/DashboardPsychology.vue'
import AgendaCalendar from '~/components/AgendaCalendar.client.vue'

definePageMeta({
  middleware: 'auth'
})

const { isPublicSite } = useDomain()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
const dashboardData = ref<any>(null)
const agendaEvents = ref<any[]>([])
let refreshInterval: any = null

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

const loadDashboard = async (silent = false) => {
  if (!silent) loading.value = true
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
    dashboardData.value = res.data || res
    if (res.data && res.success) dashboardData.value = res.data

    if (isAdminOrMaster.value || isTeacher.value) {
      try {
        const agendaRes = await api.get('/api/v1/agenda', { params: { start: '2020-01-01', end: '2050-12-31' } });
        agendaEvents.value = Array.isArray(agendaRes) ? agendaRes : (agendaRes?.data || []);
      } catch (err) {
        console.error('Error loading agenda on dashboard', err);
      }
    }

  } catch (e: any) {
    console.error('Dashboard load error', e)
    // Don't show error on silent refresh to avoid flickering / annoyance
    if (!silent) error.value = e.message || 'Error de conexiÃ³n'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadDashboard()
    
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        loadDashboard(true)
    }, 30000)
  }
})

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
})
</script>



