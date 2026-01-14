<template>
    <div class="space-y-8">
        <!-- Header & Filters -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex flex-col gap-6">
                <!-- Top Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button @click="navigateTo('/asistencia')" class="text-gray-400 hover:text-gray-600">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Estadísticas de Asistencia</h1>
                            <p class="text-sm text-gray-600 mt-0.5">
                                {{ selectedAulaName }} <span v-if="selectedAulaName">•</span> {{ viewModeLabel }}
                            </p>
                        </div>
                    </div>

                    <!-- View Mode Toggle -->
                    <div class="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                        <button @click="viewMode = 'daily'" class="px-3 py-1.5 rounded-md transition-colors"
                            :class="viewMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'">
                            Vista Diaria
                        </button>
                        <button @click="viewMode = 'monthly'" class="px-3 py-1.5 rounded-md transition-colors"
                            :class="viewMode === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'">
                            Vista Mensual
                        </button>
                    </div>
                </div>

                <!-- Filters Row -->
                <div class="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">

                    <!-- Aula Selector -->
                    <div class="w-full sm:w-64">
                        <label class="block text-xs font-bold text-gray-700 mb-1">Aula / Asignatura</label>
                        <select v-model="filters.aulaId"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white">
                            <option :value="null">Seleccionar...</option>
                            <!-- Removed redundant option here, handled by aulaOptions -->
                            <option v-for="opt in aulaOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Daily Filters -->
                    <div v-if="viewMode === 'daily'" class="w-full sm:w-48">
                        <label class="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                        <input v-model="filters.date" type="date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>

                    <!-- Monthly Filters -->
                    <template v-else>
                        <div class="w-full sm:w-40">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Mes</label>
                            <select v-model="filters.month"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
                            </select>
                        </div>
                        <div class="w-24">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Año</label>
                            <input v-model="filters.year" type="number" min="2020" max="2100"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>

                        <!-- Assignment Filter (Available for both Admin and Teacher) -->
                        <div v-if="filters.aulaId && filters.aulaId !== 'all'" class="w-full sm:w-64">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Asignatura</label>
                            <select v-model="filters.assignmentId"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                :disabled="loadingAssignments">
                                <option :value="null" disabled>Seleccione materia...</option>
                                <option v-for="opt in assignmentOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </option>
                            </select>
                        </div>
                    </template>

                    <!-- Actions -->
                    <div class="flex gap-2 ml-auto">
                        <!-- Print/Export Buttons (Disabled contextually) -->
                        <button v-if="viewMode === 'daily'" @click="printGlobal"
                            :disabled="!canPrintDaily || isPrintingGlobal"
                            class="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <PrinterIcon v-if="!isPrintingGlobal" class="h-5 w-5 text-gray-500" />
                            <svg v-else class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </button>

                        <button v-if="viewMode === 'monthly'" @click="printMonthly"
                            :disabled="isPrintingMonthly || !monthlyStats || !monthlyStats.students || monthlyStats.students.length === 0"
                            class="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <PrinterIcon v-if="!isPrintingMonthly" class="h-5 w-5 text-gray-500" />
                            <svg v-else class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            <span class="hidden sm:inline">Imprimir Reporte</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <svg class="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
            </svg>
            <div>
                <h3 class="text-sm font-bold text-red-800">Error al cargar datos</h3>
                <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center p-12">
            <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <!-- CONTENT: DAILY VIEW -->
        <template v-else-if="viewMode === 'daily'">
            <div v-if="stats && (stats.asignaturas?.length > 0 || stats.global_summary)" class="space-y-8">
                <!-- Global Summary Header -->
                <div v-if="stats.global_summary">
                    <StatsBoard title="Resumen General" subtitle="Consolidado de todas las aulas"
                        :stats="stats.global_summary" :attendanceTaken="true" :date="filters.date" />
                </div>

                <div v-for="subject in stats.asignaturas" :key="subject.assignment_id">
                    <StatsBoard
                        :title="subject.aula_nombre ? `${subject.aula_nombre} - ${subject.materia}` : subject.materia"
                        :subtitle="`${subject.horario} • Prof. ${subject.profesor}`" :stats="subject.stats"
                        :attendanceTaken="subject.attendance_taken" :assignmentId="subject.assignment_id"
                        :date="filters.date" />
                </div>
            </div>
            <div v-else-if="stats"
                class="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                No se encontraron registros diarios para esta selección.
            </div>
        </template>

        <!-- CONTENT: MONTHLY VIEW -->
        <template v-else-if="viewMode === 'monthly'">
            <div v-if="monthlyStats" class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-2 py-3 text-center font-bold text-gray-700 bg-gray-50 border-r border-gray-200 min-w-[40px]">
                                    No.
                                </th>
                                <th
                                    class="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 sticky left-0 z-10 border-r border-gray-200 min-w-[200px]">
                                    Estudiante
                                </th>
                                <th v-for="day in (monthlyStats.dates || [])" :key="day"
                                    class="px-1 py-3 text-center font-semibold text-gray-500 min-w-[32px]">
                                    {{ day }}
                                </th>
                                <th class="px-3 py-3 text-center font-bold text-gray-700 border-l border-gray-200">Total
                                    ({{ monthlyStats.dates ? monthlyStats.dates.length : 0 }})
                                </th>
                                <th class="px-3 py-3 text-center font-bold text-gray-700 border-l border-gray-200">%
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="student in (monthlyStats.students || [])" :key="student.id"
                                class="hover:bg-gray-50">
                                <td class="px-2 py-2 text-center text-gray-700 bg-white border-r border-gray-200">
                                    {{ student.numero_orden }}
                                </td>
                                <td class="px-4 py-2 font-medium text-gray-900 sticky left-0 z-10 bg-white border-r border-gray-200"
                                    :class="{ 'bg-gray-50': false /* hover effect handled by tr? sticky makes it tricky */ }">
                                    <div class="truncate max-w-[200px]" :title="student.name">
                                        {{ student.name }}
                                    </div>
                                </td>
                                <td v-for="day in (monthlyStats.dates || [])" :key="day" class="px-1 py-2 text-center">
                                    <span v-if="student.attendance[day]"
                                        class="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                                        :class="getStatusClass(student.attendance[day])">
                                        {{ student.attendance[day] }}
                                    </span>
                                    <span v-else class="text-gray-200">-</span>
                                </td>
                                <td
                                    class="px-3 py-2 text-center font-bold text-gray-800 border-l border-gray-200 bg-gray-50/50">
                                    {{ student.stats.effective_days }}
                                </td>
                                <td class="px-3 py-2 text-center font-bold border-l border-gray-200 bg-gray-50/50"
                                    :class="student.estado === 'retirado' ? '' : getPercentClass(student.stats.percentage)">
                                    <span v-if="student.estado === 'retirado'"
                                        class="inline-block text-[10px] font-medium px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">
                                        Retirado
                                    </span>
                                    <span v-else>{{ student.stats.percentage }}%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-if="!monthlyStats.students || monthlyStats.students.length === 0"
                    class="p-8 text-center text-gray-500">
                    No hay datos para mostrar en este rango.
                </div>
                <!-- Legend -->
                <div class="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
                    <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span>
                        <strong>P</strong>resente
                    </div>
                    <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span>
                        <strong>A</strong>usente (1 Pen.)
                    </div>
                    <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <strong>T</strong>ardanza (3 = 1 A)
                    </div>
                    <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <strong>E</strong>xcusa (3 = 1 A)
                    </div>
                </div>
            </div>
            <div v-else-if="!loading" class="text-center p-12 text-gray-500">Selecciona un aula o asignatura para ver el
                reporte mensual.</div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useAulasStore } from '~/stores/aulas'
