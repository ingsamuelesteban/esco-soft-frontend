<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Títulos</h1>
        <p class="mt-1 text-sm text-gray-600">Gestiona los títulos por familia profesional.</p>
      </div>
      <div>
        <button @click="openCreateModal"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Añadir Título">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <TitulosList @edit="openEditModal" @delete="handleDelete" />
    </div>

    <TitulosFormModal v-if="showModal" :titulo="selected" @close="closeModal" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TitulosList from '../../components/titulos/TitulosList.vue'
import TitulosFormModal from '../../components/titulos/TitulosFormModal.vue'
import { useTitulosStore, type Titulo } from '../../stores/titulos'
import { showConfirm, showError, showToast } from '../../utils/sweetalert'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useTitulosStore()
const showModal = ref(false)
const selected = ref<Titulo | null>(null)

const openCreateModal = () => { selected.value = null; showModal.value = true }
const openEditModal = (t: Titulo) => { selected.value = t; showModal.value = true }
const closeModal = () => { showModal.value = false; selected.value = null }

const onSaved = async () => {
  closeModal()
  await store.fetchAll()
  showToast('Título guardado correctamente', 'success')
}

const handleDelete = async (id: number) => {
  const result = await showConfirm(
    'Esta acción cambiará el estado a inactivo. Podrás reactivarlo editándolo más tarde.',
    '¿Desactivar título?',
    'warning',
    'Sí, desactivar',
    'Cancelar'
  )
  if (!result.isConfirmed) return

  try {
    await store.delete(id)
    showToast('Título desactivado', 'success')
  } catch (e) {
    showError('No se pudo desactivar el título. Intenta nuevamente.')
  }
}
</script>
