<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Estudiantes" 
        :value="metrics?.total_students || 0" 
        footer="Activos en sistema"
        :icon="UserGroupIcon"
      />
      <StatCard 
        title="Profesores" 
        :value="metrics?.total_teachers || 0" 
        footer="Personal docente"
        :icon="AcademicCapIcon"
      />
      <StatCard 
        title="Aulas" 
        :value="metrics?.total_aulas || 0" 
        footer="Capacidad instalada"
        :icon="BuildingLibraryIcon"
      />
      <StatCard 
        title="Asistencia Hoy" 
        :value="(metrics?.attendance_today_pct || 0) + '%'" 
        :footer="metrics?.attendance_details ? `${metrics.attendance_details.present} Presentes` : '-'"
        :icon="ClockIcon"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Attendance Chart -->
      <SimpleBarChart 
        v-if="chartData && chartData.length"
        title="Asistencia por Grado (Hoy)" 
        :data="chartData"
      />

      <!-- Alerts / Actions -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Alertas y Sugerencias</h3>
        <div class="space-y-4">
          <div v-if="alerts?.pending_leave_requests > 0" class="flex items-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600 mr-3" />
            <div class="flex-1">
              <h4 class="text-sm font-bold text-yellow-800">Solicitudes de Permiso</h4>
              <p class="text-sm text-yellow-700">Hay {{ alerts.pending_leave_requests }} solicitudes pendientes de revisión.</p>
            </div>
            <button class="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded" @click="navigateTo('/staff/leave-requests')">
              Revisar
            </button>
          </div>

          <div v-if="alerts?.recent_warnings > 0" class="flex items-center p-4 bg-red-50 rounded-md border border-red-200">
             <ExclamationCircleIcon class="h-6 w-6 text-red-600 mr-3" />
             <div class="flex-1">
               <h4 class="text-sm font-bold text-red-800">Amonestaciones Recientes</h4>
               <p class="text-sm text-red-700">{{ alerts.recent_warnings }} amonestaciones en los últimos 7 días.</p>
             </div>
          </div>
          
           <div v-if="!alerts?.pending_leave_requests && !alerts?.recent_warnings" class="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
              <p>No hay alertas pendientes por ahora.</p>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  BuildingLibraryIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'
import StatCard from './StatCard.vue'
import SimpleBarChart from './SimpleBarChart.vue'

const props = defineProps<{
  data: any
}>()

const metrics = computed(() => props.data?.metrics)
const alerts = computed(() => props.data?.alerts)

// Transform API chart data to Component format
const chartData = computed(() => {
  if (!props.data?.charts?.attendance_by_grade) return []
  
  return props.data.charts.attendance_by_grade.map((item: any) => ({
    label: item.grade,
    value: item.percentage,
    percentage: item.percentage
  }))
})
</script>
