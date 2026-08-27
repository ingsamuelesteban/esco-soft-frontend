<template>
  <div v-if="ticket">
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Ticket #{{ ticket.id }} - Soporte Técnico
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <NuxtLink to="/admin/soporte" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Volver
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Información de la Solicitud</h3>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Institución</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.tenant?.name }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Identificador</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.identificador || 'No provisto' }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Nombre Proporcionado</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.nombre_completo }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Teléfono Proporcionado</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.telefono }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Email Alternativo</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.email_alternativo }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Descripción</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ticket.description || 'N/A' }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Sección de Resolución -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Resolución del Caso</h3>
      </div>
      
      <div class="p-6">
        <div v-if="ticket.status === 'resolved'" class="rounded-md bg-green-50 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Ticket Resuelto</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Resuelto por: {{ ticket.resolved_by?.name || 'Sistema' }} el {{ new Date(ticket.resolved_at).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="userMatches && userMatches.length > 0" class="space-y-4">
          <div class="rounded-md bg-blue-50 p-4 border border-blue-200">
            <h4 class="text-md font-semibold text-blue-800 mb-2">Usuarios Sugeridos</h4>
            <p class="text-sm text-blue-700 mb-4">Selecciona el usuario al que corresponde este reseteo tras haber validado su identidad (vía teléfono o WhatsApp).</p>
            
            <div class="space-y-3 max-h-60 overflow-y-auto bg-white p-2 border rounded">
              <div v-for="user in userMatches" :key="user.id" class="flex items-start">
                <div class="flex items-center h-5">
                  <input :id="'user-' + user.id" :value="user.id" v-model="selectedUserId" type="radio" name="selectedUser" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                </div>
                <div class="ml-3 text-sm">
                  <label :for="'user-' + user.id" class="font-medium text-gray-700">{{ user.name }} ({{ user.role }})</label>
                  <p class="text-gray-500">Usuario: {{ user.username || user.personal_id || 'N/A' }} | Email: {{ user.email || 'N/A' }} | Tel: {{ user.phone || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <form @submit.prevent="resolverTicket" class="mt-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">¿Actualizar el correo en la base de datos?</label>
              <p class="text-xs text-gray-500 mb-2">Las nuevas credenciales se enviarán a este correo.</p>
              <input v-model="nuevoEmail" type="email" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
            </div>

            <button type="submit" :disabled="loading || !selectedUserId" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <span v-if="loading">Procesando...</span>
              <span v-else>Resetear Contraseña y Notificar por Correo</span>
            </button>
          </form>

          <div v-if="temporalPassword" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p class="text-sm text-yellow-800 font-bold">¡Clave Generada Exitosamente!</p>
            <p class="text-sm text-yellow-700 mt-1">La clave temporal es: <code class="font-bold bg-white px-2 py-1 rounded">{{ temporalPassword }}</code></p>
            <p class="text-xs text-yellow-600 mt-1">El usuario ha sido notificado por correo.</p>
          </div>
        </div>

        <div v-else class="rounded-md bg-red-50 p-4 border border-red-200">
          <h4 class="text-md font-semibold text-red-800">Usuario no encontrado</h4>
          <p class="text-sm text-red-700 mt-1">No se encontró ningún usuario con ese nombre o identificador en esta institución. El agente debe contactar al solicitante y/o corregir los datos manualmente en el sistema central.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const route = useRoute()
const config = useRuntimeConfig()

const ticket = ref(null)
const userMatches = ref([])
const selectedUserId = ref(null)
const nuevoEmail = ref('')
const loading = ref(false)
const temporalPassword = ref(null)

onMounted(async () => {
  await loadTicket()
})

const loadTicket = async () => {
  try {
    const res = await $fetch(`/api/admin/soporte/tickets/${route.params.id}`, {
      headers: { Authorization: `Bearer ${useCookie('auth_token').value}` },
      baseURL: config.public.apiBase
    })
    ticket.value = res.ticket
    userMatches.value = res.userMatches || []
    
    // Si hay un solo match perfecto, lo pre-seleccionamos
    if (userMatches.value.length === 1) {
      selectedUserId.value = userMatches.value[0].id
    }

    if (res.ticket) {
      // Sugerir el correo alternativo provisto en el ticket por defecto
      nuevoEmail.value = res.ticket.email_alternativo
    }
  } catch (error) {
    console.error('Error cargando ticket', error)
  }
}

const resolverTicket = async () => {
  if (!selectedUserId.value) {
    alert('Por favor selecciona un usuario.');
    return;
  }
  
  if (!confirm('¿Estás seguro de generar una nueva contraseña para este usuario? Asegúrate de haber validado su identidad por teléfono.')) return;
  
  loading.value = true
  temporalPassword.value = null
  
  try {
    const res = await $fetch(`/api/admin/soporte/tickets/${route.params.id}/resolver`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${useCookie('auth_token').value}` },
      baseURL: config.public.apiBase,
      body: { 
        user_id: selectedUserId.value,
        nuevo_email: nuevoEmail.value 
      }
    })
    
    temporalPassword.value = res.temporal_password
    await loadTicket() // Recargar para ver estado resolved
    alert('Ticket resuelto correctamente.')
  } catch (error) {
    console.error('Error resolviendo ticket', error)
    alert(error.data?.message || 'Error al resolver el ticket.')
  } finally {
    loading.value = false
  }
}
</script>
