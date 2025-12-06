<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-3">
          <select v-model="dia" class="rounded-md border-gray-300 text-sm">
            <option value="">Todos los días</option>
            <option v-for="d in dias" :key="d" :value="d">{{ d }}</option>
          </select>
          <input v-model="grupo" type="text" class="rounded-md border-gray-300 text-sm" placeholder="Grupo (ej. 6A)" />
        </div>
        <div class="text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="h in filtered" :key="h.id">
            <td class="px-4 py-3 whitespace-nowrap">{{ h.dia }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ h.hora_inicio }} - {{ h.hora_fin }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ materiaNombre(h.materiaId) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ aulaNombre(h.aulaId) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ h.profesor }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ h.grupo }}</td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHorariosStore, type Horario } from '../../stores/horarios'
import { useModulosFormativosApiStore } from '../../stores/modulos-formativos-api'
import { useAulasStore } from '../../stores/aulas'

const horarios = useHorariosStore()
const materias = useModulosFormativosApiStore()
const aulas = useAulasStore()

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const dia = ref('')
const grupo = ref('')

onMounted(async () => {
  if (materias.items.length === 0) await materias.fetchAll()
  if (aulas.items.length === 0) await aulas.fetchAll()
  if (horarios.items.length === 0) await horarios.fetchAll()
})

const loading = computed(() => horarios.loading)
const filtered = computed<Horario[]>(() => {
  return horarios.items.filter((h: Horario) =>
    (!dia.value || h.dia === dia.value) &&
    (!grupo.value || h.grupo.toLowerCase().includes(grupo.value.toLowerCase()))
  )
})

const materiaNombre = (id: number) => materias.items.find((m: any) => m.id === id)?.nombre || '—'
const aulaNombre = (id: number) => {
  const a = aulas.items.find(a => a.id === id)
  if (!a) return '—'
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  const label = `${grado}${seccion}${titulo}`.trim()
  return label || `Aula ${a.id}`
}
</script>
