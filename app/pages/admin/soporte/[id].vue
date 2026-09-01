<template>
  <div v-if="ticket">
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
          Ticket #{{ ticket.id }} - Soporte Técnico
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <NuxtLink to="/admin/soporte" class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
          Volver
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Información de la Solicitud</h3>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Institución</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.tenant?.name }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Identificador</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.identificador || 'No provisto' }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Proporcionado</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.nombre_completo }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono Proporcionado</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.telefono }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email Alternativo</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.email_alternativo }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{{ ticket.description || 'N/A' }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Sección de Resolución -->
    <div class="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Resolución del Caso</h3>
      </div>
      
      <div class="p-6">
        <div v-if="ticket.status === 'resolved'" class="rounded-md bg-green-50 dark:bg-green-900/20 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-300">Ticket Resuelto</h3>
              <div class="mt-2 text-sm text-green-700 dark:text-green-400">
                <p>Resuelto por: {{ ticket.resolved_by?.name || 'Sistema' }} el {{ new Date(ticket.resolved_at).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          
          <div v-if="!userMatches || userMatches.length === 0" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 mb-4">
            <h4 class="text-md font-semibold text-red-800 dark:text-red-300">No hay coincidencias exactas</h4>
            <p class="text-sm text-red-700 dark:text-red-400 mt-1">El sistema no encontró automáticamente un usuario vinculado a esta solicitud. Utiliza el buscador manual a continuación para seleccionarlo.</p>
          </div>

          <div class="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <h4 class="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2">Seleccionar Usuario</h4>
            <p class="text-sm text-blue-700 dark:text-blue-400 mb-4">Selecciona el usuario al que corresponde este reseteo tras haber validado su identidad (vía teléfono o WhatsApp).</p>
            
            <div class="mb-4">
              <label for="search_user" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar Usuario Manualmente (Cross-Tenant)</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="search_user" 
                  v-model="searchQuery" 
                  @input="onSearchInput"
                  placeholder="Escribe nombre, usuario, correo o teléfono..." 
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border" 
                />
                <div v-if="searching" class="absolute right-3 top-2">
                  <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>

              <!-- Resultados de búsqueda desplegables -->
              <div v-if="searchResults.length > 0 && searchQuery.length >= 2" class="mt-2 w-full bg-white dark:bg-gray-900 shadow-lg border rounded-md max-h-60 overflow-y-auto">
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                  <li v-for="res in searchResults" :key="'s-'+res.id" class="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center" @click="selectUserFromSearch(res)">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ res.name }} <span class="text-xs text-gray-500 dark:text-gray-400">({{ res.username }})</span></p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Email: {{ res.email || 'N/A' }} | Inst: {{ res.tenant?.name || 'N/A' }} | Estado: <span :class="res.active ? 'text-green-600' : 'text-red-600'">{{ res.active ? 'Activo' : 'Inactivo' }}</span></p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">Roles: {{ res.roles?.map(r => r.name).join(', ') || 'N/A' }}</p>
                    </div>
                    <button class="text-xs bg-blue-100 text-blue-700 dark:text-blue-400 px-2 py-1 rounded border border-blue-300 hover:bg-blue-200">Seleccionar</button>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="userMatches && userMatches.length > 0" class="space-y-3 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 p-2 border rounded">
              <div v-for="user in userMatches" :key="user.id" class="flex items-start">
                <div class="flex items-center h-5">
                  <input :id="'user-' + user.id" :value="user.id" v-model="selectedUserId" type="radio" name="selectedUser" class="focus:ring-blue-500 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600" />
                </div>
                <div class="ml-3 text-sm">
                  <label :for="'user-' + user.id" class="font-medium text-gray-700 dark:text-gray-300">{{ user.name }} ({{ user.role }})</label>
                  <p class="text-gray-500 dark:text-gray-400">Usuario: {{ user.username || user.personal_id || 'N/A' }} | Email: {{ user.email || 'N/A' }} | Tel: {{ user.phone || user.telefono || 'N/A' }} | Inst: {{ user.tenant?.name || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <form @submit.prevent="resolverTicket" class="mt-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">¿Actualizar el correo en la base de datos?</label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Las nuevas credenciales se enviarán a este correo. <span class="font-bold text-red-600">Requerido si el usuario no tiene correo.</span></p>
              <input v-model="nuevoEmail" type="email" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border" />
            </div>

            <button type="submit" :disabled="loading || !selectedUserId" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <span v-if="loading">Procesando...</span>
              <span v-else>Resetear Contraseña y Notificar por Correo</span>
            </button>
          </form>

          <div v-if="temporalPassword" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p class="text-sm text-yellow-800 dark:text-yellow-300 font-bold">¡Clave Generada Exitosamente!</p>
            <p class="text-sm text-yellow-700 dark:text-yellow-400 mt-1">La clave temporal es: <code class="font-bold bg-white dark:bg-gray-900 px-2 py-1 rounded">{{ temporalPassword }}</code></p>
            <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-1">El usuario ha sido notificado por correo.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import Swal from 'sweetalert2'

const route = useRoute()
const config = useRuntimeConfig()

const ticket = ref(null)
const userMatches = ref([])
const selectedUserId = ref(null)
const nuevoEmail = ref('')
const loading = ref(false)
const temporalPassword = ref(null)

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref([])
let searchTimeout = null

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const res = await $fetch(`/api/admin/soporte/usuarios/buscar?query=${encodeURIComponent(searchQuery.value)}`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        baseURL: config.public.apiBase
      })
      searchResults.value = res || []
    } catch (error) {
      console.error('Error buscando usuarios:', error)
    } finally {
      searching.value = false
    }
  }, 400)
}

