<template>
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between mb-6">
            <div class="min-w-0 flex-1">
                <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Despacho de Estudiantes
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    Envía estudiantes a casa y gestiona el historial de salidas.
                </p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button @click="currentTab = 'new'"
                    :class="[currentTab === 'new' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                    Nuevo Despacho
                </button>
                <button @click="currentTab = 'history'"
                    :class="[currentTab === 'history' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                    Historial
                </button>
            </nav>
        </div>

        <!-- Tab: Nuevo Despacho -->
        <div v-if="currentTab === 'new'">
            <!-- Selector de Aula -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Aula</label>
                <select v-model="selectedAulaId" @change="onAulaChange"
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                    <option value="">-- Seleccione un aula --</option>
                    <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                        {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo?.nombre }}
                    </option>
                </select>
            </div>

            <!-- Loading State -->
            <div v-if="estudiantesStore.loading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-500">Cargando estudiantes...</p>
            </div>

            <!-- Lista de Estudiantes -->
            <div v-else-if="selectedAulaId && estudiantes.length > 0"
                class="bg-white shadow-sm rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" class="relative px-6 py-3">
                                <span class="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="estudiante in estudiantes" :key="estudiante.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ estudiante.numero_orden }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 flex-shrink-0">
                                        <div
                                            class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {{ estudiante.nombres.charAt(0) }}{{ estudiante.apellidos.charAt(0) }}
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ estudiante.apellidos }}, {{ estudiante.nombres }}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            {{ estudiante.rne }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span
                                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {{ estudiante.estado }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button v-if="!isDispatched(estudiante.id)" @click="openDismissModal(estudiante)"
                                    class="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                                    Despachar
                                </button>
                                <span v-else
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Despachado
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else-if="selectedAulaId" class="text-center py-12 bg-white rounded-lg shadow">
                <p class="text-gray-500">No hay estudiantes activos en esta aula.</p>
            </div>

            <div v-else class="text-center py-12 bg-white rounded-lg shadow">
                <p class="text-gray-500">Seleccione un aula para comenzar.</p>
            </div>
        </div>

        <!-- Tab: Historial -->
        <div v-else>
            <!-- Filtros -->
            <!-- Filtros -->
            <div class="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Fecha</label>
                    <input type="date" v-model="filters.date" @change="onDateChange"
                        class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="flex items-center text-gray-400 pb-2">o</div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Mes</label>
                    <div class="flex space-x-2">
                        <select v-model="filters.month" @change="onMonthChange"
                            class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">-- Mes --</option>
                            <option v-for="(mes, index) in meses" :key="index" :value="String(index + 1)">
                                {{ mes }}
                            </option>
                        </select>
                        <select v-model="filters.year" @change="onMonthChange"
                            class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                </div>

                <div class="ml-auto">
                    <button @click="resetFilters" class="text-sm text-indigo-600 hover:text-indigo-800">
                        Restablecer a Hoy
                    </button>
                </div>
            </div>

            <!-- Tabla de Historial -->
            <div v-if="psychologyStore.loading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-500">Cargando historial...</p>
            </div>

            <div v-else-if="historyData && historyData.length > 0"
                class="bg-white shadow-sm rounded-lg overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha y Hora
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Motivo
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Despachado Por
                            </th>
                            <th scope="col" class="relative px-6 py-3">
                                <span class="sr-only">Evidencia</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="item in historyData" :key="item.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ formatDate(item.dismissed_at) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {{ item.student.apellidos }}, {{ item.student.nombres }}
                                </div>
                                <div class="text-sm text-gray-500" v-if="item.student.aula">
                                    {{ item.student.aula.grado_cardinal }}° {{ item.student.aula.seccion }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="item.reason">
                                {{ item.reason }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ item.reporter?.name || 'Sistema' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <button v-if="item.evidence_path" @click.stop="printFile('/api/psychology/dismissals/' + item.id + '/download')" 
                                    class="text-gray-400 hover:text-indigo-600 transition-colors" title="Ver Evidencia">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </button>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button @click="openDetailModal(item)" class="text-indigo-600 hover:text-indigo-900">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="text-center py-12 bg-white rounded-lg shadow">
                <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p class="text-gray-500">No hay despachos registrados para este periodo.</p>
            </div>
        </div>

        <!-- Modal de Confirmación -->
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="closeModal"></div>

                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                    stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                                    Despachar Estudiante
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500 mb-4">
                                        Estás a punto de despachar a <strong>{{ selectedStudent?.nombres }} {{
                                            selectedStudent?.apellidos }}</strong>.
                                        Esto generará una excusa automática para todas sus clases restantes de hoy.
                                    </p>

                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Motivo del despacho / Comentario <span class="text-red-500">*</span>
                                    </label>
                                    <textarea v-model="dismissReason" rows="3"
                                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                        placeholder="Ingrese el motivo detallado..."></textarea>

                                    <div class="mt-4">
                                        <DropZone v-model="evidenceFile" label="Adjuntar Evidencia (Opcional)"
                                            accept="image/jpeg,image/png,application/pdf" :max-size="50 * 1024 * 1024" />
                                        <p class="text-xs text-gray-500 mt-1">Soporta PDF, JPEG, PNG hasta 50MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button type="button" @click="confirmDismiss" :disabled="!dismissReason.trim() || submitting"
                            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ submitting ? 'Procesando...' : 'Confirmar Despacho' }}
                        </button>
                        <button type="button" @click="closeModal"
                            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Detalle -->
        <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="detail-modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="closeDetailModal"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="detail-modal-title">Detalles
                                    del Despacho</h3>
                                <div class="mt-4 border-t border-gray-100 pt-4">
                                    <div class="grid grid-cols-1 gap-y-4">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Estudiante</dt>
                                            <dd class="mt-1 text-sm text-gray-900 font-semibold">{{
                                                selectedDispatch?.student?.nombres }} {{
                                                    selectedDispatch?.student?.apellidos }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Fecha y Hora</dt>
                                            <dd class="mt-1 text-sm text-gray-900">{{
                                                formatDate(selectedDispatch?.dismissed_at) }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Motivo</dt>
                                            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{
                                                selectedDispatch?.reason }}</dd>
                                        </div>
                                        <div>
                                            <dd class="mt-1 text-sm text-gray-900">{{ selectedDispatch?.reporter?.name
                                                || 'Sistema' }}</dd>
                                        </div>
                                        <div v-if="selectedDispatch?.evidence_path">
                                            <dt class="text-sm font-medium text-gray-500">Evidencia</dt>
                                            <dd class="mt-1">
                                                <button @click="printFile('/api/psychology/dismissals/' + selectedDispatch.id + '/download')"
                                                    class="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    Ver Documento
                                                </button>
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" @click="closeDetailModal"
                            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAulasStore } from '~/stores/aulas'
import { useEstudiantesStore } from '~/stores/estudiantes'
import { usePsychologyStore } from '~/stores/psychology'
import Swal from 'sweetalert2'
import DropZone from '~/components/ui/DropZone.vue'
import { usePrint } from '~/composables/usePrint'

const { printFile } = usePrint()

const aulasStore = useAulasStore()
const estudiantesStore = useEstudiantesStore()
const psychologyStore = usePsychologyStore()

const currentTab = ref('new')
const selectedAulaId = ref('')
const showModal = ref(false)
const selectedStudent = ref<any>(null)
const dismissReason = ref('')
const evidenceFile = ref<File | null>(null)
const submitting = ref(false)

// Detail Modal State
const showDetailModal = ref(false)
const selectedDispatch = ref<any>(null)

const openDetailModal = (dispatch: any) => {
    selectedDispatch.value = dispatch
    showDetailModal.value = true
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedDispatch.value = null
}

// History Filter
const filters = ref<{ date: string, month: string, year: number | string }>({
    date: '',
    month: '',
    year: new Date().getFullYear()
})
const historyData = ref<any[]>([])
const todaysDismissalsIds = ref<Set<number>>(new Set())

const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const years = computed(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1, currentYear - 2]
})

