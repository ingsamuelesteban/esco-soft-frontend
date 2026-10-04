<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                {{ isEditing ? 'Editar Actividad' : 'Nueva Actividad' }}
              </h3>
              <div class="mt-4 flex flex-col gap-4">
                
                <!-- Title -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                  <input type="text" v-model="form.title" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                  <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                </div>

                <!-- Dates/Times 2-col on sm -->
                <div class="sm:grid sm:grid-cols-2 sm:gap-4 flex flex-col gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                    <input type="date" v-model="form.startDate" @change="checkHoliday" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Inicio</label>
                    <input type="time" v-model="form.startTime" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
                    <input type="date" v-model="form.endDate" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Fin</label>
                    <input type="time" v-model="form.endTime" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                </div>

                <!-- Holiday Alert -->
                <div v-if="isHoliday" class="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-amber-400 dark:text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium">Alerta de Feriado</h3>
                      <div class="mt-2 text-sm">
                        <p>La fecha de inicio seleccionada coincide con un día feriado.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Alerts -->
                <div class="sm:grid sm:grid-cols-2 sm:gap-4 flex flex-col gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Alerta 1</label>
                    <select v-model="form.alert1" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="none">Sin alerta</option>
                      <option value="15m">15 min antes</option>
                      <option value="1h">1 hora antes</option>
                      <option value="2h">2 horas antes</option>
                      <option value="1d">1 día antes</option>
                      <option value="2d">2 días antes</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Alerta 2</label>
                    <select v-model="form.alert2" class="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="none">Sin alerta</option>
                      <option value="15m">15 min antes</option>
                      <option value="1h">1 hora antes</option>
                      <option value="2h">2 horas antes</option>
                      <option value="1d">1 día antes</option>
                      <option value="2d">2 días antes</option>
                    </select>
                  </div>
                </div>

                <!-- Private Activity -->
                <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 mt-4">
                  <div class="flex items-center">
                    <button type="button" class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" :class="[form.es_privada ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700']" role="switch" :aria-checked="form.es_privada" @click="form.es_privada = !form.es_privada; if (form.es_privada) form.visibleToStudents = false">
                      <span class="sr-only">Actividad Privada / Personal</span>
                      <span aria-hidden="true" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" :class="[form.es_privada ? 'translate-x-5' : 'translate-x-0']"></span>
                    </button>
                    <span class="ml-3 flex flex-col">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Actividad Privada / Personal</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Solo tú podrás ver y recibir alertas de esta actividad.</span>
                    </span>
                  </div>
                </div>

                <!-- Visible for students -->
                <div class="flex items-center mt-4">
                  <button type="button" :disabled="form.es_privada" class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" :class="[form.visibleToStudents ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700', form.es_privada ? 'opacity-50 cursor-not-allowed' : '']" role="switch" :aria-checked="form.visibleToStudents" @click="if(!form.es_privada) form.visibleToStudents = !form.visibleToStudents">
                    <span class="sr-only">Visible para estudiantes</span>
                    <span aria-hidden="true" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" :class="[form.visibleToStudents ? 'translate-x-5' : 'translate-x-0']"></span>
                  </button>
                  <span class="ml-3" id="visible-students-label">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100" :class="{'opacity-50': form.es_privada}">Visible para estudiantes</span>
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="save" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
            Guardar
          </button>
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activity: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isEditing = ref(false)
const isHoliday = ref(false)

const defaultForm = {
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  alert1: 'none',
  alert2: 'none',
  visibleToStudents: false,
  es_privada: false
}

const form = ref({ ...defaultForm })

// Simulación de comprobación de feriado. Idealmente esto consultaría un store o API.
const checkHoliday = () => {
  // Demo logic: si es un día específico simulamos que es feriado (ej: si cae 1 de enero)
  if (form.value.startDate && form.value.startDate.endsWith('-01-01')) {
    isHoliday.value = true
  } else {
    isHoliday.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.activity) {
      isEditing.value = true
      form.value = { ...defaultForm, ...props.activity }
    } else {
      isEditing.value = false
      form.value = { ...defaultForm }
    }
    checkHoliday()
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const save = () => {
  emit('save', { ...form.value })
  close()
}
</script>
