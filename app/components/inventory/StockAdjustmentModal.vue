<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50">
    <div class="relative w-full max-w-md p-4 max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Ajuste de Stock Manual
          </h3>
          <button @click="close" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Cerrar</span>
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Artículo / Variante</label>
            <select v-model="form.item_id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
              <option value="" disabled>Seleccione un artículo...</option>
              <option v-for="item in items" :key="item.id" :value="item.id">
                {{ item.name }} (Stock: {{ item.stock }})
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Movimiento</label>
            <select v-model="form.type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
              <option value="entrada">Entrada / Reabastecimiento</option>
              <option value="salida_manual">Salida Manual</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad</label>
            <input v-model.number="form.quantity" type="number" min="1" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Motivo</label>
            <select v-model="form.reason" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
              <option value="ajuste_inventario">Ajuste de Conteo Físico</option>
              <option value="merma">Merma</option>
              <option value="daño">Daño</option>
              <option value="donacion">Donación</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Observación (Opcional)</label>
            <textarea v-model="form.description" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" rows="2"></textarea>
          </div>
        </div>
        <div class="flex items-center p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button @click="submit" :disabled="loading" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Confirmar Ajuste' }}
          </button>
          <button @click="close" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  preselectedItemId: { type: [Number, String], default: '' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const { $api, $swal } = useNuxtApp()

const loading = ref(false)
const form = ref({
  item_id: props.preselectedItemId || '',
  type: 'entrada',
  quantity: 1,
  reason: 'ajuste_inventario',
  description: ''
})

const maxQuantity = computed(() => {
  if (form.value.type !== 'salida_manual' || !form.value.item_id) return Infinity
  const item = props.items.find(i => i.id === form.value.item_id)
  return item ? item.stock : 0
})

const close = () => {
  emit('update:modelValue', false)
  form.value = { item_id: '', type: 'entrada', quantity: 1, reason: 'ajuste_inventario', description: '' }
}

const submit = async () => {
  if (!form.value.item_id || !form.value.quantity) return

  loading.value = true
  try {
    const { data } = await $api.post('/api/uniformes/inventario/ajuste', form.value)
    $swal.fire('Éxito', data.message || 'Ajuste de inventario registrado correctamente.', 'success')
    emit('success')
    close()
  } catch (error) {
    $swal.fire('Error', error.response?.data?.message || 'Ocurrió un error al registrar el ajuste.', 'error')
  } finally {
    loading.value = false
  }
}
</script>
