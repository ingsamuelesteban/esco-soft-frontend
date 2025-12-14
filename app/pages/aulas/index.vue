<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Aulas</h1>
        <p class="mt-1 text-sm text-gray-600">Listado de aulas y su capacidad/ubicación.</p>
      </div>
      <div class="flex gap-2">
        <button @click="refresh"
          class="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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

    <!-- Filtro de estado -->
    <div class="mt-4 flex justify-between items-center">
      <FilterStatus v-model="statusFilter" />
    </div>

    <div class="mt-6">
      <AulasList :status-filter="statusFilter" @delete="onDelete" @edit="onEdit" @viewStudents="onViewStudents" />
    </div>

    <AulasFormModal v-model="showModal" :aula="current" @saved="onSaved" />
    <AulaStudentsModal :open="showStudentsModal" :aula="selectedAula" @close="closeStudentsModal"
      @updated="onStudentsUpdated" />
  </section>
</template>

<script setup lang="ts">
import { useAulasStore, type Aula } from '../../stores/aulas'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import AulasFormModal from '../../components/aulas/AulasFormModal.vue'
import AulaStudentsModal from '../../components/aulas/AulaStudentsModal.vue'
import FilterStatus from '../../components/common/FilterStatus.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useAulasStore()
const refresh = () => { store.fetchAll() }

const statusFilter = ref<'active' | 'inactive' | 'all'>('active')
const showModal = ref(false)
const current = ref<any>(null)

// Forzar carga de datos al entrar y al cambiar filtro
import { watch } from 'vue'
watch(statusFilter, () => {
  store.fetchAll({ tituloId: undefined, search: undefined }) // O pasar el status si la API de aulas lo soportara, pero por ahora fetchAll no toma filtro de status en parametros?
  // Espera, fetchAll en el store NO toma status. El filtrado es en el cliente (computed en AulasList).
  // Pero necesitamos cargar los datos de todas formas.
  // El problema original es que AulasList NO cargaba si ya había datos.
  // Aquí forzamos la carga siempre.
  store.fetchAll()
}, { immediate: true })

const showStudentsModal = ref(false)
const selectedAula = ref<Aula | null>(null)

const openNew = () => { current.value = null; showModal.value = true }
const onEdit = (aula: any) => { current.value = aula; showModal.value = true }
const onSaved = () => { /* opcional: ya se actualiza el store */ }

const onViewStudents = (aula: Aula) => {
  selectedAula.value = aula
  showStudentsModal.value = true
}

const closeStudentsModal = () => {
  showStudentsModal.value = false
  selectedAula.value = null
}

const onStudentsUpdated = () => {
  // Opcionalmente refrescar datos si es necesario
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