import { useAuthStore } from '~/stores/auth'
import { api } from '~/utils/api'
import StatsBoard from '~/components/attendance/StatsBoard.vue'
import { PrinterIcon, TableCellsIcon } from '@heroicons/vue/24/outline'
import printJS from 'print-js'
import { isWeekend } from '~/utils/dateValidation'
import Swal from 'sweetalert2'

const aulasStore = useAulasStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref('')
const stats = ref<any>(null) // Daily stats
const monthlyStats = ref<any>(null) // Monthly stats
const isPrintingGlobal = ref(false)
const isPrintingMonthly = ref(false)
const assignments = ref<any[]>([])
const loadingAssignments = ref(false)

// View Mode
const viewMode = ref<'daily' | 'monthly'>('daily')

// Filters
const filters = reactive({
    date: (() => {
        const d = new Date()
        const day = d.getDay()
        if (day === 6) d.setDate(d.getDate() - 1)
        else if (day === 0) d.setDate(d.getDate() - 2)
        return d.toLocaleDateString('en-CA')
    })(),
    aulaId: null as number | string | null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    assignmentId: null as number | null
})

// Constants
const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Computed checks
const isAdminOrMaster = computed(() => {
    return ['admin', 'master'].includes(authStore.user?.role || '')
})

const selectedAulaName = computed(() => {
    if (!filters.aulaId) return 'Seleccionar Aula'
    const opt = aulaOptions.value.find(o => o.value == filters.aulaId)
    return opt ? opt.label : 'Aula'
})

