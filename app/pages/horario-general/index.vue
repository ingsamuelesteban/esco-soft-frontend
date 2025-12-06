<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Horario General</h1>
        <p class="mt-1 text-sm text-gray-600">Configuración de períodos y recesos del día escolar. Arrastra para
          reordenar.</p>
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
          title="Nuevo Período">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mt-6">
      <PeriodsList @delete="onDelete" @edit="onEdit" />
    </div>

    <PeriodsFormModal v-model="showModal" :period="current" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { usePeriodsStore } from '../../stores/periods'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import PeriodsList from '../../components/periods/PeriodsList.vue'
import PeriodsFormModal from '../../components/periods/PeriodsFormModal.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = usePeriodsStore()
const refresh = () => { store.fetchAll() }

const showModal = ref(false)
const current = ref<any>(null)

const openNew = () => { current.value = null; showModal.value = true }
const onEdit = (period: any) => { current.value = period; showModal.value = true }
const onSaved = () => { /* opcional: ya se actualiza el store */ }

const onDelete = async (id: number) => {
  const res = await Swal.fire({
    title: 'Desactivar período',
    text: '¿Seguro que deseas desactivar este período?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  })
  if (res.isConfirmed) {
    try {
      await store.delete(id)
      Swal.fire('Listo', 'El período fue desactivado', 'success')
    } catch (e: any) {
      Swal.fire('Error', e?.message || 'No se pudo desactivar', 'error')
    }
  }
}
</script>
