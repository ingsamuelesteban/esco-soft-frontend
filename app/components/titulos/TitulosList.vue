<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 flex items-center justify-between">
      <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
        placeholder="Buscar por nombre o código…" />
      <div class="ml-4 text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
    </div>

    <div v-if="selectedIds.length > 0" class="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
      <span class="text-sm font-medium text-blue-700">{{ selectedIds.length }} títulos seleccionados</span>
      <button @click="openBulkCopyModal" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Habilitar en otro Año Lectivo
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" 
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Familia</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Años Vigentes</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="t in filtered" :key="t.id">
            <td class="px-4 py-3 whitespace-nowrap">
              <input type="checkbox" :value="t.id" v-model="selectedIds"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ t.familia?.nombre ||
              familiaNombre(t.familia_profesional_id) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">{{ t.codigo }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ t.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-[10px]">
              <div class="flex flex-wrap gap-1">
                <span v-for="a in t.anios_lectivos" :key="a.id" 
                  class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                  {{ a.nombre }}
                </span>
                <span v-if="!t.anios_lectivos?.length" class="text-gray-400 italic">Ninguno</span>
              </div>
            </td>
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
import { api } from '../../utils/api'
import Swal from 'sweetalert2'

const emit = defineEmits<{ edit: [titulo: Titulo]; delete: [id: number] }>()

const titulos = useTitulosStore()
const familias = useFamiliasProfesionalesStore()

const query = ref('')
const selectedIds = ref<number[]>([])

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

const allSelected = computed(() => {
  return filtered.value.length > 0 && selectedIds.value.length === filtered.value.length
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filtered.value.map(t => t.id)
  }
}

const openBulkCopyModal = async () => {
  try {
    const res = await api.get('/api/anios-lectivos')
    const anios = Array.isArray(res) ? res : (res.data || [])
    
    const { value: anioId } = await Swal.fire({
      title: 'Habilitar Títulos en otro Año Lectivo',
      text: `Se habilitarán los ${selectedIds.value.length} títulos seleccionados.`,
      input: 'select',
      inputOptions: anios.reduce((acc: any, a: any) => {
        acc[a.id] = a.nombre + (a.activo ? ' (Activo)' : '')
        return acc
      }, {}),
      inputPlaceholder: 'Seleccione Año Lectivo Destino',
      showCancelButton: true,
      confirmButtonText: 'Habilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0ea5e9',
      inputValidator: (value: string) => {
        if (!value) return 'Debes seleccionar un año lectivo'
        return null
      }
    })

    if (anioId) {
      await titulos.bulkCopyToYear({
        titulo_ids: selectedIds.value,
        anio_lectivo_id: parseInt(anioId)
      })
      
      selectedIds.value = []
      await titulos.fetchAll()
      
      await Swal.fire({
        icon: 'success',
        title: 'Completado',
        text: 'Los títulos han sido habilitados para el año seleccionado.',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (e) {
    console.error('Error in bulk copy', e)
  }
}
</script>
