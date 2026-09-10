<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'] // Asumiendo middleware de auth
})

const isLoading = ref(false)
const roles = ref<any[]>([])
const permissionsGrouped = ref<Record<string, any[]>>({})
const rolePermissions = ref<Record<string, string[]>>({})

const selectedRoleId = ref<number | null>(null)
const currentPermissions = ref<Set<string>>(new Set())

const loadData = async () => {
  isLoading.value = true
  try {
    const res: any = await api.get('/api/admin/roles-permissions')
    if (res.success) {
      roles.value = res.data.roles
      permissionsGrouped.value = res.data.permissions_grouped
      rolePermissions.value = res.data.role_permissions
      
      if (roles.value.length > 0 && !selectedRoleId.value) {
        selectRole(roles.value[0].id)
      }
    }
  } catch (error) {
    console.error('Error cargando roles y permisos', error)
    Swal.fire('Error', 'No se pudieron cargar los datos.', 'error')
  } finally {
    isLoading.value = false
  }
}

const selectRole = (roleId: number) => {
  selectedRoleId.value = roleId
  // Copiar permisos actuales del rol seleccionado
  currentPermissions.value = new Set(rolePermissions.value[roleId] || [])
}

const formatModuleName = (name: string) => {
  const titles: Record<string, string> = {
    admisiones: 'Admisiones',
    estudiantes: 'Estudiantes',
    profesores: 'Profesores',
    personal: 'Personal',
    calificaciones: 'Calificaciones',
    tareas: 'Tareas',
    asistencia: 'Asistencia',
    horarios: 'Horarios',
    asignaciones: 'Asignaciones',
    catalogos: 'Catálogos',
    psicologia: 'Psicología y Orientación',
    coordinacion: 'Coordinación',
    reportes: 'Reportes',
    anuncios: 'Anuncios',
    incidencias: 'Incidencias',
    completivos: 'Completivos',
    uniformes: 'Uniformes',
    pos: 'Punto de Venta',
    facturas: 'Facturas',
    devoluciones: 'Devoluciones',
    examenes: 'Exámenes',
    tienda: 'Tienda (Estudiantes)',
    tarjeta_pagos: 'Tarjeta de Pagos (Estudiantes)'
  }
  return titles[name] || name.charAt(0).toUpperCase() + name.slice(1)
}

const togglePermission = (permissionName: string) => {
  if (currentPermissions.value.has(permissionName)) {
    currentPermissions.value.delete(permissionName)
  } else {
    currentPermissions.value.add(permissionName)
  }
}

const toggleModule = (moduleKey: string) => {
  const modulePerms = permissionsGrouped.value[moduleKey].map(p => p.name)
  const allSelected = modulePerms.every(p => currentPermissions.value.has(p))
  
  if (allSelected) {
    modulePerms.forEach(p => currentPermissions.value.delete(p))
  } else {
    modulePerms.forEach(p => currentPermissions.value.add(p))
  }
}

const savePermissions = async () => {
  if (!selectedRoleId.value) return

  const result = await Swal.fire({
    title: '¿Guardar cambios?',
    text: 'Los usuarios con este rol verán los cambios en su menú en su próxima navegación.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    isLoading.value = true
    const permsArray = Array.from(currentPermissions.value)
    
    await api.post(`/api/admin/roles/${selectedRoleId.value}/sync-permissions`, {
      permissions: permsArray
    })
    
    // Actualizar estado local
    rolePermissions.value[selectedRoleId.value] = permsArray
    
    Swal.fire('Guardado', 'Permisos sincronizados correctamente.', 'success')
  } catch (error) {
    console.error('Error guardando permisos', error)
    Swal.fire('Error', 'No se pudieron guardar los permisos.', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Roles y Permisos</h1>
        <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Gestiona qué accesos y opciones de menú tiene cada rol en el sistema.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button 
          @click="savePermissions"
          :disabled="isLoading || !selectedRoleId"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:w-auto disabled:opacity-50 transition-colors"
        >
          <span v-if="isLoading">Guardando...</span>
          <span v-else>Guardar Permisos</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading && roles.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-500"></div>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-8">
      <!-- Selector de Roles -->
      <div class="w-full lg:w-1/4">
        <nav class="space-y-1" aria-label="Roles">
          <button
            v-for="role in roles"
            :key="role.id"
            @click="selectRole(role.id)"
            :class="[
              selectedRoleId === role.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                : 'text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
              'group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
            ]"
          >
            <span class="truncate uppercase">{{ role.name }}</span>
          </button>
        </nav>
      </div>

      <!-- Matriz de Permisos -->
      <div class="w-full lg:w-3/4">
        <div v-if="selectedRoleId" class="space-y-6">
          <div 
            v-for="(perms, moduleKey) in permissionsGrouped" 
            :key="moduleKey"
            class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div class="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {{ formatModuleName(String(moduleKey)) }}
              </h3>
              <button 
                @click="toggleModule(String(moduleKey))"
                class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
              >
                Alternar todos
              </button>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div 
                  v-for="perm in perms" 
                  :key="perm.id"
                  class="relative flex items-start"
                >
                  <div class="flex h-5 items-center">
                    <input
                      :id="`perm-${perm.id}`"
                      type="checkbox"
                      :checked="currentPermissions.has(perm.name)"
                      @change="togglePermission(perm.name)"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label :for="`perm-${perm.id}`" class="font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                      {{ perm.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400">Selecciona un rol de la lista para gestionar sus permisos.</p>
        </div>
      </div>
    </div>
  </div>
</template>
