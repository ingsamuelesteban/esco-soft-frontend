<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal content -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  {{ isEdit ? 'Editar Familia Profesional' : 'Añadir Familia Profesional' }}
                </h3>

                <!-- Campos del formulario -->
                <div class="space-y-4">
                  <!-- Nombre -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input ref="initialInput" v-model.trim="form.nombre" type="text" required
                      :class="['mt-1 block w-full rounded-md shadow-sm sm:text-sm', nombreError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500']"
                      placeholder="Ej: Informática y Comunicaciones" />
                    <p v-if="nombreError" class="mt-1 text-xs text-red-600">{{ nombreError }}</p>
                  </div>

                  <!-- Código -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Código *</label>
                    <input v-model.trim="form.codigo" type="text" required maxlength="10"
                      :class="['mt-1 block w-full rounded-md shadow-sm sm:text-sm', codigoError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500']"
                      placeholder="Ej: IFC" />
                    <p v-if="codigoError" class="mt-1 text-xs text-red-600">{{ codigoError }}</p>
                  </div>

                  <!-- Estado -->
                  <div>
                    <label class="flex items-center">
                      <input v-model="form.activo" type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-200 focus:ring-opacity-50" />
                      <span class="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>

                <!-- Error message -->
                <div v-if="error" class="mt-4 text-sm text-red-600">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" @click="$emit('close')" :disabled="loading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useFamiliasProfesionalesStore, type FamiliaProfesional } from '../../stores/familias_profesionales'
import { showError } from '../../utils/sweetalert'

const props = defineProps<{
  familia: FamiliaProfesional | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useFamiliasProfesionalesStore()
const loading = ref(false)
const error = ref<string | null>(null)
const nombreError = ref<string | null>(null)
const codigoError = ref<string | null>(null)
const initialInput = ref<HTMLInputElement | null>(null)

const isEdit = computed(() => !!props.familia)

const form = ref<Omit<FamiliaProfesional, 'id'>>({
  nombre: '',
  codigo: '',
  activo: true,
})

// Cargar datos si es edición
watch(() => props.familia, (newVal) => {
  if (newVal) {
    form.value = {
      nombre: newVal.nombre,
      codigo: newVal.codigo,
      activo: newVal.activo,
    }
  }
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    initialInput.value?.focus()
  }, 100)
})

// Limpiar errores cuando cambian los campos
watch(() => form.value.nombre, () => { nombreError.value = null })
watch(() => form.value.codigo, () => { codigoError.value = null })

const validateLocal = (): boolean => {
  nombreError.value = null
  codigoError.value = null

  const norm = (s: string) => s.trim().toLowerCase()
  const currentId = props.familia?.id

  const nombreTaken = store.items.some(f => norm(f.nombre) === norm(form.value.nombre) && (!isEdit.value || f.id !== currentId))
  const codigoTaken = store.items.some(f => norm(f.codigo) === norm(form.value.codigo) && (!isEdit.value || f.id !== currentId))

  if (nombreTaken) {
    nombreError.value = 'Ya existe otra familia con este nombre.'
  }
  if (codigoTaken) {
    codigoError.value = 'Ya existe otra familia con este código.'
  }

  return !(nombreError.value || codigoError.value)
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    // Validación local sólo en creación. En edición la desactivamos por ahora
    if (!isEdit.value) {
      if (!validateLocal()) {
        const first = nombreError.value || codigoError.value || 'Corrige los errores del formulario.'
        error.value = first
        showError(first)
        return
      }
    }

    if (isEdit.value && props.familia) {
      await store.update(props.familia.id, form.value)
    } else {
      await store.create(form.value)
    }
    emit('saved')
  } catch (e: any) {
    // Manejo de errores de validación del backend (422)
    const apiErrors = e?.data?.errors
    if (apiErrors) {
      nombreError.value = apiErrors.nombre?.[0] || null
      codigoError.value = apiErrors.codigo?.[0] || null
      const first = nombreError.value || codigoError.value || e.data?.message
      error.value = first || 'Error al guardar la familia profesional'
      showError(error.value as string)
    } else {
      const errorMsg = e?.data?.message || 'Error al guardar la familia profesional'
      error.value = errorMsg
      showError(errorMsg)
    }
  } finally {
    loading.value = false
  }
}
</script>
