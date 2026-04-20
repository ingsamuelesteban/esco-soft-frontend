<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Horarios por Profesor</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Visualiza el horario de clases de cada profesor.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
          @click="reload" title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <TimetableTeacherGrid ref="gridRef" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Verificar permisos
definePageMeta({
  middleware: ['auth']
})

const gridRef = ref<any>(null)

const reload = () => {
  gridRef.value?.reload()
}
</script>