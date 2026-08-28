<template>
  <div>
    <div class="sm:flex sm:items-center mb-6">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Gestión de Roles Global (Master)</h1>
        <p class="mt-2 text-sm text-gray-700">Busca usuarios de cualquier institución y asigna roles administrativos.</p>
      </div>
    </div>

    <!-- Buscador -->
    <div class="bg-white shadow sm:rounded-lg mb-6 p-4">
      <div class="max-w-xl">
        <label for="search" class="sr-only">Buscar usuario</label>
        <div class="relative rounded-md shadow-sm flex">
          <input v-model="searchQuery" type="text" @keyup.enter="buscarUsuarios" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-none rounded-l-md p-2 border" placeholder="Buscar por nombre, cédula o correo..." />
          <button @click="buscarUsuarios" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="usuarios.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul class="divide-y divide-gray-200">
        <li v-for="user in usuarios" :key="user.id" class="p-4 hover:bg-gray-50 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600 truncate">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email || 'Sin correo' }} | {{ user.personal_id }}</p>
            <p class="text-xs text-gray-400 mt-1">Institución: {{ user.tenant?.name || 'Global/N/A' }}</p>
            <div class="mt-2 flex gap-1 flex-wrap">
              <span v-for="role in user.roles" :key="role.id" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {{ role.name }}
              </span>
              <span v-if="user.roles?.length === 0" class="text-xs text-gray-400">Sin roles asignados en Spatie</span>
            </div>
          </div>
          <div>
            <button @click="abrirModalRoles(user)" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Gestionar Roles
            </button>
          </div>
        </li>
      </ul>
    </div>
    
    <div v-else-if="buscado && usuarios.length === 0" class="text-center py-8 text-gray-500">
      No se encontraron usuarios con ese criterio.
    </div>

    <!-- Modal Roles -->
    <div v-if="modalAbierto" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="modalAbierto = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Roles para: {{ usuarioSeleccionado.name }}
            </h3>
            <div class="mt-4 space-y-4">
              <div v-for="role in rolesDisponibles" :key="role.id" class="relative flex items-start">
                <div class="flex items-center h-5">
                  <input :id="`role-${role.id}`" :value="role.name" v-model="rolesSeleccionados" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                </div>
                <div class="ml-3 text-sm">
                  <label :for="`role-${role.id}`" class="font-medium text-gray-700">{{ role.name }}</label>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button @click="guardarRoles" :disabled="guardando" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm">
              <span v-if="guardando">Guardando...</span>
              <span v-else>Guardar Roles</span>
            </button>
            <button @click="modalAbierto = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['auth'] // Add role check middleware for master
})

import Swal from 'sweetalert2'

const config = useRuntimeConfig()
const searchQuery = ref('')
const usuarios = ref([])
const buscado = ref(false)
const rolesDisponibles = ref([])

const modalAbierto = ref(false)
const usuarioSeleccionado = ref(null)
const rolesSeleccionados = ref([])
const guardando = ref(false)

onMounted(async () => {
  await cargarRoles()
})

const cargarRoles = async () => {
  try {
    const res = await $fetch('/api/admin/master/roles', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      baseURL: config.public.apiBase
    })
    rolesDisponibles.value = res
  } catch (error) {
    console.error('Error cargando roles', error)
  }
}

const buscarUsuarios = async () => {
  if (!searchQuery.value) return;
  
  try {
    const res = await $fetch('/api/admin/master/usuarios', {
      params: { search: searchQuery.value },
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      baseURL: config.public.apiBase
    })
    usuarios.value = res.data || res
    buscado.value = true
  } catch (error) {
    console.error('Error buscando usuarios', error)
  }
}

const abrirModalRoles = (user) => {
  usuarioSeleccionado.value = user
  rolesSeleccionados.value = user.roles ? user.roles.map(r => r.name) : []
  modalAbierto.value = true
}

const guardarRoles = async () => {
  guardando.value = true
  
  Swal.fire({
    title: 'Guardando...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    await $fetch(`/api/admin/master/usuarios/${usuarioSeleccionado.value.id}/roles`, {
      method: 'POST',
      body: { roles: rolesSeleccionados.value },
      headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      baseURL: config.public.apiBase
    })
    
    Swal.fire('Roles actualizados', 'Los roles se guardaron correctamente', 'success')
    modalAbierto.value = false
    await buscarUsuarios() // Refrescar lista
  } catch (error) {
    console.error('Error guardando roles', error)
    Swal.fire('Error', 'No se pudieron guardar los roles', 'error')
  } finally {
    guardando.value = false
  }
}
</script>
