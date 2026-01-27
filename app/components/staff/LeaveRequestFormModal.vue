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
                <!-- Empleado (Solo Admin/Master) -->
                <div v-if="canSelectEmployee">
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

                <!-- Info Empleado (Para usuarios normales) -->
                <div v-else class="bg-blue-50 p-4 rounded-lg flex items-center gap-4 border border-blue-100">
                    <div
                        class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {{ user?.initials }}
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">{{ user?.name }}</p>
                        <p class="text-sm text-gray-500">Solicitante (Usted)</p>
                    </div>
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
                        <option value="express">Permiso Express (Horas)</option>
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

                <!-- Horas para Permiso Express -->
                <div v-if="form.leave_type === 'express'"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Hora Inicio <span class="text-red-500">*</span>
                        </label>
                        <div class="flex gap-2">
                            <select v-model="startTime12.hour" @change="updateStartTime"
                                class="rounded-lg border-gray-300 w-full text-sm">
                                <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                            </select>
                            <span class="self-center font-bold">:</span>
                            <select v-model="startTime12.minute" @change="updateStartTime"
                                class="rounded-lg border-gray-300 w-full text-sm">
                                <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                            </select>
                            <select v-model="startTime12.ampm" @change="updateStartTime"
                                class="rounded-lg border-gray-300 w-full text-sm font-semibold">
                                <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <p v-if="errors.start_time" class="mt-1 text-sm text-red-600">{{ errors.start_time }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Hora Fin <span class="text-red-500">*</span>
                        </label>
                        <div class="flex gap-2">
                            <select v-model="endTime12.hour" @change="updateEndTime"
                                class="rounded-lg border-gray-300 w-full text-sm">
                                <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                            </select>
                            <span class="self-center font-bold">:</span>
                            <select v-model="endTime12.minute" @change="updateEndTime"
                                class="rounded-lg border-gray-300 w-full text-sm">
                                <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                            </select>
                            <select v-model="endTime12.ampm" @change="updateEndTime"
                                class="rounded-lg border-gray-300 w-full text-sm font-semibold">
                                <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <p v-if="errors.end_time" class="mt-1 text-sm text-red-600">{{ errors.end_time }}</p>
                    </div>
                </div>

                <!-- Fechas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Fecha para Permiso Express (Una sola fecha) -->
                    <div v-if="form.leave_type === 'express'" class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Fecha del Permiso <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.start_date" type="date" required
                            class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            :class="{ 'border-red-500': errors.start_date }" />
                        <p v-if="errors.start_date" class="mt-1 text-sm text-red-600">{{ errors.start_date }}</p>
                    </div>

                    <!-- Fechas para otros permisos (Rango) -->
                    <template v-else>
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
                    </template>
                </div>

                <!-- Días calculados -->
                <!-- Días calculados / Info Express -->
                <div v-if="form.start_date && form.end_date" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div v-if="calculatingDays" class="flex items-center gap-2 text-blue-800">
                        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Calculando días hábiles...
                    </div>
                    <div v-else>
                        <!-- Normal Leave -->
                        <div v-if="form.leave_type !== 'express'">
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm text-blue-800">
                                    <span class="font-semibold">Días a descontar:</span> {{ calculatedDays }} días
                                </p>
                            </div>

                            <LeaveRequestCalendar v-if="form.start_date && form.end_date" :start-date="form.start_date"
                                :end-date="form.end_date" :holidays="holidaysFound" />

                            <div v-if="holidaysFound.length > 0"
                                class="mt-3 text-xs text-red-600 flex items-start gap-1">
                                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p class="font-semibold">Feriados detectados (No descontables):</p>
                                    <ul class="list-disc list-inside ml-1">
                                        <li v-for="h in holidaysFound" :key="h.date">{{ h.name }} ({{ h.date }})</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Express Leave Info -->
                        <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div class="flex justify-between items-center mb-2" v-if="expressDuration">
                                <p class="text-sm text-yellow-800">
                                    <span class="font-semibold">Tiempo solicitado:</span> {{ expressDuration }}
                                </p>
                            </div>
                            <p class="text-sm text-yellow-800">
                                <span class="font-semibold">Importante:</span> El horario permitido para permisos
                                express es únicamente
                                de <strong>8:00 AM a 4:00 PM</strong>.
                            </p>
                        </div>
                    </div>
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
                    <DropZone v-model="form.attachment" label="Documento de Soporte (Opcional)"
                        accept=".pdf,.jpg,.jpeg,.png" :max-size="5 * 1024 * 1024" />
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
                    <p v-if="errors.employee_signature" class="mt-1 text-sm text-red-600">{{
                        errors.employee_signature
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
import { ref, computed, watch, onMounted } from 'vue'
import { useLeaveRequestsStore } from '~/stores/leaveRequests'
import { useAuthStore } from '~/stores/auth'
import SignaturePad from '~/components/staff/SignaturePad.vue'
import DropZone from '~/components/ui/DropZone.vue'
import LeaveRequestCalendar from '~/components/staff/LeaveRequestCalendar.vue'
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
const auth = useAuthStore()
const user = computed(() => auth.user)

const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null)
const submitting = ref(false)
const signatureEmpty = ref(true)

const canSelectEmployee = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'master'
})

const form = ref<any>({
    personal_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    employee_signature: '',
    attachment: null
})

// 12-hour format state
const startTime12 = ref({ hour: '08', minute: '00', ampm: 'AM' })
const endTime12 = ref({ hour: '04', minute: '00', ampm: 'PM' })

