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
                            <span class="text-gray-500 block">Días:</span>
                            <span class="font-medium text-gray-900">{{ request.days_count }} días</span>
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
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Firma del Administrador <span class="text-red-500">*</span>
                        </label>
                        <SignaturePad ref="signaturePadRef" @update="handleSignatureUpdate"
                            @change="handleSignatureChange" />
                        <p v-if="signatureError" class="mt-1 text-sm text-red-600">La firma es obligatoria</p>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 justify-end">
                        <button type="button" @click="close"
                            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            Cancelar
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
import { ref } from 'vue'
import { useLeaveRequestsStore, type LeaveRequest } from '~/stores/leaveRequests'
import SignaturePad from '~/components/staff/SignaturePad.vue'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import printJS from 'print-js'
import { api } from '~/utils/api'

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
const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null)
const submitting = ref(false)
const signatureEmpty = ref(true)
const signatureError = ref(false)

const form = ref({
    review_notes: '',
    admin_signature: ''
})

const handleSignatureUpdate = (signature: string) => {
    form.value.admin_signature = signature
}

const handleSignatureChange = (isEmpty: boolean) => {
    signatureEmpty.value = isEmpty
    if (!isEmpty) signatureError.value = false
}

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
        await store.review(props.request.id, {
            status,
            review_notes: form.value.review_notes,
            admin_signature: form.value.admin_signature
        })

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

const close = () => {
    form.value = { review_notes: '', admin_signature: '' }
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
</script>
