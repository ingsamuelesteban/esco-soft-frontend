<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Credenciales Generadas
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 mb-4">
                  Las siguientes cuentas de usuario han sido generadas. Por favor guarda estos datos, ya que no se podrán recuperar las contraseñas posteriormente.
                </p>

                <div class="overflow-x-auto max-h-96">
                  <table class="min-w-full divide-y divide-gray-200 border">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(item, index) in credentials" :key="index">
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ item.estudiante_nombre }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm font-mono text-gray-600">{{ item.username }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm font-mono font-bold text-blue-600">{{ item.password }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                   <button v-if="pdfToken" @click="downloadPdf" :disabled="isPrinting" 
                   class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg v-if="!isPrinting" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <svg v-else class="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isPrinting ? 'Generando...' : 'Imprimir' }}
                  </button>

                   <button @click="copyToClipboard" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar Tabla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm" @click="close">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../utils/api'
import { useRuntimeConfig } from '#app'
import printJS from 'print-js'

interface Credential {
  estudiante_id: number
  estudiante_nombre: string
  username: string
  password: string
}

const props = defineProps<{
  isOpen: boolean
  credentials: Credential[]
  pdfToken?: string
}>()

const emit = defineEmits(['close'])
const config = useRuntimeConfig()

const close = () => {
  emit('close')
}

const copyToClipboard = () => {
  const header = "Estudiante\tUsuario\tContraseña\n"
  const rows = props.credentials.map(c => `${c.estudiante_nombre}\t${c.username}\t${c.password}`).join("\n")
  navigator.clipboard.writeText(header + rows)
    .then(() => alert('Datos copiados al portapapeles'))
    .catch(err => console.error('Error al copiar: ', err))
}

const isPrinting = ref(false)

const downloadPdf = async () => {
  if (!props.pdfToken || isPrinting.value) return
  
  isPrinting.value = true
  try {
    // api.getBlob automatically handles tenant injection via apiCall wrapper
    const blob = await api.getBlob(`/api/estudiantes/credentials-pdf/${props.pdfToken}`)
    
    // Create URL object
    const url = URL.createObjectURL(blob)
    
    printJS({
      printable: url,
      type: 'pdf',
      showModal: true,
      modalMessage: 'Generando documento para imprimir...',
      onPrintDialogClose: () => URL.revokeObjectURL(url),
      onError: (err: any) => {
          console.error('PrintJS error:', err)
          alert('Error al intentar imprimir el documento.')
      }
    })
  } catch (e) {
    console.error('Error fetching PDF:', e)
    alert('Error al descargar el PDF.')
  } finally {
    isPrinting.value = false
  }
}
</script>
