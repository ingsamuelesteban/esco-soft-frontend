<template>
    <div class="space-y-8">
        <!-- Header & Filters -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <button @click="navigateTo('/asistencia')" class="text-gray-400 hover:text-gray-600">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 class="text-2xl font-bold text-gray-900">Estadísticas de Asistencia</h1>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                        {{ filters.date }} | {{ selectedAulaName }}
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 items-end">
                    <!-- Global Print Button -->
                    <button @click="printGlobal" :disabled="!isGlobalPrintEnabled || isPrintingGlobal"
                        class="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center gap-2 h-[38px]">
                        <PrinterIcon v-if="!isPrintingGlobal" class="h-5 w-5 text-gray-500" />
                        <svg v-else class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <span>Imprimir Todo</span>
                    </button>

                    <!-- Filtro Fecha -->
                    <div class="w-full sm:w-48">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                        <input v-model="filters.date" type="date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>

                    <!-- Filtro Aula -->
                    <div class="w-full sm:w-64">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Aula</label>
                        <select v-model="filters.aulaId"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            <option :value="null">Seleccionar aula...</option>
                            <option value="all">Todas las aulas</option>
                            <option v-for="aula in aulasStore.paraSelect" :key="aula.value" :value="aula.value">
                                {{ aula.label }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
                    <p class="text-sm text-red-700 mt-1">{{ error }}</p>
                </div>
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

        <!-- Content -->
        <template v-else-if="stats && filters.aulaId">

            <!-- Empty State for Results -->
            <div v-if="stats.asignaturas.length === 0"
                class="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900">No hay registros de asistencia</h3>
                <p class="text-sm text-gray-500 mt-1">No se encontraron clases registradas para esta fecha y aula.</p>
            </div>

            <!-- List of Subjects -->
            <div v-else class="space-y-8">
                <div v-for="subject in stats.asignaturas" :key="subject.assignment_id">
                    <StatsBoard 
                        :title="subject.aula_nombre ? `${subject.aula_nombre} - ${subject.materia}` : subject.materia"
                        :subtitle="`${subject.horario} • Prof. ${subject.profesor}`"
                        :stats="subject.stats" :attendanceTaken="subject.attendance_taken"
                        :assignmentId="subject.assignment_id" :date="filters.date" />
                </div>
            </div>

        </template>

        <!-- Empty State for Selection -->
        <div v-if="!filters.aulaId" class="bg-white shadow-sm rounded-lg p-12 text-center text-gray-500">
            Selecciona un aula para ver las estadísticas.
        </div>
    </div>
</template>

<script setup lang="ts">
// Imports
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useAulasStore } from '~/stores/aulas'
import { api } from '~/utils/api'
import StatsBoard from '~/components/attendance/StatsBoard.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import printJS from 'print-js'

// Stores
const aulasStore = useAulasStore()

// State
const loading = ref(false)
const error = ref('')
const stats = ref<any>(null)
const isPrintingGlobal = ref(false)

const filters = reactive({
    date: new Date().toLocaleDateString('en-CA'),
    aulaId: null as number | string | null
})

// Computed
const selectedAulaName = computed(() => {
    if (!filters.aulaId) return ''
    if (filters.aulaId === 'all') return 'Todas las aulas'
    const aula = aulasStore.paraSelect.find((a: any) => a.value === filters.aulaId)
    return aula ? aula.label : ''
})

const isGlobalPrintEnabled = computed(() => {
    if (!filters.date) return false
    // Enable if it's 'all' OR if it's a specific ID and we have stats
    if (filters.aulaId === 'all') return true
    return !!(filters.aulaId && stats.value)
})


// Methods
const printGlobal = async () => {
    if (!filters.date || !filters.aulaId) return
    isPrintingGlobal.value = true
    try {
        const blob = await api.getBlob('/api/attendance/report/daily', {
            params: {
                fecha: filters.date,
                aula_id: filters.aulaId
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

const fetchStats = async () => {
    if (!filters.date || !filters.aulaId) return

    loading.value = true
    error.value = ''
    stats.value = null

    try {
        const response = await api.get('/api/attendance/statistics', {
            params: {
                fecha: filters.date,
                aula_id: filters.aulaId
            }
        })
        stats.value = response
    } catch (e: any) {
        console.error('Error fetching statistics:', e)
        error.value = 'No se pudieron cargar los datos.'
    } finally {
        loading.value = false
    }
}

// Watchers
watch(() => [filters.date, filters.aulaId], () => {
    if (filters.aulaId) {
        fetchStats()
    } else {
        stats.value = null
    }
}, { immediate: true })

// Lifecycle
onMounted(() => {
    aulasStore.fetchAll()
})
</script>
