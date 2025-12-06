<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Familias Profesionales</h1>
        <p class="mt-1 text-sm text-gray-600">Gestión de familias profesionales del centro.</p>
      </div>
      <div>
        <button @click="openCreateModal"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Añadir Familia Profesional">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <FamiliasProfesionalesList @edit="openEditModal" @delete="handleDelete" />
    </div>

    <!-- Modal para crear/editar -->
    <FamiliasProfesionalesFormModal v-if="showModal" :familia="selectedFamilia" @close="closeModal" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFamiliasProfesionalesStore, type FamiliaProfesional } from '../../stores/familias_profesionales'
import { showConfirm, showError, showToast } from '../../utils/sweetalert'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useFamiliasProfesionalesStore()
const showModal = ref(false)
const selectedFamilia = ref<FamiliaProfesional | null>(null)

const openCreateModal = () => {
  selectedFamilia.value = null
  showModal.value = true
}

const openEditModal = (familia: FamiliaProfesional) => {
  selectedFamilia.value = familia
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedFamilia.value = null
}

const onSaved = () => {
  closeModal()
  store.fetchAll()
  showToast('Familia profesional guardada correctamente', 'success')
}

const handleDelete = async (id: number) => {
  const result = await showConfirm(
    'Esta acción cambiará el estado a inactivo. Podrás reactivarla editándola más tarde.',
    '¿Desactivar familia profesional?',
    'warning',
    'Sí, desactivar',
    'Cancelar'
  )

  if (result.isConfirmed) {
    try {
      await store.delete(id)
      showToast('Familia profesional desactivada', 'success')
    } catch (e) {
      showError('No se pudo desactivar la familia profesional. Intenta nuevamente.')
    }
  }
}
</script>
