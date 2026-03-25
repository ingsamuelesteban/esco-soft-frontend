<template>
  <div class="space-y-6">
    <!-- Announcements Banner (top priority) -->
    <AnnouncementsBanner />

    <!-- Psychology Metrics -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Casos" :value="summary?.total_cases || 0" footer="Histórico" :icon="FolderIcon" />
      <StatCard title="Casos Abiertos" :value="summary?.open_cases || 0" footer="En seguimiento"
        :icon="FolderOpenIcon" />
      <StatCard title="Estudiantes Atendidos"
        :value="summary?.top_students?.length ? summary.top_students.length + '+' : 0" footer="Top Casos"
        :icon="UserGroupIcon" />
    </div>

    <!-- Charts & Lists Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Cases by Grade -->
      <SimpleBarChart v-if="gradeChartData && gradeChartData.length" title="Casos por Grado (Top 5)"
        :data="gradeChartData" />

      <!-- Top Students & Quick Actions -->
      <div class="space-y-6">
        <!-- Top Students List -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-transparent dark:border-gray-700 transition-colors">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Estudiantes con más casos</h3>
          <div v-if="summary?.top_students && summary.top_students.length > 0" class="flow-root">
            <ul role="list" class="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="student in summary.top_students" :key="student.id" class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <span
                      class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 font-bold">
                      {{ student.cases_count }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {{ student.name }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {{ student.grade }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">No hay datos suficientes aún.</div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-transparent dark:border-gray-700 transition-colors">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Acciones Rápidas</h3>
          <div class="grid grid-cols-1 gap-4">
            <router-link to="/psicologia/casos"
              class="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <UserGroupIcon class="h-8 w-8 text-blue-600 dark:text-blue-400 mr-4" />
              <div>
                <h4 class="font-bold text-blue-900 dark:text-blue-200">Gestionar Casos</h4>
                <p class="text-sm text-blue-700 dark:text-blue-400">Ver listado de estudiantes con casos activos.</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FolderIcon,
  FolderOpenIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import StatCard from './StatCard.vue'
import SimpleBarChart from './SimpleBarChart.vue'
import AnnouncementsBanner from '~/components/anuncios/AnnouncementsBanner.vue'

const props = defineProps<{
  data: any
}>()

const summary = computed(() => props.data?.summary)

// Transform API chart data
const gradeChartData = computed(() => {
  if (!props.data?.by_grade) return []

  // Calculate total for percentage
  const total = props.data.by_grade.reduce((acc: number, item: any) => acc + item.total, 0)

  return props.data.by_grade.map((item: any) => ({
    label: item.curso,
    shortLabel: item.curso, // 1° A
    value: item.total,
    percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
  }))
})
</script>
