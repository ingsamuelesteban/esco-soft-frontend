<template>
  <div class="space-y-6">
    <!-- Announcements Banner (top priority) -->
    <AnnouncementsBanner />

    <!-- Teacher Metrics -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Mis Clases" :value="metrics?.total_classes || 0" footer="Asignaciones activas"
        :icon="BookOpenIcon" />
      <StatCard title="Mis Estudiantes" :value="metrics?.total_students || 0" footer="Total alumnos únicos"
        :icon="UserGroupIcon" />
      <StatCard title="Clases Hoy" :value="metrics?.classes_today_count || 0" footer="En horario"
        :icon="CalendarIcon" />
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Schedule Today -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-transparent dark:border-gray-700 transition-colors">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ClockIcon class="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          Mi Horario de Hoy
        </h3>

        <div v-if="schedule && schedule.length > 0" class="flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(cls, idx) in schedule" :key="idx">
              <div class="relative pb-8">
                <span v-if="idx !== schedule.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true" />
                <div class="relative flex space-x-3">
                  <div>
                    <span :class="[
                      isClassActive(cls) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-400 dark:bg-gray-600',
                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800'
                    ]">
                      <AcademicCapIcon class="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ cls.time_start }} - {{ cls.time_end }} ({{ cls.period }})</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ cls.materia }}</p>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <div class="font-bold text-gray-700 dark:text-gray-300">{{ cls.aula }}</div>
                      <router-link :to="{ path: '/asistencia', query: { assignment_id: cls.assignment_id } }"
                        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs">Asistencia</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-700/50 rounded-lg border border-transparent dark:border-gray-700">
          No tienes clases programadas para hoy.
        </div>
      </div>

      <!-- Quick Actions / Next Class -->
      <div class="space-y-6">
        <div v-if="nextClass" class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 class="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase mb-2">Próxima Clase</h4>
          <div class="text-2xl font-bold text-blue-800 dark:text-blue-300">{{ nextClass.time_start }}</div>
          <div class="text-lg text-blue-900 dark:text-blue-100 font-medium">{{ nextClass.materia }}</div>
          <div class="text-sm text-blue-700 dark:text-blue-400 mt-1">{{ nextClass.aula }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-transparent dark:border-gray-700 transition-colors">
          <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase mb-4">Accesos Rápidos</h3>
          <nav class="space-y-2">
            <router-link to="/asistencia"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors">
              <ClipboardDocumentCheckIcon class="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              Tomar Asistencia
            </router-link>
            <router-link to="/calificaciones"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors">
              <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              Registrar Calificaciones
            </router-link>
            <router-link to="/personal/permisos"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors">
              <CalendarIcon class="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              Solicitar Permiso
            </router-link>
          </nav>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline'
import StatCard from './StatCard.vue'
import AnnouncementsBanner from '~/components/anuncios/AnnouncementsBanner.vue'

const props = defineProps<{
  data: any
}>()

const metrics = computed(() => props.data?.metrics)
const schedule = computed(() => props.data?.schedule_today)
const nextClass = computed(() => props.data?.next_class)

const isClassActive = (cls: any) => {
  return true
}
</script>
