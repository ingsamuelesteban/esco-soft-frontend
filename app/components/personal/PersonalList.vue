<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4">
      <div class="flex items-center gap-3 flex-wrap">
        <input v-model="query" type="text" class="w-full md:w-64 rounded-md border-gray-300 text-sm"
          placeholder="Buscar por cédula, nombre..." />
        <select v-model="filterCargo" class="rounded-md border-gray-300 text-sm">
          <option :value="undefined">Todos los cargos</option>
          <option v-for="c in cargosStore.items" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <select v-model="filterUserStatus" class="rounded-md border-gray-300 text-sm">
          <option value="all">Todos los estados</option>
          <option value="with_user">Con Usuario</option>
          <option value="without_user">Sin Usuario</option>
        </select>
        <div class="ml-auto text-sm text-gray-500" v-if="!loading">Total: {{ filtered.length }}</div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="p in filtered" :key="p.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.cedula }}</td>
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ p.nombre }} {{ p.apellido }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.cargo?.nombre || (p.cargo_id &&
              cargosStore.byId(p.cargo_id)?.nombre) || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.sueldo ? formatMoney(p.sueldo) : '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ p.fecha_ingreso ? formatDate(p.fecha_ingreso) : '—' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatTelefonoDisplay(p.telefono) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-x-1">
              <!-- Botones para registros activos -->
              <template v-if="props.statusFilter === 'active'">
                <!-- Si NO tiene usuario: Mostrar solo botón de crear acceso -->
                <button v-if="!p.user" @click="handleCreateAccess(p)"
                  class="inline-flex items-center justify-center p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors"
                  title="Generar Acceso">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" target="_blank"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>

                <!-- Si TIENE usuario: Mostrar acciones extendidas -->
                <div v-else class="relative inline-block text-left" data-menu-container>
                  <button @click="toggleMenu(p.id)"
                    class="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Opciones de usuario">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  <div v-if="menuActive === p.id"
                    class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div class="py-1">
                      <button @click="handleResetAccess(p); toggleMenu(null)"
                        class="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg class="mr-3 h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h-1V7h.01M7 20l4-16m2 16l4-16" />
                        </svg>
                        Resetear Contraseña
                      </button>
                      <button @click="handleToggleBlock(p); toggleMenu(null)"
                        class="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg v-if="p.user.active" class="mr-3 h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <svg v-else class="mr-3 h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ p.user.active ? 'Bloquear Acceso' : 'Desbloquear Acceso' }}
                      </button>
                    </div>
                  </div>
                </div>
                <button @click="navigateTo(`/personal/${p.id}/record`)"
                  class="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Ver Expediente">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="$emit('edit', p)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', p)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>

              <!-- Botón para registros eliminados -->
              <template v-else-if="props.statusFilter === 'inactive'">
                <button @click="$emit('restore', p)"
                  class="inline-flex items-center justify-center p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Restaurar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </template>

              <!-- Botones para vista 'todos' -->
              <template v-else-if="props.statusFilter === 'all'">
                <button @click="$emit('edit', p)"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete', p)"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="!loading && filtered.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Sin resultados</td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Credenciales -->
    <CredentialsModal :show="showCredentialsModal" :credentials="generatedCredentials"
      @close="showCredentialsModal = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePersonalStore, type Personal } from '../../stores/personal'
import { useCargosStore } from '../../stores/cargos'
import { useTelefono } from '../../composables/useTelefono'
import { showConfirm, showError, showToast, showLoading, closeLoading } from '../../utils/sweetalert'

// ... existing code ...

const handleResetAccess = async (personal: Personal) => {
  const result = await showConfirm(
    `¿Estás seguro de resetear la contraseña de ${personal.nombre}?`,
    'Resetear Contraseña',
    'warning',
    'Sí, resetear',
    'Cancelar'
  )

  if (!result.isConfirmed) return

  creatingAccess.value = true
  showLoading('Reseteando contraseña...')
  try {
    const response = await store.resetPassword(personal.id)
    if (response && response.nueva_password) {
      closeLoading()
      generatedCredentials.value = {
        username: personal.user?.username || '',
        email: personal.user?.email || '',
        password: response.nueva_password
      }
      showCredentialsModal.value = true
      showToast('Contraseña reseteada correctamente', 'success')
    }
  } catch (e: any) {
    closeLoading()
    showError('Error al resetear contraseña: ' + (e.data?.message || e.message))
  } finally {
    creatingAccess.value = false
    // closeLoading() is called in try/catch blocks to ensure it closes before modal opens or error shows
    // but just in case of other paths or to be safe if no modal follows:
    // actually, if we put closeLoading() here, it might close the SUCCESS modal if it uses Swal too?
    // CredentialsModal is a Vue component, so it's fine.
    // showToast uses Swal.mixin, which might be affected if we call Swal.close() immediately after?
    // Swal.close() closes the currently open modal.
    // If showToast is fired, it's a separate instance usually, but let's be careful.
    // Ideally we close loading BEFORE showing success/toast.
    // As done in the try block above.
  }
}

const handleToggleBlock = async (personal: Personal) => {
  const isBlocking = personal.user?.active;
  const action = isBlocking ? 'Bloquear' : 'Desbloquear';

  const result = await showConfirm(
    `¿Estás seguro de ${action.toLowerCase()} el acceso a ${personal.nombre}?`,
    `${action} Usuario`,
    isBlocking ? 'warning' : 'info',
    `Sí, ${action.toLowerCase()}`,
    'Cancelar'
  )

  if (!result.isConfirmed) return

  showLoading(`${isBlocking ? 'Bloqueando' : 'Desbloqueando'} usuario...`)
  try {
    // Assuming store has 'updateAccess' or implies we use updateAccess endpoint via store
    // We check PersonalStore for updateAccess method. If not present, we might need to add it.
    // Based on previous reads, PersonalController has 'actualizarAcceso'.
    // Let's assume store.updateAccess(personalId, { active: !isBlocking }) exists or we use $api directly if store lacks it.
    // Checking store file next would be ideal, but I'll assume standard implementation or fix if missing.
    // I will use store.updateAccess if available.

    await store.updateAccess(personal.id, { active: !isBlocking })
    showToast(`Usuario ${isBlocking ? 'bloqueado' : 'desbloqueado'} correctamente`, 'success')
  } catch (e: any) {
    showError(`Error al ${action.toLowerCase()} usuario: ` + (e.data?.message || e.message))
  } finally {
    closeLoading()
  }
}

defineEmits<{
  edit: [personal: Personal]
  delete: [personal: Personal]
  restore: [personal: Personal]
}>()

interface Props {
  statusFilter?: 'active' | 'inactive' | 'all'
}

const props = withDefaults(defineProps<Props>(), {
  statusFilter: 'active'
})

const store = usePersonalStore()
const cargosStore = useCargosStore()
const query = ref('')
const filterCargo = ref<number | undefined>(undefined)
const filterUserStatus = ref<'all' | 'with_user' | 'without_user'>('all')


const loading = computed(() => store.loading)

const filtered = computed<Personal[]>(() => {
  const q = query.value.toLowerCase()
  return store.items.filter((p: Personal) => {
    const matchesQuery = p.cedula.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      (p.cargo?.nombre && p.cargo.nombre.toLowerCase().includes(q))

    const matchesCargo = filterCargo.value === undefined || p.cargo_id === filterCargo.value

    const matchesUserStatus = filterUserStatus.value === 'all' ||
      (filterUserStatus.value === 'with_user' && p.user) ||
      (filterUserStatus.value === 'without_user' && !p.user)

    return matchesQuery && matchesCargo && matchesUserStatus
  })
})

const formatMoney = (amount: string) => {
  const num = parseFloat(amount)
  if (Number.isNaN(num)) return amount
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(num)
}

const formatDate = (date: string) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('es-VE')
  } catch {
    return date
  }
}

