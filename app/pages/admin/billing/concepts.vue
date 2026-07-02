<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Conceptos de Cobro</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra los diferentes conceptos de pago que puede facturar la institución.</p>
      </div>
      <UButton @click="openModal()" color="primary" size="lg" icon="i-heroicons-plus" class="shadow-sm">
        Nuevo Concepto
      </UButton>
    </div>

    <!-- Table Card -->
    <UCard class="shadow-sm overflow-hidden" :ui="{ body: { padding: 'p-0' } }">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-600 uppercase bg-gray-50/80 dark:bg-gray-800/80 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th class="px-6 py-4 font-semibold tracking-wider">Concepto</th>
              <th class="px-6 py-4 font-semibold tracking-wider">Monto Predeterminado</th>
              <th class="px-6 py-4 text-center font-semibold tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-right font-semibold tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-if="loading" class="bg-white dark:bg-transparent">
              <td colspan="4" class="px-6 py-16 text-center text-gray-500">
                <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-3 text-primary-500" />
                <p>Cargando conceptos...</p>
              </td>
            </tr>
            <tr v-else-if="concepts.length === 0" class="bg-white dark:bg-transparent">
              <td colspan="4" class="px-6 py-16 text-center text-gray-500">
                <div class="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-lg font-medium text-gray-900 dark:text-white">Sin conceptos registrados</p>
                <p class="text-sm mt-1">Comienza agregando un nuevo concepto de cobro.</p>
              </td>
            </tr>
            <tr v-else v-for="concept in concepts" :key="concept.id" class="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 dark:text-white">{{ concept.name }}</span>
                  <UBadge v-if="concept.name === 'Mensualidad Académica'" color="primary" variant="subtle" size="xs">
                    Base
                  </UBadge>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                <span v-if="concept.name === 'Mensualidad Académica'" class="text-xs text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-3.5 h-3.5" />
                  Dinámico (Config. Meses)
                </span>
                <span v-else class="font-semibold text-gray-900 dark:text-gray-100">${{ Number(concept.amount).toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <UBadge :color="concept.is_recurring ? 'purple' : 'gray'" variant="subtle" size="sm">
                  {{ concept.is_recurring ? 'Recurrente' : 'Único' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton @click="openModal(concept)" color="gray" variant="ghost" icon="i-heroicons-pencil-square" title="Editar Concepto" />
                  <UButton v-if="concept.name !== 'Mensualidad Académica'" @click="deleteConcept(concept.id)" color="red" variant="ghost" icon="i-heroicons-trash" title="Eliminar Concepto" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal Form -->
    <UModal v-model="isModalOpen" prevent-close>
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon :name="editingConcept ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'" class="w-5 h-5 text-primary-500" />
              {{ editingConcept ? 'Editar Concepto' : 'Nuevo Concepto' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalOpen = false" :disabled="saving" />
          </div>
        </template>

        <form @submit.prevent="saveConcept" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre del Concepto</label>
            <UInput v-model="form.name" placeholder="Ej: Inscripción, Excursión, Curso de Verano" required :disabled="form.name === 'Mensualidad Académica'" size="md" icon="i-heroicons-tag" />
            <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
              El nombre del concepto base no puede modificarse.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monto ($)</label>
            <UInput v-model="form.amount" type="number" step="0.01" min="0" placeholder="0.00" :disabled="form.name === 'Mensualidad Académica'" required size="md" icon="i-heroicons-currency-dollar" />
            <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
              El monto base se toma de la configuración de meses fiscales.
            </p>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <UToggle v-model="form.is_recurring" />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">Cobro Recurrente</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Actívalo si este concepto se cobra de forma periódica.</p>
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
            <UButton type="button" color="gray" variant="soft" @click="isModalOpen = false" :disabled="saving">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="saving">Guardar Concepto</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import { showSuccess, showError, showConfirm } from '~/utils/sweetalert'

definePageMeta({
  middleware: 'auth'
})

const concepts = ref([])
const loading = ref(true)
const isModalOpen = ref(false)
const saving = ref(false)
const editingConcept = ref(null)

const form = ref({
  name: '',
  amount: 0,
  is_recurring: false
})

onMounted(() => {
  loadConcepts()
})

const loadConcepts = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/billing/concepts')
    concepts.value = res.data?.data || res.data || res || []
  } catch (error) {
    console.error(error)
    showError('No se pudieron cargar los conceptos')
  } finally {
    loading.value = false
  }
}

const openModal = (concept = null) => {
  editingConcept.value = concept
  if (concept) {
    form.value = {
      name: concept.name,
      amount: concept.amount,
      is_recurring: concept.is_recurring === 1 || concept.is_recurring === true
    }
  } else {
    form.value = {
      name: '',
      amount: 0,
      is_recurring: false
    }
  }
  isModalOpen.value = true
}

const saveConcept = async () => {
  saving.value = true
  try {
    if (editingConcept.value) {
      await api.put(`/api/billing/concepts/${editingConcept.value.id}`, form.value)
      showSuccess('Concepto actualizado con éxito')
    } else {
      await api.post('/api/billing/concepts', form.value)
      showSuccess('Concepto creado con éxito')
    }
    isModalOpen.value = false
    loadConcepts()
  } catch (error) {
    console.error(error)
    showError(error.response?.data?.message || 'Error al guardar el concepto')
  } finally {
    saving.value = false
  }
}

const deleteConcept = async (id) => {
  const result = await showConfirm(
    '¿Estás seguro de que deseas eliminar este concepto? Esta acción no se puede deshacer y podría afectar las facturas existentes.',
    'Eliminar Concepto',
    'warning',
    'Sí, eliminar',
    'Cancelar'
  )
  
  if (!result.isConfirmed) return
  
  try {
    await api.delete(`/api/billing/concepts/${id}`)
    showSuccess('Concepto eliminado con éxito')
    loadConcepts()
  } catch (error) {
    console.error(error)
    showError(error.response?.data?.message || 'Error al eliminar el concepto')
  }
}
</script>
