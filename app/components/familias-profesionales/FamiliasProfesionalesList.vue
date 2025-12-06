<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center justify-between">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar por nombre o código..." />
        <div class="ml-4 text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="f in filtered" :key="f.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">{{ f.codigo }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ f.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="f.activo ? 'text-green-600' : 'text-red-600'">
                {{ f.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <button @click="$emit('edit', f)"
                class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Editar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="f.activo" @click="$emit('delete', f.id)"
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
            <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useFamiliasProfesionalesStore, type FamiliaProfesional } from '../../stores/familias_profesionales'

defineEmits<{
  edit: [familia: FamiliaProfesional]
  delete: [id: number]
}>()

const store = useFamiliasProfesionalesStore()
const query = ref('')

onMounted(() => {
  if (store.items.length === 0) {
    store.fetchAll()
  }
})

const loading = computed(() => store.loading)
const filtered = computed<FamiliaProfesional[]>(() => {
  const q = query.value.toLowerCase()
  return store.items.filter((f: FamiliaProfesional) =>
    f.nombre.toLowerCase().includes(q) ||
    f.codigo.toLowerCase().includes(q)
  )
})
</script>
