<template>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
                <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
            </div>
            <div v-if="!attendanceTaken" class="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                Sin Registro
            </div>
            <div v-else class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Asistencia Tomada
            </div>
        </div>

        <div v-if="attendanceTaken" class="p-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            </div>

            <!-- Detailed Lists -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StudentListCard title="Ausentes" :students="stats?.ausente?.estudiantes || []"
                    headerColor="bg-red-50 text-red-800" emptyText="Sin ausencias" />

                <StudentListCard title="Excusas" :students="stats?.excusa?.estudiantes || []"
                    headerColor="bg-yellow-50 text-yellow-800" emptyText="Sin excusas" />

                <StudentListCard title="Tardanzas" :students="stats?.tardanza?.estudiantes || []"
                    headerColor="bg-orange-50 text-orange-800" emptyText="Sin tardanzas" />
            </div>
        </div>

        <div v-else class="p-8 text-center text-gray-500 italic">
            No hay registros de asistencia para esta clase.
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StudentListCard from './StudentListCard.vue'

const props = defineProps<{
    title: string
    subtitle?: string
    stats: any
    attendanceTaken?: boolean
}>()

const calculatePercentage = (count: number, total: number) => {
    if (!total) return 0
    return Math.round((count / total) * 100)
}
</script>
