<template>
    <div class="space-y-6">
        <!-- Breadcrumb / Header -->
        <div class="flex items-center gap-4">
            <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">Detalles de Solicitud #{{ request?.id }}</h1>
                <p class="text-sm text-gray-500">
                    {{ request?.personal?.nombre }} {{ request?.personal?.apellido }}
                </p>
            </div>
            <div class="ml-auto" v-if="request">
                <span :class="[
                    'px-3 py-1 text-sm font-semibold rounded-full',
                    getStatusClass(request.status)
                ]">
                    {{ getStatusLabel(request.status) }}
                </span>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="request" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Col 1: Main Details -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Solicitud Info -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Información de la Solicitud</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p class="text-sm text-gray-500">Tipo de Permiso</p>
                            <p class="font-medium text-gray-900 mt-1 capitalize">{{ getLeaveTypeName(request.leave_type)
                                }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Duración</p>
                            <p class="font-medium text-gray-900 mt-1">{{ getDurationDisplay(request) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Fecha Inicio</p>
                            <p class="font-medium text-gray-900 mt-1">{{ formatDate(request.start_date) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Fecha Fin</p>
                            <p class="font-medium text-gray-900 mt-1">{{ formatDate(request.end_date) }}</p>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p class="text-sm text-gray-500">Motivo</p>
                        <div class="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700">
                            {{ request.reason }}
                        </div>
                    </div>

                    <div v-if="request.attachment_path" class="mt-6">
                        <p class="text-sm text-gray-500 mb-2">Documento Adjunto (Empleado)</p>
                        <a :href="getFileUrl(request.attachment_path)" target="_blank"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Ver Adjunto
                        </a>
                    </div>

                    <div v-if="request.approval_attachment_path" class="mt-6">
                        <p class="text-sm text-gray-500 mb-2">Adjunto de Aprobación</p>
                        <a :href="getFileUrl(request.approval_attachment_path)" target="_blank"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Ver Adjunto de Aprobación
                        </a>
                    </div>
                </div>

                <!-- Firmas -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Firmas Digitales</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p class="text-sm text-gray-500 mb-2">Firma del Empleado</p>
                            <div class="border rounded-lg p-2 bg-white">
                                <img :src="request.employee_signature" alt="Firma Empleado" class="max-h-24 mx-auto"
                                    v-if="request.employee_signature" />
                                <p v-else class="text-center text-gray-400 py-4">Sin firma</p>
                            </div>
                            <p class="text-xs text-gray-400 mt-1 text-center" v-if="request.employee_signed_at">
                                Firmado el {{ formatDate(request.employee_signed_at) }}
                            </p>
                        </div>

                        <div v-if="request.status !== 'pendiente'">
                            <p class="text-sm text-gray-500 mb-2">Firma del Administrador ({{ request.status }})</p>
                            <div class="border rounded-lg p-2 bg-white">
                                <img :src="request.admin_signature" alt="Firma Admin" class="max-h-24 mx-auto"
                                    v-if="request.admin_signature" />
                                <p v-else class="text-center text-gray-400 py-4">Sin firma</p>
                            </div>
                            <p class="text-xs text-gray-400 mt-1 text-center" v-if="request.reviewed_at">
                                Revisado por {{ request.reviewer?.name }} el {{ formatDate(request.reviewed_at) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Col 2: Actions & Timeline -->
            <div class="space-y-6">
                <!-- Actions Box -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>

                    <div class="flex flex-col gap-3">
                        <button v-if="request.status === 'pendiente' && (authStore.isAdmin || authStore.isMaster)"
                            @click="showReviewModal = true"
                            class="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Revisar Solicitud
                        </button>

                        <button v-if="authStore.isAdmin || authStore.isMaster" @click="deleteRequest"
                            class="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar Solicitud
                        </button>

                        <button v-if="request.status === 'pendiente'" @click="cancelRequest"
                            class="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Cancelar Solicitud
                        </button>


                        <button @click="printRequest"
                            class="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </button>
                    </div>
                </div>

                <!-- Review Notes -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6" v-if="request.review_notes">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Notas de Revisión</h3>
                    <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ request.review_notes }}</p>
                </div>
            </div>
        </div>

        <!-- Review Modal -->
        <LeaveRequestReviewModal v-if="showReviewModal && request" :show="showReviewModal" :request="request"
            @close="showReviewModal = false" @reviewed="refresh" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '~/utils/api'
import printJS from 'print-js'
import { useLeaveRequestsStore } from '~/stores/leaveRequests'
import { useAuthStore } from '~/stores/auth'
import LeaveRequestReviewModal from '~/components/staff/LeaveRequestReviewModal.vue'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

definePageMeta({
    middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const store = useLeaveRequestsStore()
const authStore = useAuthStore()
const request = ref<any>(null)
const loading = ref(true)
const showReviewModal = ref(false)

onMounted(() => {
    refresh()
})

const refresh = async () => {
    loading.value = true
    try {
        const id = Number(route.params.id)
        if (id) {
            const res = await store.fetchOne(id)
            request.value = res
        }
    } catch (e) {
        console.error(e)
        router.push('/personal/permisos') // Redirigir si error
    } finally {
        loading.value = false
    }
}

const cancelRequest = async () => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "La solicitud será cancelada permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar'
    })

    if (result.isConfirmed) {
        try {
            await store.cancel(request.value.id)
            Swal.fire('Cancelado', 'La solicitud ha sido cancelada.', 'success')
            refresh()
        } catch (e) {
            Swal.fire('Error', 'No se pudo cancelar la solicitud.', 'error')
        }
    }
}

const printRequest = async () => {
    loading.value = true
    try {
        // Use api.getBlob to handle tenant prefix and auth headers automatically
        const res = await api.getBlob(`/api/staff/leave-requests/${request.value.id}/print`)
        // Force header type or just create new blob with correct type to ensure browser handles it as PDF
        const blob = new Blob([res], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(blob)

        printJS({
            printable: fileURL,
            type: 'pdf',
            showModal: true,
            modalMessage: 'Generando documento para impresión...'
        })
    } catch (e) {
        console.error('Error downloading PDF:', e)
        Swal.fire('Error', 'No se pudo generar el reporte', 'error')
    } finally {
        loading.value = false
    }
}

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY')

const config = useRuntimeConfig()

const getDurationDisplay = (req: any) => {
    if (req.leave_type === 'express' && req.start_time && req.end_time) {
        const startParts = req.start_time.split(':')
        const endParts = req.end_time.split(':')

        const start = parseInt(startParts[0] ?? '0') * 60 + parseInt(startParts[1] ?? '0')
        const end = parseInt(endParts[0] ?? '0') * 60 + parseInt(endParts[1] ?? '0')

        const diff = end - start
        const hours = Math.floor(diff / 60)
        const minutes = diff % 60
        let duration = ''
        if (hours > 0) duration += `${hours} hora${hours !== 1 ? 's' : ''}`
        if (minutes > 0) duration += ` ${minutes} min`
        return duration.trim()
    }
    return `${req.days_count} día${req.days_count !== 1 ? 's' : ''}`
}

const getLeaveTypeName = (type: string) => {
    const types: Record<string, string> = {
        vacaciones: 'Vacaciones',
        personal: 'Personal',
        medico: 'Médico',
        maternidad: 'Maternidad',
        paternidad: 'Paternidad',
        duelo: 'Duelo',
        express: 'Permiso Express',
        otro: 'Otro'
    }
    return types[type] || type
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pendiente: 'Pendiente',
        aprobado: 'Aprobado',
        rechazado: 'Rechazado',
        cancelado: 'Cancelado'
    }
    return labels[status] || status
}

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        aprobado: 'bg-green-100 text-green-800',
        rechazado: 'bg-red-100 text-red-800',
        cancelado: 'bg-gray-100 text-gray-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const getFileUrl = (path: string) => {
    if (!path) return '#'
    return `${config.public.apiBase}/storage/${path}`
}
</script>
