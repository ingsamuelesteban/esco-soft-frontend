<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Profesores</h1>
          <p class="text-sm text-gray-600 mt-1">Administrar accesos al sistema para el personal docente</p>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="p-6">
      <!-- Filtros de búsqueda -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar profesor</label>
            <input v-model="filtros.search" type="text" placeholder="Buscar por nombre, apellido o cédula..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="flex items-end">
            <button @click="cargarProfesores" :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              {{ loading ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de profesores -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Personal Docente ({{ profesores.length }})
          </h3>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="profesores.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron profesores</h3>
          <p class="mt-1 text-sm text-gray-500">No hay personal docente registrado o no coincide con la búsqueda.</p>
        </div>

        <!-- Tabla de profesores -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acceso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="profesor in profesores" :key="profesor.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-700">
                          {{ getInitials(profesor.nombre_completo) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ profesor.nombre_completo }}
                      </div>
                      <div class="text-sm text-gray-500">{{ profesor.cedula }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ profesor.cargo?.nombre || 'Sin cargo' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div v-if="profesor.user" class="flex justify-center" title="Tiene acceso al sistema">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-else class="flex justify-center" title="Sin acceso al sistema">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ profesor.user?.email || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div v-if="profesor.user?.active" class="flex justify-center items-center" title="Usuario activo">
                    <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div v-else-if="profesor.user && !profesor.user.active" class="flex justify-center items-center"
                    title="Usuario inactivo">
                    <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                  <div v-else class="flex justify-center items-center" title="Sin acceso al sistema">
                    <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center justify-center space-x-2">
                    <!-- Ver asignaciones (siempre visible para todos los profesores) -->
                    <button @click="verModulosFormativos(profesor)"
                      class="inline-flex items-center p-2 border border-transparent rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                      title="Ver asignaciones">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>

                    <!-- Acciones de acceso al sistema -->
                    <div v-if="!profesor.user">
                      <!-- Crear acceso -->
                      <button @click="crearAcceso(profesor)" :disabled="procesando === profesor.id"
                        class="inline-flex items-center p-2 border border-transparent rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Crear acceso al sistema">
                        <svg v-if="procesando === profesor.id" class="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                          </circle>
                          <path class="opacity-75" fill="currentColor"
                            d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z">
                          </path>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </button>
                    </div>

                    <!-- Opciones para usuarios con acceso -->
                    <div v-else class="flex items-center space-x-1">
                      <!-- Toggle estado activo/inactivo -->
                      <button @click="toggleEstado(profesor)" :disabled="procesando === profesor.id" :class="[
                        'inline-flex items-center p-2 border border-transparent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                        profesor.user.active
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50 focus:ring-green-500',
                        procesando === profesor.id ? 'opacity-50 cursor-not-allowed' : ''
                      ]" :title="profesor.user.active ? 'Desactivar acceso' : 'Activar acceso'">
                        <svg v-if="procesando === profesor.id" class="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                          </circle>
                          <path class="opacity-75" fill="currentColor"
                            d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z">
                          </path>
                        </svg>
                        <svg v-else-if="profesor.user.active" class="w-4 h-4" fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <!-- Menú desplegable para acciones adicionales -->
                      <div class="relative inline-block text-left" data-menu-container>
                        <button @click="toggleMenuProfesor(profesor.id)"
                          class="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          title="Más opciones">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        <!-- Menú desplegable -->
                        <div v-if="menuActivo === profesor.id"
                          class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                          role="menu">
                          <div class="py-1" role="none">
                            <button @click="resetearPassword(profesor); toggleMenuProfesor(null)"
                              :disabled="procesando === profesor.id"
                              class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              role="menuitem">
                              <svg class="mr-3 h-4 w-4 text-yellow-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h-1V7h.01M7 20l4-16m2 16l4-16" />
                              </svg>
                              {{ procesando === profesor.id ? 'Reseteando...' : 'Resetear Contraseña' }}
                            </button>
                            <button @click="eliminarAcceso(profesor); toggleMenuProfesor(null)"
                              :disabled="procesando === profesor.id"
                              class="group flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              role="menuitem">
                              <svg class="mr-3 h-4 w-4 text-red-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {{ procesando === profesor.id ? 'Eliminando...' : 'Eliminar Acceso Completo' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de credenciales temporales -->
    <div v-if="mostrarModalCredenciales"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="mt-4 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Acceso Creado Exitosamente</h3>
            <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-gray-700 mb-2">
                <strong>Credenciales temporales para {{ credencialesTemporales.profesor }}:</strong>
              </p>
              <div class="space-y-2 text-sm text-left">
                <div v-if="credencialesTemporales.username">
                  <span class="font-medium block text-gray-600">Usuario:</span>
                  <span class="font-mono bg-white border border-gray-200 px-2 py-1 rounded block w-full">{{
                    credencialesTemporales.username }}</span>
                </div>
                <div>
                  <span class="font-medium block text-gray-600">Email:</span>
                  <span class="font-mono bg-white border border-gray-200 px-2 py-1 rounded block w-full">{{
                    credencialesTemporales.email }}</span>
                </div>
                <div>
                  <span class="font-medium block text-gray-600">Contraseña:</span>
                  <span class="font-mono bg-white border border-gray-200 px-2 py-1 rounded block w-full break-all">{{
                    credencialesTemporales.password }}</span>
                </div>
              </div>
              <p class="text-xs text-yellow-700 mt-3 text-center">
                ⚠️ Guarda estas credenciales. El profesor debe cambiar la contraseña en su primer acceso.
              </p>
            </div>
          </div>
          <div class="mt-6">
            <button @click="cerrarModalCredenciales"
              class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import API utility
import Swal from 'sweetalert2'
import { api } from '~/utils/api'
import { useAuthStore } from '../../stores/auth'

definePageMeta({
  middleware: ['auth', 'admin']
})

// Definir tipos
interface Profesor {
  id: number
  nombre_completo: string
  cedula: string
  cargo?: { nombre: string }
  user?: {
    id: number
    email: string
    active: boolean
  }
}

interface CredencialesTemporales {
  profesor: string
  username?: string
  email: string
  password: string
}

// Estado reactivo
const profesores = ref<Profesor[]>([])
const loading = ref(false)
const procesando = ref<number | null>(null)
const mostrarModalCredenciales = ref(false)
const credencialesTemporales = ref<CredencialesTemporales>({} as CredencialesTemporales)
const menuActivo = ref<number | null>(null)

const filtros = reactive({
  search: ''
})

// Configuración
const config = useRuntimeConfig()
const authStore = useAuthStore()

// Cargar profesores
const cargarProfesores = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.search) {
      params.append('search', filtros.search)
    }

    const response = await api.get(`/api/profesores?${params.toString()}`)

    profesores.value = response.data || []
  } catch (error) {
    console.error('Error al cargar profesores:', error)
    alert('Error al cargar la lista de profesores')
  } finally {
    loading.value = false
  }
}

