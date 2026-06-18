<template>
  <section>
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Aulas</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Listado de aulas y su capacidad/ubicación.</p>
      </div>
      <div class="flex gap-2">
        <button @click="refresh"
          class="inline-flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
          title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button @click="openNew"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Nueva Aula">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Filtros -->
    <div class="mt-4 flex flex-wrap gap-4 items-center">
      <FilterStatus v-model="statusFilter" />
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Año Lectivo:</label>
        <select v-model="selectedAnioLectivo"
          class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors py-2 px-3">
          <option :value="null">Todos los años</option>
          <option v-if="aniosStore.loading" :value="null" disabled>Cargando años...</option>
          <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
            {{ anio.nombre }}{{ anio.activo ? ' ★' : '' }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-6">
      <AulasList :status-filter="statusFilter" @delete="onDelete" @edit="onEdit" @viewStudents="onViewStudents" @assignDueno="onAssignDueno" />
    </div>

    <AulasFormModal v-model="showModal" :aula="current" :anio-lectivo-id="selectedAnioLectivo" @saved="onSaved" />
    <AulaStudentsModal :open="showStudentsModal" :aula="selectedAula" :anio-lectivo-id="selectedAnioLectivo"
      @close="closeStudentsModal" @updated="onStudentsUpdated" />
    <AulaDuenoModal :open="showDuenoModal" :aula="selectedAula" :anio-lectivo-id="selectedAnioLectivo"
      @close="closeDuenoModal" @saved="onDuenoSaved" />
  </section>
</template>

<script setup lang="ts">
import { useAulasStore, type Aula } from '../../stores/aulas'
import Swal from 'sweetalert2'
import { ref, watch, onMounted } from 'vue'
import AulasFormModal from '../../components/aulas/AulasFormModal.vue'
import AulaStudentsModal from '../../components/aulas/AulaStudentsModal.vue'
import AulaDuenoModal from '../../components/aulas/AulaDuenoModal.vue'
import FilterStatus from '../../components/common/FilterStatus.vue'
import { useAniosLectivosStore } from '../../stores/anios_lectivos'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useAulasStore()
const refresh = () => { fetchAulas() }

const statusFilter = ref<'active' | 'inactive' | 'all'>('active')
const showModal = ref(false)
const current = ref<any>(null)

const aniosStore = useAniosLectivosStore()
const selectedAnioLectivo = ref<number | null>(null)

onMounted(async () => {
  if (aniosStore.items.length === 0) {
    await aniosStore.fetchAll()
  }
  const activo = aniosStore.activos[0]
  if (activo) {
    selectedAnioLectivo.value = activo.id
  } else {
    fetchAulas()
  }
})

function fetchAulas() {
  store.fetchAll({ anioLectivoId: selectedAnioLectivo.value ?? undefined })
}

// Recargar aulas cuando cambia el año o el estado
watch([selectedAnioLectivo, statusFilter], () => {
  fetchAulas()
}, { immediate: false })

// Esperar a que se seleccione el año activo para cargar por primera vez
watch(selectedAnioLectivo, (val) => {
  if (val !== null) fetchAulas()
}, { once: true })

const showStudentsModal = ref(false)
const selectedAula = ref<Aula | null>(null)

const showDuenoModal = ref(false)

const openNew = () => { current.value = null; showModal.value = true }
const onEdit = (aula: any) => { current.value = aula; showModal.value = true }
const onSaved = () => { refresh() }

const onViewStudents = (aula: Aula) => {
  selectedAula.value = aula
  showStudentsModal.value = true
}

const closeStudentsModal = () => {
  showStudentsModal.value = false
  selectedAula.value = null
}

const onStudentsUpdated = () => {
  fetchAulas()
}

const onAssignDueno = (aula: Aula) => {
  selectedAula.value = aula
  showDuenoModal.value = true
}

const closeDuenoModal = () => {
  showDuenoModal.value = false
  selectedAula.value = null
}

const onDuenoSaved = () => {
  // El store ya actualiza el item; refrescar si se quiere sincronizar desde el servidor
}

const onDelete = async (id: number) => {
  const res = await Swal.fire({
    title: 'Desactivar aula',
    text: '¿Seguro que deseas desactivar esta aula?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  })
  if (res.isConfirmed) {
    try {
      await store.delete(id)
      Swal.fire('Listo', 'El aula fue desactivada', 'success')
    } catch (e: any) {
      Swal.fire('Error', e?.message || 'No se pudo desactivar', 'error')
    }
  }
}
</script>
