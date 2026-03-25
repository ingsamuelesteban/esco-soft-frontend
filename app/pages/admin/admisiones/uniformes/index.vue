<template>
    <div class="h-full bg-gray-50 dark:bg-gray-900/50 flex flex-col p-6">
        <div class="mb-6 flex justify-between items-center flex-shrink-0">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Catálogo de Uniformes / Artículos</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Administra los artículos disponibles para facturación a
                    estudiantes.</p>
            </div>
            <div>
                <button @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir Artículo
                </button>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Artículo
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Precio
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Estado
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50 dark:bg-gray-900/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ article.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 dark:text-gray-100">${{ parseFloat(article.price).toFixed(2) }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                article.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                            ]">
                                {{ article.is_active ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button @click="openModal(article)"
                                class="text-primary-600 hover:text-primary-900 mr-4 flex-inline items-center justify-center">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button @click="deleteArticle(article.id)"
                                class="text-red-600 hover:text-red-900 flex-inline items-center justify-center">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="articles.length === 0 && !loading">
                        <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No hay artículos registrados.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                    enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel
                                class="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <form @submit.prevent="saveArticle">
                                    <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                            {{ form.id ? 'Editar Artículo' : 'Nuevo Artículo' }}
                                        </DialogTitle>
                                        <button type="button" @click="closeModal"
                                            class="text-gray-400 hover:text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                                            <span class="sr-only">Close</span>
                                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div class="px-6 py-4 space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                            <input type="text" v-model="form.name" required
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Ej. Polo Shirt Talla M" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                                            <div class="relative mt-1 rounded-md shadow-sm">
                                                <div
                                                    class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                                </div>
                                                <input type="number" v-model="form.price" required min="0" step="0.01"
                                                    class="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                    placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div class="flex items-center mt-4">
                                            <input type="checkbox" v-model="form.is_active" id="is_active"
                                                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded" />
                                            <label for="is_active" class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Artículo Activo
                                            </label>
                                        </div>
                                    </div>

                                    <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex flex-row-reverse rounded-b-xl gap-2">
                                        <button type="submit" :disabled="saving"
                                            class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50">
                                            {{ saving ? 'Guardando...' : 'Guardar' }}
                                        </button>
                                        <button type="button" @click="closeModal"
                                            class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import Swal from 'sweetalert2'

definePageMeta({
    middleware: ['auth']
})

const { $api } = useNuxtApp()

const articles = ref([])
const loading = ref(false)
const saving = ref(false)
const isOpen = ref(false)
const form = ref({
    id: null,
    name: '',
    price: 0,
    is_active: true
})

const fetchArticles = async () => {
    loading.value = true
    try {
        const response = await $api.get('/api/admission-articles')
        articles.value = response
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const openModal = (article = null) => {
    if (article) {
        form.value = { ...article }
    } else {
        form.value = { id: null, name: '', price: 0, is_active: true }
    }
    isOpen.value = true
}

const closeModal = () => {
    isOpen.value = false
    form.value = { id: null, name: '', price: 0, is_active: true }
}

const saveArticle = async () => {
    saving.value = true
    try {
        if (form.value.id) {
            await $api.put(`/api/admission-articles/${form.value.id}`, form.value)
        } else {
            await $api.post('/api/admission-articles', form.value)
        }
        await fetchArticles()
        closeModal()
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Artículo guardado correctamente',
            timer: 1500,
            showConfirmButton: false
        })
    } catch (e) {
        console.error(e)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.response?.data?.message || 'Error al guardar el artículo'
        })
    } finally {
        saving.value = false
    }
}

const deleteArticle = async (id) => {
    const { isConfirmed } = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (isConfirmed) {
        try {
            await $api.delete(`/api/admission-articles/${id}`)
            await fetchArticles()
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El artículo ha sido eliminado.',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (e) {
            console.error(e)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response?.data?.message || 'No se pudo eliminar el artículo'
            })
        }
    }
}

onMounted(() => {
    fetchArticles()
})
</script>
