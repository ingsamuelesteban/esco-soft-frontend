<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Tickets de Soporte Técnico</h1>
        <p class="mt-2 text-sm text-gray-700">Panel global de solicitudes de reseteo de contraseña e incidencias.</p>
      </div>
    </div>
    
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Institución</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Solicitante</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="ticket in tickets" :key="ticket.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">#{{ ticket.id }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ ticket.tenant?.name || 'N/A' }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ ticket.nombre_completo }}<br>
                    <span v-if="ticket.identificador" class="text-xs text-gray-400">{{ ticket.identificador }}</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ new Date(ticket.created_at).toLocaleString() }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span :class="[
                      ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                    ]">
                      {{ ticket.status.toUpperCase() }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <NuxtLink :to="`/admin/soporte/${ticket.id}`" class="text-blue-600 hover:text-blue-900">Resolver<span class="sr-only">, {{ ticket.id }}</span></NuxtLink>
                  </td>
                </tr>
                <tr v-if="tickets.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No hay tickets de soporte registrados.</td>
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
