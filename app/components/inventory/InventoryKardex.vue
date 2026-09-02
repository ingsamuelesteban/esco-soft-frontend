<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Historial de Movimientos (Kardex)</h2>
      <button @click="showModal = true" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
        + Ajuste Manual
      </button>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm">
      <select v-model="filters.item_id" @change="fetchMovements" class="form-select rounded-md border-gray-300">
        <option value="">Todos los artículos</option>
        <option v-for="item in items" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <select v-model="filters.type" @change="fetchMovements" class="form-select rounded-md border-gray-300">
        <option value="">Todos los tipos</option>
        <option value="entrada">Entrada</option>
        <option value="salida_manual">Salida Manual</option>
        <option value="venta">Venta</option>
        <option value="devolucion">Devolución</option>
      </select>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="py-3 px-6">Fecha</th>
            <th scope="col" class="py-3 px-6">Tipo</th>
            <th scope="col" class="py-3 px-6">Artículo</th>
            <th scope="col" class="py-3 px-6">Cant.</th>
            <th scope="col" class="py-3 px-6">Motivo</th>
            <th scope="col" class="py-3 px-6">Usuario</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in movements" :key="movement.id" class="bg-white border-b hover:bg-gray-50">
            <td class="py-4 px-6">{{ formatDate(movement.created_at) }}</td>
            <td class="py-4 px-6">
              <span :class="getTypeClass(movement.type)" class="px-2 py-1 rounded text-xs font-medium">
                {{ formatType(movement.type) }}
              </span>
            </td>
            <td class="py-4 px-6">{{ movement.item?.name }}</td>
            <td class="py-4 px-6 font-bold" :class="movement.type === 'salida_manual' || movement.type === 'venta' ? 'text-red-600' : 'text-green-600'">
              {{ movement.type === 'salida_manual' || movement.type === 'venta' ? '-' : '+' }}{{ movement.quantity }}
            </td>
            <td class="py-4 px-6">{{ movement.reason }}</td>
            <td class="py-4 px-6">{{ movement.user?.name }}</td>
          </tr>
          <tr v-if="movements.length === 0">
            <td colspan="6" class="py-4 px-6 text-center text-gray-500">No se encontraron movimientos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <StockAdjustmentModal 
      v-model="showModal" 
      :items="items" 
      @success="handleSuccess" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import StockAdjustmentModal from './StockAdjustmentModal.vue'
import { useDateFormat } from '@vueuse/core'

const { $api } = useNuxtApp()

const items = ref([])
const movements = ref([])
const showModal = ref(false)

const filters = ref({
  item_id: '',
  type: ''
})

const fetchItems = async () => {
  try {
    const { data } = await $api.get('/api/admission-articles')
    items.value = data.data || data
  } catch (error) {
    console.error('Error fetching items', error)
  }
}

const fetchMovements = async () => {
  try {
    const params = new URLSearchParams()
    if (filters.value.item_id) params.append('item_id', filters.value.item_id)
    if (filters.value.type) params.append('type', filters.value.type)
    
    const { data } = await $api.get(`/api/uniformes/inventario/movimientos?${params.toString()}`)
    movements.value = data.data
  } catch (error) {
    console.error('Error fetching movements', error)
  }
}

const handleSuccess = () => {
  fetchMovements()
  fetchItems() // Actualizar stock de los items
}

const formatDate = (date) => {
  return useDateFormat(date, 'DD/MM/YYYY HH:mm').value
}

const formatType = (type) => {
  const map = {
    entrada: 'Entrada',
    salida_manual: 'Salida Manual',
    venta: 'Venta',
    devolucion: 'Devolución'
  }
  return map[type] || type
}

const getTypeClass = (type) => {
  if (['entrada', 'devolucion'].includes(type)) return 'bg-green-100 text-green-800'
  return 'bg-red-100 text-red-800'
}

onMounted(() => {
  fetchItems()
  fetchMovements()
})
</script>
