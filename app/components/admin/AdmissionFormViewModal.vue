<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                Expediente de Admisi&oacute;n Original
              </h3>
              
              <div class="mt-4" v-if="loading">
                <p class="text-gray-500">Cargando expediente...</p>
              </div>
              
              <div class="mt-4 space-y-6" v-else-if="estudiante">
                <!-- Datos Personales -->
                <div>
                  <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Datos del Estudiante</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p class="text-gray-500">Nombres</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.nombres }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Apellidos</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.apellidos }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">C&eacute;dula</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.cedula || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">A&ntilde;o de Postulaci&oacute;n</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.admision?.anio_lectivo?.nombre || 'N/A' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Datos de Salud -->
                <div v-if="estudiante.historia_clinica">
                  <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Datos MA(c)dicos / Salud</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p class="text-gray-500">Alergias</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.historia_clinica.alergias || 'Ninguna registrada' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Condici&oacute;n MA(c)dica</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ estudiante.historia_clinica.condicion_medica || 'Ninguna registrada' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Familiares -->
                <div v-if="estudiante.familiares && estudiante.familiares.length > 0">
                  <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Datos Familiares</h4>
                  <div class="mt-3 space-y-4">
                    <div v-for="fam in estudiante.familiares" :key="fam.id" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p class="text-gray-500">Nombre</p>
                          <p class="font-medium text-gray-900 dark:text-gray-100">{{ fam.nombres }} {{ fam.apellidos }}</p>
                        </div>
                        <div>
                          <p class="text-gray-500">Parentesco</p>
                          <p class="font-medium text-gray-900 dark:text-gray-100">{{ fam.parentesco }}</p>
                        </div>
                        <div>
                          <p class="text-gray-500">TelA(c)fono</p>
                          <p class="font-medium text-gray-900 dark:text-gray-100">{{ fam.telefono || 'N/A' }}</p>
                        </div>
                        <div>
                          <p class="text-gray-500">Ocupaci&oacute;n</p>
                          <p class="font-medium text-gray-900 dark:text-gray-100">{{ fam.ocupacion || 'N/A' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div v-else class="mt-4">
                <p class="text-red-500">No se pudo cargar la informaci&oacute;n.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" @click="closeModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '~/utils/api'

const props = defineProps({
  isOpen: Boolean,
  estudianteId: Number
})

const emit = defineEmits(['close'])

const loading = ref(false)
const estudiante = ref(null)

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.estudianteId) {
    await fetchExpediente()
  } else {
    estudiante.value = null
  }
})

const fetchExpediente = async () => {
  loading.value = true
  try {
    const res = await api.get(`/api/estudiantes/${props.estudianteId}/expediente-admision`)
    estudiante.value = res.data ?? res
  } catch (error) {
    console.error('Error fetching expediente:', error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>
