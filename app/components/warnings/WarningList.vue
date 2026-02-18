<template>
    <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="warnings.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay advertencias</h3>
            <p class="mt-1 text-sm text-gray-500">
                {{ status === 'closed' ? 'No hay advertencias cerradas' : 'No hay advertencias activas' }}
            </p>
        </div>

        <!-- Warnings Table -->
        <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                            Estudiante
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Título
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Reportado por
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fecha
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Estado
                        </th>
                        <th scope="col" class="relative py-3.5 pl-3 pr-4">
                            <span class="sr-only">Acciones</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="warning in warnings" :key="warning.id" class="hover:bg-gray-50 cursor-pointer"
                        @click="selectWarning(warning)">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                            <div class="flex items-center">
                                <div class="h-10 w-10 flex-shrink-0">
                                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span class="text-indigo-800 font-medium text-sm">
                                            {{ warning.student?.nombres?.charAt(0) }}{{
                                                warning.student?.apellidos?.charAt(0) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="font-medium text-gray-900">
                                        {{ warning.student?.apellidos }}, {{ warning.student?.nombres }}
                                    </div>
                                    <div class="text-gray-500">
                                        {{ warning.student?.aula?.grado_cardinal }}-{{ warning.student?.aula?.seccion }}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-4 text-sm text-gray-900">
                            {{ warning.title }}
                        </td>
                        <td class="px-3 py-4 text-sm text-gray-500">
                            {{ warning.reportedBy?.name || warning.reported_by?.name || 'Desconocido' }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {{ formatDate(warning.created_at) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                            <span :class="[
                                warning.status === 'open'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800',
                                'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                            ]">
                                {{ warning.status === 'open' ? 'Abierta' : 'Cerrada' }}
                            </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                            <button @click.stop="selectWarning(warning)" class="text-indigo-600 hover:text-indigo-900">
                                Ver detalle
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useStudentWarningsStore } from '~/stores/studentWarnings'
import type { StudentWarning } from '~/types/warnings'

const props = defineProps<{
    reportedByMe?: boolean
    studentId?: number
    status?: 'open' | 'closed'
    search?: string
    dateFrom?: string
    dateTo?: string
    reportedBy?: string
    anioLectivoId?: number | string
}>()

const emit = defineEmits<{
    (e: 'select', warning: StudentWarning): void
}>()

const warningsStore = useStudentWarningsStore()
const warnings = ref<StudentWarning[]>([])
const loading = ref(false)

const loadWarnings = async () => {
    loading.value = true
    const filters: any = {
        status: props.status || 'open'
    }

    if (props.anioLectivoId) {
        filters.anio_lectivo_id = props.anioLectivoId
    }

    if (props.reportedByMe) {
        filters.reported_by = 'me'
    } else if (props.reportedBy) {
        filters.reported_by = props.reportedBy
    }

    if (props.studentId) {
        // Warning: This filter might not be supported by backend index yet if not mapped
        // Checked backend: specific student_id filter not explicitly in index, only via search
        // But let's keep it if it was working or intended. 
        // Actually backend doesn't seem to support student_id in index directly? 
        // Let's check backend index implementation again - it did NOT have student_id filter for index!
        // It only had search. So this studentId prop might be for a different use case or missing backend support.
        // Wait, the previous implementation of studentWarnings.ts FETCH logic didn't transfer student_id either!
        // It seems studentId prop was not actually doing anything in fetchWarnings before?
        // Let's assume search is the primary way for now.
    }

    if (props.search) filters.search = props.search
    if (props.dateFrom) filters.date_from = props.dateFrom
    if (props.dateTo) filters.date_to = props.dateTo

    const result = await warningsStore.fetchWarnings(filters)
    if (result.success && result.data) {
        warnings.value = result.data
    }
    loading.value = false
}

const selectWarning = (warning: StudentWarning) => {
    emit('select', warning)
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

onMounted(() => {
    loadWarnings()
})

watch(() => [props.status, props.search, props.dateFrom, props.dateTo, props.reportedBy], () => {
    loadWarnings()
})

defineExpose({ loadWarnings })
</script>