const viewModeLabel = computed(() => viewMode.value === 'daily' ? 'Diario' : 'Mensual')

const canPrintDaily = computed(() => {
    if (!filters.date) return false
    if (filters.aulaId === 'all') return true
    return !!(filters.aulaId && stats.value)
})

// Options for Aula Select
const aulaOptions = computed(() => {
    const opts = aulasStore.paraSelect
    if (isAdminOrMaster.value) {
        return [
            { value: 'all_summary', label: 'Todas las Aulas (Resumen)' },
            { value: 'all', label: 'Todas las Aulas (Detalle)' },
            ...opts
        ]
    }
    return opts
})

// Computed Assignments for Select
const assignmentOptions = computed(() => {
    return assignments.value.map(a => ({
        value: a.id,
        label: a.materia?.nombre || 'Sin Nombre'
    }))
})

// Helper Classes
const getStatusClass = (code: string) => {
    switch (code) {
        case 'P': return 'bg-green-100 text-green-700'
        case 'A': return 'bg-red-100 text-red-700'
        case 'T': return 'bg-yellow-100 text-yellow-700'
        case 'E': return 'bg-blue-100 text-blue-700'
        default: return 'bg-gray-100'
    }
}

const getPercentClass = (pct: number) => {
    if (pct >= 90) return 'text-green-600'
    if (pct >= 75) return 'text-yellow-600'
    return 'text-red-600'
}

// Methods
const fetchAssignments = async (aulaId: number | string) => {
    if (!aulaId || aulaId === 'all' || aulaId === 'all_summary') {
        assignments.value = []
        return
    }

    loadingAssignments.value = true
    try {
        // Use 'only_active' to match controller logic
        let url = `/api/class-assignments?aula_id=${aulaId}&only_active=true`

        // Filter by professor if not admin
        if (!isAdminOrMaster.value && authStore.user?.personal_id) {
            url += `&profesor_id=${authStore.user.personal_id}`
        }

        const res = await api.get(url)
        // Handle pagination response (res.data for array, or res.data.data if paginated)
        // In calificaciones: assignmentsResponse.data?.data || assignmentsResponse.data || []
        // Assuming api.get returns the body directly:
        const rawData = res.data || res
        assignments.value = Array.isArray(rawData) ? rawData : (rawData.data || [])

        // Auto-select first if available (since we removed 'All' option)
        // UPDATE: Only auto-select for Monthly view, or if wanted. 
        // For Daily view, we want 'Todas' by default (null).
        if (assignments.value.length > 0 && viewMode.value === 'monthly') {
            filters.assignmentId = assignments.value[0].id
        }
    } catch (e) {
        console.error("Error loading assignments", e)
        assignments.value = []
    } finally {
        loadingAssignments.value = false
    }
}

