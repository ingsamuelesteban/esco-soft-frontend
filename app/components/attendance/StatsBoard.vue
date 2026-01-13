<template>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
                <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
            </div>
            <div v-if="!attendanceTaken" class="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                Aún sin pasar lista
            </div>
            <div v-else class="flex items-center gap-3">
                <button @click="handlePrint" :disabled="isPrinting"
                    class="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Imprimir Reporte">
                    <PrinterIcon v-if="!isPrinting" class="h-5 w-5" />
                    <svg v-else class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </button>
                <button @click="handleExport" :disabled="isExporting"
                    class="p-1 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Exportar a Excel">
                    <TableCellsIcon v-if="!isExporting" class="h-5 w-5" />
                    <svg v-else class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </button>
                <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Asistencia Tomada
                </div>
            </div>
        </div>

        <div v-if="attendanceTaken" class="p-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <!-- Presentes -->
                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Presentes</h4>
                    <div class="mt-2 flex item-baseline">
                        <span class="text-2xl font-bold text-gray-900">{{ stats?.presente?.total || 0 }}</span>
                        <span class="ml-2 text-xs text-gray-500" v-if="(stats?.total_registrados || 0) > 0">
                            ({{ calculatePercentage(stats?.presente?.total || 0, stats?.total_registrados || 0) }}%)
                        </span>
                    </div>
                    <div class="mt-2 flex gap-4 text-xs text-gray-600">
                        <div><span class="font-semibold">{{ stats?.presente?.masculino || 0 }}</span> Masc</div>
                        <div><span class="font-semibold">{{ stats?.presente?.femenino || 0 }}</span> Fem</div>
                    </div>
                </div>

                <!-- Ausentes -->
                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                    <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ausentes</h4>
                    <div class="mt-2 flex item-baseline">
                        <span class="text-2xl font-bold text-gray-900">{{ stats?.ausente?.total || 0 }}</span>
                        <span class="ml-2 text-xs text-gray-500" v-if="(stats?.total_registrados || 0) > 0">
                            ({{ calculatePercentage(stats?.ausente?.total || 0, stats?.total_registrados || 0) }}%)
                        </span>
                    </div>
                    <div class="mt-2 flex gap-4 text-xs text-gray-600">
                        <div><span class="font-semibold">{{ stats?.ausente?.masculino || 0 }}</span> Masc</div>
                        <div><span class="font-semibold">{{ stats?.ausente?.femenino || 0 }}</span> Fem</div>
                    </div>
                </div>

                <!-- Otros -->
                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Excusas / Tardanzas</h4>
                    <div class="mt-2 flex item-baseline gap-4">
                        <div>
                            <span class="text-2xl font-bold text-gray-900">{{ stats?.excusa?.total || 0 }}</span>
                            <span class="text-xs text-gray-500 ml-1">Exc</span>
                        </div>
                        <div>
                            <span class="text-2xl font-bold text-gray-900">{{ stats?.tardanza?.total || 0 }}</span>
                            <span class="text-xs text-gray-500 ml-1">Tard</span>
                        </div>
                    </div>
                    <div class="mt-2 flex gap-4 text-xs text-gray-600">
                        <!-- Sum M and Sum F for others if needed, or breakdown per type if preferred. For simplicity showing totals or omitted if complex -->
                        <!-- The user requested breakdown for Excuses and Tardiness too. -->
                        <div class="flex flex-col">
                            <div class="flex gap-2">
                                <span class="text-[10px] text-gray-500">Exc:</span>
                                <span>{{ stats?.excusa?.masculino || 0 }} M</span>
                                <span>{{ stats?.excusa?.femenino || 0 }} F</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="text-[10px] text-gray-500">Tard:</span>
                                <span>{{ stats?.tardanza?.masculino || 0 }} M</span>
                                <span>{{ stats?.tardanza?.femenino || 0 }} F</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Retirados -->
                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
                    <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Retirados</h4>
                    <div class="mt-2 flex item-baseline">
                        <span class="text-2xl font-bold text-gray-900">{{ stats?.retirado?.total || 0 }}</span>
                        <span class="ml-2 text-xs text-gray-500" v-if="(stats?.total_registrados || 0) > 0">
                            ({{ calculatePercentage(stats?.retirado?.total || 0, stats?.total_registrados || 0) }}%)
                        </span>
                    </div>
                    <div class="mt-2 flex gap-4 text-xs text-gray-600">
                        <div><span class="font-semibold">{{ stats?.retirado?.masculino || 0 }}</span> Masc</div>
                        <div><span class="font-semibold">{{ stats?.retirado?.femenino || 0 }}</span> Fem</div>
                    </div>
                </div>
            </div>

            <!-- Detailed Lists -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Pass isGlobal prop derived from title (a bit hacky but effective given context) or check props.stats structure -->
                <!-- Better: check if we are in global summary mode -->
                <StudentListCard title="Ausentes" :students="stats?.ausente?.estudiantes || []"
                    headerColor="bg-red-50 text-red-800" emptyText="Sin ausencias"
                    :isGlobal="title === 'Resumen General'" />

                <StudentListCard title="Excusas" :students="stats?.excusa?.estudiantes || []"
                    headerColor="bg-yellow-50 text-yellow-800" emptyText="Sin excusas"
                    :isGlobal="title === 'Resumen General'" />

                <StudentListCard title="Tardanzas" :students="stats?.tardanza?.estudiantes || []"
                    headerColor="bg-orange-50 text-orange-800" emptyText="Sin tardanzas"
                    :isGlobal="title === 'Resumen General'" />

                <StudentListCard title="Retirados" :students="stats?.retirado?.estudiantes || []"
                    headerColor="bg-gray-100 text-gray-800" emptyText="Sin retirados"
                    :isGlobal="title === 'Resumen General'" />
            </div>
        </div>

        <div v-else class="p-8 text-center text-gray-500 italic">
            Aún sin pasar lista
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PrinterIcon, TableCellsIcon } from '@heroicons/vue/24/outline'
import StudentListCard from './StudentListCard.vue'
import { api } from '~/utils/api'
import printJS from 'print-js'

