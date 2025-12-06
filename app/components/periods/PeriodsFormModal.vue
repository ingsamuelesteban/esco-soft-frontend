<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="onClose" />
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-5">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ isEdit ? 'Editar Período' : 'Nuevo Período' }}</h3>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
          <input v-model.trim="form.label" class="w-full rounded-md border-gray-300 text-sm"
            placeholder="1ra hora, Receso, etc." />
          <p v-if="errors.label" class="mt-1 text-sm text-red-600">{{ errors.label }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
            <input type="time" v-model="form.start_time" class="w-full rounded-md border-gray-300 text-sm" />
            <p v-if="errors.start_time" class="mt-1 text-sm text-red-600">{{ errors.start_time }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
            <input type="time" v-model="form.end_time" class="w-full rounded-md border-gray-300 text-sm" />
            <p v-if="errors.end_time" class="mt-1 text-sm text-red-600">{{ errors.end_time }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select v-model="form.type" class="w-full rounded-md border-gray-300 text-sm">
              <option value="class">Clase</option>
              <option value="break">Receso</option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Período</label>
            <input type="number" min="1" v-model.number="form.period_number" :disabled="form.type === 'break'"
              class="w-full rounded-md border-gray-300 text-sm disabled:bg-gray-100" placeholder="1, 2, 3..." />
            <p v-if="errors.period_number" class="mt-1 text-sm text-red-600">{{ errors.period_number }}</p>
          </div>
        </div>

        <div v-if="isEdit" class="flex items-center gap-2">
          <input id="is_active" type="checkbox" v-model="form.is_active" class="rounded border-gray-300" />
          <label for="is_active" class="text-sm text-gray-700">Activo</label>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="onClose"
            class="px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100">Cancelar</button>
          <button type="submit" class="px-3 py-1.5 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">{{
            isEdit ? 'Guardar' : 'Crear' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { usePeriodsStore, type Period } from '../../stores/periods'

const props = defineProps<{ modelValue: boolean; period?: Period | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved', period: Period): void }>()

const store = usePeriodsStore()

const isEdit = computed(() => !!props.period)

const form = reactive<{
  label: string
  start_time: string
  end_time: string
  type: 'class' | 'break'
  period_number: number | null
  is_active: boolean
}>({
  label: '',
  start_time: '',
  end_time: '',
  type: 'class',
  period_number: null,
  is_active: true,
})

const errors = reactive<{ [k: string]: string | null }>({})

const reset = () => {
  form.label = ''
  form.start_time = ''
  form.end_time = ''
  form.type = 'class'
  form.period_number = null
  form.is_active = true
  for (const k of Object.keys(errors)) errors[k] = null
}

watch(() => props.period, (p) => {
  reset()
  if (p) {
    form.label = p.label
    form.start_time = p.start_time
    form.end_time = p.end_time
    form.type = p.type
    form.period_number = p.period_number
    form.is_active = p.is_active
  }
}, { immediate: true })

watch(() => form.type, (t) => {
  if (t === 'break') form.period_number = null
})

const onClose = () => emit('update:modelValue', false)

const onSubmit = async () => {
  for (const k of Object.keys(errors)) errors[k] = null
  try {
    if (!form.label) errors.label = 'La etiqueta es obligatoria'
    if (!form.start_time) errors.start_time = 'La hora de inicio es obligatoria'
    if (!form.end_time) errors.end_time = 'La hora de fin es obligatoria'
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      errors.end_time = 'La hora de fin debe ser posterior a la de inicio'
    }
    if (errors.label || errors.start_time || errors.end_time) return

    let saved: Period
    if (isEdit.value && props.period) {
      saved = await store.update(props.period.id, form)
    } else {
      saved = await store.create(form)
    }
    emit('saved', saved)
    emit('update:modelValue', false)
  } catch (e: any) {
    const backend = e?.data?.errors || {}
    for (const key of Object.keys(backend)) {
      errors[key] = Array.isArray(backend[key]) ? backend[key][0] : String(backend[key])
    }
  }
}
</script>
