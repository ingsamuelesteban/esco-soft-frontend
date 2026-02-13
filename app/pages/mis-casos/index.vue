<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Mis Casos Reportados</h1>
                    <p class="text-sm text-gray-600 mt-1">Seguimiento de estudiantes reportados a Psicología</p>
                </div>
            </div>
        </div>

        <!-- Tabs: Casos vs Advertencias -->
        <div class="bg-white shadow-sm rounded-lg p-4 h-[calc(100vh-180px)] min-h-[600px)] flex flex-col">
            <!-- Main Tabs -->
            <div class="border-b border-gray-200 mb-4">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <a href="#" @click.prevent="mainTab = 'cases'"
                        :class="[mainTab === 'cases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                        Casos Psicológicos
                    </a>
                    <a href="#" @click.prevent="mainTab = 'warnings'"
                        :class="[mainTab === 'warnings' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                        Advertencias
                    </a>
                </nav>
            </div>

            <!-- Cases Tab Content -->
            <div v-if="mainTab === 'cases'" class="flex-1">
                <div v-if="viewMode === 'list'">
                    <div class="flex items-center justify-between mb-4 border-b border-gray-200">
                        <h2 class="text-lg font-medium text-gray-900 pb-2">Mis Casos</h2>
                        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                            <a href="#" @click.prevent="caseFilter = 'open'"
                                :class="[caseFilter === 'open' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                Activos
                            </a>
                            <a href="#" @click.prevent="caseFilter = 'closed'"
                                :class="[caseFilter === 'closed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                Historial (Cerrados)
                            </a>
                        </nav>
                    </div>
                    <!-- :reported-by-me="true" forces filter to show only cases reported by logged in user -->
                    <ActiveCaseList ref="activeCaseListRef" @select="handleCaseSelected" :status="caseFilter"
                        :reported-by-me="true" />
                </div>

                <!-- Detail View: Reusing same component but it will have restricted buttons based on role -->
                <CaseDetail v-else-if="viewMode === 'detail' && selectedCaseId" :case-id="selectedCaseId"
                    @back="backToCaseList" />
            </div>

            <!-- Warnings Tab Content -->
            <div v-if="mainTab === 'warnings'" class="flex-1">
                <div v-if="warningViewMode === 'list'">
                    <!-- Filters -->
                    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div class="sm:col-span-2">
                            <label for="search" class="block text-sm font-medium text-gray-700">Buscar
                                Estudiante</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <input type="text" name="search" id="search" v-model="warningSearch"
                                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Nombre, apellido o cédula">
                            </div>
                        </div>
                        <div>
                            <label for="date_from" class="block text-sm font-medium text-gray-700">Desde</label>
                            <div class="mt-1">
                                <input type="date" name="date_from" id="date_from" v-model="warningDateFrom"
                                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                            </div>
                        </div>
                        <div>
                            <label for="date_to" class="block text-sm font-medium text-gray-700">Hasta</label>
                            <div class="mt-1">
                                <input type="date" name="date_to" id="date_to" v-model="warningDateTo"
                                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between mb-4 border-b border-gray-200">
                        <h2 class="text-lg font-medium text-gray-900 pb-2">Mis Advertencias</h2>
                        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                            <a href="#" @click.prevent="warningFilter = 'open'"
                                :class="[warningFilter === 'open' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                Abiertas
                                <span v-if="warningsStore.counts.open > 0"
                                    class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
                                    {{ warningsStore.counts.open }}
                                </span>
                            </a>
                            <a href="#" @click.prevent="warningFilter = 'closed'"
                                :class="[warningFilter === 'closed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                                Cerradas
                                <span v-if="warningsStore.counts.closed > 0"
                                    class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    {{ warningsStore.counts.closed }}
                                </span>
                            </a>
                        </nav>
                    </div>
                    <WarningList ref="warningListRef" @select="handleWarningSelected" :status="warningFilter"
                        :search="warningSearch" :date-from="warningDateFrom" :date-to="warningDateTo"
                        :reported-by-me="true" />
                </div>

                <WarningDetail v-else-if="warningViewMode === 'detail' && selectedWarningId"
                    :warning-id="selectedWarningId" @back="backToWarningList" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ActiveCaseList from '~/components/psychology/ActiveCaseList.vue'
import CaseDetail from '~/components/psychology/CaseDetail.vue'
import WarningList from '~/components/warnings/WarningList.vue'
import WarningDetail from '~/components/warnings/WarningDetail.vue'
import { useStudentWarningsStore } from '~/stores/studentWarnings'

useHead({
    title: 'Mis Casos - EscoSoft'
})

definePageMeta({
    layout: 'default',
    middleware: 'auth'
})

const warningsStore = useStudentWarningsStore()

// Main tab selector
const mainTab = ref<'cases' | 'warnings'>('cases')

// Filters
const warningSearch = ref('')
const warningDateFrom = ref('')
const warningDateTo = ref('')

onMounted(() => {
    warningsStore.fetchCounts()
})

// Cases state
const activeCaseListRef = ref<any>(null)
const selectedCaseId = ref<number | null>(null)
const viewMode = ref<'list' | 'detail'>('list')
const caseFilter = ref<'open' | 'closed'>('open')

// Warnings state
const warningListRef = ref<any>(null)
const selectedWarningId = ref<number | null>(null)
const warningViewMode = ref<'list' | 'detail'>('list')
const warningFilter = ref<'open' | 'closed'>('open')

// Cases handlers
const handleCaseSelected = (caso: any) => {
    selectedCaseId.value = caso.id
    viewMode.value = 'detail'
}

const backToCaseList = () => {
    selectedCaseId.value = null
    viewMode.value = 'list'
    activeCaseListRef.value?.loadCases()
}

// Warnings handlers
const handleWarningSelected = (warning: any) => {
    selectedWarningId.value = warning.id
    warningViewMode.value = 'detail'
}

const backToWarningList = () => {
    selectedWarningId.value = null
    warningViewMode.value = 'list'
    warningListRef.value?.loadWarnings()
    warningsStore.fetchCounts()
}
</script>
