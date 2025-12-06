<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">Arrastra para reordenar</p>
        <div class="text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Fin</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período #</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(p, idx) in filtered" :key="p.id" :draggable="true" @dragstart="onDragStart(idx)" @dragover.prevent
            @drop="onDrop(idx)" class="cursor-move hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-gray-400">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">{{ p.order_index }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ p.label }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatTime12h(p.start_time) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatTime12h(p.end_time) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="p.type === 'class' ? 'text-blue-600' : 'text-orange-600'">
                {{ p.type === 'class' ? 'Clase' : 'Receso' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.period_number ?? '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="p.is_active ? 'text-green-600' : 'text-red-600'">
                {{ p.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <button @click="$emit('edit', p)"
                class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Editar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="p.is_active" @click="$emit('delete', p.id)"
                class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Desactivar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
              <span v-else class="inline-flex items-center justify-center p-1.5 text-gray-400" title="Inactivo">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </span>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="9" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="9" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePeriodsStore, type Period } from '../../stores/periods'
import { formatTime12h } from '../../utils/timeFormat'

defineEmits<{
  edit: [period: Period]
  delete: [id: number]
  reorder: [orderedIds: number[]]
}>()

const store = usePeriodsStore()
const draggedIndex = ref<number | null>(null)

onMounted(() => {
  if (store.items.length === 0) {
    store.fetchAll()
  }
})

const loading = computed(() => store.loading)
const filtered = computed<Period[]>(() => store.items)

const onDragStart = (idx: number) => {
  draggedIndex.value = idx
}

const onDrop = (targetIdx: number) => {
  if (draggedIndex.value === null || draggedIndex.value === targetIdx) return

  const items = [...filtered.value]
  const [removed] = items.splice(draggedIndex.value, 1)
  if (!removed) {
    draggedIndex.value = null
    return
  }
  items.splice(targetIdx, 0, removed)

  // Emit reorder with new IDs order
  const orderedIds = items.map(p => p.id)
  store.reorder(orderedIds).catch(e => console.error('Reorder failed', e))

  draggedIndex.value = null
}
</script>
