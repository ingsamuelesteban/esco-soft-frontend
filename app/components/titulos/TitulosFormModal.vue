<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ isEdit ? 'Editar Título' : 'Añadir Título' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Familia *</label>
                <select v-model.number="form.familia_profesional_id" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option disabled value="">Selecciona una familia</option>
                  <option v-for="f in familias" :key="f.id" :value="f.id">{{ f.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre *</label>
                <input v-model.trim="form.nombre" type="text" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Código *</label>
                <input v-model.trim="form.codigo" type="text" required maxlength="50"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="flex items-center">
                  <input v-model="form.activo" type="checkbox"
                    class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-200 focus:ring-opacity-50" />
                  <span class="ml-2 text-sm text-gray-700">Activo</span>
                </label>
              </div>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" :disabled="loading" class="btn-primary disabled:opacity-50">{{ loading ? 'Guardando…'
              : 'Guardar' }}</button>
            <button type="button" @click="$emit('close')" :disabled="loading"
              class="btn-secondary sm:mr-3 disabled:opacity-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTitulosStore, type Titulo } from '../../stores/titulos'
import { useFamiliasProfesionalesStore } from '../../stores/familias_profesionales'
import { showError } from '../../utils/sweetalert'

const props = defineProps<{ titulo: Titulo | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const titulos = useTitulosStore()
const familiasStore = useFamiliasProfesionalesStore()

const familias = computed(() => familiasStore.items)
const isEdit = computed(() => !!props.titulo)

const loading = ref(false)
const error = ref<string | null>(null)

const form = ref<Omit<Titulo, 'id' | 'familia'>>({
  familia_profesional_id: 0,
  nombre: '',
  codigo: '',
  activo: true,
})

watch(() => props.titulo, (val) => {
  if (val) {
    form.value = {
      familia_profesional_id: val.familia_profesional_id,
      nombre: val.nombre,
      codigo: val.codigo,
      activo: val.activo,
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    if (isEdit.value && props.titulo) {
      await titulos.update(props.titulo.id, form.value)
    } else {
      await titulos.create(form.value)
    }
    emit('saved')
  } catch (e: any) {
    const apiErrors = e?.data?.errors
    if (apiErrors) {
      error.value = apiErrors.nombre?.[0] || apiErrors.codigo?.[0] || apiErrors.familia_profesional_id?.[0] || e?.data?.message
    } else {
      error.value = e?.data?.message || 'Error al guardar el título'
    }
    showError(error.value as string)
  } finally {
    loading.value = false
  }
}
</script>
