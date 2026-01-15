<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Departamento de Psicología</h1>
                    <p class="text-sm text-gray-600 mt-1">Gestión de Casos y Referimientos</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Columna Izquierda: Bandeja de Entrada (Referimientos Pendientes) -->
            <div class="lg:col-span-1 space-y-6">
                <div class="bg-white shadow-sm rounded-lg p-4">
                    <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                        <span>Bandeja de Entrada</span>
                        <span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            v-if="pendingReferrals.length">
                            {{ pendingReferrals.length }}
                        </span>
                    </h2>

                    <div v-if="loadingReferrals" class="text-center py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>

                    <div v-else-if="pendingReferrals.length === 0" class="text-center py-8 text-gray-500 text-sm">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No hay referimientos pendientes
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="referral in pendingReferrals" :key="referral.id"
                            class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            @click="openReferralPreview(referral)">
                            <div class="flex justify-between items-start mb-2">
                                <span :class="getPriorityClass(referral.priority)"
                                    class="px-2 py-0.5 text-xs rounded-full font-medium uppercase">
                                    {{ referral.priority === 'high' ? 'Alta' : (referral.priority === 'medium' ? 'Media'
                                        : 'Baja') }}
                                </span>
                                <span class="text-xs text-gray-400">{{ formatDate(referral.created_at) }}</span>
                            </div>
                            <h3 class="font-medium text-gray-900">{{ referral.student?.nombres }} {{
                                referral.student?.apellidos }}</h3>
                            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ referral.reason }}</p>
                            <div class="mt-2 flex items-center text-xs text-gray-500">
                                <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Ref por: {{ referral.reporter?.name || (referral.reporter?.nombres ?
                                    referral.reporter?.nombres + ' ' + referral.reporter?.apellidos : 'Desconocido') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Casos Activos (Expedientes) -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white shadow-sm rounded-lg p-4 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
                    <div v-if="viewMode === 'list'">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-medium text-gray-900">Casos Activos</h2>
                            <!-- TODO: Filter controls -->
                        </div>
                        <ActiveCaseList ref="activeCaseListRef" @select="handleCaseSelected" />
                    </div>

                    <CaseDetail v-else-if="viewMode === 'detail' && selectedCaseId" :case-id="selectedCaseId"
                        @back="backToCaseList" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePsychologyStore } from '~/stores/psychology'
import ActiveCaseList from '~/components/psychology/ActiveCaseList.vue'
import CaseDetail from '~/components/psychology/CaseDetail.vue'
import Swal from 'sweetalert2'

useHead({
    title: 'Psicología - EscoSoft'
})

definePageMeta({
    layout: 'default',
    // middleware: ['auth', 'role:psychologist'] 
})

const psychologyStore = usePsychologyStore()
const pendingReferrals = ref<any[]>([])
const loadingReferrals = ref(true)
const activeCaseListRef = ref<any>(null)
const selectedCaseId = ref<number | null>(null)
const viewMode = ref<'list' | 'detail'>('list')

const loadReferrals = async () => {
    loadingReferrals.value = true
    const res = await psychologyStore.fetchReferrals({ status: 'pending' })
    if (res.data) {
        pendingReferrals.value = res.data
    }
    loadingReferrals.value = false
}

// ... helper functions ...

const handleCaseSelected = (caso: any) => {
    selectedCaseId.value = caso.id
    viewMode.value = 'detail'
}

const backToCaseList = () => {
    selectedCaseId.value = null
    viewMode.value = 'list'
    // Reload cases to refresh last update time?
    activeCaseListRef.value?.loadCases()
}

const getPriorityClass = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-800'
        case 'medium': return 'bg-yellow-100 text-yellow-800'
        case 'low': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
}

const openReferralPreview = async (referral: any) => {
    const result = await Swal.fire({
        title: 'Referimiento Pendiente',
        html: `
            <div class="text-left bg-gray-50 p-4 rounded-md text-sm">
                <p><strong>Estudiante:</strong> ${referral.student?.nombres} ${referral.student?.apellidos}</p>
                <p><strong>Curso:</strong> ${referral.student?.aula ? (referral.student.aula.grado_cardinal + '° ' + referral.student.aula.seccion) : 'N/A'}</p>
                <p><strong>Reportado por:</strong> ${referral.reporter?.name || (referral.reporter?.nombres + ' ' + referral.reporter?.apellidos)}</p>
                <p><strong>Prioridad:</strong> <span class="uppercase font-bold">${referral.priority}</span></p>
                <hr class="my-2">
                <p><strong>Motivo:</strong></p>
                <p class="italic text-gray-700">${referral.reason}</p>
            </div>
            <p class="mt-4 text-sm">¿Desea aceptar este referimiento e iniciar un caso?</p>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sí, iniciar caso',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4f46e5',
        showDenyButton: true,
        denyButtonText: 'Rechazar/Cerrar',
    })

    if (result.isConfirmed) {
        handleAcceptReferral(referral)
    } else if (result.isDenied) {
        handleRejectReferral(referral)
    }
}

const handleAcceptReferral = async (referral: any) => {
    const { value: title } = await Swal.fire({
        title: 'Iniciar Caso',
        input: 'text',
        inputLabel: 'Título del Caso',
        inputValue: `Caso: ${referral.reason.substring(0, 30)}...`,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return 'El título es requerido'
        }
    })

    if (title) {
        const res = await psychologyStore.createCase({
            student_id: referral.student_id,
            referral_id: referral.id,
            title: title,
            initial_observation: `Caso iniciado a partir de referimiento: ${referral.reason}`
        })

        if (res.success) {
            Swal.fire('Caso Iniciado', 'El caso ha sido creado exitosamente.', 'success')
            loadReferrals()
            activeCaseListRef.value?.loadCases()
        } else {
            Swal.fire('Error', res.error || 'No se pudo crear el caso', 'error')
        }
    }
}

const handleRejectReferral = async (referral: any) => {
    const { value: reason } = await Swal.fire({
        title: 'Rechazar Referimiento',
        input: 'textarea',
        inputLabel: 'Motivo del rechazo',
        inputPlaceholder: 'Explique por qué se rechaza este referimiento...',
        inputAttributes: {
            'aria-label': 'Ingrese el motivo del rechazo'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar Rechazo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        inputValidator: (value) => {
            if (!value) {
                return 'Debe proporcionar un motivo para el rechazo'
            }
        }
    })

    if (reason) {
        const res = await psychologyStore.updateReferralStatus(referral.id, 'rejected', reason)
        if (res.success) {
            loadReferrals()
            Swal.fire('Referimiento Rechazado', 'El referimiento ha sido rechazado correctamente.', 'success')
        } else {
            Swal.fire('Error', res.error || 'No se pudo rechazar el referimiento', 'error')
        }
    }
}



onMounted(() => {
    loadReferrals()
})
</script>
