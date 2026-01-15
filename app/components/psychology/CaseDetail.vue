<template>
    <div class="h-full flex flex-col">
        <!-- Header del Caso -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else-if="currentCase" class="flex-1 flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
            <!-- Toolbar Superior -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div class="flex items-center space-x-4">
                    <button @click="$emit('back')" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">{{ currentCase.student?.nombres }} {{
                            currentCase.student?.apellidos }}</h2>
                        <p class="text-sm text-gray-500">
                            {{ currentCase.title }} • Iniciado: {{ formatDate(currentCase.start_date) }}
                            <span v-if="currentCase.status === 'closed' && currentCase.closed_by">
                                • Cerrado por: {{ currentCase.closed_by.name }}
                            </span>
                        </p>
                        <div class="flex flex-wrap gap-2 mt-2 items-center">
                            <span v-for="cat in currentCase.categories" :key="cat.id"
                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                :style="{ backgroundColor: cat.color ? cat.color + '20' : '', color: cat.color }">
                                {{ cat.name }}
                            </span>
                            <button @click="openCategoryModal"
                                class="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {{ currentCase.categories?.length ? 'Editar' : 'Agregar Categoría' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                        :class="currentCase.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                        {{ currentCase.status === 'open' ? 'Activo' : 'Cerrado' }}
                    </span>
                    <div class="flex items-center space-x-2">
                        <!-- Toggle En Oficina / En Aula -->
                        <div class="flex items-center mr-4" v-if="currentCase.status === 'open'">
                            <button @click="toggleInOffice"
                                class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                :class="currentCase.in_office ? 'bg-indigo-600' : 'bg-gray-200'"
                                title="Indica si el estudiante está físicamente en la oficina">
                                <span class="sr-only">Está en oficina</span>
                                <span aria-hidden="true"
                                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow trasform ring-0 transition ease-in-out duration-200"
                                    :class="currentCase.in_office ? 'translate-x-5' : 'translate-x-0'"></span>
                            </button>
                            <span class="ml-2 text-sm text-gray-600">
                                {{ currentCase.in_office ? 'En Psicología' : 'En Aula' }}
                            </span>
                        </div>

                        <button @click="showAddEntry = true" v-if="currentCase.status === 'open'"
                            class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                            Nueva Entrada
                        </button>
                    </div>
                    <!-- Botón Cerrar Caso (Solo si está abierto) -->
                    <button v-if="currentCase.status === 'open'" @click="closeCase"
                        class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200">
                        Cerrar Caso
                    </button>
                </div>
            </div>

            <div class="flex-1 flex overflow-hidden">
                <!-- Columna Izquierda: Cronología / Entradas -->
                <div class="flex-1 overflow-y-auto p-6 bg-white">
                    <div class="mb-6">
                        <button @click="showAddEntry = true"
                            class="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar Nueva Entrada
                        </button>
                    </div>

                    <!-- Timeline -->
                    <div class="flow-root">
                        <ul role="list" class="-mb-8">
                            <li v-for="(entry, entryIdx) in currentCase.entries" :key="entry.id">
                                <div class="relative pb-8">
                                    <span v-if="entryIdx !== currentCase.entries.length - 1"
                                        class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"></span>
                                    <div class="relative flex space-x-3">
                                        <div>
                                            <span
                                                class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                                                :class="getEntryIconClass(entry.type)">
                                                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path v-if="entry.type === 'observation'" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    <path v-else-if="entry.type === 'agreement'" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="2"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    <path v-else-if="entry.type === 'interview'" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="2"
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    <path v-else stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p class="text-sm text-gray-500">
                                                    <span class="font-medium text-gray-900">{{ getTypeLabel(entry.type)
                                                    }}</span>
                                                    por <span class="font-medium text-gray-900">{{ entry.author?.name ||
                                                        'Usuario' }}</span>
                                                </p>
                                                <div class="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{{
                                                    entry.content }}</div>
                                            </div>
                                            <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time :datetime="entry.date_of_event">{{ formatDate(entry.date_of_event)
                                                }}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <!-- Inicio del caso (implícito) -->
                            <li>
                                <div class="relative flex space-x-3">
                                    <div>
                                        <span
                                            class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">Caso Iniciado</p>
                                        </div>
                                        <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                            <time :datetime="currentCase.start_date">{{
                                                formatDate(currentCase.start_date) }}</time>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Panel Lateral derecho (Info estudiante, categorías - opcional, por ahora oculto/integrado) -->
            </div>
        </div>

        <!-- Modal Nueva Entrada -->
        <div v-if="showAddEntry" class="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="showAddEntry = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Nueva Entrada</h3>
                        <div class="mt-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                                <select v-model="newEntry.type"
                                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="observation">Observación</option>
                                    <option value="interview">Entrevista</option>
                                    <option value="agreement">Acuerdo/Compromiso</option>
                                    <option value="family_meeting">Reunión Familiar</option>
                                    <option value="sanction">Sanción/Medida</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha del Evento</label>
                                <input type="date" v-model="newEntry.date_of_event"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Contenido</label>
                                <textarea v-model="newEntry.content" rows="4"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Describa los detalles..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            :disabled="savingEntry" @click="saveEntry">
                            {{ savingEntry ? 'Guardando...' : 'Guardar' }}
                        </button>
                        <button type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            @click="showAddEntry = false">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Categorías -->
        <div v-if="showCategoryModal" class="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="showCategoryModal = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Administrar Categorías
                        </h3>
                        <div class="mt-4 max-h-60 overflow-y-auto space-y-2">
                            <div v-for="cat in allCategories" :key="cat.id" class="flex items-center">
                                <input :id="'cat-' + cat.id" type="checkbox" :value="cat.id"
                                    v-model="selectedCategories"
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                <label :for="'cat-' + cat.id"
                                    class="ml-3 block text-sm font-medium text-gray-700 flex items-center">
                                    <span class="w-3 h-3 rounded-full mr-2"
                                        :style="{ backgroundColor: cat.color }"></span>
                                    {{ cat.name }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            :disabled="savingCategories" @click="saveCategories">
                            {{ savingCategories ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                        <button type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            @click="showCategoryModal = false">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { usePsychologyStore } from '../../stores/psychology'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

const props = defineProps<{
    caseId: number
}>()

const emit = defineEmits(['back'])
const store = usePsychologyStore()

const currentCase = ref<any>(null)
const loading = ref(true)
const showAddEntry = ref(false)
const savingEntry = ref(false)

const newEntry = ref({
    type: 'observation',
    content: '',
    date_of_event: new Date().toISOString().split('T')[0]
})

// Categories State
const showCategoryModal = ref(false)
const allCategories = ref<any[]>([])
const selectedCategories = ref<number[]>([])
const savingCategories = ref(false)

const loadCase = async () => {
    loading.value = true
    const res = await store.fetchCase(props.caseId)
    if (res) {
        currentCase.value = res
        // Sync selected categories
        if (currentCase.value.categories) {
            selectedCategories.value = currentCase.value.categories.map((c: any) => c.id)
        }
    }
    loading.value = false
}

const toggleInOffice = async () => {
    if (!currentCase.value) return;

    // Toggle value locally first for responsiveness (or wait for API)
    // Let's wait for API to be safe
    const newState = !currentCase.value.in_office;

    try {
        const res = await api.put(`/api/psychology/cases/${props.caseId}`, {
            in_office: newState
        });

        currentCase.value.in_office = res.in_office;

        const statusText = newState ? 'En Psicología' : 'En Aula';
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Estudiante marcado como: ${statusText}`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
}

const openCategoryModal = async () => {
    // Load available categories if empty
    if (allCategories.value.length === 0) {
        try {
            const res = await api.get('/api/psychology/categories')
            allCategories.value = res || []
        } catch (e) {
            console.error(e)
            Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
            return
        }
    }
    // Set selected from current case
    if (currentCase.value && currentCase.value.categories) {
        selectedCategories.value = currentCase.value.categories.map((c: any) => c.id)
    } else {
        selectedCategories.value = []
    }
    showCategoryModal.value = true
}

const saveCategories = async () => {
    savingCategories.value = true
    try {
        const res = await api.put(`/api/psychology/cases/${props.caseId}`, {
            categories: selectedCategories.value
        })

        // Update local state
        currentCase.value = res // Controller returns updated case with categories loaded

        showCategoryModal.value = false
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Categorías actualizadas', timer: 2000, showConfirmButton: false })
    } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudieron guardar los cambios', 'error')
    }
    savingCategories.value = false
}

const saveEntry = async () => {
    if (!newEntry.value.content) return

    savingEntry.value = true
    const res = await store.addCaseEntry({
        case_id: props.caseId,
        ...newEntry.value
    })

    if (res.success) {
        // Reset form
        newEntry.value.content = ''
        newEntry.value.type = 'observation'
        showAddEntry.value = false
        // Reload case to see new entry
        await loadCase()
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Entrada guardada', timer: 2000, showConfirmButton: false })
    } else {
        Swal.fire('Error', res.error, 'error')
    }
    savingEntry.value = false
}

const closeCase = async () => {
    const result = await Swal.fire({
        title: '¿Cerrar Caso?',
        text: 'El caso se marcará como cerrado. Podrá reabrirlo si es necesario.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar caso',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        try {
            await api.put(`/api/psychology/cases/${props.caseId}`, { status: 'closed' })
            loadCase()
            Swal.fire('Caso Cerrado', '', 'success')
        } catch (e) {
            Swal.fire('Error', 'No se pudo cerrar', 'error')
        }
    }
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
}

const getTypeLabel = (type: string) => {
    const map: any = {
        'observation': 'Observación',
        'interview': 'Entrevista',
        'agreement': 'Acuerdo',
        'family_meeting': 'Reunión Familiar',
        'sanction': 'Sanción'
    }
    return map[type] || type
}

const getEntryIconClass = (type: string) => {
    switch (type) {
        case 'observation': return 'bg-gray-400'
        case 'agreement': return 'bg-green-500'
        case 'interview': return 'bg-blue-500'
        case 'sanction': return 'bg-red-500'
        case 'family_meeting': return 'bg-purple-500'
        default: return 'bg-gray-400'
    }
}

watch(() => props.caseId, () => {
    loadCase()
})

onMounted(() => {
    loadCase()
})
</script>