const fetchStats = async () => {
    if (!filters.aulaId) return
    if (viewMode.value === 'daily' && !filters.date) return

    // For Monthly view, we prefer an assignment strictly
    // But if admin selects 'all', maybe global?
    // Let's enforce single assignment for Monthly View for clarity unless Admin 'all'.

    loading.value = true
    error.value = ''
    stats.value = null
    monthlyStats.value = null

    try {
        if (viewMode.value === 'daily') {
            const response = await api.get('/api/attendance/statistics', {
                params: {
                    fecha: filters.date,
                    aula_id: filters.aulaId,
                    // If filtering by specific assignment in daily view?
                    // The backend `statistics` endpoint accepts `assignment_id`?
                    // Let's check backend. Yes, but logic implies it returns array of subjects.
                    // If we pass assignment_id, checking backend...
                    // Backend `statistics` doesn't seem to use `assignment_id` param explicitly
                    // to FILTER the loop in `aulaId != all` mode.
                    // It iterates all `horario`.
                    // Ideally we should pass it if we want to filter.
                    // We can pass it and let backend handle or filter client side.
                    // Let's stick to current backend behavior for Daily.
                    // UPDATE: Filter client side if assignment selected
                }
            })
            // If we have an assignment selected, filter the result client-side for Daily View
            if (filters.assignmentId && response.asignaturas) {
                response.asignaturas = response.asignaturas.filter((s: any) => s.assignment_id === filters.assignmentId)
            }
            stats.value = response
        } else {
            // Monthly
            // Must have assignment_id usually
            let targetAssignment = filters.assignmentId

            // If teacher and no assignment selected but list has 1, auto-selected above.
            // If list has multiple and none selected, user must select.

            // If Admin and 'all' assignments, pass null?

            const response = await api.get('/api/attendance/monthly-statistics', {
                params: {
                    aula_id: filters.aulaId,
                    month: filters.month,
                    year: filters.year,
                    assignment_id: targetAssignment
                }
            })
            monthlyStats.value = response
        }
    } catch (e: any) {
        console.error('Error fetching statistics:', e)
        error.value = 'No se pudieron cargar los datos.'
    } finally {
        loading.value = false
    }
}

const printGlobal = async () => {
    if (!filters.date || !filters.aulaId) return
    isPrintingGlobal.value = true
    try {
        // Force full report from main button
        let aulaParam = filters.aulaId
        if (aulaParam === 'all_summary') {
            aulaParam = 'all'
        }

        const blob = await api.getBlob('/api/attendance/report/daily', {
            params: {
                fecha: filters.date,
                aula_id: aulaParam
            }
        })

        const url = URL.createObjectURL(blob)
        printJS({
            printable: url,
            type: 'pdf',
            showModal: true,
            onPrintDialogClose: () => URL.revokeObjectURL(url)
        })
    } catch (e: any) {
        console.error('Error printing global:', e)
    } finally {
        isPrintingGlobal.value = false
    }
}

const printMonthly = async () => {
    if (!filters.aulaId || !filters.month || !filters.year) return

    isPrintingMonthly.value = true
    try {
        const blob = await api.getBlob('/api/attendance/report/monthly', {
            params: {
                aula_id: filters.aulaId,
                assignment_id: filters.assignmentId,
                month: filters.month,
                year: filters.year
            }
        })

        if (blob.type === 'application/json') {
            const text = await blob.text()
            try {
                const json = JSON.parse(text)
                alert('Error: ' + (json.message || json.error || 'Unknown server error'))
            } catch (e) {
                alert('Error del servidor')
            }
            return
        }

        const url = URL.createObjectURL(blob)
        printJS({
            printable: url,
            type: 'pdf',
            showModal: true,
            onPrintDialogClose: () => URL.revokeObjectURL(url)
        })
    } catch (e: any) {
        console.error("Error printing monthly report", e)
        alert('Error al generar reporte')
    } finally {
        isPrintingMonthly.value = false
    }
}

// Watchers
watch(() => filters.date, (newDate, oldDate) => {
    if (newDate && isWeekend(newDate)) {
        Swal.fire({
            icon: 'warning',
            title: 'Fecha inválida',
            text: 'No se pueden seleccionar fines de semana porque no hay clases.',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        })
        filters.date = oldDate || ''
    }
})

watch(() => filters.aulaId, (newId) => {
    filters.assignmentId = null
    assignments.value = []
    if (newId && newId !== 'all' && newId !== 'all_summary') {
        fetchAssignments(newId)
    }
})

watch(() => [filters.date, filters.aulaId, viewMode, filters.month, filters.year, filters.assignmentId], () => {
    if (filters.aulaId) fetchStats()
}, { immediate: false })

// Init
onMounted(async () => {
    await aulasStore.fetchAll()
})
</script>

<style scoped>
/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
    height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>
