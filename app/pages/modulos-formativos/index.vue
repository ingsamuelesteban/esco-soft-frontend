<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Módulos Formativos</h1>
        <p class="mt-1 text-sm text-gray-600">Catálogo de módulos formativos de la institución.</p>
      </div>
      <div class="flex items-center gap-2">
        <FilterStatus v-model="store.statusFilter" @update:modelValue="onFilterChange" />
        <button
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          @click="refresh" title="Refrescar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button @click="openNew"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Nuevo módulo formativo">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <ModulosFormativosList @edit="onEdit" @delete="onDelete" @restore="onRestore" />
    </div>

    <ModulosFormativosFormModal v-if="showModal" :modulo-formativo="current" @close="closeModal" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModulosFormativosApiStore, type ModuloFormativoApi } from '../../stores/modulos-formativos-api'
import { showConfirm, showError, showToast } from '../../utils/sweetalert'
import FilterStatus from '../../components/common/FilterStatus.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useModulosFormativosApiStore()

const showModal = ref(false)
const current = ref<ModuloFormativoApi | null>(null)

onMounted(() => {
  refresh()
})

const refresh = () => { store.fetchAll(store.statusFilter) }
const openNew = () => { current.value = null; showModal.value = true }
const onEdit = (m: ModuloFormativoApi) => { current.value = m; showModal.value = true }
const closeModal = () => { showModal.value = false; current.value = null }

const onSaved = () => {
  closeModal()
  showToast('Módulo formativo guardado correctamente')
}

const onFilterChange = (newStatus: 'active' | 'inactive' | 'all') => {
  store.fetchAll(newStatus)
}

const onDelete = async (moduloFormativo: ModuloFormativoApi) => {
  const result = await showConfirm(
    `¿Estás seguro de que deseas eliminar el módulo formativo "${moduloFormativo.nombre}"?`,
    'Eliminar módulo formativo',
    'warning',
    'Sí, eliminar',
    'Cancelar'
  )
  if (!result.isConfirmed) return

  try {
    await store.remove(moduloFormativo.id)
    showToast('Módulo formativo eliminado exitosamente', 'success')
    refresh()
  } catch (e: any) {
    showError(e?.data?.message || 'No se pudo eliminar el módulo formativo')
  }
}

const onRestore = async (moduloFormativo: ModuloFormativoApi) => {
  const result = await showConfirm(
    `¿Estás seguro de que deseas restaurar el módulo formativo "${moduloFormativo.nombre}"?`,
    'Restaurar módulo formativo',
    'question',
    'Sí, restaurar',
    'Cancelar'
  )
  if (!result.isConfirmed) return

  try {
    await store.restore(moduloFormativo.id)
    showToast('Módulo formativo restaurado exitosamente', 'success')
    refresh()
  } catch (e: any) {
    showError(e?.data?.message || 'No se pudo restaurar el módulo formativo')
  }
}
</script>

<style scoped></style>
