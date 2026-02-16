<template>
    <div v-if="currentUnifiedCase" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Caso Unificado #{{ currentUnifiedCase.id }}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Estudiante: {{ currentUnifiedCase.student?.nombres }} {{ currentUnifiedCase.student?.apellidos }}
                </p>
            </div>
            <div class="space-x-2">
                <button @click="$emit('back')"
                    class="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                    Volver
                </button>
                <button v-if="currentUnifiedCase.status === 'open'" @click="openAddModal"
                    class="bg-indigo-600 border border-transparent rounded-md shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none">
                    Agregar Entrada
                </button>
                <button v-if="currentUnifiedCase.status === 'open'" @click="showCloseModal = true"
                    class="bg-red-600 border border-transparent rounded-md shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none">
                    Cerrar Caso Unificado
                </button>
            </div>
        </div>

        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">Casos Vinculados</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                        <ul class="list-disc pl-5 space-y-1">
                            <li v-for="caso in currentUnifiedCase.cases" :key="caso.id">
                                Caso #{{ caso.id }} - {{ caso.title }} ({{ caso.referral?.teacher?.name ?? 'Psicología'
                                }})
                            </li>
                        </ul>
                    </dd>
                </div>
                <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">Estado</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                        <span :class="[
                            currentUnifiedCase.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                        ]">
                            {{ currentUnifiedCase.status === 'open' ? 'Abierto' : 'Cerrado' }}
                        </span>
                    </dd>
                </div>
            </dl>
        </div>

        <!-- Timeline -->
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Línea de Tiempo Unificada</h4>
            <div class="flow-root">
                <ul role="list" class="-mb-8">
                    <li v-for="(entry, entryIdx) in currentUnifiedCase.timeline" :key="entry.id">
                        <div class="relative pb-8">
                            <span v-if="entryIdx !== currentUnifiedCase.timeline.length - 1"
                                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            <div class="relative flex space-x-3">
                                <div>
                                    <span
                                        class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                        <!-- Heroicon: clipboard-document-list -->
                                        <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </span>
                                </div>
                                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p class="text-sm text-gray-500">
                                            {{ entry.type }} <span class="font-medium text-gray-900">por {{
                                                entry.author?.name }}</span>
                                        </p>
                                        <p class="text-xs text-gray-400">
                                            Fuente: {{ entry.case_id ? (entry.case_source_title ?? 'Caso #' +
                                                entry.case_id) : 'Caso Unificado' }}
                                        </p>
                                        <div class="mt-2 text-sm text-gray-700">
                                            <p class="font-semibold">{{ entry.title }}</p>
                                            <div class="whitespace-pre-wrap" v-html="entry.content"></div>
                                        </div>
                                    </div>
                                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time :datetime="entry.date_of_event">{{ new
                                            Date(entry.date_of_event).toLocaleDateString() }}</time>
                                        <div class="mt-2" v-if="canEdit(entry)">
                                            <button @click="editEntry(entry)"
                                                class="text-indigo-600 hover:text-indigo-900 text-xs font-medium">
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li v-if="!currentUnifiedCase.timeline || currentUnifiedCase.timeline.length === 0">
                        <p class="text-sm text-gray-500 italic">No hay entradas registradas en los casos vinculados.</p>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Add Entry Modal -->
        <div v-if="showAddEntryModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="showAddEntryModal = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">

                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">{{ isEditing ? 'Editar Entrada' :
                        'Nueva Entrada Unificada' }}</h3>
                    <p v-if="!isEditing" class="text-sm text-yellow-600 bg-yellow-50 p-3 rounded mb-4 flex">
                        <!-- Heroicon: exclamation-triangle -->
                        <svg class="h-5 w-5 mr-2 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Esta entrada se replicará en todos los casos individuales vinculados ({{
                            currentUnifiedCase.cases.length }} casos).
                    </p>

                    <form @submit.prevent="submitEntry">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Título</label>
                                <input v-model="newEntry.title" type="text" required
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha del Evento</label>
                                <input v-model="newEntry.date_of_event" type="date" required
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                                <select v-model="newEntry.type" required
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="Observación">Observación</option>
                                    <option value="Entrevista">Entrevista</option>
                                    <option value="Reunión">Reunión</option>
                                    <option value="Intervención">Intervención</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea v-model="newEntry.description" rows="3" required
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Visibilidad</label>
                                <select v-model="newEntry.visibility" required
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="public">Visible para profesores</option>
                                    <option value="private">Privado (Solo Psicología)</option>
                                    <option value="restricted">Restringido</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button type="submit" :disabled="isSaving"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ isSaving ? 'Guardando...' : 'Guardar' }}
                            </button>
                            <button type="button" @click="showAddEntryModal = false"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Close Case Modal -->
        <div v-if="showCloseModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="showCloseModal = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Cerrar Caso Unificado</h3>
                    <p class="text-sm text-red-600 bg-red-50 p-3 rounded mb-4 flex">
                        <!-- Heroicon: exclamation-circle -->
                        <svg class="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ADVERTENCIA: Al cerrar este caso unificado, se cerrarán AUTOMÁTICAMENTE todos los casos
                        individuales vinculados ({{ currentUnifiedCase.cases.length }} casos). Esta acción no se puede
                        deshacer fácilmente.
                    </p>
                    <div class="mt-4 flex justify-end space-x-3">
                        <button @click="showCloseModal = false" type="button"
                            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            Cancelar
                        </button>
                        <button @click="confirmClose" type="button"
                            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                            Confirmar Cierre Total
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div v-else class="text-center py-10">
        <!-- Heroicon: arrow-path -->
        <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Cargando detalles...</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useUnifiedCasesStore } from '~/stores/unified-cases'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

