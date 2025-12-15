<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <div class="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ isEdit ? 'Editar estudiante' : 'Nuevo estudiante' }}</h3>
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
              <label class="block text-sm text-gray-600 mb-1">Nombres <span class="text-red-500">*</span></label>
              <input v-model="form.nombres" type="text" class="border rounded px-2 py-2 w-full"
                placeholder="Nombres del estudiante" />
              <p v-if="errors.nombres" class="text-sm text-red-600 mt-1">{{ errors.nombres }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Apellidos <span class="text-red-500">*</span></label>
              <input v-model="form.apellidos" type="text" class="border rounded px-2 py-2 w-full"
                placeholder="Apellidos del estudiante" />
              <p v-if="errors.apellidos" class="text-sm text-red-600 mt-1">{{ errors.apellidos }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CedulaInput v-model="form.cedula" label="Cédula" placeholder="000-0000000-0"
                :error-message="errors.cedula || undefined" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">RNE</label>
              <input v-model="form.rne" type="text" class="border rounded px-2 py-2 w-full"
                placeholder="Código único" />
              <p v-if="errors.rne" class="text-sm text-red-600 mt-1">{{ errors.rne }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Sexo <span class="text-red-500">*</span></label>
              <select v-model="form.sexo" class="border rounded px-2 py-2 w-full">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <p v-if="errors.sexo" class="text-sm text-red-600 mt-1">{{ errors.sexo }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Fecha de Nacimiento <span
                  class="text-red-500">*</span></label>
              <input v-model="form.fecha_nacimiento" type="date" class="border rounded px-2 py-2 w-full" />
              <p v-if="errors.fecha_nacimiento" class="text-sm text-red-600 mt-1">{{ errors.fecha_nacimiento }}</p>
            </div>
            <div v-if="form.fecha_nacimiento">
              <label class="block text-sm text-gray-600 mb-1">Edad (calculada automáticamente)</label>
              <input :value="edadCalculada + ' años'" type="text" class="border rounded px-2 py-2 w-full bg-gray-50"
                readonly />
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">Aula Asignada</label>
            <select v-model="form.aula_id" class="border rounded px-2 py-2 w-full">
              <option value="">Sin asignar</option>
              <option v-for="option in aulasStore.paraSelect" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="errors.aula_id" class="text-sm text-red-600 mt-1">{{ errors.aula_id }}</p>
          </div>

          <div v-if="formError" class="p-3 bg-red-50 text-red-700 rounded">{{ formError }}</div>
        </div>

        <div class="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" class="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 transition"
            @click="onCancel" :disabled="loading">Cancelar</button>
          <button type="submit"
            class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading">
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Guardando...
            </span>
            <span v-else>{{ isEdit ? 'Actualizar' : 'Crear' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useEstudiantesStore, type Estudiante } from '../../stores/estudiantes'
import { useAulasStore } from '../../stores/aulas'
import CedulaInput from '../forms/CedulaInput.vue'

const props = defineProps<{ open: boolean; model?: Estudiante | null }>()
const emit = defineEmits<{ close: []; saved: [item: Estudiante] }>()

const store = useEstudiantesStore()
const aulasStore = useAulasStore()

onMounted(() => {
  aulasStore.fetchAll()
})

function resetForm() {
  form.nombres = ''
  form.apellidos = ''
  form.fecha_nacimiento = ''
  form.cedula = ''
  form.sexo = ''
  form.rne = ''
  form.aula_id = null
  errors.nombres = null
  errors.apellidos = null
  errors.fecha_nacimiento = null
  errors.cedula = null
  errors.sexo = null
  errors.rne = null
  errors.aula_id = null
  formError.value = null
}

const form = reactive<{
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  cedula: string
  sexo: string
  rne: string
  aula_id: number | null
}>({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  cedula: '',
  sexo: '',
  rne: '',
  aula_id: null
})

const errors = reactive<Record<string, string | null>>({})
const formError = ref<string | null>(null)
const loading = ref(false)

const isEdit = computed(() => !!props.model)

const edadCalculada = computed(() => {
  if (!form.fecha_nacimiento) return 0
  return store.calcularEdad(form.fecha_nacimiento)
})

watch(() => props.model, (m) => {
  if (m) {
    form.nombres = m.nombres
    form.apellidos = m.apellidos
    // Convertir fecha ISO a formato yyyy-MM-dd para input date
    form.fecha_nacimiento = (m.fecha_nacimiento || '').split('T')[0] || ''
    form.cedula = m.cedula
    form.sexo = m.sexo
    form.rne = m.rne
    form.aula_id = m.aula_id || null
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (isOpen && !isEdit.value) {
    resetForm()
  }
})

const onSubmit = async () => {
  // Limpiar errores
  Object.keys(errors).forEach(key => errors[key] = null)
  formError.value = null

  // Validaciones básicas
  if (!form.nombres.trim()) errors.nombres = 'Requerido'
  if (!form.apellidos.trim()) errors.apellidos = 'Requerido'
  if (!form.fecha_nacimiento) errors.fecha_nacimiento = 'Requerido'
  if (!form.cedula.trim()) { /* Cedula is optional */ }
  if (!form.sexo) errors.sexo = 'Requerido'
  if (!form.rne.trim()) { /* RNE is optional */ }

  if (Object.values(errors).some(e => e !== null)) return

  loading.value = true
  try {
    if (isEdit.value && props.model) {
      const updated = await store.update(props.model.id, { ...form } as any)
      emit('saved', updated)
    } else {
      const created = await store.create({ ...form } as any)
      emit('saved', created)
      resetForm()
    }
    emit('close')
  } catch (e: any) {
    const err = e?.data
    if (err?.errors) {
      for (const k of Object.keys(err.errors)) {
        let msg = Array.isArray(err.errors[k]) ? err.errors[k][0] : String(err.errors[k])
        
        // Traducir mensajes de error comunes del backend (Laravel defaults)
        if (msg.toLowerCase().includes('already been taken')) {
          if (k === 'rne') msg = 'Este RNE ya está registrado.'
          else if (k === 'cedula') msg = 'Esta cédula ya está registrada.'
          else msg = 'Este valor ya está registrado.'
        }
        
        errors[k] = msg
      }
    }
    formError.value = err?.message || 'Error al enviar el formulario'
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  resetForm()
  emit('close')
}
</script>