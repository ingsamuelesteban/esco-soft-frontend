<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Horarios</h1>
        <p class="mt-1 text-sm text-gray-600">Gestiona el horario por aula usando los períodos generales.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          @click="reload" title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <TimetableGrid :read-only="isPsychologist" />
    </div>
  </section>
</template>

<script setup lang="ts">
// Verificar permisos de administrador
definePageMeta({
  middleware: ['auth']
})

import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isPsychologist = computed(() => {
  const r = authStore.user?.role?.toLowerCase() || ''
  return r.includes('psic') || r.includes('orient')
})

const reload = () => { }
</script>

<style scoped></style>
