<template>
    <div>
        <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Bloqueos</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Estudiantes bloqueados para ver boletines</p>
            </div>
            <div class="flex space-x-2">
                <button v-if="selectedStudentIds.length > 0" @click="bulkUnlock"
                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium transition duration-150 flex items-center">
                    Desbloquear Seleccionados ({{ selectedStudentIds.length }})
                </button>
                <button @click="openCreateModal"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                    Bloquear Estudiante
                </button>
            </div>
        </header>

        <div class="p-6">
            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Cargando...</p>
            </div>

            <div v-else class="space-y-4">
                <!-- Filters -->
                <div class="flex flex-col md:flex-row gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex-1">
                        <label for="search" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Buscar
                            Estudiante</label>
                        <div class="relative">
                            <input type="text" id="search" v-model="searchQuery"
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Nombre o apellido..." />
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="w-full md:w-64">
                        <label for="aula" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filtrar por Aula</label>
                        <select id="aula" v-model="selectedAulaId"
                            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="">Todas las aulas</option>
                            <option v-for="aula in aulasOptions" :key="aula.value" :value="aula.value">
                                {{ aula.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th class="w-12 px-6 py-3 text-left">
                                    <input type="checkbox" :checked="areAllSelected" @change="toggleSelectAll"
                                        class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4">
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estudiante</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Razón</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tipo</th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="lock in filteredLocks" :key="lock.id" :class="{'bg-blue-50/50 dark:bg-blue-900/10': selectedStudentIds.includes(lock.student_id)}">
                                <td class="px-6 py-4 whitespace-nowrap text-left">
                                    <input type="checkbox" :value="lock.student_id" v-model="selectedStudentIds"
                                        class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4">
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {{ lock.student?.nombres }} {{ lock.student?.apellidos }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ lock.student?.aula?.grado_cardinal }}° {{ lock.student?.aula?.seccion }}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ lock.reason }}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                        :class="lock.auto_generated ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : 'bg-yellow-100 text-yellow-800'">
                                        {{ lock.auto_generated ? 'Automático' : 'Manual' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        <button @click="unlock(lock)" class="text-green-600 hover:text-green-900"
                                            title="Desbloquear">
                                            <LockOpenIcon class="h-5 w-5" />
                                        </button>
                                        <button @click="viewDetails(lock)" class="text-blue-600 hover:text-blue-900"
                                            title="Ver Detalles">
                                            <EyeIcon class="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredLocks.length === 0">
                                <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    {{ emptyStateMessage }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>            <!-- Modal Manual Lock -->
            <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Bloquear Estudiante Manualmente</h3>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estudiante</label>
                        
                        <!-- Selected Student Card -->
                        <div v-if="selectedStudent" class="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md flex justify-between items-center mb-1">
                            <div>
                                <div class="font-medium text-blue-900 dark:text-blue-200 text-sm">
                                    {{ selectedStudent.nombres }} {{ selectedStudent.apellidos }}
                                </div>
                                <div class="text-xs text-blue-700 dark:text-blue-400" v-if="selectedStudent.aula">
                                    {{ selectedStudent.aula.grado_cardinal }}° {{ selectedStudent.aula.seccion }} - RNE: {{ selectedStudent.rne || 'N/A' }}
                                </div>
                            </div>
                            <button type="button" @click="clearStudentSelection" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" title="Quitar selección">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Search Autocomplete Input -->
                        <div v-else class="relative">
                            <input 
                                v-model="studentSearchQuery" 
                                @focus="showStudentDropdown = true"
                                @blur="onStudentSearchBlur"
                                type="text" 
                                class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Buscar por nombre, apellido o RNE...">
                            
                            <!-- Dropdown Results -->
                            <div v-if="showStudentDropdown && filteredStudents.length > 0" 
                                 class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                <button 
                                    v-for="student in filteredStudents" 
                                    :key="student.id"
                                    type="button"
                                    @click="selectStudent(student)"
                                    class="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors">
                                    <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">{{ student.nombres }} {{ student.apellidos }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400" v-if="student.aula">
                                        {{ student.aula.grado_cardinal }}° {{ student.aula.seccion }} - RNE: {{ student.rne || 'N/A' }}
                                    </div>
                                </button>
                            </div>
                            
                            <div v-if="showStudentDropdown && studentSearchQuery && studentSearchQuery.length >= 2 && filteredStudents.length === 0" 
                                 class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No se encontraron estudiantes.
                            </div>
                            <div v-if="showStudentDropdown && (!studentSearchQuery || studentSearchQuery.length < 2)"
                                 class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-2 text-center text-gray-500 dark:text-gray-400 text-xs">
                                Escribe al menos 2 caracteres para buscar...
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo</label>
                        <textarea v-model="form.reason" class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="2"></textarea>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button @click="showModal = false"
                            class="px-4 py-2 border rounded text-gray-700 dark:text-gray-300">Cancelar</button>
                        <button @click="performLock" :disabled="!form.student_id"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Bloquear</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocksStore } from '~/stores/locks'
import { useAulasStore } from '~/stores/aulas'
import { useEstudiantesStore } from '~/stores/estudiantes'
import { LockOpenIcon, EyeIcon } from '@heroicons/vue/24/outline'

import Swal from 'sweetalert2'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const store = useLocksStore()
const aulasStore = useAulasStore()

const locks = computed(() => store.locks)
const loading = computed(() => store.loading || aulasStore.loading)
const aulasOptions = computed(() => aulasStore.paraSelect)

const searchQuery = ref('')
const selectedAulaId = ref<number | ''>('')

const showModal = ref(false)
const showDetailsModal = ref(false)
const detailsLoading = ref(false)
const detailsData = ref<any>({})
const selectedLockStudentName = ref('')

const form = reactive({
    student_id: '',
    reason: 'Intervención Psicológica'
})

const estudiantesStore = useEstudiantesStore()
const studentSearchQuery = ref('')
const showStudentDropdown = ref(false)
const selectedStudent = ref<any>(null)
let blurTimeout: any = null

const filteredStudents = computed(() => {
    if (!studentSearchQuery.value || studentSearchQuery.value.length < 2) {
        return []
    }
    const query = studentSearchQuery.value.toLowerCase()
    return estudiantesStore.items.filter(student => {
        const fullName = `${student.nombres} ${student.apellidos}`.toLowerCase()
        return fullName.includes(query) || (student.rne && student.rne.toLowerCase().includes(query))
    }).slice(0, 10)
})

function selectStudent(student: any) {
    if (blurTimeout) clearTimeout(blurTimeout)
    selectedStudent.value = student
    form.student_id = student.id.toString()
    showStudentDropdown.value = false
}

function clearStudentSelection() {
    selectedStudent.value = null
    form.student_id = ''
    studentSearchQuery.value = ''
}

function onStudentSearchBlur() {
    blurTimeout = setTimeout(() => {
        showStudentDropdown.value = false
    }, 200)
}

const filteredLocks = computed(() => {
    let result = locks.value

    // Filter by student name
    if (searchQuery.value) {
        const lowerQ = searchQuery.value.toLowerCase()
        result = result.filter(lock => {
            const fullName = `${lock.student?.nombres} ${lock.student?.apellidos}`.toLowerCase()
            return fullName.includes(lowerQ)
        })
    }

    // Filter by Aula
    if (selectedAulaId.value) {
        result = result.filter(lock => lock.student?.aula_id === selectedAulaId.value)
    }

    return result
})

const emptyStateMessage = computed(() => {
    return locks.value.length === 0
        ? 'No hay estudiantes bloqueados.'
        : 'No se encontraron resultados con los filtros actuales.'
})

const selectedStudentIds = ref<number[]>([])

const areAllSelected = computed(() => {
    return filteredLocks.value.length > 0 && selectedStudentIds.value.length === filteredLocks.value.length
})

function toggleSelectAll() {
    if (areAllSelected.value) {
        selectedStudentIds.value = []
    } else {
        selectedStudentIds.value = filteredLocks.value.map(lock => lock.student_id)
    }
}

watch([searchQuery, selectedAulaId], () => {
    selectedStudentIds.value = []
})

onMounted(() => {
    store.fetchAll()
    aulasStore.fetchAll()
})

function openCreateModal() {
    form.student_id = ''
    form.reason = 'Intervención Psicológica'
    studentSearchQuery.value = ''
    selectedStudent.value = null
    showModal.value = true
    estudiantesStore.fetchAll('active')
}

async function performLock() {
    if (!form.student_id) return
    try {
        await store.manualLock(parseInt(form.student_id), form.reason)
        showModal.value = false
        Swal.fire({
            title: '¡Bloqueado!',
            text: 'El estudiante ha sido bloqueado exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        })
    } catch (e) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo bloquear al estudiante. Verifique el ID.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    }
}

async function unlock(lock: any) {
    const result = await Swal.fire({
        title: '¿Desbloquear estudiante?',
        text: `¿Estás seguro de desbloquear a ${lock.student.nombres}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desbloquear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        try {
            await store.unlock(lock.student_id)
            Swal.fire(
                '¡Desbloqueado!',
                'El estudiante ha sido desbloqueado.',
                'success'
            )
        } catch (e) {
            Swal.fire(
                'Error',
                'Hubo un problema al desbloquear.',
                'error'
            )
        }
    }
}

async function bulkUnlock() {
    if (selectedStudentIds.value.length === 0) return

    const result = await Swal.fire({
        title: '¿Desbloquear estudiantes seleccionados?',
        text: `¿Estás seguro de desbloquear a los ${selectedStudentIds.value.length} estudiantes seleccionados?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desbloquear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        try {
            await store.bulkUnlock(selectedStudentIds.value)
            selectedStudentIds.value = []
            Swal.fire(
                '¡Desbloqueados!',
                'Los estudiantes han sido desbloqueados.',
                'success'
            )
        } catch (e) {
            Swal.fire(
                'Error',
                'Hubo un problema al desbloquear.',
                'error'
            )
        }
    }
}

const router = useRouter()

async function viewDetails(lock: any) {
    router.push(`/admin/locks/${lock.student_id}`)
}
</script>
