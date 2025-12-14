<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 flex items-center justify-between">
      <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
        placeholder="Buscar por nombre o código…" />
      <div class="ml-4 text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Familia</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="t in filtered" :key="t.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ t.familia?.nombre ||
              familiaNombre(t.familia_profesional_id) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">{{ t.codigo }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ t.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="t.activo ? 'text-green-600' : 'text-red-600'">{{ t.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <button @click="$emit('edit', t)"
                class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Editar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="t.activo" @click="$emit('delete', t.id)"
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
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Cargando…</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTitulosStore, type Titulo } from '../../stores/titulos'
import { useFamiliasProfesionalesStore } from '../../stores/familias_profesionales'

const emit = defineEmits<{ edit: [titulo: Titulo]; delete: [id: number] }>()

const titulos = useTitulosStore()
const familias = useFamiliasProfesionalesStore()

const query = ref('')

onMounted(async () => {
  await familias.fetchAll()
  await titulos.fetchAll()
})

const loading = computed(() => titulos.loading)

const familiaNombre = (id: number) => familias.byId(id)?.nombre || '—'

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  return titulos.items.filter((t) =>
    t.nombre.toLowerCase().includes(q) ||
    t.codigo.toLowerCase().includes(q) ||
    familiaNombre(t.familia_profesional_id).toLowerCase().includes(q)
  )
})
</script>
