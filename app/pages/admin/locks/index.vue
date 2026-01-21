<template>
    <div>
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Gestión de Bloqueos</h1>
                <p class="text-sm text-gray-600 mt-1">Estudiantes bloqueados para ver boletines</p>
            </div>
            <button @click="openCreateModal"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                Bloquear Estudiante
            </button>
        </header>

        <div class="p-6">
            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-gray-500">Cargando...</p>
            </div>

            <div v-else class="space-y-4">
                <!-- Filters -->
                <div class="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex-1">
                        <label for="search" class="block text-xs font-medium text-gray-500 mb-1">Buscar
                            Estudiante</label>
                        <div class="relative">
                            <input type="text" id="search" v-model="searchQuery"
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 sm:text-sm transition duration-150 ease-in-out"
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
                        <label for="aula" class="block text-xs font-medium text-gray-500 mb-1">Filtrar por Aula</label>
                        <select id="aula" v-model="selectedAulaId"
                            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="">Todas las aulas</option>
                            <option v-for="aula in aulasOptions" :key="aula.value" :value="aula.value">
                                {{ aula.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="bg-white shadow overflow-hidden rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estudiante</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Razón</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo</th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="lock in filteredLocks" :key="lock.id">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ lock.student?.nombres }} {{ lock.student?.apellidos }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {{ lock.student?.aula?.grado_cardinal }}° {{ lock.student?.aula?.seccion }}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-gray-700">{{ lock.reason }}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                        :class="lock.auto_generated ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'">
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
                                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                    {{ emptyStateMessage }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Manual Lock -->
            <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 class="text-lg font-bold mb-4">Bloquear Estudiante Manualmente</h3>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">ID Estudiante</label>
                        <input v-model="form.student_id" type="number" class="w-full border rounded px-3 py-2"
                            placeholder="ID del estudiante">
                        <p class="text-xs text-gray-500 mt-1">Ingresa el ID del sistema del estudiante.</p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                        <textarea v-model="form.reason" class="w-full border rounded px-3 py-2" rows="2"></textarea>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button @click="showModal = false"
                            class="px-4 py-2 border rounded text-gray-700">Cancelar</button>
                        <button @click="performLock"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Bloquear</button>
                    </div>
                </div>
            </div>
            <!-- Modal Details -->
            <div v-if="showDetailsModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-lg font-bold">Detalles del Bloqueo</h3>
                            <p class="text-sm text-gray-600">{{ selectedLockStudentName }}</p>
                        </div>
                        <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div v-if="detailsLoading" class="text-center py-6">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="text-sm text-gray-500 mt-2">Cargando detalles...</p>
                    </div>

                    <div v-else class="space-y-6 max-h-[60vh] overflow-y-auto">
                        <!-- Academic Failures -->
                        <div v-if="detailsData.academic && detailsData.academic.length > 0">
                            <h4 class="font-medium text-red-700 border-b border-red-200 pb-1 mb-2">Materias Académicas
                                Reprobadas</h4>
                            <table class="min-w-full text-sm">
                                <thead class="bg-red-50">
                                    <tr>
                                        <th class="px-3 py-2 text-left">Materia</th>
                                        <th class="px-3 py-2 text-left">Periodo</th>
                                        <th class="px-3 py-2 text-right">Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detailsData.academic" :key="idx" class="border-b">
                                        <td class="px-3 py-2 text-gray-700">{{ item.materia }}</td>
                                        <td class="px-3 py-2 text-gray-700">Periodo {{ item.periodo }}</td>
                                        <td class="px-3 py-2 text-right font-bold text-red-600">{{ item.nota }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Technical Failures -->
                        <div v-if="detailsData.technical && detailsData.technical.length > 0">
                            <h4 class="font-medium text-orange-700 border-b border-orange-200 pb-1 mb-2">Módulos
                                Técnicos Reprobados</h4>
                            <table class="min-w-full text-sm">
                                <thead class="bg-orange-50">
                                    <tr>
                                        <th class="px-3 py-2 text-left">Materia</th>
                                        <th class="px-3 py-2 text-left">RA</th>
                                        <th class="px-3 py-2 text-left">Periodo</th>
                                        <th class="px-3 py-2 text-right">Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detailsData.technical" :key="idx" class="border-b">
                                        <td class="px-3 py-2 text-gray-700">{{ item.materia }}</td>
                                        <td class="px-3 py-2 text-gray-700">RA {{ item.ra }} (Op. {{ item.oportunidad
                                        }})</td>
                                        <td class="px-3 py-2 text-gray-700">Periodo {{ item.periodo }}</td>
                                        <td class="px-3 py-2 text-right font-bold text-red-600">
                                            {{ item.nota }} <span v-if="item.valor_ra"
                                                class="text-xs text-gray-400 font-normal">/ {{ item.valor_ra }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-if="(!detailsData.academic?.length && !detailsData.technical?.length)"
                            class="text-center py-4 bg-gray-50 rounded">
                            <p class="text-gray-500 italic">No se encontraron asignaturas reprobadas que justifiquen un
                                bloqueo automático actual.</p>
                            <p class="text-xs text-gray-400 mt-1">Es posible que el bloqueo sea manual o que las notas
                                hayan sido corregidas sin actualizar el bloqueo.</p>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <button @click="showDetailsModal = false"
                            class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useLocksStore } from '~/stores/locks'
import { useAulasStore } from '~/stores/aulas'
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

onMounted(() => {
    store.fetchAll()
    aulasStore.fetchAll()
})

function openCreateModal() {
    form.student_id = ''
    form.reason = 'Intervención Psicológica'
    showModal.value = true
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

async function viewDetails(lock: any) {
    selectedLockStudentName.value = `${lock.student?.nombres} ${lock.student?.apellidos}`
    showDetailsModal.value = true
    detailsLoading.value = true
    detailsData.value = {}

    try {
        const data = await store.getLockDetails(lock.student_id)
        detailsData.value = data
    } catch (e) {
        console.error(e)
        // detailsData remains empty or show error
    } finally {
        detailsLoading.value = false
    }
}
</script>
