<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
        <form @submit.prevent="submit">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  Desactivar Asignaciones en Lote
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción modificará todas las asignaciones del ciclo escolar seleccionado. Las calificaciones históricas y actas previas no se eliminarán.
                  </p>
                </div>

                <div class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Año Lectivo</label>
                    <select v-model="form.anio_lectivo_id" required
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                      <option disabled value="">Seleccione un año lectivo</option>
                      <option v-for="y in aniosStore.items" :key="y.id" :value="y.id">
                        {{ y.nombre }} {{ y.activo ? '(Activo)' : '' }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Modo</label>
                    <div class="mt-2 space-y-2">
                      <div class="flex items-start">
                        <div class="flex items-center h-5">
                          <input id="modo_liberar" type="radio" v-model="form.modo" value="liberar_docentes"
                            class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="modo_liberar" class="font-medium text-gray-700 dark:text-gray-300">Vaciar Docentes (Recomendado)</label>
                          <p class="text-gray-500 dark:text-gray-400">Mantiene las materias en las aulas pero sin profesor asignado.</p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <div class="flex items-center h-5">
                          <input id="modo_desactivar" type="radio" v-model="form.modo" value="desactivar_completas"
                            class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="modo_desactivar" class="font-medium text-gray-700 dark:text-gray-300">Desactivar / Apagar Completas</label>
                          <p class="text-gray-500 dark:text-gray-400">Oculta las asignaciones por completo.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start mt-4">
                    <div class="flex items-center h-5">
                      <input id="confirmacion" type="checkbox" v-model="confirmed" required
                        class="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded" />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="confirmacion" class="font-medium text-gray-700 dark:text-gray-300">
                        Entiendo que esta acción modificará las asignaciones de este ciclo.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" :disabled="isProcessing || !confirmed || !form.anio_lectivo_id"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              <svg v-if="isProcessing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ isProcessing ? 'Procesando...' : 'Confirmar' }}
            </button>
            <button type="button" @click="close"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useClassAssignmentsStore } from '../../stores/class_assignments'
import { useAniosLectivosStore } from '../../stores/anios_lectivos'
import Swal from 'sweetalert2'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const store = useClassAssignmentsStore()
const aniosStore = useAniosLectivosStore()

const isProcessing = ref(false)
const confirmed = ref(false)

const form = ref({
  anio_lectivo_id: store.anioLectivoId || '',
  modo: 'liberar_docentes' as 'liberar_docentes' | 'desactivar_completas'
})

watch(() => props.open, async (newVal) => {
  if (newVal) {
    confirmed.value = false
    form.value.modo = 'liberar_docentes'
    if (aniosStore.items.length === 0) {
      await aniosStore.fetchAll()
    }
    // Prefill with current selected year or active year
    const activeYear = aniosStore.items.find(y => y.activo)
    form.value.anio_lectivo_id = store.anioLectivoId || (activeYear ? activeYear.id : '')
  }
})

const close = () => {
  emit('close')
}

const submit = async () => {
  if (!confirmed.value || !form.value.anio_lectivo_id) return
  isProcessing.value = true

  try {
    const res = await store.bulkDeactivate({
      anio_lectivo_id: Number(form.value.anio_lectivo_id),
      modo: form.value.modo
    })
    
    emit('success')
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: res.message || 'Se procesaron las asignaciones correctamente.',
      timer: 3000,
      showConfirmButton: false
    })
    close()
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.data?.message || 'Ocurrió un error al procesar las asignaciones.'
    })
  } finally {
    isProcessing.value = false
  }
}
</script>
