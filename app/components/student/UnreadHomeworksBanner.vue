<template>
  <div 
    v-if="homeworkStore.unopenedHomeworks.length > 0" 
    class="mb-6 bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200 rounded-xl p-4 sm:p-5 shadow-sm transition-colors duration-300"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 font-semibold text-base sm:text-lg mb-3">
      <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span>Tienes {{ homeworkStore.unopenedHomeworks.length }} {{ homeworkStore.unopenedHomeworks.length === 1 ? 'tarea pendiente' : 'tareas pendientes' }} por revisar</span>
    </div>

    <!-- Homeworks Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div 
        v-for="hw in homeworkStore.unopenedHomeworks" 
        :key="hw.id"
        @click="navigateToHomework(hw.id)"
        class="bg-white dark:bg-gray-800 border border-amber-200/80 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:scale-[1.01] transition-transform cursor-pointer"
      >
        <div class="flex justify-between items-start mb-1">
          <h4 class="truncate text-sm font-medium text-gray-900 dark:text-white" :title="hw.title">
            {{ hw.title }}
          </h4>
          <span 
            v-if="hw.due_date && isUrgent(hw.due_date)" 
            class="ml-2 flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          >
            Urgente
          </span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ hw.class_assignment?.materia?.nombre || 'Asignatura' }}
        </div>
        <div class="mt-2 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
          <span>Prof. {{ hw.creator?.name?.split(' ')[0] || 'Docente' }}</span>
          <span v-if="hw.due_date" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {{ formatDate(hw.due_date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHomeworkStore } from '~/stores/homework'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)

const homeworkStore = useHomeworkStore()
const router = useRouter()

const navigateToHomework = (id: number) => {
  router.push(`/student/tareas/${id}`)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('DD MMM, YYYY')
}

const isUrgent = (date: string) => {
  if (!date) return false
  // Return true if due in 3 days or less
  return dayjs(date).isSameOrBefore(dayjs().add(3, 'day'))
}
</script>