// Props definition
const props = defineProps({
    caseId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['back'])

const store = useUnifiedCasesStore()
const { currentUnifiedCase } = storeToRefs(store)
const authStore = useAuthStore()

const showAddEntryModal = ref(false)
const showCloseModal = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const currentEntryId = ref<number | null>(null)

const newEntry = reactive({
    title: '',
    date_of_event: new Date().toISOString().split('T')[0],
    type: 'Observación',
    description: '',
    visibility: 'public'
})

onMounted(async () => {
    if (props.caseId) {
        await store.fetchUnifiedCase(props.caseId)
    }
})

const canEdit = (entry: any) => {
    return authStore.user?.id === entry.user_id || authStore.user?.role === 'admin'
}

const editEntry = (entry: any) => {
    isEditing.value = true
    currentEntryId.value = entry.id

    // Use title and content directly
    newEntry.title = entry.title || ''
    newEntry.description = entry.content || ''
    newEntry.date_of_event = entry.date_of_event.split('T')[0]
    newEntry.type = entry.type
    newEntry.visibility = entry.visibility || 'public'

    showAddEntryModal.value = true
}

const openAddModal = () => {
    isEditing.value = false
    currentEntryId.value = null
    // Reset form
    newEntry.title = ''
    newEntry.description = ''
    newEntry.type = 'Observación'
    newEntry.date_of_event = new Date().toISOString().split('T')[0]
    newEntry.visibility = 'public'

    showAddEntryModal.value = true
}

const submitEntry = async () => {
    isSaving.value = true
    try {
        if (isEditing.value && currentEntryId.value) {
            await store.updateEntry(currentEntryId.value, {
                ...newEntry,
                content: newEntry.description
            })

            // Reload whole unified case to refresh timeline from simple entries update
            // Ideally should just update local state but let's be safe
            await store.fetchUnifiedCase(props.caseId)
        } else {
            await store.addEntry(props.caseId, newEntry)
        }
        showAddEntryModal.value = false
        // Reset form
        newEntry.title = ''
        newEntry.description = ''
        newEntry.type = 'Observación'
    } catch (e) {
        // Handled in store
    } finally {
        isSaving.value = false
    }
}

const confirmClose = async () => {
    try {
        await store.closeCase(props.caseId)
        showCloseModal.value = false
    } catch (e) {
        // Handled
    }
}
</script>
