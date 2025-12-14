<template>
  <section>
    <h1 class="text-2xl font-semibold text-gray-900">Panel</h1>
    <p class="mt-2 text-gray-600">Resumen general del sistema</p>

    <!-- Cards resumen -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink to="/aulas" class="group">
        <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm group-hover:shadow transition">
          <div class="text-sm text-gray-500">Aulas</div>
          <div class="mt-2 text-3xl font-semibold text-gray-900">{{ aulasCount }}</div>
          <div class="mt-2 text-xs text-gray-400">Capacidad total: {{ capacidadTotal }}</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/modulos-formativos" class="group">
        <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm group-hover:shadow transition">
          <div class="text-sm text-gray-500">Módulos Formativos</div>
          <div class="mt-2 text-3xl font-semibold text-gray-900">{{ modulosFormativosCount }}</div>
          <div class="mt-2 text-xs text-gray-400">Horas/sem totales: {{ horasSemanalesTotales }}</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/horarios" class="group">
        <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm group-hover:shadow transition">
          <div class="text-sm text-gray-500">Horarios</div>
          <div class="mt-2 text-3xl font-semibold text-gray-900">{{ horariosCount }}</div>
          <div class="mt-2 text-xs text-gray-400">Grupos únicos: {{ gruposUnicos }}</div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAulasStore } from '../stores/aulas'
import { useModulosFormativosApiStore } from '../stores/modulos-formativos-api'
import { useClassAssignmentsStore } from '../stores/class_assignments'
import { useTimetableEntriesStore } from '../stores/timetable_entries'

// Definir el middleware de autenticación
definePageMeta({
  middleware: 'auth' // Requiere autenticación
})

const aulas = useAulasStore()
const modulosFormativosApi = useModulosFormativosApiStore()
const assignments = useClassAssignmentsStore()
const timetable = useTimetableEntriesStore()

onMounted(async () => {
  // Always fetch fresh data to ensure tenant consistency
  await Promise.all([
    aulas.fetchAll(),
    modulosFormativosApi.fetchAll(),
    assignments.fetchAll({ only_active: true }),
    timetable.fetchAll()
  ])
})

const aulasCount = computed(() => aulas.total)
const capacidadTotal = computed(() => (aulas.items || []).reduce((acc, a) => acc + (a.capacidad || 0), 0))
const modulosFormativosCount = computed(() => (modulosFormativosApi.items || []).length)
const horasSemanalesTotales = computed(() => (assignments.items || []).reduce((acc, a) => acc + (a.horas_semanales || 0), 0))
const horariosCount = computed(() => (timetable.items || []).length)
const gruposUnicos = computed(() => new Set((timetable.items || []).map(e => e.aula_id)).size)
</script>
