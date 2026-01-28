<template>
  <div class="space-y-6">
    <!-- Header with Staff Details -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div v-if="personal">
            <h1 class="text-2xl font-bold text-gray-900">{{ personal.nombre }} {{ personal.apellido }}</h1>
            <p class="text-gray-500">{{ personal.cedula }} • {{ personal.cargo?.nombre || 'Sin cargo' }}</p>
          </div>
          <div v-else class="h-16 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
      
      <!-- Stats Summary -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div class="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Solicitudes</div>
          <div class="text-2xl font-bold text-blue-800">{{ stats.total }}</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div class="text-xs text-yellow-600 font-medium uppercase tracking-wider">Pendientes</div>
          <div class="text-2xl font-bold text-yellow-800">{{ stats.pending }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <div class="text-xs text-green-600 font-medium uppercase tracking-wider">Aprobadas</div>
          <div class="text-2xl font-bold text-green-800">{{ stats.approved }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg border border-red-100">
          <div class="text-xs text-red-600 font-medium uppercase tracking-wider">Rechazadas</div>
          <div class="text-2xl font-bold text-red-800">{{ stats.rejected }}</div>
        </div>
      </div>
    </div>

    <!-- Permission History List -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Historial de Permisos</h3>
        <span class="text-xs text-gray-500" v-if="leaveRequests.length">Mostrando últimos {{ leaveRequests.length }} registros</span>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-500">Cargando historial...</p>
      </div>

      <div v-else-if="leaveRequests.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2">No hay registros de permisos para este personal.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Solicitud</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas Permiso</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="request in leaveRequests" :key="request.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(request.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                  {{ request.leave_type }}
                </span>
                <div v-if="request.leave_type === 'express'" class="text-xs text-gray-500 mt-1 ml-1">
                   {{ getDurationDisplay(request) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{{ formatDate(request.start_date) }} <span class="text-gray-400">-></span> {{ formatDate(request.end_date) }}</div>
                <div class="text-xs text-gray-500" v-if="request.leave_type !== 'express'">
                    {{ request.days_count }} día{{ request.days_count !== 1 ? 's' : '' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(request.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                  {{ request.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                <button @click="navigateToRequest(request.id)" class="text-blue-600 hover:text-blue-900 font-medium text-xs bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                  Ver Detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePersonalStore } from '~/stores/personal'
import { useLeaveRequestsStore } from '~/stores/leaveRequests'

const route = useRoute()
const router = useRouter()
const personalStore = usePersonalStore()
const leaveStore = useLeaveRequestsStore()

const personalId = parseInt(route.params.id as string)
const personal = ref(null)
const leaveRequests = ref([])
const stats = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // Load Personal Data
    if (personalStore.items.length === 0) {
      await personalStore.fetchAll()
    }
    
    // Attempt to find in store
    personal.value = personalStore.byId(personalId)
    
    // Fetch Leave Requests for this person
    // We use the existing fetchAll action but with distinct filters
    // Note: The store will replace its 'leaveRequests' state with this result.
    // If we want to preserve the main list state, this might be side-effectful if the user goes back to the main list without reloading.
    // But commonly in this app structure, lists reload on mount.
    await leaveStore.fetchAll({ personal_id: personalId })
    leaveRequests.value = leaveStore.leaveRequests
    
    // Calculate stats locally from the fetched list to avoid extra API call if possible, 
    // or use store.getStatistics if it supported filtering by user context (which it does based on auth, but we are admin viewing another user).
    // The backend statistics endpoint uses auth()->user() constraints, so as an admin, getting stats for a SPECIFIC user via api is not directly supported by 'statistics' endpoint unless we add a param.
    // So calculating from the list is safer/easier here.
    stats.value = leaveRequests.value.reduce((acc, req) => {
      acc.total++
      if (acc[req.status] !== undefined) acc[req.status]++
      // Mapping 'cancelado' if needed or just specific ones
      return acc
    }, { total: 0, pending: 0, approved: 0, rejected: 0, cancelado: 0 })
    
  } catch (e) {
    console.error('Error loading record:', e)
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES') // Using es-ES for DD/MM/YYYY format standard
}

const getDurationDisplay = (req: any) => {
    if (req.leave_type === 'express' && req.start_time && req.end_time) {
        const startParts = req.start_time.split(':')
        const endParts = req.end_time.split(':')
        const start = parseInt(startParts[0] ?? '0') * 60 + parseInt(startParts[1] ?? '0')
        const end = parseInt(endParts[0] ?? '0') * 60 + parseInt(endParts[1] ?? '0')
        const diff = end - start
        
        const hours = Math.floor(diff / 60)
        const minutes = diff % 60
        
        return `${hours}h ${minutes}m`
    }
    return ''
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'aprobado': return 'bg-green-100 text-green-800'
    case 'rechazado': return 'bg-red-100 text-red-800'
    case 'pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'cancelado': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const navigateToRequest = (id: number) => {
  router.push(`/personal/permisos/${id}`)
}
</script>
