<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Maestro a Cargo del Aula
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Asigna el maestro dueño del aula
        <strong>{{ aulaLabel }}</strong>
        para el año lectivo seleccionado.
      </p>

      <!-- Dueño actual -->
      <div v-if="aula?.dueno" class="mb-4 flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
        <div>
          <p class="text-xs text-blue-500 dark:text-blue-400 font-medium uppercase tracking-wider mb-0.5">Dueño actual</p>
          <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">{{ aula.dueno.nombre_completo }}</p>
        </div>
        <button @click="onRemove" :disabled="saving"
          class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 transition-colors">
          Quitar
        </button>
      </div>
      <div v-else class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        Sin maestro dueño asignado para este año.
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asignar maestro
          </label>
          <select v-model.number="selectedPersonalId"
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors">
            <option :value="null">Seleccione un maestro…</option>
            <option v-for="p in teachers" :key="p.id" :value="p.id">
              {{ p.apellido }}, {{ p.nombre }}
            </option>
          </select>
          <p v-if="errorMsg" class="mt-1 text-sm text-red-600">{{ errorMsg }}</p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="$emit('close')"
            class="px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="saving || !selectedPersonalId"
            class="px-3 py-1.5 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {{ saving ? 'Guardando...' : 'Asignar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { usePersonalStore } from '../../stores/personal'

const props = defineProps<{
  open: boolean
  aula: Aula | null
  anioLectivoId: number | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const aulasStore = useAulasStore()
const personalStore = usePersonalStore()

const selectedPersonalId = ref<number | null>(null)
const saving = ref(false)
const errorMsg = ref<string | null>(null)
const teachers = ref<typeof personalStore.items>([])

const aulaLabel = computed(() => {
  if (!props.aula) return ''
  const grado = props.aula.grado_cardinal
  const gradoStr = grado === 1 ? '1ro' : grado === 2 ? '2do' : grado === 3 ? '3ro' :
    grado === 4 ? '4to' : grado === 5 ? '5to' : grado === 6 ? '6to' : String(grado ?? '')
  return `${gradoStr} ${props.aula.seccion}${props.aula.titulo ? ' - ' + props.aula.titulo.nombre : ''}`
})

onMounted(async () => {
  const data = await personalStore.fetchTeachers()
  teachers.value = [...data].sort((a, b) =>
    `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
  )
})

watch(() => props.open, (val) => {
  if (val) {
    selectedPersonalId.value = props.aula?.dueno?.personal_id ?? null
    errorMsg.value = null
  }
})

const onSubmit = async () => {
  if (!props.aula || !props.anioLectivoId || !selectedPersonalId.value) {
    errorMsg.value = 'Seleccione un maestro'
    return
  }
  errorMsg.value = null
  saving.value = true
  try {
    await aulasStore.setDueno(props.aula.id, {
      anio_lectivo_id: props.anioLectivoId,
      personal_id: selectedPersonalId.value,
    })
    emit('saved')
    emit('close')
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al asignar el dueño'
  } finally {
    saving.value = false
  }
}

const onRemove = async () => {
  if (!props.aula || !props.anioLectivoId) return
  saving.value = true
  try {
    await aulasStore.removeDueno(props.aula.id, props.anioLectivoId)
    selectedPersonalId.value = null
    emit('saved')
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al quitar el dueño'
  } finally {
    saving.value = false
  }
}
</script>
