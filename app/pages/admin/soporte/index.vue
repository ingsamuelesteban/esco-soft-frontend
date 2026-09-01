<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Tickets de Soporte Técnico</h1>
        <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">Panel global de solicitudes de reseteo de contraseña e incidencias.</p>
      </div>
    </div>
    
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg border border-transparent dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Institución</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Solicitante</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Fecha</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Estado</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">#{{ ticket.id }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{{ ticket.tenant?.name || 'N/A' }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {{ ticket.nombre_completo }}<br>
                    <span v-if="ticket.identificador" class="text-xs text-gray-400 dark:text-gray-500">{{ ticket.identificador }}</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{{ new Date(ticket.created_at).toLocaleString() }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <span :class="[
                      ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent dark:border-current'
                    ]">
                      {{ ticket.status.toUpperCase() }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <NuxtLink :to="`/admin/soporte/${ticket.id}`" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">{{ ticket.status === 'resolved' ? 'Ver Detalles' : 'Resolver' }}<span class="sr-only">, {{ ticket.id }}</span></NuxtLink>
                  </td>
                </tr>
                <tr v-if="tickets.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No hay tickets de soporte registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['auth'] // Add role check middleware as needed
})

const config = useRuntimeConfig()
const tickets = ref([])

onMounted(async () => {
  await loadTickets()
})

const loadTickets = async () => {
  try {
    const { data } = await $fetch('/api/admin/soporte/tickets', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      },
      baseURL: config.public.apiBase
    })
    tickets.value = data || []
  } catch (error) {
    console.error('Error cargando tickets:', error)
    tickets.value = []
  }
}
</script>