const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = ['00', '15', '30', '45']
const periods = ['AM', 'PM']

// Update 24h format when 12h changes
const updateStartTime = () => {
    let hour = parseInt(startTime12.value.hour)
    if (startTime12.value.ampm === 'PM' && hour !== 12) hour += 12
    if (startTime12.value.ampm === 'AM' && hour === 12) hour = 0
    form.value.start_time = `${hour.toString().padStart(2, '0')}:${startTime12.value.minute}`
}

const updateEndTime = () => {
    let hour = parseInt(endTime12.value.hour)
    if (endTime12.value.ampm === 'PM' && hour !== 12) hour += 12
    if (endTime12.value.ampm === 'AM' && hour === 12) hour = 0
    form.value.end_time = `${hour.toString().padStart(2, '0')}:${endTime12.value.minute}`
}

// Initialize 24h values on mount/reset
watch(() => form.value.leave_type, (newType) => {
    if (newType === 'express') {
        updateStartTime()
        updateEndTime()
    }
})

const expressDuration = computed(() => {
    if (form.value.leave_type !== 'express' || !form.value.start_time || !form.value.end_time) return null

    const start = parseInt(form.value.start_time.split(':')[0]) * 60 + parseInt(form.value.start_time.split(':')[1])
    const end = parseInt(form.value.end_time.split(':')[0]) * 60 + parseInt(form.value.end_time.split(':')[1])

    if (end <= start) return null

    const diff = end - start
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    let duration = ''
    if (hours > 0) duration += `${hours} hora${hours !== 1 ? 's' : ''}`
    if (minutes > 0) duration += ` ${minutes} minutos`

    return duration.trim()
})

onMounted(() => {
    // If user is not admin and has personal_id, pre-fill it for frontend validation
    // Although backend handles it, frontend validation checks for personal_id
    if (!canSelectEmployee.value && user.value?.personal_id) {
        form.value.personal_id = user.value.personal_id
    }
})

// Watch for modal opening to reset/init
watch(() => props.show, (newVal) => {
    if (newVal && !canSelectEmployee.value && user.value?.personal_id) {
        form.value.personal_id = user.value.personal_id
    }
})

const errors = ref<Record<string, string>>({})

const calculatedDays = ref(0)
const holidaysFound = ref<any[]>([])
const calculatingDays = ref(false)

const calculateDays = async () => {
    if (!form.value.start_date || !form.value.end_date) {
        calculatedDays.value = 0
        holidaysFound.value = []
        return
    }

    calculatingDays.value = true
    calculatingDays.value = true
    try {
        const data = await store.calculateDays({
            start_date: form.value.start_date,
            end_date: form.value.end_date
        })
        console.log('Respuesta Store CalculateDays:', data)

        // Verificamos si data tiene la forma esperada o si está anidado
        const result = data.days !== undefined ? data : (data.data || {})

        calculatedDays.value = result.days || 0
        holidaysFound.value = result.holidays || []
    } catch (e) {
        console.error('Error en calculo:', e)
        // Fallback or error handling
    } finally {
        calculatingDays.value = false
    }
}

// Watchers for dates
watch(() => [form.value.start_date, form.value.end_date, form.value.leave_type], () => {
    // Si es express, forzar que fecha fin sea igual a fecha inicio
    if (form.value.leave_type === 'express' && form.value.start_date) {
        if (form.value.end_date !== form.value.start_date) {
            form.value.end_date = form.value.start_date
        }
    }

    // Solo calcular días si NO es express
    if (form.value.leave_type !== 'express') {
        calculateDays()
    }
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
    if (form.value.leave_type === 'express') {
        if (!form.value.start_time) {
            errors.value.start_time = 'La hora de inicio es obligatoria'
            return
        }
        if (!form.value.end_time) {
            errors.value.end_time = 'La hora de fin es obligatoria'
            return
        }
        if (form.value.start_time >= form.value.end_time) {
            errors.value.end_time = 'La hora de fin debe ser posterior a la de inicio'
            return
        }

        // Validar rango de horario (8:00 AM - 4:00 PM)
        if (form.value.start_time < '08:00' || form.value.start_time > '16:00') {
            errors.value.start_time = 'La hora de inicio debe estar entre 8:00 AM y 4:00 PM'
            return
        }
        if (form.value.end_time < '08:00' || form.value.end_time > '16:00') {
            errors.value.end_time = 'La hora de fin debe estar entre 8:00 AM y 4:00 PM'
            return
        }

        // Validar máximo 8 horas
        const start = parseInt(form.value.start_time.split(':')[0]) * 60 + parseInt(form.value.start_time.split(':')[1])
        const end = parseInt(form.value.end_time.split(':')[0]) * 60 + parseInt(form.value.end_time.split(':')[1])
        const diffMinutes = end - start

        if (diffMinutes > 480) { // 8 horas * 60 minutos
            errors.value.end_time = 'El permiso express no puede exceder las 8 horas laborales'
            return
        }
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
        if (form.value.leave_type === 'express') {
            formData.append('start_time', form.value.start_time)
            formData.append('end_time', form.value.end_time)
        }
        formData.append('reason', form.value.reason)
        formData.append('employee_signature', form.value.employee_signature)

        // Agregar archivo si existe
        if (form.value.attachment) {
            formData.append('attachment', form.value.attachment)
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
        start_time: '',
        end_time: '',
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