const aulas = computed(() => aulasStore.items)
const estudiantes = computed(() => estudiantesStore.items)

onMounted(async () => {
    await aulasStore.fetchAll()
    // Initialize filter with today's date
    filters.value.date = new Date().toISOString().split('T')[0] || ''
    await fetchTodaysDismissals()
})

onUnmounted(() => {
    estudiantesStore.items = []
})


// Watch for tab change tab to load history
watch(currentTab, async (newTab) => {
    if (newTab === 'history') {
        // Ensure date is set if empty (though onMounted sets it)
        if (!filters.value.date && !filters.value.month) {
            filters.value.date = new Date().toISOString().split('T')[0] || ''
        }
        await loadHistory()
    }
})

const loadHistory = async () => {
    const params: any = {}

    if (filters.value.date) {
        params.date = filters.value.date
    } else if (filters.value.month) {
        params.month = filters.value.month
        params.year = filters.value.year
    }

    const result = await psychologyStore.fetchDismissals(params)
    if (result.success && Array.isArray(result.data)) {
        historyData.value = result.data
    } else {
        historyData.value = []
    }
}

const onDateChange = () => {
    if (filters.value.date) filters.value.month = ''
    loadHistory()
}

const onMonthChange = () => {
    if (filters.value.month) filters.value.date = ''
    loadHistory()
}

const resetFilters = () => {
    filters.value.date = new Date().toISOString().split('T')[0] || ''
    filters.value.month = ''
    filters.value.year = new Date().getFullYear()
    loadHistory()
}

const onAulaChange = async () => {
    if (selectedAulaId.value) {
        await estudiantesStore.fetchAll({
            aula_id: parseInt(selectedAulaId.value as string),
            status: 'active'
        })
    } else {
        estudiantesStore.items = []
    }
}

const openDismissModal = (student: any) => {
    selectedStudent.value = student
    dismissReason.value = ''
    evidenceFile.value = null
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedStudent.value = null
    dismissReason.value = ''
    evidenceFile.value = null
}

const confirmDismiss = async () => {
    if (!selectedStudent.value || !dismissReason.value.trim()) return

    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('student_id', selectedStudent.value.id)
        formData.append('reason', dismissReason.value)
        
        if (evidenceFile.value) {
            formData.append('evidence_file', evidenceFile.value)
        }

        const result = await psychologyStore.createDismissal(formData)

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Estudiante Despachado',
                text: 'El despacho se ha registrado y se han generado las excusas correspondientes.',
                timer: 2000,
                showConfirmButton: false
            })
            await fetchTodaysDismissals()
            closeModal()
        } else {
            throw new Error(result.error as string)
        }
    } catch (e: any) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.message || 'No se pudo procesar el despacho.'
        })
    } finally {
        submitting.value = false
    }
}

const fetchTodaysDismissals = async () => {
    const today = new Date().toISOString().split('T')[0]
    const result = await psychologyStore.fetchDismissals({ date: today })
    if (result.success && Array.isArray(result.data)) {
        todaysDismissalsIds.value = new Set(result.data.map((d: any) => d.student_id))
    }
}

const isDispatched = (studentId: number) => {
    return todaysDismissalsIds.value.has(studentId)
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date)
}
</script>
