<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Revisar Solicitud de Permiso</h2>
                <button @click="close" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Info Resumen -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {{ request.personal?.nombre[0] }}{{ request.personal?.apellido[0] }}
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">{{ request.personal?.nombre }} {{
                                request.personal?.apellido }}</h3>
                            <p class="text-xs text-gray-500">{{ request.personal?.cedula }}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500 block">Tipo:</span>
                            <span class="font-medium text-gray-900">{{ request.leave_type }}</span>
                            <!-- TODO: Format name -->
                        </div>
                        <div>
                            <span class="text-gray-500 block">Duración:</span>
                            <span class="font-medium text-gray-900">{{ getDurationDisplay(request) }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-gray-500 block">Fechas:</span>
                            <span class="font-medium text-gray-900">{{ formatDate(request.start_date) }} - {{
                                formatDate(request.end_date) }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-gray-500 block">Motivo:</span>
                            <p class="text-gray-700 mt-1">{{ request.reason }}</p>
                        </div>
                    </div>
                    <!-- Attachments -->
                    <div class="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2">
                        <div v-if="request.attachment_path">
                            <span
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Evidencia
                                del Empleado</span>
                            <button @click="printFile(request.attachment_path)"
                                class="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors w-fit">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                Ver Documento Adjunto
                            </button>
                        </div>

                        <div v-if="request.approval_attachment_path">
                            <span
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Adjunto
                                de Aprobación</span>
                            <button @click="printFile(request.approval_attachment_path)"
                                class="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors w-fit">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver Documento de Aprobación
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Formulario de Revisión -->
                <form class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Notas de Revisión
                        </label>
                        <textarea v-model="form.review_notes" rows="3"
                            placeholder="Comentarios sobre la aprobación o rechazo..."
                            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>

                    <div>
                        <DropZone v-model="form.file" label="Evidencia Adjunta (Opcional)" accept="image/*,.pdf"
                            :max-size="10 * 1024 * 1024" />
                        <p class="text-xs text-gray-500 mt-1">Formatos: Imágenes o PDF. Máx 10MB.</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Firma del Administrador <span class="text-red-500">*</span>
                        </label>
                        <div v-if="usingStoredSignature" class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="bg-green-100 p-2 rounded-full">
                                    <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900">Firma Digital Cargada</p>
                                    <p class="text-xs text-gray-500">Se utilizará su firma registrada en el perfil</p>
                                </div>
                            </div>
                            <button type="button" @click="useManualSignature" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                Firmar manualmente
                            </button>
                        </div>
                        <div v-else>
                            <SignaturePad ref="signaturePadRef" @update="handleSignatureUpdate"
                                @change="handleSignatureChange" />
                            <div v-if="authStore.user?.digital_signature_path" class="mt-2 text-right">
                                <button type="button" @click="loadStoredSignature" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                    Usar firma guardada
                                </button>
                            </div>
                        </div>
                        <p v-if="signatureError" class="mt-1 text-sm text-red-600">La firma es obligatoria</p>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 justify-end">
                        <button type="button" @click="close"
                            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            Cancelar
                        </button>

                        <button v-if="authStore.isAdmin || authStore.isMaster" type="button" @click="deleteRequest"
                            :disabled="submitting"
                            class="px-4 py-2 text-white bg-red-800 hover:bg-red-900 rounded-lg transition-colors flex items-center justify-center mr-auto sm:mr-0 sm:ml-auto order-first sm:order-none">
                            <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>

                        <button type="button" @click="submit('rechazado')" :disabled="submitting || signatureEmpty"
                            class="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-gray-400">
                            Rechazar
                        </button>

                        <button type="button" @click="submit('aprobado')" :disabled="submitting || signatureEmpty"
                            class="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:bg-gray-400">
                            Aprobar Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeaveRequestsStore, type LeaveRequest } from '~/stores/leaveRequests'
import { useAuthStore } from '~/stores/auth'
import SignaturePad from '~/components/staff/SignaturePad.vue'
import DropZone from '~/components/ui/DropZone.vue'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import printJS from 'print-js'
import { api } from '~/utils/api'
import { usePrint } from '~/composables/usePrint'

interface Props {
    show: boolean
    request: LeaveRequest
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    reviewed: []
}>()

const store = useLeaveRequestsStore()
const authStore = useAuthStore()
const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null)
const submitting = ref(false)
const signatureEmpty = ref(true)
const signatureError = ref(false)
const { printFile } = usePrint()

