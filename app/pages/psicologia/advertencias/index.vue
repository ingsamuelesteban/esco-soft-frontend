<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Advertencias</h1>
                    <p class="text-sm text-gray-600 mt-1">Supervisión y seguimiento de advertencias estudiantiles</p>
                </div>
                <div class="flex items-center space-x-4">
                    <select v-model="selectedAnioId" v-if="aniosStore.items.length > 0"
                        class="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                        <option :value="'all'">Todos los años</option>
                        <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
                            {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="bg-white shadow-sm rounded-lg p-4 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
            <div v-if="viewMode === 'list'">
                <div class="mb-4">
                    <h2 class="text-lg font-medium text-gray-900 pb-4">Listado de Advertencias</h2>

                    <!-- Filters -->
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-12 mb-6">
                        <div class="sm:col-span-4">
                            <label for="search" class="block text-sm font-medium text-gray-700">Buscar
                                Estudiante</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <input type="text" name="search" id="search" v-model="search"
                                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Nombre, apellido o cédula">
                            </div>
                        </div>

                        <div class="sm:col-span-4">
                            <label for="reported_by" class="block text-sm font-medium text-gray-700">Reportado
                                Por</label>
                            <select id="reported_by" name="reported_by" v-model="reportedBy"
                                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="">Todos los profesores</option>
                                <option v-for="reporter in warningsStore.reporters" :key="reporter.id"
                                    :value="reporter.id">
                                    {{ reporter.name }}
                                </option>
                            </select>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="date_from" class="block text-sm font-medium text-gray-700">Desde</label>
                            <div class="mt-1">
                                <input type="date" name="date_from" id="date_from" v-model="dateFrom"
                                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                            </div>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="date_to" class="block text-sm font-medium text-gray-700">Hasta</label>
                            <div class="mt-1">
                                <input type="date" name="date_to" id="date_to" v-model="dateTo"
                                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between mb-4 border-b border-gray-200">
                        <div class="flex space-x-4">
                            <!-- Status Filter -->
                            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                                <a href="#" @click.prevent="filter = 'open'"
                                    :class="[filter === 'open' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                    Abiertas
                                    <span v-if="warningsStore.counts.open > 0"
                                        class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
                                        {{ warningsStore.counts.open }}
                                    </span>
                                </a>
                                <a href="#" @click.prevent="filter = 'closed'"
                                    :class="[filter === 'closed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                    Historial (Cerradas)
                                    <span v-if="warningsStore.counts.closed > 0"
                                        class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {{ warningsStore.counts.closed }}
                                    </span>
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>

                <WarningList ref="warningListRef" @select="handleWarningSelected" :status="filter" :search="search"
                    :date-from="dateFrom" :date-to="dateTo" :anio-lectivo-id="selectedAnioId"
                    :reported-by="reportedBy ? String(reportedBy) : undefined" />
            </div>

            <WarningDetail v-else-if="viewMode === 'detail' && selectedWarningId" :warning-id="selectedWarningId"
                @back="backToList" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import WarningList from '~/components/warnings/WarningList.vue'
import WarningDetail from '~/components/warnings/WarningDetail.vue'
import { useStudentWarningsStore } from '~/stores/studentWarnings'
import { useAniosLectivosStore } from '~/stores/anios_lectivos'

useHead({
    title: 'Gestión de Advertencias - EscoSoft'
})

definePageMeta({
    layout: 'default',
    middleware: 'auth'
})

const warningsStore = useStudentWarningsStore()
const aniosStore = useAniosLectivosStore()
const warningListRef = ref<any>(null)
const selectedWarningId = ref<number | null>(null)
const viewMode = ref<'list' | 'detail'>('list')
const filter = ref<'open' | 'closed'>('open')

// Filters
const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const reportedBy = ref('')
const selectedAnioId = ref<number | string | undefined>(undefined)

onMounted(async () => {
    await aniosStore.fetchAll()
    if (aniosStore.activos.length > 0) {
        selectedAnioId.value = aniosStore.activos[0]?.id
    } else if (aniosStore.items.length > 0) {
        selectedAnioId.value = aniosStore.items[0]?.id
    }

    loadCounts()
    warningsStore.fetchReporters()
})

const loadCounts = () => {
    const params: any = {}
    if (selectedAnioId.value) {
        params.anio_lectivo_id = selectedAnioId.value
    } else {
        // If "All years" selected ('undefined'), we might want to pass 'all' string if backed expects it,
        // or undefined if we handled it in backend to mean "Current Active" (which we did).
        // Wait, backend logic: 
        // if (request->has('anio_lectivo_id')) { if !== 'all' ... } else { default active }
        // So if I send undefined (key missing), it defaults to Active.
        // If I want ALL years, I must send 'all'.
        // So let's make sure 'undefined' in selector means 'all' in param?
        // In my selector: <option :value="undefined">Todos los años</option>
        // If selectedAnioId is undefined, I should send 'all' to backend if I want ALL years.
        // But my backend logic says: if MISSING -> Active.
        // So to see ALL, I must send 'all'.
        params.anio_lectivo_id = 'all'
    }

    // Actually, let's look at my selector logic in `casos/index.vue`
    // I used :value="undefined". And in loadStats: if (selectedAnioId.value) params...
    // So if undefined, param is missing -> Backend defaults to Active.
    // So "Todos los años" actually shows "Active Year" in my previous implementation?
    // Let's correct this in both places if needed.
    // If user selects "Todos los años", they expect ALL years.
    // So I should send 'all'.

    warningsStore.fetchCounts(params)
}

const handleWarningSelected = (warning: any) => {
    selectedWarningId.value = warning.id
    viewMode.value = 'detail'
}

const backToList = () => {
    selectedWarningId.value = null
    viewMode.value = 'list'
    // Refresh list to show updates (e.g. if warning was closed)
    warningListRef.value?.loadWarnings()
    loadCounts()
}

watch(selectedAnioId, () => {
    loadCounts()
})
</script>
