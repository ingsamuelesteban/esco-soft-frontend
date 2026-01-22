<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">Amonestaciones</h1>
                <p class="mt-1 text-sm text-gray-600">Gestión de amonestaciones disciplinarias</p>
            </div>
            <button @click="showCreateModal = true"
                class="inline-flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Amonestación
            </button>
        </div>

        <!-- Filters and Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <!-- Tabs -->
            <div class="border-b border-gray-200">
                <nav class="flex -mb-px">
                    <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
                        'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                        activeTab === tab.value
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                        {{ tab.label }}
                    </button>
                </nav>
            </div>

            <!-- Filters -->
            <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4">
                <div class="w-full sm:w-64">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Empleado</label>
                    <select v-model="filters.personal_id" @change="loadWarnings"
                        class="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <option :value="undefined">Todos</option>
                        <option v-for="p in personalList" :key="p.id" :value="p.id">
                            {{ p.nombre }} {{ p.apellido }}
                        </option>
                    </select>
                </div>

                <div class="w-full sm:w-48">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                    <select v-model="filters.warning_type" @change="loadWarnings"
                        class="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <option :value="undefined">Todos</option>
                        <option value="verbal">Verbal</option>
                        <option value="escrita">Escrita</option>
                        <option value="suspension">Suspensión</option>
                        <option value="despido">Despido</option>
                    </select>
                </div>

                <div class="w-full sm:w-48">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Gravedad</label>
                    <select v-model="filters.severity" @change="loadWarnings"
                        class="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <option :value="undefined">Todas</option>
                        <option value="leve">Leve</option>
                        <option value="moderada">Moderada</option>
                        <option value="grave">Grave</option>
                        <option value="muy_grave">Muy Grave</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Cargando amonestaciones...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!store.warnings || store.warnings.length === 0"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay amonestaciones</h3>
            <p class="mt-1 text-sm text-gray-500">No se han registrado amonestaciones.</p>
        </div>

        <!-- Warnings List -->
        <div v-else class="grid gap-4">
            <div v-for="warning in (store.warnings || [])" :key="warning.id"
                class="bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow"
                :class="getBorderClass(warning.severity)">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <span class="text-red-600 font-semibold text-lg">
                                    {{ getInitials(warning.personal) }}
                                </span>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">
                                    {{ warning.personal?.nombre }} {{ warning.personal?.apellido }}
                                </h3>
                                <p class="text-sm text-gray-500">{{ warning.personal?.cedula }}</p>
                            </div>
                        </div>

                        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p class="text-xs text-gray-500">Tipo</p>
                                <span :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                    getTypeClass(warning.warning_type)
                                ]">
                                    {{ getTypeName(warning.warning_type) }}
                                </span>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Gravedad</p>
                                <span :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                    getSeverityClass(warning.severity)
                                ]">
                                    {{ getSeverityName(warning.severity) }}
                                </span>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Fecha del Incidente</p>
                                <p class="text-sm font-medium text-gray-900">{{ formatDate(warning.incident_date) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Estado</p>
                                <span :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                    getStatusClass(warning.status)
                                ]">
                                    {{ getStatusLabel(warning.status) }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-3">
                            <p class="text-xs text-gray-500">Descripción</p>
                            <p class="text-sm text-gray-700 mt-1 line-clamp-2">{{ warning.description }}</p>
                        </div>

                        <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
                            <span>Emitida por: {{ warning.issuer?.name }}</span>
                            <span v-if="warning.employee_signed_at" class="flex items-center gap-1 text-green-600">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                Firmada por empleado
                            </span>
                        </div>
                    </div>

                    <div class="ml-4 flex flex-col gap-2">
                        <button @click="viewDetails(warning)"
                            class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="store.lastPage > 1" class="flex justify-center">
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button @click="changePage(store.currentPage - 1)" :disabled="store.currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <span
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Página {{ store.currentPage }} de {{ store.lastPage }}
                </span>
                <button @click="changePage(store.currentPage + 1)" :disabled="store.currentPage === store.lastPage"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </nav>
        </div>

        <!-- Create Modal (placeholder) -->
        <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
                <h2 class="text-xl font-semibold mb-4">Nueva Amonestación</h2>
                <p class="text-gray-600">Formulario en construcción...</p>
                <button @click="showCreateModal = false" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWarningsStore, type StaffWarning } from '../../../stores/warnings'
import { usePersonalStore } from '../../../stores/personal'
import dayjs from 'dayjs'

definePageMeta({
    middleware: ['auth', 'admin']
})

const store = useWarningsStore()
const personalStore = usePersonalStore()

const activeTab = ref('all')
const showCreateModal = ref(false)

const filters = ref({
    personal_id: undefined as number | undefined,
    warning_type: undefined as string | undefined,
    severity: undefined as string | undefined
})

const tabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Activas', value: 'activa' },
    { label: 'Resueltas', value: 'resuelta' },
    { label: 'Anuladas', value: 'anulada' }
]

const personalList = computed(() => personalStore.items)

onMounted(async () => {
    await personalStore.fetchAll('active')
    await loadWarnings()
})

// Watch activeTab changes
watch(activeTab, () => {
    loadWarnings()
})

const loadWarnings = async () => {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    await store.fetchAll({ ...filters.value, status })
}

const changePage = (page: number) => {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    store.fetchAll({ ...filters.value, status }, page)
}

const viewDetails = (warning: StaffWarning) => {
    navigateTo(`/personal/amonestaciones/${warning.id}`)
}

const getInitials = (personal: any) => {
    if (!personal) return '??'
    return (personal.nombre[0] || '') + (personal.apellido[0] || '')
}

const getTypeName = (type: string) => {
    const types: Record<string, string> = {
        verbal: 'Verbal',
        escrita: 'Escrita',
        suspension: 'Suspensión',
        despido: 'Despido'
    }
    return types[type] || type
}

const getSeverityName = (severity: string) => {
    const severities: Record<string, string> = {
        leve: 'Leve',
        moderada: 'Moderada',
        grave: 'Grave',
        muy_grave: 'Muy Grave'
    }
    return severities[severity] || severity
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        activa: 'Activa',
        resuelta: 'Resuelta',
        apelada: 'Apelada',
        anulada: 'Anulada'
    }
    return labels[status] || status
}

const getTypeClass = (type: string) => {
    const classes: Record<string, string> = {
        verbal: 'bg-yellow-100 text-yellow-800',
        escrita: 'bg-orange-100 text-orange-800',
        suspension: 'bg-red-100 text-red-800',
        despido: 'bg-purple-100 text-purple-800'
    }
    return classes[type] || 'bg-gray-100 text-gray-800'
}

const getSeverityClass = (severity: string) => {
    const classes: Record<string, string> = {
        leve: 'bg-blue-100 text-blue-800',
        moderada: 'bg-yellow-100 text-yellow-800',
        grave: 'bg-orange-100 text-orange-800',
        muy_grave: 'bg-red-100 text-red-800'
    }
    return classes[severity] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        activa: 'bg-red-100 text-red-800',
        resuelta: 'bg-green-100 text-green-800',
        apelada: 'bg-yellow-100 text-yellow-800',
        anulada: 'bg-gray-100 text-gray-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const getBorderClass = (severity: string) => {
    const classes: Record<string, string> = {
        leve: 'border-blue-400',
        moderada: 'border-yellow-400',
        grave: 'border-orange-400',
        muy_grave: 'border-red-600'
    }
    return classes[severity] || 'border-gray-300'
}

const formatDate = (date: string) => {
    return dayjs(date).format('DD MMM YYYY')
}
</script>