const form = ref({
    review_notes: '',
    admin_signature: '',
    file: null as File | null
})

const handleSignatureUpdate = (signature: string) => {
    form.value.admin_signature = signature
}

const usingStoredSignature = ref(false)
const isLoadingSignature = ref(false)

const loadStoredSignature = async () => {
    if (!authStore.user?.digital_signature_path) return

    try {
        isLoadingSignature.value = true
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBase}/storage/${authStore.user.digital_signature_path}`)
        const blob = await response.blob()
        
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
            const base64data = reader.result as string
            form.value.admin_signature = base64data
            signatureEmpty.value = false
            usingStoredSignature.value = true
        }
    } catch (e) {
        console.error('Error loading signature:', e)
        usingStoredSignature.value = false
    } finally {
        isLoadingSignature.value = false
    }
}

const useManualSignature = () => {
    usingStoredSignature.value = false
    form.value.admin_signature = ''
    signatureEmpty.value = true
    setTimeout(() => {
        if (signaturePadRef.value) signaturePadRef.value.clear()
    }, 100)
}

watch(() => props.show, (newVal) => {
    if (newVal) {
        if (authStore.user?.digital_signature_path) {
            loadStoredSignature()
        } else {
             usingStoredSignature.value = false
        }
    }
})

const handleSignatureChange = (isEmpty: boolean) => {
    signatureEmpty.value = isEmpty
    if (!isEmpty) signatureError.value = false
}

// Replaced by DropZone v-model directly
// const handleFileChange = ... 

const formatDate = (date: string) => {
    return dayjs(date).format('DD MMM YYYY')
}

const submit = async (status: 'aprobado' | 'rechazado') => {
    if (signatureEmpty.value) {
        signatureError.value = true
        return
    }

    submitting.value = true

    try {
        const formData = new FormData()
        formData.append('status', status)
        if (form.value.review_notes) {
            formData.append('review_notes', form.value.review_notes)
        }
        formData.append('admin_signature', form.value.admin_signature)

        if (form.value.file) {
            formData.append('file', form.value.file)
        }

        await store.review(props.request.id, formData)

        const result = await Swal.fire({
            icon: 'success',
            title: status === 'aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
            text: 'La revisión ha sido registrada exitosamente',
            showCancelButton: true,
            confirmButtonText: 'Imprimir Reporte',
            cancelButtonText: 'Aceptar',
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#6c757d'
        })

        if (result.isConfirmed) {
            await printRequest(props.request.id)
        }

        emit('reviewed')
        close()
    } catch (error: any) {
        console.error(error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo procesar la revisión'
        })
    } finally {
        submitting.value = false
    }
}

const deleteRequest = async () => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Esta acción eliminará permanentemente la solicitud y no se podrá recuperar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        try {
            submitting.value = true
            await store.remove(props.request.id)
            await Swal.fire(
                '¡Eliminada!',
                'La solicitud ha sido eliminada correctamente.',
                'success'
            )
            emit('reviewed') // Refresh list
            close()
        } catch (error: any) {
            Swal.fire(
                'Error',
                error.message || 'No se pudo eliminar la solicitud',
                'error'
            )
        } finally {
            submitting.value = false
        }
    }
}

const close = () => {
    form.value = { review_notes: '', admin_signature: '', file: null }
    if (signaturePadRef.value) {
        signaturePadRef.value.clear()
    }
    emit('close')
}

const printRequest = async (id: number) => {
    try {
        const res = await api.getBlob(`/api/staff/leave-requests/${id}/print`)
        const blob = new Blob([res], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(blob)

        printJS({
            printable: fileURL,
            type: 'pdf',
            showModal: true,
            modalMessage: 'Generando documento...'
        })
    } catch (e) {
        console.error('Error downloading PDF:', e)
        Swal.fire('Error', 'No se pudo generar el reporte para imprimir', 'error')
    }
}
const getDurationDisplay = (req: LeaveRequest) => {
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
</script>
