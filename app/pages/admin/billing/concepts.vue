<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Conceptos de Cobro</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra los diferentes conceptos de pago que puede facturar la institución.</p>
      </div>
      <button @click="openModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        Nuevo Concepto
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th class="px-6 py-4">Concepto</th>
              <th class="px-6 py-4">Monto Predeterminado</th>
              <th class="px-6 py-4 text-center">Tipo</th>
              <th class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="bg-white dark:bg-gray-800">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2" />
                Cargando conceptos...
              </td>
            </tr>
            <tr v-else-if="concepts.length === 0" class="bg-white dark:bg-gray-800">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                No hay conceptos registrados.
              </td>
            </tr>
            <tr v-else v-for="concept in concepts" :key="concept.id" class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {{ concept.name }}
                <span v-if="concept.name === 'Mensualidad Académica'" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Base</span>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                <span v-if="concept.name === 'Mensualidad Académica'" class="text-xs text-gray-400 italic">Dinámico (Config. Meses)</span>
                <span v-else>${{ Number(concept.amount).toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="concept.is_recurring ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ concept.is_recurring ? 'Recurrente' : 'Único' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-3">
                  <button @click="openModal(concept)" class="text-gray-500 hover:text-primary-600 transition-colors" title="Editar">
                    <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
                  </button>
                  <button v-if="concept.name !== 'Mensualidad Académica'" @click="deleteConcept(concept.id)" class="text-gray-500 hover:text-red-600 transition-colors" title="Eliminar">
                    <UIcon name="i-heroicons-trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal v-model="isModalOpen">
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ editingConcept ? 'Editar Concepto' : 'Nuevo Concepto' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalOpen = false" />
          </div>
        </template>

        <form @submit.prevent="saveConcept" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Concepto</label>
            <UInput v-model="form.name" placeholder="Ej: Inscripción, Excursión" required :disabled="form.name === 'Mensualidad Académica'" />
            <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-gray-500 mt-1">El nombre del concepto base no puede modificarse.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto ($)</label>
            <UInput v-model="form.amount" type="number" step="0.01" min="0" placeholder="0.00" :disabled="form.name === 'Mensualidad Académica'" required />
            <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-gray-500 mt-1">El monto base se toma de la configuración de meses fiscales.</p>
          </div>

          <div class="flex items-center gap-2 mt-4">
            <UToggle v-model="form.is_recurring" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Es un cobro recurrente</span>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
            <UButton type="button" color="gray" variant="soft" @click="isModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="saving">Guardar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import { showSuccess, showError } from '~/utils/sweetalert'

definePageMeta({
  layout: 'admin',
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
  if (!confirm('¿Estás seguro de que deseas eliminar este concepto? Esta acción no se puede deshacer.')) return
  
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
