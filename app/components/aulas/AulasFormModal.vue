<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="onClose" />
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {{ isConfigAnio ? 'Configurar Aula para Año Lectivo' : (isEdit ? 'Editar Aula' : 'Nueva Aula') }}
      </h3>
      <p v-if="isConfigAnio" class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Los cambios realizados aquí solo afectarán al año lectivo seleccionado.
      </p>
      <div v-else class="mb-4"></div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
          <select ref="initialInput" v-model.number="form.titulo_id"
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors">
            <option :value="null">Seleccione un título…</option>
            <option v-for="t in titulos.activas" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
          <p v-if="errors.titulo_id" class="mt-1 text-sm text-red-600">{{ errors.titulo_id }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grado</label>
            <select v-model.number="form.grado_cardinal" :disabled="isConfigAnio"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50">
              <option :value="null">—</option>
              <option v-for="n in [1, 2, 3, 4, 5, 6]" :key="n" :value="n">{{ gradoLabel(n) }}</option>
            </select>
            <p v-if="errors.grado_cardinal" class="mt-1 text-sm text-red-600">{{ errors.grado_cardinal }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sección</label>
            <input v-model="form.seccion" @input="onSeccionInput" maxlength="1" :disabled="isConfigAnio"
              class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50" placeholder="A" />
            <p v-if="errors.seccion" class="mt-1 text-sm text-red-600">{{ errors.seccion }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad</label>
          <input type="number" min="1" v-model.number="form.capacidad"
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="30" />
          <p v-if="errors.capacidad" class="mt-1 text-sm text-red-600">{{ errors.capacidad }}</p>
        </div>

        <div v-if="isEdit && !isConfigAnio" class="flex items-center gap-2">
          <input id="activo" type="checkbox" v-model="form.activo"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
          <label for="activo" class="text-sm text-gray-700 dark:text-gray-300">Activa</label>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="onClose"
            class="px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
          <button type="submit"
            class="px-3 py-1.5 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">{{
            isConfigAnio ? 'Guardar Configuración' : (isEdit ? 'Guardar Cambios' : 'Crear Aula') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, onMounted, ref } from 'vue'
import { useTitulosStore } from '../../stores/titulos'
import { useAulasStore, type Aula } from '../../stores/aulas'

const props = defineProps<{ modelValue: boolean; aula?: Aula | null; anioLectivoId?: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved', aula: Aula): void }>()

const titulos = useTitulosStore()
const aulas = useAulasStore()

const isEdit = computed(() => !!props.aula)
const isConfigAnio = computed(() => !!props.anioLectivoId && isEdit.value)

const form = reactive<{ titulo_id: number | null; grado_cardinal: number | null; seccion: string; capacidad: number | null; activo?: boolean }>({
  titulo_id: null,
  grado_cardinal: null,
  seccion: '',
  capacidad: null,
  activo: true,
})

const errors = reactive<{ [k: string]: string | null }>({})
const initialInput = ref<HTMLSelectElement | null>(null)

const reset = () => {
  form.titulo_id = null
  form.grado_cardinal = null
  form.seccion = ''
  form.capacidad = null
  form.activo = true
  for (const k of Object.keys(errors)) errors[k] = null
}

watch(() => props.aula, (a) => {
  reset()
  if (a) {
    form.titulo_id = a.titulo_id ?? null
    form.grado_cardinal = a.grado_cardinal ?? null
    form.seccion = a.seccion || ''
    form.capacidad = a.capacidad ?? null
    form.activo = a.activo
  }
}, { immediate: true })

onMounted(() => {
  if (titulos.items.length === 0) titulos.fetchAll().catch(() => { })
  setTimeout(() => {
    initialInput.value?.focus()
  }, 100)
})

const onSeccionInput = () => {
  form.seccion = (form.seccion || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1)
}

const onClose = () => emit('update:modelValue', false)

const gradoLabel = (n: number) => {
  if (n === 1) return '1ro'
  if (n === 2) return '2do'
  if (n === 3) return '3ro'
  if (n === 4) return '4to'
  if (n === 5) return '5to'
  if (n === 6) return '6to'
  return String(n)
}

const onSubmit = async () => {
  for (const k of Object.keys(errors)) errors[k] = null
  try {
    if (!form.titulo_id) errors.titulo_id = 'Seleccione un título'
    if (!form.grado_cardinal) errors.grado_cardinal = 'Seleccione un grado'
    if (!form.seccion) errors.seccion = 'Ingrese una sección'
    if (errors.titulo_id || errors.grado_cardinal || errors.seccion) return

    if (isConfigAnio.value && props.aula && props.anioLectivoId) {
      await aulas.configurarAnio(props.aula.id, {
        anio_lectivo_id: props.anioLectivoId,
        titulo_id: form.titulo_id,
        capacidad: form.capacidad
      })
      // No devolvemos el objeto aula completo porque el backend solo confirma éxito.
      // Emitimos saved con el aula local actualizada para que el padre recargue
      emit('saved', { ...props.aula, titulo_id: form.titulo_id, capacidad: form.capacidad } as Aula)
    } else {
      let saved: Aula
      if (isEdit.value && props.aula) {
        saved = await aulas.update(props.aula.id, form)
      } else {
        saved = await aulas.create(form)
      }
      emit('saved', saved)
    }
    emit('update:modelValue', false)
  } catch (e: any) {
    const backend = e?.data?.errors || {}
    for (const key of Object.keys(backend)) {
      errors[key] = Array.isArray(backend[key]) ? backend[key][0] : String(backend[key])
    }
  }
}
</script>
