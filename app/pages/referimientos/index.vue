<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Reportes a Psicología</h1>
                    <p class="text-sm text-gray-600 mt-1">Seleccione un aula y los estudiantes que desea reportar.</p>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Selector de fecha (Solo Profesor) -->
                <div v-if="isTeacher">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input v-model="selectedDate" type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <!-- Selector de Materia/Aula (Profesor) -->
                <div v-if="isTeacher">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Materia y Aula</label>
                    <select v-model="selectedAssignmentId" @change="onAssignmentChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        :disabled="attendanceStore.loadingDailyClasses">
                        <option :value="null">
                            {{ attendanceStore.loadingDailyClasses ? 'Cargando horario...' :
                                (attendanceStore.dailyClasses.length ?
                                    'Seleccionar clase...' : 'No hay clases programadas hoy') }}
                        </option>
                        <option v-for="entry in attendanceStore.dailyClasses" :key="entry.id"
                            :value="entry.assignment_id">
                            {{ entry.period?.start_time?.slice(0, 5) }} - {{ entry.period?.end_time?.slice(0, 5) }} |
                            {{ entry.assignment?.materia?.nombre }} - {{ entry.assignment?.aula?.grado_cardinal }}-{{
                                entry.assignment?.aula?.seccion }}
                        </option>
                    </select>
                </div>

                <!-- Selector de Aula (Admin/Psicólogo) -->
                <div v-if="isAdminOrPsychologist" class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Aula</label>
                    <select v-model="selectedAulaId" @change="onAulaChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                        <option :value="null">Seleccione un aula...</option>
                        <option v-for="aula in aulasStore.items" :key="aula.id" :value="aula.id">
                            {{ aula.grado_cardinal }} - {{ aula.seccion }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Lista de Estudiantes -->
        <div v-if="hasData" class="bg-white shadow-sm rounded-lg">
            <div
                class="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 bg-white shadow-sm rounded-t-lg">
                <h3 class="text-lg font-medium text-gray-900">Estudiantes</h3>

                <button v-if="selectedStudents.length > 0" @click="openReferralModal"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Reportar Seleccionados ({{ selectedStudents.length }})
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left">
                                <input type="checkbox" :checked="areAllSelected" @change="toggleSelectAll"
                                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orden</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="record in records" :key="record.estudiante.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" :value="record.estudiante.id" v-model="selectedStudents"
                                    :disabled="record.estudiante.estado === 'retirado'"
                                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ record.estudiante.numero_orden }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span class="text-indigo-800 font-medium text-sm">{{
                                            record.estudiante.nombres.charAt(0) }}{{
                                                record.estudiante.apellidos.charAt(0) }}</span>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{{ record.estudiante.apellidos
                                        }}, {{ record.estudiante.nombres }}</div>
                                        <div class="text-sm text-gray-500">{{ record.estudiante.cedula || 'Sin cédula'
                                        }}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Spinner Loading -->
        <div v-if="attendanceStore.loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else-if="!hasData" class="bg-white shadow-sm rounded-lg p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Seleccione una clase</h3>
            <p class="mt-1 text-sm text-gray-500">Seleccione una materia y aula para ver la lista de estudiantes.</p>
        </div>

        <!-- Referral Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Reportar Estudiantes ({{ selectedStudents.length }})
                        </h3>
                        <div class="mt-4">
                            <form @submit.prevent="submitReferral" class="space-y-4">
                                <!-- Selector de Tipo de Reporte -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
                                    <div class="grid grid-cols-2 gap-3">
                                        <button type="button" @click="form.reportType = 'case'" :class="[
                                            form.reportType === 'case'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                                            'relative border rounded-lg px-4 py-3 flex items-center justify-center text-sm font-medium focus:outline-none'
                                        ]">
                                            <span>Caso (Psicología)</span>
                                        </button>
                                        <button type="button" @click="form.reportType = 'warning'" :class="[
                                            form.reportType === 'warning'
                                                ? 'bg-amber-50 border-amber-500 text-amber-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                                            'relative border rounded-lg px-4 py-3 flex items-center justify-center text-sm font-medium focus:outline-none'
                                        ]">
                                            <span>Advertencia</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Tipo de Advertencia (para advertencias) -->
                                <div v-if="form.reportType === 'warning'">
                                    <label class="block text-sm font-medium text-gray-700">Tipo de Advertencia</label>
                                    <select v-model="form.warning_type_id"
                                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="">Seleccione un tipo</option>
                                        <option v-for="type in warningTypes" :key="type.id" :value="type.id">
                                            {{ type.name }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Título (para advertencias) -->
                                <div v-if="form.reportType === 'warning'">
                                    <label class="block text-sm font-medium text-gray-700">Título</label>
                                    <input v-model="form.title" type="text" required
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Título breve de la advertencia" />
                                </div>

                                <!-- Prioridad (solo para casos) -->
                                <div v-if="form.reportType === 'case'">
                                    <label class="block text-sm font-medium text-gray-700">Prioridad</label>
                                    <select v-model="form.priority"
                                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                <!-- Asignar a (solo para casos) -->
                                <div v-if="form.reportType === 'case' && !isPsychologistRole">
                                    <label class="block text-sm font-medium text-gray-700">Asignar a (Opcional)</label>
                                    <select v-model="form.assigned_to"
                                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="">Automático (Según disponibilidad)</option>
                                        <option v-for="psych in psychologists" :key="psych.id" :value="psych.id">
                                            {{ psych.name }}
                                        </option>
                                    </select>
                                    <p class="mt-1 text-xs text-gray-500">Si se deja en blanco, el sistema asignará
                                        automáticamente.</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        {{ form.reportType === 'warning' ? 'Comentario Inicial' : 'Motivo' }}
                                    </label>
                                    <textarea v-model="form.reason" rows="3" required
                                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                        placeholder="Describa el motivo..."></textarea>
                                </div>

                                <!-- Enviar estudiante (solo para casos) -->
                                <div v-if="form.reportType === 'case'" class="flex items-start">
                                    <div class="flex items-center h-5">
                                        <input id="send_student" v-model="form.send_student" type="checkbox"
                                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                    </div>
                                    <div class="ml-3 text-sm">
                                        <label for="send_student" class="font-medium text-gray-700">¿Enviar estudiante a
                                            psicología?</label>
                                        <p class="text-gray-500">Marque esta opción si el estudiante debe presentarse al
                                            departamento de psicología. Si no se marca, solo se abrirá el caso para
                                            seguimiento.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" @click="submitReferral" :disabled="submitting"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                            {{ submitting ? 'Enviando...' : 'Reportar' }}
                        </button>
                        <button type="button" @click="closeModal"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
// Stores
import { useAttendanceStore } from '~/stores/attendance'
import { usePsychologyStore } from '~/stores/psychology'
import { useStudentWarningsStore } from '~/stores/studentWarnings'
import { useAuthStore } from '~/stores/auth'
import { useEstudiantesStore } from '~/stores/estudiantes'
import { useAulasStore } from '~/stores/aulas'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

definePageMeta({
    middleware: ['auth', 'role']
})

const attendanceStore = useAttendanceStore()
const psychologyStore = usePsychologyStore()
const warningsStore = useStudentWarningsStore()
const authStore = useAuthStore()
const estudiantesStore = useEstudiantesStore()
const aulasStore = useAulasStore()

const selectedDate = ref(new Date().toLocaleDateString('en-CA'))
const selectedAssignmentId = ref<number | null>(null)
const selectedAulaId = ref<number | null>(null)

const selectedStudents = ref<number[]>([]) // Array de IDs
const showModal = ref(false)
const submitting = ref(false)
const psychologists = ref<any[]>([])
const warningTypes = ref<any[]>([])

const form = reactive({
    reportType: 'case' as 'case' | 'warning',
    warning_type_id: null as number | null,
    title: '',
    priority: 'medium',
    reason: '',
    assigned_to: '' as string | number | null,
    send_student: false
})

// Check Roles
const isAdminOrPsychologist = computed(() => ['admin', 'master', 'psico', 'orien'].some(r => authStore.user?.role?.includes(r)))
// Specific check for psychologist/orientador to hide manual assignment in modal
const isPsychologistRole = computed(() => ['psico', 'orien'].some(r => authStore.user?.role?.includes(r)))

const isTeacher = computed(() => !isAdminOrPsychologist.value && (authStore.user?.role === 'profesor' || !!authStore.user?.personal_id))

// Helper functions
const loadPsychologists = async () => {
    const res = await psychologyStore.fetchPsychologists()
    if (Array.isArray(res)) {
        psychologists.value = res
    }
}

const loadWarningTypes = async () => {
    try {
        const res = await api.get('/api/warning-types')
        warningTypes.value = Array.isArray(res) ? res : res.data || []
    } catch (e) {
        console.error('Error loading warning types:', e)
    }
}

// Cargar clases del día al iniciar
onMounted(async () => {
    // Para profesores: Cargar Horario
    if (isTeacher.value && authStore.user?.personal_id) {
        await attendanceStore.fetchDailyClasses({ professorId: authStore.user.personal_id, date: selectedDate.value })
    }

    // Para Admin/Psicólogos: Cargar Aulas
    if (isAdminOrPsychologist.value) {
        await aulasStore.fetchAll()
    }

    // Cargar lista de psicólogos para Admin, Master y Profesores (todos los que NO son roles psico/orien)
    // Para que puedan asignar manualmente en el modal.
    if (!isPsychologistRole.value) {
        await loadPsychologists()
    }
    await loadWarningTypes()
})

onUnmounted(() => {
    estudiantesStore.items = []
    selectedStudents.value = []
})

// Recargar clases si cambia la fecha
watch(selectedDate, async (newVal) => {
    if (newVal && authStore.user?.personal_id) {
        selectedAssignmentId.value = null
        selectedAulaId.value = null
        attendanceStore.resetRecords()
        await attendanceStore.fetchDailyClasses({ professorId: authStore.user.personal_id, date: newVal })
    }
})

const onAssignmentChange = async () => {
    if (selectedAssignmentId.value) {
        const entry = attendanceStore.dailyClasses.find(e => e.assignment_id === selectedAssignmentId.value)
        if (entry && entry.assignment) {
            selectedAulaId.value = entry.assignment.aula_id
            // Ensure ID is present before calling
            if (selectedAulaId.value && selectedAssignmentId.value) {
                await attendanceStore.fetchAttendance(selectedDate.value, selectedAulaId.value, selectedAssignmentId.value)
            }
        }
    } else {
        selectedAulaId.value = null
        attendanceStore.resetRecords()
    }
}



const onAulaChange = async () => {
    selectedStudents.value = []
    if (selectedAulaId.value) {
        await estudiantesStore.fetchAll({
            aula_id: selectedAulaId.value,
            status: 'active',
            include_psychology: true
        })
    } else {
        estudiantesStore.items = []
    }
}

// Unify records from AttendanceStore (Teachers) or EstudiantesStore (Admin/Psych)
const records = computed(() => {
    if (isTeacher.value) {
        return attendanceStore.records
    } else {
        // Map estudiantesStore items to similar structure
        return estudiantesStore.items.map((est: any) => {
            const hasPending = est.psychological_referrals_count > 0 || est.psychology_referrals?.length > 0
            const hasOpenCase = est.psychological_cases_count > 0 || est.psychology_cases?.length > 0

            return {
                estudiante: est,
                psychology: {
                    has_pending_referral: hasPending,
                    has_open_case: hasOpenCase,
                    is_in_office: false // We simplified this for non-attendance view
                }
            }
        })
    }
})

const hasData = computed(() => records.value.length > 0)

const areAllSelected = computed(() => {
    if (!hasData.value) return false
    const activeStudents = records.value.filter((r: any) => r.estudiante.estado !== 'retirado')
    return activeStudents.length > 0 && selectedStudents.value.length === activeStudents.length
})

const toggleSelectAll = () => {
    if (areAllSelected.value) {
        selectedStudents.value = []
    } else {
        selectedStudents.value = records.value
            .filter((r: any) => r.estudiante.estado !== 'retirado')
            .map((r: any) => r.estudiante.id)
    }
}

const openReferralModal = () => {
    form.reportType = 'case'
    form.warning_type_id = null
    form.title = ''
    form.reason = ''
    form.priority = 'medium'
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const submitReferral = async () => {
    if (!form.reason.trim()) {
        Swal.fire('Error', `Debe escribir ${form.reportType === 'warning' ? 'un comentario' : 'un motivo'}`, 'warning')
        return
    }

    if (form.reportType === 'warning' && !form.title.trim()) {
        Swal.fire('Error', 'Debe escribir un título para la advertencia', 'warning')
        return
    }

    submitting.value = true
    let successCount = 0
    let failCount = 0

    if (form.reportType === 'warning') {
        // Create warnings
        for (const studentId of selectedStudents.value) {
            const res = await warningsStore.createWarning({
                student_id: studentId,
                warning_type_id: form.warning_type_id,
                title: form.title,
                initial_comment: form.reason
            })
            if (res && res.success) successCount++
            else failCount++
        }
    } else {
        // Create cases (original logic)
        for (const studentId of selectedStudents.value) {
            const res = await psychologyStore.createReferral({
                student_id: studentId,
                reason: form.reason,
                priority: form.priority,
                assigned_to: form.assigned_to || null,
                send_student: form.send_student
            })
            if (res.success) successCount++
            else failCount++
        }
    }

    submitting.value = false
    closeModal()

    if (successCount > 0) {
        Swal.fire({
            icon: 'success',
            title: 'Proceso completado',
            text: `Se ${form.reportType === 'warning' ? 'crearon' : 'enviaron'} ${successCount} ${form.reportType === 'warning' ? 'advertencias' : 'reportes'} correctamente.` + (failCount > 0 ? ` Fallaron ${failCount}.` : '')
        })

        // Refresh Data
        if (isTeacher.value) {
            if (selectedAulaId.value && selectedAssignmentId.value) {
                await attendanceStore.fetchAttendance(selectedDate.value, selectedAulaId.value, selectedAssignmentId.value)
            }
        } else {
            // Re-fetch estudiantes to update status flags
            if (selectedAulaId.value) {
                await estudiantesStore.fetchAll({
                    aula_id: selectedAulaId.value,
                    status: 'active',
                    include_psychology: true
                })
            }
        }

        selectedStudents.value = [] // Reset selection
    } else {
        Swal.fire('Error', `No se pudieron ${form.reportType === 'warning' ? 'crear las advertencias' : 'enviar los reportes'}`, 'error')
    }
}
</script>
