<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Soporte Técnico EscoSoft
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        ¿Olvidaste tu contraseña o tienes problemas para ingresar?
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form v-if="!submitted" class="space-y-6" @submit.prevent="submitTicket">
          <div>
            <label for="tenant_id" class="block text-sm font-medium text-gray-700">Institución Educativa</label>
            <div class="mt-1">
              <select v-model="form.tenant_id" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="" disabled>Selecciona tu institución...</option>
                <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                  {{ tenant.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="identificador" class="block text-sm font-medium text-gray-700">Usuario</label>
            <div class="mt-1">
              <input v-model="form.identificador" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ingresa tu usuario..." />
            </div>
          </div>

          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <div class="mt-1">
              <input v-model="form.nombre_completo" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono o Celular (Para contactarte)</label>
            <div class="mt-1">
              <input v-model="form.telefono" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico (Alternativo)</label>
            <p class="text-xs text-gray-500">A este correo enviaremos tu nueva contraseña temporal.</p>
            <div class="mt-1">
              <input v-model="form.email_alternativo" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción o Comentarios</label>
            <div class="mt-1">
              <textarea v-model="form.description" rows="3" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span v-if="loading">Enviando...</span>
              <span v-else>Enviar Solicitud de Soporte</span>
            </button>
          </div>
        </form>

        <div v-else class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">¡Solicitud Enviada!</h3>
          <p class="mt-1 text-sm text-gray-500">
            Hemos recibido tu solicitud. Nuestro equipo de soporte la revisará y te contactará al correo proporcionado en breve con las instrucciones o nuevas credenciales.
          </p>
          <div class="mt-6">
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
              Volver al inicio de sesión
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'

const config = useRuntimeConfig()
const tenants = ref([])
const loading = ref(false)
const submitted = ref(false)

const form = reactive({
  tenant_id: '',
  identificador: '',
  nombre_completo: '',
  telefono: '',
  email_alternativo: '',
  description: ''
})

onMounted(async () => {
  try {
    const response = await $fetch('/api/soporte/instituciones', { baseURL: config.public.apiBase })
    tenants.value = response.data || response // Depende del formato de respuesta
  } catch (error) {
    console.error('Error cargando instituciones', error)
  }
})

const submitTicket = async () => {
  loading.value = true
  Swal.fire({
    title: 'Validando y enviando...',
    text: 'Por favor espera un momento',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    await $fetch('/api/soporte/tickets', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: form
    })
    Swal.close()
    submitted.value = true
  } catch (error) {
    console.error('Error enviando ticket', error)
    const errorMsg = error.data?.message || 'Ocurrió un error al enviar el ticket. Intenta de nuevo.'
    Swal.fire('Error', errorMsg, 'error')
  } finally {
    loading.value = false
  }
}
</script>
