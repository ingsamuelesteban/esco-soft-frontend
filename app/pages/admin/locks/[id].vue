<template>
    <div>
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <button @click="router.back()" class="text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon class="h-5 w-5" />
                </button>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">
                        {{ student ? `${student.nombres} ${student.apellidos}` : 'Detalles del Estudiante' }}
                    </h1>
                    <p v-if="student?.aula" class="text-sm text-gray-600 mt-1">
                        {{ student.aula.grado_cardinal }}° {{ student.aula.seccion }}
                    </p>
                </div>
            </div>
            <div>
                <button @click="confirmUnlock" :disabled="unlocking"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="unlocking" class="mr-2">
                        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </span>
                    <span v-else class="mr-2">
                        <LockOpenIcon class="h-5 w-5" />
                    </span>
                    Desbloquear
                </button>
            </div>
        </header>

        <div class="p-6">
            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-gray-500">Cargando calificaciones...</p>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- FAILURES COLUMN -->
                <div class="space-y-6">
                    <h2 class="text-lg font-semibold text-red-700 flex items-center gap-2">
                        <XCircleIcon class="h-5 w-5" /> Reprobadas
                    </h2>

                    <!-- Academic Failures -->
                    <div v-if="failedAcademic.length > 0"
                        class="bg-white rounded-lg shadow overflow-hidden border-l-4 border-red-500">
                        <div class="px-4 py-3 bg-red-50 border-b border-red-100 font-medium text-red-800">
                            Materias Académicas
                        </div>
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="(item, idx) in failedAcademic" :key="'af-' + idx">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{{ item.materia }}</div>
                                        <div class="text-xs text-gray-500">{{ item.competencia }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                            Periodo {{ item.periodo }}
                                        </span>
                                        <div class="font-bold text-lg text-red-600 mt-1">{{ item.nota }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Technical Failures -->
                    <div v-if="failedTechnical.length > 0"
                        class="bg-white rounded-lg shadow overflow-hidden border-l-4 border-orange-500">
                        <div class="px-4 py-3 bg-orange-50 border-b border-orange-100 font-medium text-orange-800">
                            Módulos Técnicos
                        </div>
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="(item, idx) in failedTechnical" :key="'tf-' + idx">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{{ item.materia }}</div>
                                        <div class="text-xs text-gray-500">RA {{ item.ra }} (Op. {{ item.oportunidad }})
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                            Periodo {{ item.periodo }}
                                        </span>
                                        <div class="font-bold text-lg text-red-600 mt-1">
                                            {{ item.nota }}
                                            <span v-if="item.valor_ra" class="text-xs text-gray-400 font-normal">/ {{
                                                item.valor_ra }}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="failedAcademic.length === 0 && failedTechnical.length === 0"
                        class="bg-green-50 rounded-lg p-6 text-center border border-green-100">
                        <CheckCircleIcon class="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p class="text-green-700 font-medium">¡Sin asignaturas reprobadas!</p>
                        <p class="text-sm text-green-600 mt-1">Este estudiante no tiene calificaciones reprobadas en los
                            periodos publicados.</p>
                    </div>
                </div>

                <!-- APPROVED COLUMN -->
                <div class="space-y-6">
                    <h2 class="text-lg font-semibold text-green-700 flex items-center gap-2">
                        <CheckCircleIcon class="h-5 w-5" /> Aprobadas
                    </h2>

                    <!-- Academic Approved -->
                    <div v-if="approvedAcademic.length > 0"
                        class="bg-white rounded-lg shadow overflow-hidden border-l-4 border-green-500">
                        <div class="px-4 py-3 bg-green-50 border-b border-green-100 font-medium text-green-800">
                            Materias Académicas
                        </div>
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="(item, idx) in approvedAcademic" :key="'aa-' + idx">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{{ item.materia }}</div>
                                        <div class="text-xs text-gray-500">{{ item.competencia }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Periodo {{ item.periodo }}
                                        </span>
                                        <div class="font-bold text-lg text-green-600 mt-1">{{ item.nota }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Technical Approved -->
                    <div v-if="approvedTechnical.length > 0"
                        class="bg-white rounded-lg shadow overflow-hidden border-l-4 border-teal-500">
                        <div class="px-4 py-3 bg-teal-50 border-b border-teal-100 font-medium text-teal-800">
                            Módulos Técnicos
                        </div>
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="(item, idx) in approvedTechnical" :key="'ta-' + idx">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{{ item.materia }}</div>
                                        <div class="text-xs text-gray-500">RA {{ item.ra }} (Op. {{ item.oportunidad }})
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Periodo {{ item.periodo }}
                                        </span>
                                        <div class="font-bold text-lg text-green-600 mt-1">
                                            {{ item.nota }}
                                            <span v-if="item.valor_ra" class="text-xs text-gray-400 font-normal">/ {{
                                                item.valor_ra }}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocksStore } from '~/stores/locks'
import { ArrowLeftIcon, XCircleIcon, CheckCircleIcon, LockOpenIcon } from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const store = useLocksStore()

const loading = ref(true)
const unlocking = ref(false)
const student = ref<any>(null)
const details = ref<any>({ academic: [], technical: [] })

const confirmUnlock = async () => {
    const result = await Swal.fire({
        title: '¿Desbloquear estudiante?',
        text: "El estudiante podrá ver sus calificaciones nuevamente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, desbloquear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        unlocking.value = true
        try {
            await store.unlock(studentId)
            await Swal.fire(
                '¡Desbloqueado!',
                'El estudiante ha sido desbloqueado exitosamente.',
                'success'
            )
            // Navigate back to the list
            router.push('/admin/locks')
        } catch (e) {
            console.error(e)
            Swal.fire(
                'Error',
                'No se pudo desbloquear al estudiante.',
                'error'
            )
        } finally {
            unlocking.value = false
        }
    }
}

const studentId = parseInt(route.params.id as string)

onMounted(async () => {
    try {
        const response: any = await store.getLockFullDetails(studentId)
        details.value = response.data
        student.value = response.student
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
})

const failedAcademic = computed(() => {
    return details.value.academic.filter((i: any) => i.status === 'reprobado')
})

const approvedAcademic = computed(() => {
    return details.value.academic.filter((i: any) => i.status === 'aprobado' || i.status === 'recuperado')
})

const failedTechnical = computed(() => {
    return details.value.technical.filter((i: any) => i.status === 'reprobado')
})

const approvedTechnical = computed(() => {
    return details.value.technical.filter((i: any) => i.status === 'aprobado')
})
</script>
