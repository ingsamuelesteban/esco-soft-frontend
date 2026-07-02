<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Conceptos de Cobro</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra los diferentes conceptos de pago que puede facturar la institución.</p>
      </div>
      <button @click="openModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
        <PlusIcon class="w-5 h-5" />
        Nuevo Concepto
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800/80 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-4 font-semibold tracking-wider">Concepto</th>
              <th class="px-6 py-4 font-semibold tracking-wider">Monto Predeterminado</th>
              <th class="px-6 py-4 text-center font-semibold tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-right font-semibold tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="bg-white dark:bg-gray-800">
              <td colspan="4" class="px-6 py-16 text-center text-gray-500">
                <ArrowPathIcon class="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                <p>Cargando conceptos...</p>
              </td>
            </tr>
            <tr v-else-if="concepts.length === 0" class="bg-white dark:bg-gray-800">
              <td colspan="4" class="px-6 py-16 text-center text-gray-500">
                <div class="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-lg font-medium text-gray-900 dark:text-white">Sin conceptos registrados</p>
                <p class="text-sm mt-1">Comienza agregando un nuevo concepto de cobro.</p>
              </td>
            </tr>
            <tr v-else v-for="concept in concepts" :key="concept.id" class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 dark:text-white">{{ concept.name }}</span>
                  <span v-if="concept.name === 'Mensualidad Académica'" class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Base
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                <span v-if="concept.name === 'Mensualidad Académica'" class="text-xs text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                  <Cog6ToothIcon class="w-3.5 h-3.5" />
                  Dinámico (Config. Meses)
                </span>
                <span v-else class="font-semibold text-gray-900 dark:text-gray-100">${{ Number(concept.amount).toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="concept.is_recurring ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ concept.is_recurring ? 'Recurrente' : 'Único' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openModal(concept)" class="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar Concepto">
                    <PencilSquareIcon class="w-5 h-5" />
                  </button>
                  <button v-if="concept.name !== 'Mensualidad Académica'" @click="deleteConcept(concept.id)" class="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar Concepto">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" class="relative z-50" @close="closeModal">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/50 dark:bg-black/70" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <DialogTitle as="h3" class="text-lg font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <PencilSquareIcon v-if="editingConcept" class="w-5 h-5 text-blue-500" />
                    <PlusCircleIcon v-else class="w-5 h-5 text-blue-500" />
                    {{ editingConcept ? 'Editar Concepto' : 'Nuevo Concepto' }}
                  </DialogTitle>
                  <button @click="closeModal" :disabled="saving" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50">
                    <XMarkIcon class="w-6 h-6" />
                  </button>
                </div>

                <form @submit.prevent="saveConcept" class="p-6 space-y-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre del Concepto</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TagIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input 
                        v-model="form.name" 
                        type="text" 
                        placeholder="Ej: Inscripción, Excursión" 
                        required 
                        :disabled="form.name === 'Mensualidad Académica'" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-60"
                      />
                    </div>
                    <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                      <InformationCircleIcon class="w-4 h-4" />
                      El nombre del concepto base no puede modificarse.
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monto ($)</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input 
                        v-model="form.amount" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        :disabled="form.name === 'Mensualidad Académica'" 
                        required 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-60"
                      />
                    </div>
                    <p v-if="form.name === 'Mensualidad Académica'" class="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                      <InformationCircleIcon class="w-4 h-4" />
                      El monto base se toma de la configuración de meses fiscales.
                    </p>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Cobro Recurrente</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Actívalo si este concepto se cobra de forma periódica.</p>
                      </div>
                      <Switch
                        v-model="form.is_recurring"
                        :class="form.is_recurring ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        <span class="sr-only">Habilitar cobro recurrente</span>
                        <span
                          :class="form.is_recurring ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </Switch>
                    </div>
                  </div>

                  <div class="pt-4 flex justify-end gap-3 mt-6">
                    <button type="button" class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50" @click="closeModal" :disabled="saving">
                      Cancelar
                    </button>
                    <button type="submit" class="inline-flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-75" :disabled="saving">
                      <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
                      Guardar Concepto
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot, Switch } from '@headlessui/vue'
import { 
  PlusIcon, ArrowPathIcon, DocumentTextIcon, Cog6ToothIcon, PencilSquareIcon, TrashIcon, 
  PlusCircleIcon, XMarkIcon, TagIcon, CurrencyDollarIcon, InformationCircleIcon 
} from '@heroicons/vue/24/outline'
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

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
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
