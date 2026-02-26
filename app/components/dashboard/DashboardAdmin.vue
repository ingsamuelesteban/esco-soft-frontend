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

    <!-- Permission Requests Banner -->
    <PermissionRequestsBanner />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Attendance Chart -->
      <SimpleBarChart 
        v-if="chartData && chartData.length"
        title="Asistencia por Grado (Hoy)" 
        :data="chartData"
      />

      <!-- Online Users -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Usuarios en Línea</h3>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div v-if="onlineUsers && onlineUsers.length > 0" class="flow-root">
             <ul role="list" class="-my-4 divide-y divide-gray-200">
                <li v-for="user in onlineUsers" :key="user.id" class="flex items-center space-x-3 py-4">
                   <div class="flex-shrink-0">
                      <img v-if="user.profile_photo_url" class="h-8 w-8 rounded-full" :src="user.profile_photo_url" :alt="user.name" />
                      <span v-else class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                        <span class="text-xs font-medium leading-none text-white">{{ user.initials }}</span>
                      </span>
                   </div>
                   <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p v-if="user.is_online" class="truncate text-xs text-green-600 font-medium">En línea</p>
                      <p v-else class="truncate text-xs text-gray-500">Últ. vez {{ user.last_seen }}</p>
                   </div>
                   <div>
                      <span v-if="user.is_online" class="inline-block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                      <span v-else class="inline-block h-2.5 w-2.5 rounded-full bg-gray-300 ring-2 ring-white"></span>
                   </div>
                </li>
             </ul>
          </div>
          
           <div v-else class="text-center py-6 text-gray-500">
              <p>No hay otros usuarios en línea.</p>
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
import PermissionRequestsBanner from './PermissionRequestsBanner.vue'

const props = defineProps<{
  data: any
}>()

const metrics = computed(() => props.data?.metrics)
const onlineUsers = computed(() => props.data?.online_users)

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
