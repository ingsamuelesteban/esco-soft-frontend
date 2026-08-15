<template>
    <div class="h-full bg-gray-50 dark:bg-gray-900/50 flex flex-col p-6">
        <div class="mb-6 flex justify-between items-center flex-shrink-0">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Catálogo de Uniformes / Artículos</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Administra los artículos disponibles para facturación a
                    estudiantes.</p>
            </div>
            <div class="flex items-center gap-3">
                <NuxtLink to="/admin/admisiones/uniformes/planeacion-compras"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg class="-ml-1 mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Planeación
                </NuxtLink>
                <NuxtLink to="/admin/admisiones/uniformes/ordenes-pendientes"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg class="-ml-1 mr-2 h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Órdenes Pendientes
                </NuxtLink>
                <button @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir Artículo
                </button>
            </div>
        </div>

        <!-- Control de Visibilidad Global del Portal del Estudiante -->
        <div class="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:shadow-md">
            <div class="flex items-start sm:items-center gap-3.5">
                <div class="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">Mostrar disponibilidad de inventario a estudiantes</span>
                        <span title="Si está activo (true), los estudiantes verán en su dashboard un banner cuando tengan uniformes pagados o con stock reservado listos para retirar en administración. Si se desactiva (false), el banner nunca se mostrará." class="cursor-help text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors inline-flex">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Control global en tiempo real sobre la visibilidad de alertas de retiro e inventario de uniformes en el portal de los alumnos.</p>
                </div>
            </div>
            <div class="flex items-center gap-3 self-end sm:self-center">
                <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="mostrarExistenciaEstudiantes ? 'bg-green-100 text-green-800 dark:bg-green-950/80 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'">
                    {{ mostrarExistenciaEstudiantes ? 'Visible' : 'Oculto' }}
                </span>
                <button type="button" 
                    @click="toggleStudentVisibility" 
                    :disabled="loadingVisibility"
                    :class="[
                        mostrarExistenciaEstudiantes ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 shadow-inner'
                    ]"
                    role="switch" 
                    :aria-checked="mostrarExistenciaEstudiantes">
                    <span class="sr-only">Mostrar disponibilidad a estudiantes</span>
                    <span :class="[
                        mostrarExistenciaEstudiantes ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out'
                    ]" />
                </button>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-x-auto flex-1 overflow-y-auto">
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
                            Existencia
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Reservado
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Disponible
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
                            <div class="text-sm text-gray-900 dark:text-gray-100">{{ article.stock ?? 0 }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ article.reserved_stock ?? 0 }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-semibold" :class="((article.stock ?? 0) - (article.reserved_stock ?? 0)) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                {{ (article.stock ?? 0) - (article.reserved_stock ?? 0) }}
                            </div>
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
                            <button @click="addStockPrompt(article)"
                                title="Agregar existencia"
                                class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4 flex-inline items-center justify-center">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button @click="openAdjustModal(article)"
                                title="Ajuste Manual de Inventario"
                                class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 flex-inline items-center justify-center">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
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
                                                class="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                                                    class="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                    placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div v-if="!form.id">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Existencia Inicial</label>
                                            <input type="number" v-model.number="form.stock" required min="0" step="1"
                                                class="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="0" />
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

        <!-- Componente Modal de Ajuste -->
        <AdminUniformesAdjustStockModal
            :is-open="isAdjustModalOpen"
            :article="selectedArticleForAdjust"
            @close="isAdjustModalOpen = false"
            @adjusted="onStockAdjusted"
        />
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
const mostrarExistenciaEstudiantes = ref(true)
const loadingVisibility = ref(false)
const isOpen = ref(false)
const isAdjustModalOpen = ref(false)
const selectedArticleForAdjust = ref(null)

const form = ref({
    id: null,
    name: '',
    price: 0,
    is_active: true,
    stock: 0
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
        form.value = { id: null, name: '', price: 0, is_active: true, stock: 0 }
    }
    isOpen.value = true
}

const closeModal = () => {
    isOpen.value = false
    form.value = { id: null, name: '', price: 0, is_active: true, stock: 0 }
}

const addStockPrompt = async (article) => {
    const { value: quantity } = await Swal.fire({
        title: 'Agregar Existencia',
        text: `¿Cuántas unidades deseas añadir al stock físico de "${article.name}"?`,
        input: 'number',
        inputAttributes: {
            min: 1,
            step: 1
        },
        inputValue: 1,
        showCancelButton: true,
        confirmButtonText: 'Añadir',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || parseInt(value) <= 0) {
                return 'Debes ingresar un número entero mayor a cero.'
            }
        }
    })

    if (quantity) {
        try {
            await $api.post(`/api/admission-articles/${article.id}/add-stock`, {
                quantity: parseInt(quantity)
            })
            await fetchArticles()
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Existencia agregada correctamente',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (e) {
            console.error(e)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response?.data?.message || 'Error al agregar existencia'
            })
        }
    }
}

const openAdjustModal = (article) => {
    selectedArticleForAdjust.value = article
    isAdjustModalOpen.value = true
}

const onStockAdjusted = async () => {
    await fetchArticles()
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

const fetchVisibilitySetting = async () => {
    try {
        const response = await $api.get('/api/admin/uniforms/settings')
        if (response && response.mostrar_existencia_estudiantes !== undefined) {
            mostrarExistenciaEstudiantes.value = response.mostrar_existencia_estudiantes
        }
    } catch (e) {
        console.error('Error cargando configuración de visibilidad de uniformes:', e)
    }
}

const toggleStudentVisibility = async () => {
    if (loadingVisibility.value) return
    loadingVisibility.value = true
    const previousState = mostrarExistenciaEstudiantes.value
    const newState = !previousState
    
    try {
        mostrarExistenciaEstudiantes.value = newState
        const response = await $api.patch('/api/admin/uniforms/settings', {
            mostrar_existencia_estudiantes: newState
        })
        if (response && response.mostrar_existencia_estudiantes !== undefined) {
            mostrarExistenciaEstudiantes.value = response.mostrar_existencia_estudiantes
        }
        Swal.fire({
            icon: 'success',
            title: 'Visibilidad de inventario actualizada',
            toast: true,
            position: 'top-end',
            timer: 2500,
            showConfirmButton: false
        })
    } catch (e) {
        console.error('Error al actualizar visibilidad:', e)
        mostrarExistenciaEstudiantes.value = previousState
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.response?.data?.message || 'Error al cambiar la visibilidad de inventario',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        })
    } finally {
        loadingVisibility.value = false
    }
}

onMounted(() => {
    fetchArticles()
    fetchVisibilitySetting()
})
</script>
