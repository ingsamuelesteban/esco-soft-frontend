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
              <input ref="initialInput" v-model="form.nombres" type="text" class="border rounded px-2 py-2 w-full"
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
          <!-- Estado y Aula -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Aula</label>
              <select v-model="form.aula_id"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option :value="undefined">Sin aula asignada</option>
                <option v-for="aula in aulasStore.items" :key="aula.id" :value="aula.id">
                  {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo?.nombre }}
                </option>
              </select>
            </div>

            <!-- Año Lectivo (Solo creación) -->
            <div v-if="!isEdit">
              <label class="block text-sm font-medium text-gray-700 mb-1">Año Lectivo de Ingreso</label>
              <select v-model="form.anio_lectivo_id"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option :value="undefined">Seleccionar año...</option>
                <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
                  {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                </option>
              </select>
               <p class="text-xs text-gray-500 mt-1" v-if="anioSeleccionado && !anioSeleccionado.activo">
                {{ anioSeleccionado.nombre }} es un año futuro o inactivo.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.estado"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="activo">Activo</option>
                <option value="retirado">Retirado</option>
              </select>
            </div>
          </div>

          <!-- Fecha de Retiro (visible solo si es retirado) -->
          <div v-if="form.estado === 'retirado'" class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 w-full">
                <h3 class="text-sm font-medium text-red-800">Fecha de Retiro</h3>
                <div class="mt-2">
                  <input v-model="form.fecha_retiro" type="date" class="border rounded px-2 py-2 w-full" />
                </div>
                <p class="mt-2 text-xs text-red-700">
                  El estudiante mantendrá su número de orden (se activará orden manual). Su asistencia y calificaciones
                  se deshabilitarán.
                </p>
              </div>
            </div>
          </div>

          <!-- Orden Manual -->
          <div v-if="form.aula_id" class="sm:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Ordenamiento Manual</h4>
                <p class="text-xs text-gray-500 mt-1">Activar solo para excepciones (ej. inscripciones tardías fuera de
                  orden alfabético).</p>
              </div>
              <div class="flex items-center">
                <button type="button" @click="form.orden_manual = !form.orden_manual"
                  :class="form.orden_manual ? 'bg-blue-600' : 'bg-gray-200'"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.orden_manual ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </div>
            </div>

            <div v-if="form.orden_manual" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Número de Orden</label>
              <input type="number" v-model.number="form.numero_orden"
                class="w-32 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" min="1">
              <p class="text-xs text-amber-600 mt-1">Este estudiante mantendrá este número fijo. Los demás se reodenarán
                alrededor.</p>
            </div>
          </div>
          <p v-if="errors.aula_id" class="text-sm text-red-600 mt-1">{{ errors.aula_id }}</p>

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
import { useAniosLectivosStore } from '../../stores/anios_lectivos'
import CedulaInput from '../forms/CedulaInput.vue'

const props = defineProps<{ open: boolean; model?: Estudiante | null }>()
const emit = defineEmits<{ close: []; saved: [item: Estudiante] }>()

const store = useEstudiantesStore()
const aulasStore = useAulasStore()
const aniosStore = useAniosLectivosStore()

onMounted(async () => {
  aulasStore.fetchAll()
  await aniosStore.fetchAll()
  
  // Set default active year for new students
  if (!props.model) {
      const activeYear = aniosStore.activos[0]
      if (activeYear) {
          form.anio_lectivo_id = activeYear.id
      }
  }
})

interface EstudianteForm {
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  cedula: string
  sexo: string
  rne: string
  aula_id?: number
  orden_manual: boolean
  numero_orden?: number
  estado: string
  fecha_retiro?: string
  anio_lectivo_id?: number
}

const form = reactive<EstudianteForm>({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  cedula: '',
  sexo: 'Masculino',
  rne: '',
  aula_id: undefined,
  orden_manual: false,
  numero_orden: undefined,
  estado: 'activo',
  fecha_retiro: undefined,
  anio_lectivo_id: undefined
})

function resetForm() {
  Object.assign(form, {
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    cedula: '',
    sexo: 'Masculino',
    rne: '',
    aula_id: undefined,
    orden_manual: false,
    numero_orden: undefined,
    estado: 'activo',
    fecha_retiro: undefined,
    anio_lectivo_id: aniosStore.activos[0]?.id
  })
  errors.nombres = null
  errors.apellidos = null
  errors.fecha_nacimiento = null
  errors.cedula = null
  errors.sexo = null
  errors.rne = null
  errors.aula_id = null
  errors.orden_manual = null
  errors.numero_orden = null
  formError.value = null
}

const errors = reactive<Record<string, string | null>>({})
const formError = ref<string | null>(null)
const loading = ref(false)
const initialInput = ref<HTMLInputElement | null>(null)

const isEdit = computed(() => !!props.model)

const edadCalculada = computed(() => {
  if (!form.fecha_nacimiento) return 0
  return store.calcularEdad(form.fecha_nacimiento)
})

watch(() => props.model, (m) => {
  if (m) {
    form.nombres = m.nombres || ''
    form.apellidos = m.apellidos || ''
    // Convertir fecha ISO a formato yyyy-MM-dd para input date
    form.fecha_nacimiento = (m.fecha_nacimiento || '').split('T')[0] || ''
    form.cedula = m.cedula || ''
    form.sexo = m.sexo || ''
    form.rne = m.rne || ''
    form.aula_id = m.aula_id || undefined
    form.orden_manual = m.orden_manual || false
    form.numero_orden = m.numero_orden || undefined
    form.estado = m.estado || 'activo'
    form.fecha_retiro = m.fecha_retiro ? m.fecha_retiro.split('T')[0] : undefined
  } else {
    resetForm()
  }
}, { immediate: true })

const anioSeleccionado = computed(() => {
    return aniosStore.items.find(a => a.id === form.anio_lectivo_id)
})

watch(() => form.estado, (newEstado) => {
  if (newEstado === 'retirado' && !form.fecha_retiro) {
    // Set default to today's date in YYYY-MM-DD format
    form.fecha_retiro = new Date().toISOString().split('T')[0]
  }
})

watch(() => props.open, (isOpen) => {
  if (isOpen && !isEdit.value) {
    resetForm()
  }
  if (isOpen) {
    setTimeout(() => {
      initialInput.value?.focus()
    }, 100)
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
    const payload = {
      ...form,
      cedula: form.cedula.trim() || null,
      rne: form.rne.trim() || null,
      aula_id: form.aula_id || null,
      anio_lectivo_id: form.anio_lectivo_id
    }

    if (isEdit.value && props.model) {
      const updated = await store.update(props.model.id, payload as any)
      emit('saved', updated)
    } else {
      const created = await store.create(payload as any)
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
    formError.value = err?.error || err?.message || 'Error al enviar el formulario'
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  resetForm()
  emit('close')
}
</script>