const props = defineProps<{
    title: string
    subtitle?: string
    stats: any
    attendanceTaken?: boolean
    assignmentId?: number // Added for API call
    date?: string        // Added for API call
}>()

const isPrinting = ref(false)
const isExporting = ref(false)

const calculatePercentage = (count: number, total: number) => {
    if (!total) return 0
    return Math.round((count / total) * 100)
}

const handlePrint = async () => {
    // If stats are provided directly (global summary), we can't print detailed report for "assignment"
    // BUT if we have a date and it IS the global summary (no assignmentId), we can print the Global Daily Report
    const isGlobalSummary = !props.assignmentId && props.stats && props.title === 'Resumen General'

    if (!isGlobalSummary && (!props.assignmentId || !props.date)) return
    if (isGlobalSummary && !props.date) return

    isPrinting.value = true
    try {
        let blob;

        if (isGlobalSummary) {
            // Print Global Daily Report
            blob = await api.getBlob('/api/attendance/report/daily', {
                params: {
                    fecha: props.date,
                    aula_id: 'all_summary' // Special flag for global summary
                }
            })
        } else {
            // Print Single Assignment Report
            blob = await api.getBlob('/api/attendance/report/assignment', {
                params: {
                    fecha: props.date,
                    assignment_id: props.assignmentId
                }
            })
        }

        const url = URL.createObjectURL(blob)
        printJS({
            printable: url,
            type: 'pdf',
            showModal: true,
            onPrintDialogClose: () => URL.revokeObjectURL(url)
        })

    } catch (e: any) {
        console.error('Error printing:', e)
        alert('Error al imprimir: ' + (e.message || e))
    } finally {
        isPrinting.value = false
    }
}

const handleExport = async () => {
    if (!props.assignmentId || !props.date) return

    isExporting.value = true
    try {
        const response = await api.get('/api/attendance/report/assignment/excel', {
            params: {
                fecha: props.date,
                assignment_id: props.assignmentId
            }
        })

        if (response && response.url) {
            window.open(response.url, '_blank')
        } else {
            console.error('No URL returned for excel export', response)
            alert('Error: No se pudo generar la URL de descarga.')
        }

    } catch (e: any) {
        console.error('Error exporting excel:', e)
        alert('Error al exportar: ' + (e.message || e))
    } finally {
        isExporting.value = false
    }
}
</script>
