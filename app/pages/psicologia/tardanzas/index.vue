<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-clock text-blue-600 dark:text-blue-400"></i>
                    Registro de Tardanzas
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gestione las tardanzas de los estudiantes por aula. Las tardanzas del día actual se reflejarán en la
                    asistencia de la primera clase.
                </p>
            </div>
        </div>

        <!-- Tabs -->
        <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="flex -mb-px" aria-label="Tabs">
                    <button @click="activeTab = 'registro'" :class="[
                        activeTab === 'registro'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                        'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200'
                    ]">
                        <i class="fas fa-edit mr-2"></i>
                        Registro del Día Actual
                    </button>
                    <button @click="activeTab = 'historial'" :class="[
                        activeTab === 'historial'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                        'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200'
                    ]">
                        <i class="fas fa-history mr-2"></i>
                        Historial
                    </button>
                </nav>
            </div>

            <div class="p-6">
                <!-- Tab: Registro -->
                <div v-show="activeTab === 'registro'" class="space-y-6">
                    <div
                        class="flex flex-col md:flex-row gap-4 items-end bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="w-full md:w-1/3">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <i class="fas fa-door-open mr-1"></i> Aula
                            </label>
                            <select v-model="selectedAula" @change="loadRegistro"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                :disabled="isLoading">
                                <option value="">Seleccione un aula...</option>
                                <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                                    {{ aula.grado_cardinal }} {{ aula.seccion }}
                                </option>
                            </select>
                        </div>

                        <div class="w-full md:w-1/2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <i class="fas fa-search mr-1"></i> Buscar Estudiante
                            </label>
                            <div class="relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                                <input type="text" v-model="searchQuery"
                                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Filtrar por nombre..." :disabled="!selectedAula || isLoading" />
                            </div>
                        </div>

                        <div class="w-full md:w-1/6 flex justify-end">
                            <button @click="loadRegistro" :disabled="!selectedAula || isLoading"
                                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': isLoading }"></i>
                                Refrescar
                            </button>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isLoading" class="flex justify-center items-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="!selectedAula"
                        class="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <i class="fas fa-door-open text-4xl text-gray-400 mb-3"></i>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Seleccione un aula</h3>
                        <p class="text-gray-500 dark:text-gray-400 mt-1">Para visualizar y registrar las tardanzas del
                            día actual</p>
                    </div>

                    <!-- Listado de Estudiantes -->
                    <div v-else
                        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Estudiante
                                    </th>
                                    <th scope="col"
                                        class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Tardanza?
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-if="filteredStudents.length === 0">
                                    <td colspan="2"
                                        class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No se encontraron estudiantes
                                    </td>
                                </tr>
                                <tr v-for="estudiante in filteredStudents" :key="estudiante.estudiante_id"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 h-10 w-10 relative">
                                                <!-- User Avatar Initials -->
                                                <div
                                                    class="h-10 w-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                                                    {{ getInitials(estudiante.nombres_completos) }}
                                                </div>
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                                    {{ estudiante.nombres_completos }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        <button @click="toggleTardanza(estudiante)" :disabled="isToggling"
                                            class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-sm disabled:opacity-50"
                                            :class="estudiante.tiene_tardanza ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800' : 'text-gray-900 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'">
                                            <span
                                                class="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md flex items-center gap-2">
                                                <i class="fas"
                                                    :class="estudiante.tiene_tardanza ? 'fa-check-circle' : 'fa-plus-circle text-gray-500'"></i>
                                                <span v-if="estudiante.tiene_tardanza">Llegó Tarde</span>
                                                <span v-else>Registrar Tardanza</span>
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tab: Historial -->
                <div v-show="activeTab === 'historial'" class="space-y-6">
                    <div
                        class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <i class="fas fa-door-open mr-1"></i> Aula
                            </label>
                            <select v-model="historyFilters.aula_id"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                <option value="">Todas las aulas</option>
                                <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                                    {{ aula.grado_cardinal }} {{ aula.seccion }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <i class="fas fa-calendar mr-1"></i> Fecha Inicio
                            </label>
                            <input type="date" v-model="historyFilters.fecha_inicio"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <i class="fas fa-calendar mr-1"></i> Fecha Fin
                            </label>
                            <input type="date" v-model="historyFilters.fecha_fin"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div class="flex items-end">
                            <button @click="loadHistory(1)" :disabled="isHistoryLoading"
                                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <i class="fas fa-filter mr-2"></i>
                                Filtrar Resultados
                            </button>
                        </div>
                    </div>

                    <div v-if="isHistoryLoading" class="flex justify-center items-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                    </div>

                    <div v-else
                        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Fecha
                                    </th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Estudiante
                                    </th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Aula
                                    </th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        Registrado Por
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-if="historyData.data.length === 0">
                                    <td colspan="4"
                                        class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No se encontraron registros de tardanzas con los filtros aplicados.
                                    </td>
                                </tr>
                                <tr v-for="record in historyData.data" :key="record.id"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                        {{ record.fecha_formateada || formatDate(record.fecha) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ record.estudiante?.apellidos }}, {{ record.estudiante?.nombres }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {{ record.aula ? `${record.aula.grado_cardinal} ${record.aula.seccion}` : 'N/A'
                                        }}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-xs">
                                        {{ record.registrador?.personal?.nombres || record.registrador?.name ||
                                        'Sistema' }} {{ record.registrador?.personal?.apellidos || '' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        <div v-if="historyData.last_page > 1"
                            class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                            <!-- Pagination Implementation omitted for brevity, but standardized Vue pagination here -->
                            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p class="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando <span class="font-medium">{{ historyData.from }}</span> a <span
                                            class="font-medium">{{ historyData.to }}</span> de <span
                                            class="font-medium">{{ historyData.total }}</span> resultados
                                    </p>
                                </div>
                                <div>
                                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination">
                                        <button @click="loadHistory(historyData.current_page - 1)"
                                            :disabled="historyData.current_page === 1"
                                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                                            <span class="sr-only">Anterior</span>
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                        <button @click="loadHistory(historyData.current_page + 1)"
                                            :disabled="historyData.current_page === historyData.last_page"
                                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                                            <span class="sr-only">Siguiente</span>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

definePageMeta({
    layout: 'default',
    middleware: 'auth',
    // Requiere roles específicos
})

const activeTab = ref('registro')

// Common data
const aulas = ref([])

// Registro del día
const selectedAula = ref('')
const searchQuery = ref('')
const studentsRecord = ref([])
const isLoading = ref(false)
const isToggling = ref(false)

const filteredStudents = computed(() => {
    if (!searchQuery.value) return studentsRecord.value
    const query = searchQuery.value.toLowerCase()
    return studentsRecord.value.filter(s => s.nombres_completos.toLowerCase().includes(query))
})

// Historial
const isHistoryLoading = ref(false)
const historyFilters = ref({
    aula_id: '',
    fecha_inicio: '',
    fecha_fin: ''
})
const historyData = ref({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
})

// Funciones
const loadAulas = async () => {
    try {
        const response = await api.get('/api/aulas')
        aulas.value = response.data || response // Adapt to actual response format
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error cargando las aulas',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        })
    }
}

const loadRegistro = async () => {
    if (!selectedAula.value) return
    isLoading.value = true
    try {
        // Enviar la fecha actual en formato YYYY-MM-DD local
        const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
        const res = await api.get(`/api/psychology/tardiness`, {
            params: { aula_id: selectedAula.value, fecha: today }
        })
        if (res.success) {
            studentsRecord.value = res.data
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error cargando los estudiantes para el registro',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        })
    } finally {
        isLoading.value = false
    }
}

const toggleTardanza = async (estudiante) => {
    isToggling.value = true
    try {
        const today = new Date().toLocaleDateString('en-CA')
        const payload = {
            estudiante_id: estudiante.estudiante_id,
            aula_id: selectedAula.value,
            fecha: today
        }

        const res = await api.post(`/api/psychology/tardiness/toggle`, payload)

        if (res.success) {
            // Update local state instead of full reload for snappy UI
            estudiante.tiene_tardanza = !estudiante.tiene_tardanza

            if (res.action === 'added') {
                Swal.fire({
                    icon: 'success',
                    title: `Tardanza marcada para ${estudiante.nombres_completos}`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                })
            } else {
                Swal.fire({
                    icon: 'info',
                    title: `Tardanza removida de ${estudiante.nombres_completos}`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                })
            }
        }
    } catch (error) {
        const msg = error.response?.data?.message || 'Error al procesar la tardanza'
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        })
        // Recargar en caso de desincronización
        loadRegistro()
    } finally {
        isToggling.value = false
    }
}

const loadHistory = async (page = 1) => {
    isHistoryLoading.value = true
    try {
        const params = {
            page,
            per_page: 25,
            ...historyFilters.value
        }

        const res = await api.get('/api/psychology/tardiness/history', { params })
        if (res.success) {
            historyData.value = res.data
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error cargando el historial de tardanzas',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        })
    } finally {
        isHistoryLoading.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
        // Asume YYYY-MM-DD desde el backend, convertir a local timezone para display
        const [year, month, day] = dateString.split('-')
        const date = new Date(year, month - 1, day)
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    } catch (e) {
        return dateString
    }
}

const getInitials = (name) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

onMounted(() => {
    loadAulas()
    // Pre-cargar historial inicial
    loadHistory()
})
</script>
