<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Departamento de Psicología</h1>
                    <p class="text-sm text-gray-600 mt-1">Gestión de Casos de Psicología</p>
                </div>
            </div>
        </div>

        <!-- Casos Activos (Full Width) -->
        <div class="bg-white shadow-sm rounded-lg p-4 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
            <div v-if="viewMode === 'list'">
                <div class="flex items-center justify-between mb-4 border-b border-gray-200">
                    <h2 class="text-lg font-medium text-gray-900 pb-2">Casos</h2>
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <a href="#" @click.prevent="caseFilter = 'open'"
                            :class="[caseFilter === 'open' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                            Activos <span v-if="stats"
                                class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">{{
                                    stats.summary.open_cases }}</span>
                        </a>
                        <a v-if="isPsychologist" href="#" @click.prevent="caseFilter = 'unified'"
                            :class="[caseFilter === 'unified' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                            Unificados <span v-if="unifiedStore.unifiedCases"
                                class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">{{
                                unifiedStore.unifiedCases.length }}</span>
                        </a>
                        <a href="#" @click.prevent="caseFilter = 'closed'"
                            :class="[caseFilter === 'closed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
                            Historial (Cerrados) <span v-if="stats"
                                class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{
                                    stats.summary.closed_cases }}</span>
                        </a>
                    </nav>
                </div>
                <ActiveCaseList v-if="caseFilter !== 'unified'" ref="activeCaseListRef" @select="handleCaseSelected"
                    @filter-change="handleFilterChange" :status="caseFilter" />
                <UnifiedCaseList v-else-if="caseFilter === 'unified'" @select="handleUnifiedCaseSelected" />
            </div>

            <CaseDetail v-if="viewMode === 'detail' && selectedCaseId" :case-id="selectedCaseId"
                @back="backToCaseList" />

            <UnifiedCaseDetail v-else-if="viewMode === 'detail' && selectedUnifiedCaseId"
                :case-id="selectedUnifiedCaseId" @back="backToCaseList" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ActiveCaseList from '~/components/psychology/ActiveCaseList.vue'
import CaseDetail from '~/components/psychology/CaseDetail.vue'
import UnifiedCaseList from '~/components/psychology/UnifiedCaseList.vue'
import UnifiedCaseDetail from '~/components/psychology/UnifiedCaseDetail.vue'
import { usePsychologyStore } from '~/stores/psychology'
import { useAuthStore } from '~/stores/auth'
import { useUnifiedCasesStore } from '~/stores/unified-cases'

useHead({
    title: 'Psicología - EscoSoft'
})

definePageMeta({
    layout: 'default',
})

const activeCaseListRef = ref<any>(null)
const selectedCaseId = ref<number | null>(null)
const selectedUnifiedCaseId = ref<number | null>(null)
const viewMode = ref<'list' | 'detail'>('list')
const caseFilter = ref<'open' | 'closed' | 'unified'>('open')
const store = usePsychologyStore()
const authStore = useAuthStore()
const unifiedStore = useUnifiedCasesStore()
const stats = ref<any>(null)

const isPsychologist = computed(() => {
    const role = authStore.user?.role?.toLowerCase() || ''
    return role === 'admin' || role === 'master' || role.includes('psic') || role.includes('orient')
})

const handleCaseSelected = (caso: any) => {
    selectedCaseId.value = caso.id
    selectedUnifiedCaseId.value = null
    viewMode.value = 'detail'
}

const handleUnifiedCaseSelected = (unifiedCase: any) => {
    selectedUnifiedCaseId.value = unifiedCase.id
    selectedCaseId.value = null
    viewMode.value = 'detail'
}

const handleFilterChange = (filter: any) => {
    loadStats(filter)
}

const backToCaseList = () => {
    selectedCaseId.value = null
    selectedUnifiedCaseId.value = null
    viewMode.value = 'list'
    activeCaseListRef.value?.loadCases()
}

const loadStats = async (assignedTo?: any) => {
    try {
        const params: any = {}
        if (assignedTo) {
            params.assigned_to = assignedTo
        }

        const res = await store.fetchStats(params)
        if (res && res.summary) {
            stats.value = res
        } else if (res && res.data && res.data.summary) {
            stats.value = res.data
        } else {
            // Fallback or log different structure
            stats.value = res
        }
    } catch (e) {
        console.error('Error loading stats', e)
    }
}

onMounted(() => {
    loadStats()
    if (isPsychologist.value) {
        unifiedStore.fetchUnifiedCases()
    }
})
</script>
