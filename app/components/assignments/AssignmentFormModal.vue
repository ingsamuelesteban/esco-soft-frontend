<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <div class="bg-white w-full max-w-xl rounded-lg shadow-xl overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ isEdit ? 'Editar asignación' : 'Nueva asignación' }}</h3>
        <button
          class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          @click="onCancel" title="Cerrar">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form @submit.prevent="onSubmit">
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Año lectivo</label>
              <input v-model="form.anio_lectivo" type="text" class="border rounded px-2 py-2 w-full"
                placeholder="2025-2" />
              <p v-if="errors.anio_lectivo" class="text-sm text-red-600 mt-1">{{ errors.anio_lectivo }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Horas semanales</label>
              <input v-model.number="form.horas_semanales" type="number" min="0" max="60"
                class="border rounded px-2 py-2 w-full" placeholder="p. ej. 5" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Módulo Formativo</label>
              <select v-model.number="form.materia_id" class="border rounded px-2 py-2 w-full">
                <option :value="undefined">Seleccionar…</option>
                <option v-for="m in modulosFormativos" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              </select>
              <p v-if="errors.materia_id" class="text-sm text-red-600 mt-1">{{ errors.materia_id }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Profesor</label>
              <select v-model.number="form.profesor_id" class="border rounded px-2 py-2 w-full">
                <option :value="undefined">Seleccionar…</option>
                <option v-for="p in profesores" :key="p.id" :value="p.id">{{ p.nombre }} {{ p.apellido }}</option>
              </select>
              <p v-if="errors.profesor_id" class="text-sm text-red-600 mt-1">{{ errors.profesor_id }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Aula</label>
              <select v-model.number="form.aula_id" class="border rounded px-2 py-2 w-full">
                <option :value="undefined">Seleccionar…</option>
                <option v-for="a in aulas" :key="a.id" :value="a.id">{{ aulaName(a) }}</option>
              </select>
              <p v-if="errors.aula_id" class="text-sm text-red-600 mt-1">{{ errors.aula_id }}</p>
            </div>
          </div>
          <div v-if="formError" class="p-3 bg-red-50 text-red-700 rounded">{{ formError }}</div>
        </div>
        <div class="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" class="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 transition"
            @click="onCancel">Cancelar</button>
          <button type="submit" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">{{ isEdit
            ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useModulosFormativosApiStore } from '../../stores/modulos-formativos-api'
import { usePersonalStore } from '../../stores/personal'
import { useAulasStore, type Aula } from '../../stores/aulas'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'

const props = defineProps<{ open: boolean; model?: ClassAssignment | null }>()
const emit = defineEmits<{ close: []; saved: [item: ClassAssignment] }>()

const modulosFormativosStore = useModulosFormativosApiStore()
const personalStore = usePersonalStore()
const aulasStore = useAulasStore()
const assignments = useClassAssignmentsStore()

const form = reactive<{ anio_lectivo: string; horas_semanales: number | null; materia_id?: number; profesor_id?: number; aula_id?: number }>({
  anio_lectivo: assignments.anioLectivo,
  horas_semanales: null,
})
const errors = reactive<Record<string, string | null>>({})
const formError = ref<string | null>(null)

const isEdit = computed(() => !!props.model)

onMounted(async () => {
  if (modulosFormativosStore.items.length === 0) await modulosFormativosStore.fetchAll()
  if (personalStore.items.length === 0) await personalStore.fetchAll()
  if (aulasStore.items.length === 0) await aulasStore.fetchAll()
})

function resetForm() {
  form.anio_lectivo = assignments.anioLectivo
  form.horas_semanales = null
  form.materia_id = undefined
  form.profesor_id = undefined
  form.aula_id = undefined
  errors.anio_lectivo = null
  errors.materia_id = null
  errors.profesor_id = null
  errors.aula_id = null
  formError.value = null
}

watch(() => props.model, (m) => {
  if (m) {
    form.anio_lectivo = m.anio_lectivo
    form.horas_semanales = m.horas_semanales ?? null
    form.materia_id = m.materia_id
    form.profesor_id = m.profesor_id
    form.aula_id = m.aula_id
  } else {
    resetForm()
  }
}, { immediate: true })

const modulosFormativos = computed(() => modulosFormativosStore.active)
const profesores = computed(() => personalStore.items.filter(p => p.cargo?.nombre === 'Profesor'))
const aulas = computed(() => aulasStore.items)

const aulaName = (a: Aula) => {
  const grado = a.grado_cardinal ? `${a.grado_cardinal}º` : ''
  const seccion = a.seccion || ''
  const titulo = a.titulo?.nombre ? ` - ${a.titulo.nombre}` : ''
  return `${grado}${seccion}${titulo}`.trim() || `Aula ${a.id}`
}

const onSubmit = async () => {
  errors.anio_lectivo = null
  errors.materia_id = null
  errors.profesor_id = null
  errors.aula_id = null
  formError.value = null
  try {
    // Basic required checks for TS and UX
    if (!form.materia_id) errors.materia_id = 'Requerido'
    if (!form.profesor_id) errors.profesor_id = 'Requerido'
    if (!form.aula_id) errors.aula_id = 'Requerido'
    if (errors.materia_id || errors.profesor_id || errors.aula_id) return

    if (isEdit.value && props.model) {
      const updated = await assignments.update(props.model.id, { ...form })
      emit('saved', updated)
    } else {
      const created = await assignments.create({
        anio_lectivo: form.anio_lectivo,
        horas_semanales: form.horas_semanales,
        materia_id: form.materia_id!,
        profesor_id: form.profesor_id!,
        aula_id: form.aula_id!,
        activo: true,
      })
      emit('saved', created)
      resetForm()
    }
    emit('close')
  } catch (e: any) {
    const err = e?.data
    if (err?.errors) {
      for (const k of Object.keys(err.errors)) {
        errors[k] = Array.isArray(err.errors[k]) ? err.errors[k][0] : String(err.errors[k])
      }
    }
    formError.value = err?.message || 'Error al enviar el formulario'
  }
}

// resetForm hoisted above to avoid TDZ and allow immediate watchers


watch(() => props.open, (isOpen) => {
  if (isOpen && !isEdit.value) {
    resetForm()
  }
})

const onCancel = () => {
  resetForm()
  emit('close')
}
</script>

<style scoped></style>
