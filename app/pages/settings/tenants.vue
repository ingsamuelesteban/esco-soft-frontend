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

                        <!-- Pestañas del Modal -->
                        <div class="mt-4 border-b border-gray-200">
                            <nav class="-mb-px flex space-x-8">
                                <button @click="activeTab = 'general'"
                                    :class="[activeTab === 'general' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors']">
                                    Información General
                                </button>
                                <button @click="activeTab = 'reports'"
                                    :class="[activeTab === 'reports' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors']">
                                    Firmas / Reportes
                                </button>
                                <button @click="activeTab = 'public'"
                                    :class="[activeTab === 'public' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors']">
                                    Página Pública / Director
                                </button>
                            </nav>
                        </div>

                        <div class="mt-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            <!-- Tab: General -->
                            <div v-if="activeTab === 'general'" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input v-model="form.name" type="text"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Abreviatura</label>
                                    <input v-model="form.abbreviation" type="text" maxlength="10" required
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
                                        <label class="block text-sm font-medium text-gray-700">Provincia</label>
                                        <select v-model="form.provincia" @change="fetchMunicipiosConfig" required
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                            <option value="" disabled>Seleccione provincia</option>
                                            <option v-for="prov in provinciasList" :key="prov.id" :value="prov.nombre">
                                                {{ prov.nombre }}
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Municipio</label>
                                        <select v-model="form.municipio" required :disabled="!form.provincia"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                            <option value="" disabled>Seleccione municipio</option>
                                            <option v-for="mun in municipiosList" :key="mun.nombre" :value="mun.nombre">
                                                {{ mun.nombre }}
                                            </option>
                                        </select>
                                    </div>
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
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Logo</label>
                                    <div class="mt-1 flex items-center">
                                        <span v-if="logoPreview || form.logo_url"
                                            class="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-4">
                                            <img :src="logoPreview || form.logo_url" alt="Logo"
                                                class="h-full w-full object-cover">
                                        </span>
                                        <input type="file" @change="onLogoChange" accept="image/*" class="block w-full text-sm text-gray-500
                                              file:mr-4 file:py-2 file:px-4
                                              file:rounded-full file:border-0
                                              file:text-sm file:font-semibold
                                              file:bg-primary-50 file:text-primary-700
                                              hover:file:bg-primary-100
                                            " />
                                    </div>
                                </div>
                            </div>

                             <!-- Tab: Página Pública -->
                            <div v-if="activeTab === 'public'" class="space-y-6">
                                <div class="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-4">
                                    <div class="flex items-center">
                                        <input v-model="form.public_pages_enabled" type="checkbox" id="public_enabled"
                                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                                        <label for="public_enabled" class="ml-2 block text-sm font-medium text-primary-900">
                                            Habilitar página pública informativa
                                        </label>
                                    </div>
                                    <p class="mt-1 text-xs text-primary-700 ml-6">
                                        Si está desactivado, el subdominio redirigirá directamente al login.
                                    </p>
                                </div>

                                <!-- Hero Section -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Descripción Pública (Landing)</label>
                                    <textarea v-model="form.public_description" rows="3"
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Breve descripción que aparecerá en la página de inicio..."></textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Imagen Principal (Hero)</label>
                                    <div class="mt-1 flex items-center">
                                        <div v-if="heroImagePreview || form.hero_image_url" class="mr-4 relative">
                                            <img :src="heroImagePreview || form.hero_image_url" 
                                                class="h-20 w-32 object-cover rounded border border-gray-200">
                                        </div>
                                        <input type="file" @change="onHeroImageChange" accept="image/*" 
                                            class="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    </div>
                                </div>

                                <!-- Identity Section -->
                                <div class="border-t border-gray-200 pt-4 space-y-4">
                                    <h4 class="text-sm font-semibold text-gray-900">Identidad Institucional</h4>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Misión</label>
                                        <textarea v-model="form.mission" rows="2"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Visión</label>
                                        <textarea v-model="form.vision" rows="2"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Valores</label>
                                        <textarea v-model="form.values" rows="2"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                                    </div>
                                </div>

                                <!-- Director Section -->
                                <div class="border-t border-gray-200 pt-4">
                                    <h4 class="text-sm font-semibold text-gray-900 mb-3">Perfil del Director</h4>
                                    <div class="grid grid-cols-1 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Nombre del Director</label>
                                            <input v-model="form.director_name" type="text"
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Biografía/Mensaje del Director</label>
                                            <textarea v-model="form.director_bio" rows="4"
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Escriba aquí la biografía o un mensaje de bienvenida del director..."></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Foto del Director</label>
                                            <div class="mt-1 flex items-center">
                                                <div v-if="directorImagePreview || form.director_image_url" class="mr-4">
                                                    <img :src="directorImagePreview || form.director_image_url" 
                                                        class="h-16 w-16 object-cover rounded-full border border-gray-200">
                                                </div>
                                                <input type="file" @change="onDirectorImageChange" accept="image/*"
                                                    class="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Social Media -->
                                <div class="border-t border-gray-200 pt-4">
                                    <h4 class="text-sm font-semibold text-gray-900 mb-3">Redes Sociales</h4>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 italic">Facebook</label>
                                            <input v-model="form.social_media.facebook" type="text" placeholder="https://..."
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 italic">Instagram</label>
                                            <input v-model="form.social_media.instagram" type="text" placeholder="https://..."
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 italic">Twitter / X</label>
                                            <input v-model="form.social_media.twitter" type="text" placeholder="https://..."
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 italic">YouTube</label>
                                            <input v-model="form.social_media.youtube" type="text" placeholder="https://..."
                                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-xs">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tab: Firmas / Reportes -->
                            <div v-if="activeTab === 'reports'" class="space-y-4">
                                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                                    <p class="text-xs text-blue-800">
                                        Configure los datos del Ministerio o Distrito que aparecerán en los encabezados de los reportes y actas oficiales.
                                    </p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Departamento </label>
                                        <input v-model="form.departamento" type="text" placeholder="Ejem: La Altagracia"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Distrito Educativo</label>
                                        <input v-model="form.distrito" type="text" placeholder="Ejem: 12-01"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                    </div>
                                </div>
                                
                                <div class="border-t border-gray-100 pt-3">
                                    <label class="block text-sm font-medium text-gray-700">Logo del Departamento / Regional</label>
                                    <div class="mt-1 flex items-center">
                                        <div v-if="logoDepartamentoPreview || form.logo_departamento" class="mr-4">
                                            <img :src="logoDepartamentoPreview || form.logo_departamento" class="h-16 w-16 object-contain border rounded p-1">
                                        </div>
                                        <input type="file" @change="onLogoDepartamentoChange" accept="image/*"
                                            class="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    </div>
                                </div>

                                <div class="border-t border-gray-100 pt-3">
                                    <label class="block text-sm font-medium text-gray-700">Sello Institucional (Para Reportes/Actas)</label>
                                    <div class="mt-1 flex items-center">
                                        <div v-if="selloInstitucionalPreview || form.sello_institucional" class="mr-4">
                                            <img :src="selloInstitucionalPreview || form.sello_institucional" class="h-20 w-20 object-contain border rounded p-1">
                                        </div>
                                        <input type="file" @change="onSelloInstitucionalChange" accept="image/*"
                                            class="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    </div>
                                    <p class="mt-1 text-[10px] text-gray-400 italic">Este sello aparecerá como fondo en los certificados y documentos oficiales generados.</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-gray-100">
                            <button @click="saveTenant" type="button"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                                :disabled="saving">
                                {{ isEditing ? (saving ? 'Actualizando...' : 'Actualizar Institución') : (saving ? 'Creando...' : 'Crear Institución') }}
                            </button>
                            <button @click="closeModal" type="button"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all">
                                Cancelar
                            </button>
                        </div>
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
import Swal from 'sweetalert2'
import provinciasData from '~/utils/provincias.json'
import municipiosData from '~/utils/municipios.json'

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
const activeTab = ref('general')

