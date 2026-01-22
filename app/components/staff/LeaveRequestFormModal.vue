<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Nueva Solicitud de Permiso</h2>
                <button @click="close" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <!-- Empleado -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Empleado <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.personal_id" required
                        class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        :class="{ 'border-red-500': errors.personal_id }">
                        <option value="">Seleccione un empleado</option>
                        <option v-for="p in personalList" :key="p.id" :value="p.id">
                            {{ p.nombre }} {{ p.apellido }} - {{ p.cedula }}
                        </option>
                    </select>
                    <p v-if="errors.personal_id" class="mt-1 text-sm text-red-600">{{ errors.personal_id }}</p>
                </div>

                <!-- Tipo de Permiso -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Permiso <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.leave_type" required
                        class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        :class="{ 'border-red-500': errors.leave_type }">
                        <option value="">Seleccione un tipo</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="personal">Permiso Personal</option>
                        <option value="medico">Permiso Médico</option>
                        <option value="maternidad">Licencia por Maternidad</option>
                        <option value="paternidad">Licencia por Paternidad</option>
                        <option value="duelo">Permiso por Duelo</option>
                        <option value="otro">Otro</option>
                    </select>
                    <p v-if="errors.leave_type" class="mt-1 text-sm text-red-600">{{ errors.leave_type }}</p>
                </div>

                <!-- Fechas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Inicio <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.start_date" type="date" required
                            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            :class="{ 'border-red-500': errors.start_date }" />
                        <p v-if="errors.start_date" class="mt-1 text-sm text-red-600">{{ errors.start_date }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Fin <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.end_date" type="date" required :min="form.start_date"
                            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            :class="{ 'border-red-500': errors.end_date }" />
                        <p v-if="errors.end_date" class="mt-1 text-sm text-red-600">{{ errors.end_date }}</p>
                    </div>
                </div>

                <!-- Días calculados -->
                <div v-if="calculatedDays > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-sm text-blue-800">
                        <span class="font-semibold">Días solicitados:</span> {{ calculatedDays }} días
                    </p>
                </div>

                <!-- Motivo -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Motivo del Permiso <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.reason" required rows="4"
                        placeholder="Describa el motivo de la solicitud..."
                        class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        :class="{ 'border-red-500': errors.reason }"></textarea>
                    <p class="mt-1 text-xs text-gray-500">Mínimo 10 caracteres</p>
                    <p v-if="errors.reason" class="mt-1 text-sm text-red-600">{{ errors.reason }}</p>
                </div>

                <!-- Archivo Adjunto -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Documento de Soporte (Opcional)
                    </label>
                    <input type="file" @change="handleFileChange" accept=".pdf,.jpg,.jpeg,.png"
                        class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <p class="mt-1 text-xs text-gray-500">PDF, JPG, JPEG o PNG. Máximo 5MB</p>
                    <p v-if="errors.attachment" class="mt-1 text-sm text-red-600">{{ errors.attachment }}</p>
                </div>

                <!-- Firma Digital -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Firma del Empleado <span class="text-red-500">*</span>
                    </label>
                    <SignaturePad ref="signaturePadRef" @update="handleSignatureUpdate"
                        @change="handleSignatureChange" />
                    <p v-if="errors.employee_signature" class="mt-1 text-sm text-red-600">{{ errors.employee_signature
                    }}</p>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" @click="close"
                        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="submitting || signatureEmpty"
                        class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ submitting ? 'Guardando...' : 'Guardar Solicitud' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeaveRequestsStore } from '~/stores/leaveRequests'
import SignaturePad from '~/components/staff/SignaturePad.vue'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

interface Props {
    show: boolean
    personalList: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    saved: []
}>()

const store = useLeaveRequestsStore()
const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null)
const submitting = ref(false)
const signatureEmpty = ref(true)

const form = ref({
    personal_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    employee_signature: ''
})

const errors = ref<Record<string, string>>({})

const calculatedDays = computed(() => {
    if (!form.value.start_date || !form.value.end_date) return 0
    const start = dayjs(form.value.start_date)
    const end = dayjs(form.value.end_date)
    return end.diff(start, 'day') + 1
})

const handleSignatureUpdate = (signature: string) => {
    form.value.employee_signature = signature
}

const handleSignatureChange = (isEmpty: boolean) => {
    signatureEmpty.value = isEmpty
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const file = target.files[0]
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            errors.value.attachment = 'El archivo no puede exceder 5MB'
            target.value = ''
        } else {
            errors.value.attachment = ''
        }
    }
}

const handleSubmit = async () => {
    errors.value = {}

    // Validaciones
    if (!form.value.personal_id) {
        errors.value.personal_id = 'Debe seleccionar un empleado'
        return
    }
    if (!form.value.leave_type) {
        errors.value.leave_type = 'Debe seleccionar un tipo de permiso'
        return
    }
    if (!form.value.start_date) {
        errors.value.start_date = 'La fecha de inicio es obligatoria'
        return
    }
    if (!form.value.end_date) {
        errors.value.end_date = 'La fecha de fin es obligatoria'
        return
    }
    if (form.value.reason.length < 10) {
        errors.value.reason = 'El motivo debe tener al menos 10 caracteres'
        return
    }
    if (signatureEmpty.value) {
        errors.value.employee_signature = 'La firma es obligatoria'
        return
    }

    submitting.value = true

    try {
        const formData = new FormData()
        formData.append('personal_id', form.value.personal_id)
        formData.append('leave_type', form.value.leave_type)
        formData.append('start_date', form.value.start_date)
        formData.append('end_date', form.value.end_date)
        formData.append('reason', form.value.reason)
        formData.append('employee_signature', form.value.employee_signature)

        // Agregar archivo si existe
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput?.files?.[0]) {
            formData.append('attachment', fileInput.files[0])
        }

        await store.create(formData)

        await Swal.fire({
            icon: 'success',
            title: 'Solicitud Creada',
            text: 'La solicitud de permiso ha sido registrada exitosamente',
            timer: 2000,
            showConfirmButton: false
        })

        emit('saved')
        close()
    } catch (error: any) {
        console.error(error)

        // Manejar errores de validación del backend
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        }

        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo crear la solicitud'
        })
    } finally {
        submitting.value = false
    }
}

const close = () => {
    // Limpiar formulario
    form.value = {
        personal_id: '',
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        employee_signature: ''
    }
    errors.value = {}
    if (signaturePadRef.value) {
        signaturePadRef.value.clear()
    }
    emit('close')
}
</script>
