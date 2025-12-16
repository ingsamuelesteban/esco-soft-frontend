<template>
    <div>
        <header class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-gray-900">Años Lectivos</h1>
                <button @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Nuevo Año Lectivo
                </button>
            </div>
        </header>

        <div class="p-6">
            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded mb-6">
                {{ error }}
            </div>

            <!-- List -->
            <div v-else class="bg-white shadow overflow-hidden rounded-md">
                <ul class="divide-y divide-gray-200">
                    <li v-for="anio in items" :key="anio.id"
                        class="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                        <div>
                            <div class="text-sm font-medium text-gray-900">{{ anio.nombre }}</div>
                            <div class="text-sm text-gray-500">{{ anio.descripcion || 'Sin descripción' }}</div>
                        </div>
                        <div class="flex items-center gap-4">
                            <!-- Toggle Activo -->
                            <button @click="toggleActive(anio)" 
                                class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                :class="anio.activo ? 'bg-blue-600' : 'bg-gray-200'"
                                :title="anio.activo ? 'Año activo actualmente' : 'Click para activar este año'">
                                <span class="sr-only">Usar configuración</span>
                                <span aria-hidden="true" 
                                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                                    :class="anio.activo ? 'translate-x-5' : 'translate-x-0'">
                                </span>
                            </button>
                            
                            <button @click="openModal(anio)"
                                class="text-blue-600 hover:text-blue-900 text-sm font-medium">Editar</button>
                            <button @click="confirmDelete(anio)"
                                class="text-red-600 hover:text-red-900 text-sm font-medium">Eliminar</button>
                        </div>
                    </li>
                    <li v-if="items.length === 0" class="px-6 py-12 text-center text-gray-500">
                        No hay años lectivos registrados.
                    </li>
                </ul>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div class="px-6 py-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ isEdit ? 'Editar Año Lectivo' : 'Nuevo Año Lectivo'
                    }}</h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Cerrar</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="save">
                    <div class="px-6 py-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input v-model="form.nombre" type="text" required placeholder="Ej. 2025-2"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea v-model="form.descripcion" rows="2"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                        <div class="flex items-center">
                            <input id="activo" v-model="form.activo" type="checkbox"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="activo" class="ml-2 block text-sm text-gray-900">Activo</label>
                        </div>
                        <div v-if="formError" class="text-red-600 text-sm">{{ formError }}</div>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" @click="closeModal" :disabled="loading"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="loading"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center">
                            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            {{ loading ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAniosLectivosStore, type AnioLectivo } from '../../../stores/anios_lectivos'

const store = useAniosLectivosStore()
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const items = computed(() => store.items)

const showModal = ref(false)
const isEdit = ref(false)
const formError = ref<string | null>(null)
const editingId = ref<number | null>(null)

const form = reactive({
    nombre: '',
    descripcion: '' as string | null | undefined,
    activo: true
})

onMounted(() => {
    store.fetchAll()
})

function openModal(item?: AnioLectivo) {
    formError.value = null
    if (item) {
        isEdit.value = true
        editingId.value = item.id
        form.nombre = item.nombre
        form.descripcion = item.descripcion
        form.activo = item.activo
    } else {
        isEdit.value = false
        editingId.value = null
        form.nombre = ''
        form.descripcion = ''
        form.activo = true
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

async function save() {
    formError.value = null
    try {
        if (isEdit.value && editingId.value) {
            await store.update(editingId.value, form)
        } else {
            await store.create(form)
        }
        closeModal()
    } catch (e: any) {
        formError.value = e.response?.data?.message || 'Error al guardar'
    }
}

async function confirmDelete(item: AnioLectivo) {
    if (confirm(`¿Estás seguro de eliminar el año lectivo "${item.nombre}"?`)) {
        try {
            await store.delete(item.id)
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error al eliminar')
        }
    }
}

async function toggleActive(item: AnioLectivo) {
    // Removed guard to allow re-activating an item which triggers the backend cleanup
    // if (item.activo) return 
    
    // Optimistic UI Update:
    // 1. Snapshot current state in case we need to revert
    const previousState = items.value.map(i => ({ id: i.id, activo: i.activo }))
    
    // 2. Update local state immediately
    store.items.forEach(i => {
        i.activo = (i.id === item.id)
    })
    
    try {
        // 3. Call backend
        await store.update(item.id, { activo: true })
        // 4. Reload to be sure (optional if optimistic worked perfect, but good for consistency)
        await store.fetchAll()
    } catch (e: any) {
        // Revert on error
        store.items.forEach(i => {
            const prev = previousState.find(p => p.id === i.id)
            if (prev) i.activo = prev.activo
        })
        alert(e.response?.data?.message || 'Error al actualizar estado')
    }
}
</script>
