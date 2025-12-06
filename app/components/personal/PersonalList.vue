<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center gap-3 flex-wrap">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar por cédula, nombre..." />
        <select v-model="filterCargo" class="rounded-md border-gray-300 text-sm">
          <option :value="undefined">Todos los cargos</option>
          <option v-for="c in cargosStore.items" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <div class="ml-auto text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="p in filtered" :key="p.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.cedula }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ p.nombre }} {{ p.apellido }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.cargo?.nombre || (p.cargo_id &&
              cargosStore.byId(p.cargo_id)?.nombre) || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.sueldo ? formatMoney(p.sueldo) : '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.fecha_ingreso ? formatDate(p.fecha_ingreso) : '—' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatTelefonoDisplay(p.telefono) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <!-- Botones para registros activos -->
              <template v-if="props.statusFilter === 'active'">
                <button @click="$emit('edit', p)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', p)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>

              <!-- Botón para registros eliminados -->
              <template v-else-if="props.statusFilter === 'inactive'">
                <button @click="$emit('restore', p)"
                  class="inline-flex items-center justify-center p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Restaurar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </template>

              <!-- Botones para vista 'todos' -->
              <template v-else-if="props.statusFilter === 'all'">
                <button @click="$emit('edit', p)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', p)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePersonalStore, type Personal } from '../../stores/personal'
import { useCargosStore } from '../../stores/cargos'
import { useTelefono } from '../../composables/useTelefono'

defineEmits<{
  edit: [personal: Personal]
  delete: [personal: Personal]
  restore: [personal: Personal]
}>()

interface Props {
  statusFilter?: 'active' | 'inactive' | 'all'
}

const props = withDefaults(defineProps<Props>(), {
  statusFilter: 'active'
})

const store = usePersonalStore()
const cargosStore = useCargosStore()
const query = ref('')
const filterCargo = ref<number | undefined>(undefined)

onMounted(() => {
  if (store.items.length === 0) {
    store.fetchAll()
  }
  cargosStore.fetchAll()
})

const loading = computed(() => store.loading)

const filtered = computed<Personal[]>(() => {
  const q = query.value.toLowerCase()
  return store.items.filter((p: Personal) => {
    const matchesQuery = p.cedula.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      (p.cargo?.nombre && p.cargo.nombre.toLowerCase().includes(q))

    const matchesCargo = filterCargo.value === undefined || p.cargo_id === filterCargo.value

    return matchesQuery && matchesCargo
  })
})

const formatMoney = (amount: string) => {
  const num = parseFloat(amount)
  if (Number.isNaN(num)) return amount
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(num)
}

const formatDate = (date: string) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('es-VE')
  } catch {
    return date
  }
}

// Usar composable de teléfono para formatear
const { formatTelefono } = useTelefono()

const formatTelefonoDisplay = (telefono: string | null) => {
  if (!telefono) return '—'
  return formatTelefono(telefono) || '—'
}
</script>
