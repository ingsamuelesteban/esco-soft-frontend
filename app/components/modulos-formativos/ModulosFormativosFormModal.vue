<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ title }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre *</label>
                <input v-model.trim="form.nombre" type="text" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Código</label>
                <input v-model.trim="form.codigo" type="text" maxlength="50"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo *</label>
                <select v-model="form.tipo" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option value="Academico">Académico</option>
                  <option value="Tecnico">Técnico</option>
                </select>
              </div>
              <div v-if="form.tipo === 'Tecnico'">
                <label class="block text-sm font-medium text-gray-700">Cantidad de RA *</label>
                <input v-model.number="form.cantidad_ra" type="number" min="1" max="20" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ej: 5" />
                <p class="mt-1 text-xs text-gray-500">Número de Resultados de Aprendizaje para este módulo técnico</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea v-model.trim="form.descripcion" rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
              </div>
              <div>
                <label class="flex items-center">
                  <input v-model="form.activo" type="checkbox"
                    class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-200 focus:ring-opacity-50" />
                  <span class="ml-2 text-sm text-gray-700">Activa</span>
                </label>
              </div>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" :disabled="loading"
              class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{{
                loading ? 'Guardando…' : 'Guardar' }}</button>
            <button type="button" @click="$emit('close')" :disabled="loading"
              class="px-3 py-2 rounded border bg-white text-gray-700 hover:bg-gray-50 transition sm:mr-3 disabled:opacity-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModulosFormativosApiStore, type ModuloFormativoApi } from '../../stores/modulos-formativos-api'
import { showError } from '../../utils/sweetalert'

const props = defineProps<{ moduloFormativo: ModuloFormativoApi | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const store = useModulosFormativosApiStore()

const isEdit = computed(() => !!props.moduloFormativo)
const title = computed(() => isEdit.value ? 'Editar módulo formativo' : 'Nuevo módulo formativo')
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref<{ nombre: string; codigo?: string | null; tipo: 'Academico' | 'Tecnico'; cantidad_ra?: number | null; descripcion?: string | null; activo: boolean }>({
  nombre: '',
  codigo: '',
  tipo: 'Academico',
  cantidad_ra: null,
  descripcion: '',
  activo: true,
})

watch(() => props.moduloFormativo, (m) => {
  if (m) {
    form.value = {
      nombre: m.nombre,
      codigo: m.codigo ?? '',
      tipo: m.tipo || 'Academico',
      cantidad_ra: m.cantidad_ra ?? null,
      descripcion: m.descripcion ?? '',
      activo: m.activo,
    }
  } else {
    form.value = { nombre: '', codigo: '', tipo: 'Academico', cantidad_ra: null, descripcion: '', activo: true }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    if (isEdit.value && props.moduloFormativo) {
      await store.update(props.moduloFormativo.id, form.value)
    } else {
      await store.create(form.value)
    }
    emit('saved')
  } catch (e: any) {
    const apiErrors = e?.data?.errors
    if (apiErrors) {
      error.value = apiErrors.nombre?.[0] || apiErrors.codigo?.[0] || e?.data?.message
    } else {
      error.value = e?.data?.message || 'Error al guardar el módulo formativo'
    }
    showError(error.value as string)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