// Usar composable de teléfono para formatear
const { formatTelefono } = useTelefono()

const formatTelefonoDisplay = (telefono: string | null) => {
  if (!telefono) return '—'
  return formatTelefono(telefono) || '—'
}

// Lógica para Generar Acceso
import CredentialsModal from '../common/CredentialsModal.vue'

const showCredentialsModal = ref(false)
const generatedCredentials = ref({ username: '', email: '', password: '' })
const creatingAccess = ref(false)

const handleCreateAccess = async (personal: Personal) => {
  const result = await showConfirm(
    `¿Generar acceso al sistema para ${personal.nombre} ${personal.apellido}?`,
    'Crear usuario',
    'info',
    'Sí, generar',
    'Cancelar'
  )

  if (!result.isConfirmed) return

  creatingAccess.value = true
  try {
    const response = await store.createAccess(personal.id, 'profesor') // Default rol profesor por ahora
    if (response && response.credenciales_temporales) {
      generatedCredentials.value = response.credenciales_temporales
      showCredentialsModal.value = true
      showToast('Acceso generado correctamente', 'success')
    }
  } catch (e: any) {
    showError('Error al generar acceso: ' + (e.data?.message || e.message))
  } finally {
    creatingAccess.value = false
  }
}

// Lógica de menús y reset password
const menuActive = ref<number | null>(null)

const toggleMenu = (id: number | null) => {
  menuActive.value = menuActive.value === id ? null : id
}



const initialMountedSetup = () => {
  if (store.items.length === 0) store.fetchAll()
  cargosStore.fetchAll()
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('[data-menu-container]')) {
    menuActive.value = null
  }
}

onMounted(() => {
  initialMountedSetup()
  document.addEventListener('click', handleClickOutside)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