const selectUserFromSearch = (user) => {
  // Limpiar resultados
  searchQuery.value = ''
  searchResults.value = []
  
  // Reemplazar la lista de coincidencias con este Ãºnico usuario o aÃ±adirlo si no estÃ¡
  userMatches.value = [user]
  
  // Seleccionarlo automÃ¡ticamente
  selectedUserId.value = user.id
  nuevoEmail.value = user.email || ''
}

onMounted(async () => {
  await loadTicket()
})

const loadTicket = async () => {
  try {
    const res = await $fetch(`/api/admin/soporte/tickets/${route.params.id}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
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
    Swal.fire('Atención', 'Por favor selecciona un usuario.', 'warning');
    return;
  }
  
  const confirmacion = await Swal.fire({
    title: '¿Generar nueva contraseña?',
    text: 'Asegúrate de haber validado la identidad del usuario por teléfono.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, generar contraseña',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacion.isConfirmed) return;
  
  loading.value = true
  temporalPassword.value = null
  
  Swal.fire({
    title: 'Procesando...',
    text: 'Generando contraseña y enviando correos',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
  
  try {
    const res = await $fetch(`/api/admin/soporte/tickets/${route.params.id}/resolver`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      baseURL: config.public.apiBase,
      body: { 
        user_id: selectedUserId.value,
        nuevo_email: nuevoEmail.value 
      }
    })
    
    temporalPassword.value = res.temporal_password
    await loadTicket() // Recargar para ver estado resolved
    
    Swal.fire({
      title: '¡Resuelto!',
      html: `El ticket se resolvió exitosamente.<br><br><b>Contraseña temporal:</b> <code class="bg-gray-100 px-2 py-1 rounded text-lg">${res.temporal_password}</code><br><br>Puedes enviarle esta contraseña vía Whatsapp al solicitante.`,
      icon: 'success'
    });
  } catch (error) {
    console.error('Error resolviendo ticket', error)
    Swal.fire('Error', error.data?.message || 'Error al resolver el ticket.', 'error');
  } finally {
    loading.value = false
  }
}
</script>
