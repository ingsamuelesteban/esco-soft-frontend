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

        <!-- Casos Activos (Full Width) -->
        <div class="bg-white shadow-sm rounded-lg p-4 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActiveCaseList from '~/components/psychology/ActiveCaseList.vue'
import CaseDetail from '~/components/psychology/CaseDetail.vue'

useHead({
    title: 'Mis Casos - EscoSoft'
})

definePageMeta({
    layout: 'default',
    middleware: 'auth'
})

const activeCaseListRef = ref<any>(null)
const selectedCaseId = ref<number | null>(null)
const viewMode = ref<'list' | 'detail'>('list')
const caseFilter = ref<'open' | 'closed'>('open')

const handleCaseSelected = (caso: any) => {
    selectedCaseId.value = caso.id
    viewMode.value = 'detail'
}

const backToCaseList = () => {
    selectedCaseId.value = null
    viewMode.value = 'list'
    activeCaseListRef.value?.loadCases()
}
</script>
