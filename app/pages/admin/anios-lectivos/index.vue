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
                            <span class="inline-flex px-2 text-xs leading-5 font-semibold rounded-full"
                                :class="anio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                {{ anio.activo ? 'Activo' : 'Inactivo' }}
                            </span>
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
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Guardar</button>
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
</script>
