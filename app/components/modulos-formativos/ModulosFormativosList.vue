<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center justify-between gap-3">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar módulos formativos..." />
        <div class="ml-2 text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo Formativo
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="m in filtered" :key="m.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ m.codigo || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ m.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="m.tipo === 'Tecnico' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                {{ m.tipo }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span v-if="!m.deleted_at" :class="m.activo ? 'text-green-600' : 'text-red-600'">{{ m.activo ? 'Activa' :
                'Inactiva' }}</span>
              <span v-else class="text-gray-500">Eliminada</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <template v-if="!m.deleted_at">
                <button @click="$emit('edit', m)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', m)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
              <template v-else>
                <button @click="$emit('restore', m)"
                  class="inline-flex items-center justify-center p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Restaurar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useModulosFormativosApiStore, type ModuloFormativoApi } from '../../stores/modulos-formativos-api'

defineEmits<{
  edit: [m: ModuloFormativoApi];
  delete: [moduloFormativo: ModuloFormativoApi];
  restore: [moduloFormativo: ModuloFormativoApi];
}>()

const store = useModulosFormativosApiStore()
const query = ref('')

onMounted(() => {
  if (store.items.length === 0) store.fetchAll()
})

const loading = computed(() => store.loading)
const filtered = computed<ModuloFormativoApi[]>(() => {
  const q = query.value.toLowerCase()
  return store.items.filter((m) =>
    (m.nombre || '').toLowerCase().includes(q) ||
    (m.codigo || '').toLowerCase().includes(q)
  )
})
</script>