// Crear acceso para un profesor
const crearAcceso = async (profesor: Profesor) => {
  procesando.value = profesor.id
  try {
    const response = await api.post(`/api/profesores/${profesor.id}/crear-acceso`, { active: true })

    if (response.success) {
      // Mostrar credenciales temporales
      credencialesTemporales.value = {
        profesor: profesor.nombre_completo,
        username: response.data.credenciales_temporales.username,
        email: response.data.credenciales_temporales.email,
        password: response.data.credenciales_temporales.password
      }
      mostrarModalCredenciales.value = true

      // Actualizar la lista
      await cargarProfesores()
    }
  } catch (error) {
    console.error('Error al crear acceso:', error)
    Swal.fire('Error', 'Error al crear acceso al sistema', 'error')
  } finally {
    procesando.value = null
  }
}

// Toggle estado activo/inactivo
const toggleEstado = async (profesor: Profesor) => {
  procesando.value = profesor.id
  try {
    if (!profesor.user) return
    const nuevoEstado = !profesor.user.active
    const response = await api.put(`/api/profesores/${profesor.id}/actualizar-acceso`, { active: nuevoEstado })

    if (response.success) {
      await cargarProfesores()
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: nuevoEstado ? 'Acceso activado' : 'Acceso desactivado'
      })
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    Swal.fire('Error', 'Error al cambiar el estado del usuario', 'error')
  } finally {
    procesando.value = null
  }
}

// Resetear contraseña
const resetearPassword = async (profesor: Profesor) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas resetear la contraseña de ${profesor.nombre_completo}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, resetear',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) {
    return
  }

  procesando.value = profesor.id
  try {
    const response = await api.post<{ success: boolean; data: { username: string; nueva_password: string } }>(`/api/profesores/${profesor.id}/resetear-password`)

    if (response.success && profesor.user) {
      credencialesTemporales.value = {
        profesor: profesor.nombre_completo,
        username: response.data.username,
        email: profesor.user.email,
        password: response.data.nueva_password
      }
      mostrarModalCredenciales.value = true
    }
  } catch (error) {
    console.error('Error al resetear contraseña:', error)
    Swal.fire('Error', 'Error al resetear la contraseña', 'error')
  } finally {
    procesando.value = null
  }
}

// Ver asignaciones del profesor
const verModulosFormativos = (profesor: Profesor) => {
  navigateTo(`/profesores/${profesor.id}/asignaciones`)
}

// Eliminar acceso
const eliminarAcceso = async (profesor: Profesor) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Eliminar acceso al sistema de ${profesor.nombre_completo}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) {
    return
  }

  procesando.value = profesor.id
  try {
    const response = await api.delete(`/api/profesores/${profesor.id}/eliminar-acceso`)
    if ((response as any).success) {
      await cargarProfesores()
      Swal.fire('Eliminado', 'El acceso ha sido eliminado.', 'success')
    }
  } catch (error) {
    console.error('Error al eliminar acceso:', error)
    Swal.fire('Error', 'Error al eliminar el acceso al sistema', 'error')
  } finally {
    procesando.value = null
  }
}

// Cerrar modal de credenciales
const cerrarModalCredenciales = () => {
  mostrarModalCredenciales.value = false
  credencialesTemporales.value = {} as CredencialesTemporales
}

// Toggle menú desplegable
const toggleMenuProfesor = (profesorId: number | null) => {
  menuActivo.value = menuActivo.value === profesorId ? null : profesorId
}

// Obtener iniciales del nombre
const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    return 'P' // Fallback para "Profesor"
  }
  return nombreCompleto
    .split(' ')
    .slice(0, 2)
    .map(word => word && word.charAt(0).toUpperCase())
    .filter(Boolean)
    .join('') || 'P'
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarProfesores()

  // Cerrar menús al hacer clic fuera
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('[data-menu-container]')) {
      menuActivo.value = null
    }
  }

  document.addEventListener('click', handleClickOutside)

  // Limpiar event listener al desmontar
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Recargar al cambiar filtros
watch(() => filtros.search, () => {
  if (filtros.search.length >= 3 || filtros.search.length === 0) {
    cargarProfesores()
  }
})
</script>