const form = reactive({
    name: '',
    abbreviation: '',
    domain: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    departamento: '',
    distrito: '',
    logo_departamento: '',
    provincia: '',
    municipio: '',
    sello_institucional: '',
    public_pages_enabled: false,
    public_description: '',
    hero_image_url: '',
    director_name: '',
    director_bio: '',
    director_image_url: '',
    mission: '',
    vision: '',
    values: '',
    social_media: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    }
})

const provinciasList = ref<any[]>([])
const municipiosList = ref<any[]>([])

const fetchProvincias = () => {
    provinciasList.value = provinciasData
}

const fetchMunicipiosConfig = () => {
    if (!form.provincia) {
        municipiosList.value = []
        return
    }
    const prov = provinciasList.value.find(p => p.nombre === form.provincia)
    if (prov) {
        municipiosList.value = municipiosData.filter(m => m.provinciaId === prov.id)

        // Check if current municipio is in the new list, if not clear it
        if (form.municipio && !municipiosList.value.some((m: any) => m.nombre === form.municipio)) {
            form.municipio = ''
        }
    }
}

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
    activeTab.value = 'general'
    isEditing.value = false
    editingId.value = null
    Object.assign(form, {
        name: '',
        abbreviation: '',
        domain: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        departamento: '',
        distrito: '',
        logo_departamento: '',
        provincia: '',
        municipio: '',
        sello_institucional: '',
        public_pages_enabled: false,
        public_description: '',
        hero_image_url: '',
        director_name: '',
        director_bio: '',
        director_image_url: '',
        mission: '',
        vision: '',
        values: '',
        social_media: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
        }
    })
    logoFile.value = null
    logoPreview.value = null
    logoDepartamentoFile.value = null
    logoDepartamentoPreview.value = null
    selloInstitucionalFile.value = null
    selloInstitucionalPreview.value = null
    heroImageFile.value = null
    heroImagePreview.value = null
    directorImageFile.value = null
    directorImagePreview.value = null
    showModal.value = true
}

