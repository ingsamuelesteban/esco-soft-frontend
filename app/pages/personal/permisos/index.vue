<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">Solicitudes de Permiso</h1>
                <p class="mt-1 text-sm text-gray-600">Gestión de permisos y ausencias del personal</p>
            </div>
            <button @click="showCreateModal = true"
                class="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Solicitud
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
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                        {{ tab.label }}
                        <span v-if="tab.count !== undefined" :class="[
                            'ml-2 px-2 py-0.5 text-xs rounded-full',
                            activeTab === tab.value
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                        ]">
                            {{ tab.count }}
                        </span>
                    </button>
                </nav>
            </div>

            <!-- Filters -->
            <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4">
                <div class="w-full sm:w-64">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Empleado</label>
                    <select v-model="filters.personal_id" @change="loadRequests"
                        class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <option :value="undefined">Todos</option>
                        <option v-for="p in personalList" :key="p.id" :value="p.id">
                            {{ p.nombre }} {{ p.apellido }}
                        </option>
                    </select>
                </div>

                <div class="w-full sm:w-48">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Tipo de Permiso</label>
                    <select v-model="filters.leave_type" @change="loadRequests"
                        class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <option :value="undefined">Todos</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="personal">Personal</option>
                        <option value="medico">Médico</option>
                        <option value="maternidad">Maternidad</option>
                        <option value="paternidad">Paternidad</option>
                        <option value="duelo">Duelo</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Cargando solicitudes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!store.leaveRequests || store.leaveRequests.length === 0"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
            <p class="mt-1 text-sm text-gray-500">Comienza creando una nueva solicitud de permiso.</p>
        </div>

        <!-- Requests List -->
        <div v-else class="grid gap-4">
            <div v-for="request in (store.leaveRequests || [])" :key="request.id"
                class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-blue-600 font-semibold text-lg">
                                    {{ getInitials(request.personal) }}
                                </span>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">
                                    {{ request.personal?.nombre }} {{ request.personal?.apellido }}
                                </h3>
                                <p class="text-sm text-gray-500">{{ request.personal?.cedula }}</p>
                            </div>
                        </div>

                        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p class="text-xs text-gray-500">Tipo</p>
                                <p class="text-sm font-medium text-gray-900">{{ getLeaveTypeName(request.leave_type) }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Fechas</p>
                                <p class="text-sm font-medium text-gray-900">
                                    {{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Días</p>
                                <p class="text-sm font-medium text-gray-900">{{ request.days_count }} días</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Estado</p>
                                <span :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                    getStatusClass(request.status)
                                ]">
                                    {{ getStatusLabel(request.status) }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-3">
                            <p class="text-xs text-gray-500">Motivo</p>
                            <p class="text-sm text-gray-700 mt-1">{{ request.reason }}</p>
                        </div>

                        <div v-if="request.review_notes" class="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p class="text-xs text-gray-500">Notas del revisor</p>
                            <p class="text-sm text-gray-700 mt-1">{{ request.review_notes }}</p>
                            <p class="text-xs text-gray-500 mt-1">
                                Por: {{ request.reviewer?.name }} - {{ formatDate(request.reviewed_at!) }}
                            </p>
                        </div>
                    </div>

                    <div class="ml-4 flex flex-col gap-2">
                        <button v-if="request.status === 'pendiente'" @click="openReviewModal(request)"
                            class="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            Revisar
                        </button>
                        <button @click="viewDetails(request)"
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

        <!-- Create Modal -->
        <LeaveRequestFormModal :show="showCreateModal" :personal-list="personalList" @close="showCreateModal = false"
            @saved="onSaved" />

        <!-- Review Modal (placeholder) -->
        <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
                <h2 class="text-xl font-semibold mb-4">Revisar Solicitud</h2>
                <p class="text-gray-600">Modal de revisión en construcción...</p>
                <button @click="showReviewModal = false" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLeaveRequestsStore, type LeaveRequest } from '../../../stores/leaveRequests'
import { usePersonalStore } from '../../../stores/personal'
import LeaveRequestFormModal from '../../../components/staff/LeaveRequestFormModal.vue'
import dayjs from 'dayjs'

definePageMeta({
    middleware: ['auth', 'admin']
})

const store = useLeaveRequestsStore()
const personalStore = usePersonalStore()

const activeTab = ref('all')
const showCreateModal = ref(false)
const showReviewModal = ref(false)
const selectedRequest = ref<LeaveRequest | null>(null)

const filters = ref({
    personal_id: undefined as number | undefined,
    leave_type: undefined as string | undefined
})

const tabs = computed(() => [
    { label: 'Todas', value: 'all', count: store.total },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Aprobadas', value: 'aprobado' },
    { label: 'Rechazadas', value: 'rechazado' }
])

const personalList = computed(() => personalStore.items)

onMounted(async () => {
    await personalStore.fetchAll('active')
    await loadRequests()
})

// Watch activeTab changes
watch(activeTab, () => {
    loadRequests()
})

const loadRequests = async () => {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    await store.fetchAll({ ...filters.value, status })
}

const changePage = (page: number) => {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    store.fetchAll({ ...filters.value, status }, page)
}

const openReviewModal = (request: LeaveRequest) => {
    selectedRequest.value = request
    showReviewModal.value = true
}

const viewDetails = (request: LeaveRequest) => {
    // Navigate to detail page
    navigateTo(`/personal/permisos/${request.id}`)
}

const onSaved = () => {
    showCreateModal.value = false
    loadRequests()
}

const getInitials = (personal: any) => {
    if (!personal) return '??'
    return (personal.nombre[0] || '') + (personal.apellido[0] || '')
}

const getLeaveTypeName = (type: string) => {
    const types: Record<string, string> = {
        vacaciones: 'Vacaciones',
        personal: 'Personal',
        medico: 'Médico',
        maternidad: 'Maternidad',
        paternidad: 'Paternidad',
        duelo: 'Duelo',
        otro: 'Otro'
    }
    return types[type] || type
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pendiente: 'Pendiente',
        aprobado: 'Aprobado',
        rechazado: 'Rechazado',
        cancelado: 'Cancelado'
    }
    return labels[status] || status
}

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        aprobado: 'bg-green-100 text-green-800',
        rechazado: 'bg-red-100 text-red-800',
        cancelado: 'bg-gray-100 text-gray-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date: string) => {
    return dayjs(date).format('DD MMM YYYY')
}
</script>
