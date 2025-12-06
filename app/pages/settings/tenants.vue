<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Instituciones</h1>
                    <p class="text-sm text-gray-600 mt-1">Administra los tenants del sistema</p>
                </div>
                <button @click="openCreateModal"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Institución
                </button>
            </div>
        </div>

        <!-- Lista de Tenants -->
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
            <div v-if="loading" class="p-12 text-center">
                <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <p class="mt-2 text-gray-500">Cargando instituciones...</p>
            </div>

            <div v-else-if="tenants.length === 0" class="p-12 text-center">
                <p class="text-gray-500">No hay instituciones registradas.</p>
            </div>

            <table v-else class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dominio</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contacto</th>
                        <th scope="col"
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="tenant in tenants" :key="tenant.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div
                                    class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                    {{ tenant.name.charAt(0).toUpperCase() }}
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">{{ tenant.name }}</div>
                                    <div class="text-sm text-gray-500">{{ tenant.website || 'Sin web' }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ tenant.domain || 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{{ tenant.email }}</div>
                            <div>{{ tenant.phone }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button @click="editTenant(tenant)"
                                class="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                            <button @click="deleteTenant(tenant)"
                                class="text-red-600 hover:text-red-900">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Crear/Editar -->
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="closeModal"></div>

                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            {{ isEditing ? 'Editar Institución' : 'Nueva Institución' }}
                        </h3>
                        <div class="mt-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                                <input v-model="form.name" type="text"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Dominio (opcional)</label>
                                <input v-model="form.domain" type="text"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Dirección</label>
                                <input v-model="form.address" type="text"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input v-model="form.phone" type="text"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Email</label>
                                    <input v-model="form.email" type="email"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Sitio Web</label>
                                <input v-model="form.website" type="url"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="saveTenant" type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                            :disabled="saving">
                            {{ saving ? 'Guardando...' : 'Guardar' }}
                        </button>
                        <button @click="closeModal" type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { api } from '../../utils/api'
import type { Tenant } from '../../stores/auth'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const tenants = ref<Tenant[]>([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
    name: '',
    domain: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: ''
})

const fetchTenants = async () => {
    loading.value = true
    try {
        const response = await api.get<{ success: boolean, data: Tenant[] }>('/api/tenants')
        if (response.success) {
            tenants.value = response.data
        }
    } catch (error) {
        console.error('Error fetching tenants:', error)
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    isEditing.value = false
    editingId.value = null
    Object.assign(form, {
        name: '',
        domain: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: ''
    })
    showModal.value = true
}

const editTenant = (tenant: Tenant) => {
    isEditing.value = true
    editingId.value = tenant.id
    Object.assign(form, {
        name: tenant.name,
        domain: tenant.domain || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        website: tenant.website || '',
        logo_url: tenant.logo_url || ''
    })
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const saveTenant = async () => {
    if (!form.name) return // Validación básica

    saving.value = true
    try {
        if (isEditing.value && editingId.value) {
            await api.put(`/api/tenants/${editingId.value}`, form)
        } else {
            await api.post('/api/tenants', form)
        }
        await fetchTenants()
        closeModal()
    } catch (error) {
        console.error('Error saving tenant:', error)
        alert('Error al guardar la institución')
    } finally {
        saving.value = false
    }
}

const deleteTenant = async (tenant: Tenant) => {
    if (!confirm(`¿Estás seguro de eliminar la institución "${tenant.name}"? Esta acción no se puede deshacer.`)) return

    try {
        await api.delete(`/api/tenants/${tenant.id}`)
        await fetchTenants()
    } catch (error) {
        console.error('Error deleting tenant:', error)
        alert('Error al eliminar la institución')
    }
}

onMounted(() => {
    fetchTenants()
})
</script>
