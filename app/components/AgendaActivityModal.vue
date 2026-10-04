<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
        <form @submit.prevent="save">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  {{ isEditing ? 'Editar Actividad' : 'Nueva Actividad' }}
                </h3>
                <div class="mt-4 flex flex-col gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                    <input type="text" v-model="form.titulo" required class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea v-model="form.descripcion" rows="3" class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-primary-500 sm:text-sm"></textarea>
                  </div>
                  <div class="sm:grid sm:grid-cols-2 sm:gap-4 flex flex-col gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                      <input type="date" v-model="form.startDate" required class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Inicio</label>
                      <input type="time" v-model="form.startTime" class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
                      <input type="date" v-model="form.endDate" class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Fin</label>
                      <input type="time" v-model="form.endTime" class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 sm:text-sm" />
                    </div>
                  </div>
                  <div class="sm:grid sm:grid-cols-2 sm:gap-4 flex flex-col gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Actividad</label>
                      <select v-model="form.tipo_actividad" class="mt-1 block w-full rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 sm:text-sm">
                        <option value="académica">Académica</option>
                        <option value="administrativa">Administrativa</option>
                        <option value="reunión">Reunión</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 mt-4">
                    <div class="flex items-center">
                      <button type="button" class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" :class="[form.es_privada ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600']" role="switch" :aria-checked="form.es_privada" @click="form.es_privada = !form.es_privada; if (form.es_privada) form.visible_para_estudiantes = false">
                        <span class="sr-only">Actividad Privada</span>
                        <span aria-hidden="true" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" :class="[form.es_privada ? 'translate-x-5' : 'translate-x-0']"></span>
                      </button>
                      <span class="ml-3 flex flex-col">
                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Actividad Privada / Personal</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Solo tú podrás ver y recibir alertas de esta actividad.</span>
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center mt-4">
                    <button type="button" :disabled="form.es_privada" class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" :class="[form.visible_para_estudiantes ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600', form.es_privada ? 'opacity-50 cursor-not-allowed' : '']" role="switch" :aria-checked="form.visible_para_estudiantes" @click="form.es_privada ? null : form.visible_para_estudiantes = !form.visible_para_estudiantes">
                      <span class="sr-only">Visible para estudiantes</span>
                      <span aria-hidden="true" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" :class="[form.visible_para_estudiantes ? 'translate-x-5' : 'translate-x-0']"></span>
                    </button>
                    <span class="ml-3">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100" :class="{'opacity-50': form.es_privada}">Visible para estudiantes</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
            <button type="submit" :disabled="loading" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  activity: { type: Object, default: () => null },
  anioLectivoId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'created'])

const isEditing = ref(false)
const loading = ref(false)

const defaultForm = {
  titulo: '',
  descripcion: '',
  startDate: '',
  startTime: '08:00',
  endDate: '',
  endTime: '',
  tipo_actividad: 'académica',
  visible_para_estudiantes: false,
  es_privada: false
}

const form = ref({ ...defaultForm })

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.activity) {
      isEditing.value = true
      form.value = { ...defaultForm, ...props.activity }
    } else {
      isEditing.value = false
      form.value = { ...defaultForm }
    }
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const save = async () => {
  if (!props.anioLectivoId) return;
  loading.value = true;
  try {
    const payload = {
      anio_lectivo_id: props.anioLectivoId,
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      tipo_actividad: form.value.tipo_actividad,
      fecha_inicio: form.value.startDate + (form.value.startTime ? ' ' + form.value.startTime : ' 00:00:00'),
      fecha_fin: form.value.endDate ? (form.value.endDate + (form.value.endTime ? ' ' + form.value.endTime : ' 23:59:59')) : null,
      visible_para_estudiantes: form.value.visible_para_estudiantes,
      es_privada: form.value.es_privada
    }
    
    if (isEditing.value) {
      await api.put(/api/v1/agenda/\, payload);
    } else {
      await api.post('/api/v1/agenda', payload);
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Actividad guardada correctamente',
      timer: 1500,
      showConfirmButton: false
    });
    
    emit('created');
    close();
  } catch (e) {
    console.error(e);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e.response?.data?.message || 'Error de validación o servidor'
    });
  } finally {
    loading.value = false;
  }
}
</script>

