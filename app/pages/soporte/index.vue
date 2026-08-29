<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 flex items-center justify-center">
    <div class="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Soporte Técnico EscoSoft
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Olvidaste tu contraseña o tienes problemas para ingresar?
        </p>
      </div>

      <div class="mt-8 sm:mx-auto w-full">
        <form v-if="!submitted" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submitTicket">
          
          <div class="sm:col-span-2">
            <label for="tenant_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Institución Educativa <span class="text-red-500">*</span></label>
            <div class="mt-1">
              <select v-model="form.tenant_id" required class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm">
                <option value="" disabled>Selecciona tu institución...</option>
                <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                  {{ tenant.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="sm:col-span-1">
            <label for="identificador" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario <span class="text-red-500">*</span></label>
            <div class="mt-1">
              <input v-model="form.identificador" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm" placeholder="Ingresa tu usuario..." />
            </div>
          </div>

          <div class="sm:col-span-1">
            <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo <span class="text-red-500">*</span></label>
            <div class="mt-1">
              <input v-model="form.nombre_completo" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm" />
            </div>
          </div>

          <div class="sm:col-span-1">
            <ClientOnly>
              <TelefonoInput v-model="form.telefono" label="Whatsapp de contacto" required />
              <template #fallback>
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Whatsapp de contacto <span class="text-red-500">*</span></label>
                  <input
                    type="tel"
                    v-model="form.telefono"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-3 py-2 text-gray-900 dark:text-white focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm"
                    placeholder="Cargando selector..."
                    required
                  />
                </div>
              </template>
            </ClientOnly>
          </div>

          <div class="sm:col-span-1">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico (Alternativo) <span class="text-red-500">*</span></label>
            <div class="mt-1">
              <input v-model="form.email_alternativo" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm" />
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">A este correo enviaremos tu nueva contraseña.</p>
          </div>

          <div class="sm:col-span-2">
            <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción o Comentarios</label>
            <div class="mt-1">
              <textarea v-model="form.description" rows="3" class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm"></textarea>
            </div>
          </div>

          <div class="sm:col-span-2 mt-2">
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading">Enviando...</span>
              <span v-else>Enviar Solicitud de Soporte</span>
            </button>
          </div>
        </form>

        <div v-else class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">¡Solicitud Enviada!</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hemos recibido tu solicitud. Nuestro equipo de soporte la revisará y te contactará al correo proporcionado en breve con las instrucciones o nuevas credenciales.
          </p>
          <div class="mt-6">
            <NuxtLink to="/login" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium">
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
