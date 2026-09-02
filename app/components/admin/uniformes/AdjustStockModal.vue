<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
          enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                  enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                  leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                  <DialogPanel
                      class="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                      <form @submit.prevent="submitAdjustment">
                          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                  Ajuste de Inventario
                              </DialogTitle>
                              <button type="button" @click="closeModal"
                                  class="text-gray-400 hover:text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                                  <span class="sr-only">Close</span>
                                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fill-rule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clip-rule="evenodd" />
                                  </svg>
                              </button>
                          </div>

                          <div class="px-6 py-4 space-y-4">
                              <div class="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg flex justify-between items-center border border-indigo-100 dark:border-indigo-800">
                                  <div>
                                      <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Artículo</p>
                                      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ article?.name }}</p>
                                  </div>
                                  <div class="text-right">
                                      <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Stock Actual</p>
                                      <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">{{ article?.stock ?? 0 }}</p>
                                  </div>
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nuevo Conteo Físico Total</label>
                                  <input type="number" v-model.number="form.new_stock" required min="0" step="1"
                                      class="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                      placeholder="Ingrese la cantidad real contada" />
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo del Ajuste</label>
                                  <select v-model="form.reason" required
                                      class="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                      <option value="" disabled>Selecciona un motivo</option>
                                      <option value="Auditoría / Conteo Físico">Auditoría / Conteo Físico</option>
                                      <option value="Prenda Dañada / Merma">Prenda Dañada / Merma</option>
                                      <option value="Corrección de Registro">Corrección de Registro</option>
                                      <option value="Ajuste Administrativo">Ajuste Administrativo</option>
                                  </select>
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (Opcional)</label>
                                  <textarea v-model="form.notes" rows="2"
                                      class="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                      placeholder="Detalles adicionales sobre el ajuste..."></textarea>
                              </div>
                              
                              <div v-if="delta !== 0" class="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                  <div class="flex justify-between items-center text-sm mb-1">
                                      <span class="text-gray-600 dark:text-gray-400">Variación de stock:</span>
                                      <span class="font-bold" :class="delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'">
                                          {{ delta > 0 ? '+' : '' }}{{ delta }}
                                      </span>
                                  </div>
                                  <div class="flex justify-between items-center text-sm mb-1">
                                      <span class="text-gray-600 dark:text-gray-400">Stock Reservado:</span>
                                      <span class="font-medium text-gray-800 dark:text-gray-200">{{ article?.reserved_stock ?? 0 }}</span>
                                  </div>
                                  <div class="flex justify-between items-center text-sm pt-1 border-t border-gray-200 dark:border-gray-600 mt-1">
                                      <span class="font-semibold text-gray-700 dark:text-gray-300">Disponible Resultante:</span>
                                      <span class="font-bold text-gray-900 dark:text-gray-100">
                                          {{ availableStockResult }}
                                      </span>
                                  </div>
                              </div>
                          </div>

                          <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex flex-row-reverse rounded-b-xl gap-2">
                              <button type="submit" :disabled="saving || form.new_stock === null || delta === 0"
                                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                  {{ saving ? 'Guardando...' : 'Confirmar Ajuste' }}
                              </button>
                              <button type="button" @click="closeModal"
                                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                  Cancelar
                              </button>
                          </div>
                      </form>
                  </DialogPanel>
              </TransitionChild>
          </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import Swal from 'sweetalert2'

const props = defineProps({
    isOpen: Boolean,
    article: Object
})

const emit = defineEmits(['close', 'adjusted'])
const { $api } = useNuxtApp()

const saving = ref(false)
const form = ref({
    new_stock: 0,
    reason: '',
    notes: ''
})

watch(() => props.isOpen, (newVal) => {
    if (newVal && props.article) {
        form.value = {
            new_stock: props.article.stock ?? 0,
            reason: '',
            notes: ''
        }
    }
})

const currentStock = computed(() => props.article?.stock ?? 0)
const reservedStock = computed(() => props.article?.reserved_stock ?? 0)
const delta = computed(() => (form.value.new_stock === null || form.value.new_stock === '') ? 0 : form.value.new_stock - currentStock.value)
const availableStockResult = computed(() => (form.value.new_stock === null || form.value.new_stock === '') ? 0 : form.value.new_stock - reservedStock.value)

const closeModal = () => {
    emit('close')
}

const submitAdjustment = async () => {
    if (delta.value === 0) return
    saving.value = true
    try {
        const type = delta.value > 0 ? 'entrada' : 'salida_manual'
        const quantity = Math.abs(delta.value)
        
        await $api.post(`/api/uniformes/inventario/ajuste`, {
            item_id: props.article.id,
            type: type,
            quantity: quantity,
            reason: form.value.reason,
            description: form.value.notes
        })
        
        emit('adjusted')
        Swal.fire({
            icon: 'success',
            title: 'Inventario Ajustado',
            text: 'El ajuste se registró correctamente en el Kardex.',
            timer: 2000,
            showConfirmButton: false
        })
        closeModal()
    } catch (e) {
        console.error(e)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.response?.data?.message || 'Error al ajustar el inventario'
        })
    } finally {
        saving.value = false
    }
}
</script>
