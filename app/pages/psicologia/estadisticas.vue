<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <h1 class="text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
            <p class="text-sm text-gray-600 mt-1">Resumen del rendimiento y actividad del departamento de psicología.
            </p>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="rounded-md bg-indigo-500 p-3">
                                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Casos</dt>
                                    <dd class="text-lg font-semibold text-gray-900">{{ stats.summary?.total_cases }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="rounded-md bg-green-500 p-3">
                                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Casos Activos</dt>
                                    <dd class="text-lg font-semibold text-gray-900">{{ stats.summary?.open_cases }}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="rounded-md bg-yellow-500 p-3">
                                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Referimientos Pendientes</dt>
                                    <dd class="text-lg font-semibold text-gray-900">{{ stats.summary?.pending_referrals
                                    }}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="rounded-md bg-gray-500 p-3">
                                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Referimientos</dt>
                                    <dd class="text-lg font-semibold text-gray-900">{{ stats.summary?.total_referrals }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Cases by Grade -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Casos por Grado (Top 5)</h3>
                    <div class="space-y-4">
                        <div v-for="(item, idx) in stats.by_grade" :key="idx">
                            <div class="flex items-center justify-between text-sm font-medium text-gray-600 mb-1">
                                <span>{{ item.curso }}</span>
                                <span>{{ item.total }} casos</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-indigo-600 h-2.5 rounded-full"
                                    :style="{ width: calculatePercentage(item.total, stats.summary?.total_cases) + '%' }">
                                </div>
                            </div>
                        </div>
                        <div v-if="stats.by_grade?.length === 0" class="text-center text-gray-500 py-4">No hay datos
                            suficientes.</div>
                    </div>
                </div>

                <!-- Cases by Category -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Casos por Categoría/Tipología</h3>
                    <div class="space-y-4">
                        <div v-for="(item, idx) in stats.by_category" :key="idx">
                            <div class="flex items-center justify-between text-sm font-medium text-gray-600 mb-1">
                                <div class="flex items-center">
                                    <span class="w-3 h-3 rounded-full mr-2"
                                        :style="{ backgroundColor: item.color }"></span>
                                    <span>{{ item.name }}</span>
                                </div>
                                <span>{{ item.total }}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="h-2.5 rounded-full"
                                    :style="{ width: calculatePercentage(item.total, stats.summary?.total_cases) + '%', backgroundColor: item.color }">
                                </div>
                            </div>
                        </div>
                        <div v-if="stats.by_category?.length === 0" class="text-center text-gray-500 py-4">No hay datos
                            suficientes.</div>
                    </div>
                </div>
            </div>

            <!-- Cases by Month (Simple Bar Chart Visualization with CSS) -->
            <div class="bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-medium leading-6 text-gray-900 mb-6">Tendencia de Casos (Últimos 6 meses)</h3>
                <div class="flex items-end space-x-4 h-48 sm:h-64" v-if="stats.by_month && stats.by_month.length > 0">
                    <div v-for="(item, idx) in stats.by_month" :key="idx"
                        class="flex-1 flex flex-col items-center group relative">
                        <div
                            class="absolute -top-8 text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {{ item.total }} casos
                        </div>
                        <div class="w-full bg-indigo-200 hover:bg-indigo-300 rounded-t-md transition-all duration-300"
                            :style="{ height: calculatePercentageOfMax(item.total) + '%' }"></div>
                        <div
                            class="mt-2 text-xs text-gray-600 transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center">
                            {{ monthLabel(item.month) }}</div>
                    </div>
                </div>
                <div v-else class="text-center text-gray-500 py-12">No hay datos históricos suficientes.</div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePsychologyStore } from '../../stores/psychology'

useHead({
    title: 'Estadísticas - Psicología'
})

definePageMeta({
    layout: 'default'
})

const store = usePsychologyStore()
const stats = ref<any>({})
const loading = ref(true)

const loadStats = async () => {
    loading.value = true
    const res = await store.fetchStats()
    stats.value = res || {}
    loading.value = false
}

const calculatePercentage = (value: number, total: number) => {
    if (!total) return 0
    return Math.min(Math.round((value / total) * 100), 100)
}

const calculatePercentageOfMax = (value: number) => {
    if (!stats.value.by_month) return 0
    const max = Math.max(...stats.value.by_month.map((m: any) => m.total))
    if (!max) return 0
    return Math.round((value / max) * 100)
}

const monthLabel = (yyyymm: string) => {
    if (!yyyymm) return ''
    const [year, month] = yyyymm.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
}

onMounted(() => {
    loadStats()
})
</script>
