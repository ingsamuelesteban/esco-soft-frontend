<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Personal</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Gestión del personal administrativo y de apoyo.</p>
      </div>
      <div>
        <button @click="openCreateModal"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Añadir Personal">
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
      <PersonalList :status-filter="statusFilter" @edit="openEditModal" @delete="handleDelete"
        @restore="handleRestore" />
    </div>

    <!-- Modal para crear/editar -->
    <PersonalFormModal v-if="showModal" :personal="selectedPersonal" @close="closeModal" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { usePersonalStore, type Personal } from '../../stores/personal'
import { showConfirm, showErrorAlert, showToast } from '../../utils/sweetalert'
import FilterStatus from '../../components/common/FilterStatus.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = usePersonalStore()
const showModal = ref(false)
const selectedPersonal = ref<Personal | null>(null)
const statusFilter = ref<'active' | 'inactive' | 'all'>('active')

// Watcher para el filtro de estado
watch(statusFilter, async (newStatus) => {
  await store.fetchAll(newStatus)
}, { immediate: true })

const openCreateModal = () => {
  selectedPersonal.value = null
  showModal.value = true
}

const openEditModal = (personal: Personal) => {
  selectedPersonal.value = personal
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPersonal.value = null
}

const onSaved = () => {
  closeModal()
  store.fetchAll(statusFilter.value)
  showToast('Registro de personal guardado correctamente', 'success')
}

const handleDelete = async (personal: Personal) => {
  const result = await showConfirm(
    `¿Está seguro que desea dar de baja a ${personal.nombre} ${personal.apellido}? Su registro pasará a estado inactivo. Si posee una cuenta de acceso, esta será desactivada de inmediato y se revocarán todas sus sesiones activas.`,
    'Dar de baja personal',
    'warning',
    'Sí, dar de baja',
    'Cancelar'
  )

  if (result.isConfirmed) {
    try {
      await store.delete(personal.id)
      showToast('Personal dado de baja y cuenta de usuario desactivada correctamente.', 'success')
      store.fetchAll(statusFilter.value)
    } catch (error: any) {
      if (error?.data?.has_assignments || error?.response?.status === 422) {
        const message = error?.data?.message || error?.response?.data?.message || 'No se puede dar de baja. El personal tiene asignaturas activas asignadas en el año lectivo actual. Reasigne o retire las materias antes de continuar.';
        Swal.fire({
          icon: 'warning',
          title: 'No se puede eliminar',
          text: message,
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Entendido',
        })
      } else {
        showErrorAlert(error?.data?.message || 'Error al dar de baja el personal')
      }
    }
  }
}

const handleRestore = async (personal: Personal) => {
  const result = await showConfirm(
    `¿Restaurar a ${personal.nombre} ${personal.apellido}?`,
    'Restaurar personal',
    'question',
    'Sí, restaurar',
    'Cancelar'
  )

  if (result.isConfirmed) {
    try {
      await store.restore(personal.id)
      showToast('Personal restaurado correctamente', 'success')
    } catch (error: any) {
      showErrorAlert(error?.data?.message || 'Error al restaurar el personal')
    }
  }
}
</script>
