<template>
    <div class="space-y-6">
        <!-- Suggestions Section -->
        <div v-if="suggestions.length > 0" class="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <h3 class="text-sm font-medium text-indigo-800 mb-2">Sugerencias de Unificación</h3>
            <p class="text-sm text-indigo-600 mb-4">Los siguientes estudiantes tienen múltiples casos activos que
                podrían unificarse.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="student in suggestions" :key="student.id"
                    class="bg-white p-4 rounded shadow-sm border border-indigo-100">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-900">{{ student.nombres }} {{ student.apellidos }}</span>
                        <span
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {{ student.psychology_cases.length }} casos
                        </span>
                    </div>
                    <div class="text-xs text-gray-500 mb-3 space-y-1">
                        <div v-for="caso in student.psychology_cases" :key="caso.id" class="flex justify-between">
                            <span>#{{ caso.id }} - {{ caso.title }}</span>
                            <span class="italic">{{ caso.referral?.reporter?.name ?? 'Psicología' }}</span>
                        </div>
                    </div>
                    <button @click="openUnifyModal(student)"
                        class="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700">
                        Unificar Casos
                    </button>
                </div>
            </div>
        </div>

        <!-- Unified Cases List -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="unified in unifiedCases" :key="unified.id">
                    <a href="#" @click.prevent="$emit('select', unified)" class="block hover:bg-gray-50">
                        <div class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-indigo-600 truncate">
                                    Caso Unificado #{{ unified.id }} - {{ unified.student?.nombres }} {{
                                        unified.student?.apellidos }}
                                </p>
                                <div class="ml-2 flex-shrink-0 flex">
                                    <span :class="[
                                        unified.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                                    ]">
                                        {{ unified.status === 'open' ? 'Abierto' : 'Cerrado' }}
                                    </span>
                                </div>
                            </div>
                            <div class="mt-2 sm:flex sm:justify-between">
                                <div class="sm:flex">
                                    <p class="flex items-center text-sm text-gray-500">
                                        <!-- Heroicon: users -->
                                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        {{ unified.cases?.length || 0 }} casos vinculados
                                    </p>
                                </div>
                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <!-- Heroicon: calendar -->
                                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p>
                                        Creado el <time :datetime="unified.created_at">{{ new
                                            Date(unified.created_at).toLocaleDateString() }}</time>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
                <li v-if="unifiedCases.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
                    <span v-if="loading">Cargando...</span>
                    <span v-else>No hay casos unificados registrados.</span>
                </li>
            </ul>
        </div>

        <!-- Unify Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="showModal = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Unificar Casos</h3>
                    <p class="text-sm text-gray-500 mb-4">
                        Seleccione los casos que desea unificar para {{ selectedStudent?.nombres }} {{
                            selectedStudent?.apellidos }}.
                        Al unificar, se creará una vista consolidada para psicología, manteniendo la privacidad
                        individual para los profesores.
                    </p>

                    <div v-if="selectedStudent" class="space-y-2 mb-6">
                        <div v-for="caso in selectedStudent.psychology_cases" :key="caso.id" class="flex items-start">
                            <div class="flex items-center h-5">
                                <input :id="'case-' + caso.id" v-model="selectedCaseIds" :value="caso.id"
                                    type="checkbox"
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            </div>
                            <div class="ml-3 text-sm">
                                <label :for="'case-' + caso.id" class="font-medium text-gray-700">Caso #{{ caso.id }} -
                                    {{
                                        caso.title }}</label>
                                <p class="text-gray-500">Reportado por: {{ caso.referral?.reporter?.name ?? 'N/A' }}</p>
                                <p class="text-gray-500" v-if="caso.assigned_to">Asignado a: <span
                                        class="font-medium">{{
                                            caso.assigned_to.name }}</span></p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button @click="showModal = false" type="button"
                            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            Cancelar
                        </button>
                        <button @click="confirmUnify" :disabled="selectedCaseIds.length < 2 || loading" type="button"
                            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50">
                            {{ loading ? 'Unificando...' : 'Unificar Casos' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUnifiedCasesStore } from '~/stores/unified-cases'
import { storeToRefs } from 'pinia'

// Props and Emits
const emit = defineEmits(['select'])

const store = useUnifiedCasesStore()
const { unifiedCases, suggestions, loading } = storeToRefs(store)
const showModal = ref(false)
const selectedStudent = ref<any>(null)
const selectedCaseIds = ref<number[]>([])


onMounted(async () => {
    await Promise.all([
        store.fetchSuggestions(),
        store.fetchUnifiedCases()
    ])
})

const openUnifyModal = (student: any) => {
    selectedStudent.value = student
    // Pre-select all eligible cases by default (assuming they exist on student object)
    if (student.psychology_cases) {
        selectedCaseIds.value = student.psychology_cases.map((c: any) => c.id)
    }
    showModal.value = true
}

const confirmUnify = async () => {
    if (selectedCaseIds.value.length < 2 || !selectedStudent.value) return

    try {
        await store.unifyCases({
            student_id: selectedStudent.value.id,
            case_ids: selectedCaseIds.value
        })
        showModal.value = false
        selectedStudent.value = null
        selectedCaseIds.value = []

        // Refresh list
        await store.fetchUnifiedCases()
    } catch (e) {
        // Error handled in store
    }
}
</script>