const editTenant = (tenant: Tenant) => {
    activeTab.value = 'general'
    isEditing.value = true
    editingId.value = tenant.id
    Object.assign(form, {
        name: tenant.name,
        abbreviation: tenant.abbreviation || '',
        domain: tenant.domain || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        website: tenant.website || '',
        logo_url: tenant.logo_url || '',
        departamento: tenant.departamento || '',
        distrito: tenant.distrito || '',
        logo_departamento: tenant.logo_departamento || '',
        provincia: tenant.provincia || '',
        municipio: tenant.municipio || '',
        sello_institucional: tenant.sello_institucional || '',
        public_pages_enabled: !!tenant.public_pages_enabled,
        public_description: tenant.public_description || '',
        hero_image_url: tenant.hero_image_url || '',
        director_name: tenant.director_name || '',
        director_bio: tenant.director_bio || '',
        director_image_url: tenant.director_image_url || '',
        mission: tenant.mission || '',
        vision: tenant.vision || '',
        values: tenant.values || '',
        social_media: tenant.social_media || {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
        }
    })

    if (form.provincia) {
        fetchMunicipiosConfig()
    }
    logoFile.value = null
    logoPreview.value = null
    logoDepartamentoFile.value = null
    logoDepartamentoPreview.value = null
    selloInstitucionalFile.value = null
    selloInstitucionalPreview.value = null
    heroImageFile.value = null
    heroImagePreview.value = null
    directorImageFile.value = null
    directorImagePreview.value = null
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

const logoDepartamentoFile = ref<File | null>(null)
const logoDepartamentoPreview = ref<string | null>(null)

const selloInstitucionalFile = ref<File | null>(null)
const selloInstitucionalPreview = ref<string | null>(null)

const heroImageFile = ref<File | null>(null)
const heroImagePreview = ref<string | null>(null)

const directorImageFile = ref<File | null>(null)
const directorImagePreview = ref<string | null>(null)

const onLogoChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        logoFile.value = input.files[0]
        logoPreview.value = URL.createObjectURL(input.files[0])
    }
}

const onLogoDepartamentoChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        logoDepartamentoFile.value = input.files[0]
        logoDepartamentoPreview.value = URL.createObjectURL(input.files[0])
    }
}

const onSelloInstitucionalChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        selloInstitucionalFile.value = input.files[0]
        selloInstitucionalPreview.value = URL.createObjectURL(input.files[0])
    }
}

const onHeroImageChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        heroImageFile.value = input.files[0]
        heroImagePreview.value = URL.createObjectURL(input.files[0])
    }
}

const onDirectorImageChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        directorImageFile.value = input.files[0]
        directorImagePreview.value = URL.createObjectURL(input.files[0])
    }
}

const saveTenant = async () => {
    if (!form.name || !form.abbreviation) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor complete los campos requeridos (Nombre y Abreviatura)',
            confirmButtonColor: '#3085d6',
        })
        return
    }

    saving.value = true
    try {
        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('abbreviation', form.abbreviation)
        if (form.domain) formData.append('domain', form.domain)
        if (form.address) formData.append('address', form.address)
        if (form.phone) formData.append('phone', form.phone)
        if (form.email) formData.append('email', form.email)
        if (form.website) formData.append('website', form.website)
        if (form.departamento) formData.append('departamento', form.departamento)
        if (form.distrito) formData.append('distrito', form.distrito)
        if (form.provincia) formData.append('provincia', form.provincia)
        if (form.municipio) formData.append('municipio', form.municipio)
        
        formData.append('public_pages_enabled', form.public_pages_enabled ? '1' : '0')
        if (form.public_description) formData.append('public_description', form.public_description)
        if (form.director_name) formData.append('director_name', form.director_name)
        if (form.director_bio) formData.append('director_bio', form.director_bio)
        
        if (form.mission) formData.append('mission', form.mission)
        if (form.vision) formData.append('vision', form.vision)
        if (form.values) formData.append('values', form.values)
        
        formData.append('social_media', JSON.stringify(form.social_media))

        if (logoFile.value) {
            formData.append('logo', logoFile.value)
        }

        if (logoDepartamentoFile.value) {
            formData.append('logo_departamento', logoDepartamentoFile.value)
        }

        if (selloInstitucionalFile.value) {
            formData.append('sello_institucional', selloInstitucionalFile.value)
        }

        if (heroImageFile.value) {
            formData.append('hero_image', heroImageFile.value)
        }

        if (directorImageFile.value) {
            formData.append('director_image', directorImageFile.value)
        }

        let url = '/api/tenants'

        if (isEditing.value && editingId.value) {
            url = `/api/tenants/${editingId.value}`
            formData.append('_method', 'PUT')
        }

        const response = await api.post<{ success: boolean, message?: string }>(url, formData)

        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: response.message || 'Institución guardada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })
            await fetchTenants()
            closeModal()
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'Error al guardar la institución'
            })
        }
    } catch (error: any) {
        console.error('Error saving tenant:', error)
        const message = error.data?.message || 'Error al guardar la institución'
        const errors = error.data?.errors

        let errorMsg = ''
        if (errors) {
            errorMsg = Object.values(errors).flat().join('<br>')
        }

        Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            html: `<strong>${message}</strong>${errorMsg ? '<br><br>' + errorMsg : ''}`,
            confirmButtonColor: '#d33'
        })
    } finally {
        saving.value = false
    }
}



const deleteTenant = async (tenant: Tenant) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Deseas eliminar la institución "${tenant.name}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) return

    try {
        const response = await api.delete<{ success: boolean, message?: string }>(`/api/tenants/${tenant.id}`)
        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'La institución ha sido eliminada correctamente',
                timer: 1500,
                showConfirmButton: false
            })
            await fetchTenants()
        }
    } catch (error: any) {
        console.error('Error deleting tenant:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || 'Error al eliminar la institución'
        })
    }
}

onMounted(() => {
    fetchTenants()
    fetchProvincias()
})
</script>
