<template>
    <div class="space-y-6">
        <div class="bg-white shadow-sm rounded-lg p-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Categorías y Tipologías</h1>
                <p class="text-sm text-gray-600 mt-1">Gestione las categorías para clasificar casos (ej. Académico,
                    Conductual, Familiar)</p>
            </div>
            <div>
                <button @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Categoría
                </button>
            </div>
        </div>

        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>

            <div v-else-if="categories.length === 0" class="p-8 text-center text-gray-500">
                No hay categorías registradas.
            </div>

            <table v-else class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color
                        </th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Acciones</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="category in categories" :key="category.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ category.description || '-' }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :style="{ backgroundColor: category.color + '20', color: category.color }">
                                <span class="h-2 w-2 mr-1 rounded-full"
                                    :style="{ backgroundColor: category.color }"></span>
                                {{ category.color }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button @click="handleDelete(category)"
                                class="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Form -->
        <div v-if="showModal" class="fixed inset-0 overflow-y-auto z-50">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showModal = false">
                </div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Nueva Categoría</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" v-model="form.name"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea v-model="form.description" rows="2"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Color (Hex)</label>
                                <div class="flex items-center space-x-2 mt-1">
                                    <input type="color" v-model="form.color"
                                        class="h-8 w-12 p-0 border border-gray-300 rounded shadow-sm">
                                    <input type="text" v-model="form.color"
                                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            @click="saveCategory" :disabled="saving">
                            {{ saving ? 'Guardando...' : 'Guardar' }}
                        </button>
                        <button type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            @click="showModal = false">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePsychologyStore } from '../../stores/psychology'
import Swal from 'sweetalert2'

useHead({
    title: 'Categorías - Psicología'
})

definePageMeta({
    layout: 'default'
})

const store = usePsychologyStore()
const categories = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)

const form = ref({
    name: '',
    description: '',
    color: '#6366f1'
})

const loadCategories = async () => {
    loading.value = true
    const res = await store.fetchCategories()
    categories.value = res || []
    loading.value = false
}

const openModal = () => {
    form.value = { name: '', description: '', color: '#6366f1' }
    showModal.value = true
}

const saveCategory = async () => {
    if (!form.value.name) return

    saving.value = true
    const res = await store.createCategory(form.value)

    if (res.success) {
        showModal.value = false
        loadCategories()
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Categoría guardada', timer: 2000, showConfirmButton: false })
    } else {
        Swal.fire('Error', res.error, 'error')
    }
    saving.value = false
}

const handleDelete = async (category: any) => {
    const result = await Swal.fire({
        title: '¿Eliminar categoría?',
        text: 'Esto no afectará los casos existentes, pero ya no podrá seleccionarse.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    })

    if (result.isConfirmed) {
        const res = await store.deleteCategory(category.id)
        if (res.success) {
            loadCategories()
            Swal.fire('Eliminado', '', 'success')
        } else {
            Swal.fire('Error', res.error, 'error')
        }
    }
}

onMounted(() => {
    loadCategories()
})
</script>
