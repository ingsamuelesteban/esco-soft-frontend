<template>
    <div class="h-full bg-gray-50 dark:bg-gray-900/50 flex flex-col p-6">
        <div class="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 flex-shrink-0">
            <div>
                <div class="flex items-center gap-3">
                    <NuxtLink to="/admin/admisiones/uniformes" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </NuxtLink>
                    <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Órdenes Pendientes de Uniformes</h1>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-9">Gestiona la visibilidad individual y masiva de las facturas no entregadas en el portal de estudiantes.</p>
            </div>
        </div>

        <!-- Master Switch and Search -->
        <div class="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="flex items-center gap-4 w-full lg:w-1/3">
                <div class="relative w-full">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input type="text" v-model="searchQuery" @input="debounceSearch"
                        placeholder="Buscar por factura o estudiante..."
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors" />
                </div>
            </div>

            <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900 dark:text-gray-100">Visibilidad Masiva (Todas las Órdenes)</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Mostrar/Ocultar todas las órdenes pendientes a los estudiantes.</span>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button type="button" 
                        @click="toggleBulkVisibility(false)" 
                        :disabled="loadingBulk"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                        Ocultar Todas
                    </button>
                    <button type="button" 
                        @click="toggleBulkVisibility(true)" 
                        :disabled="loadingBulk"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                        Mostrar Todas
                    </button>
                </div>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-x-auto flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Factura #</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estudiante / Aula</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiempo de Espera</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resumen de Prendas</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibilidad</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ order.invoice_number }}</div>
                            <div class="text-xs text-gray-500">{{ new Date(order.created_at).toLocaleDateString() }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {{ order.estudiante?.nombres }} {{ order.estudiante?.apellidos }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {{ order.estudiante?.aula?.titulo?.nombre || 'Sin aula' }} - {{ order.estudiante?.aula?.grado_cardinal }} {{ order.estudiante?.aula?.seccion }}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                <svg class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ getWaitTime(order.created_at) }}
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" :title="getSummary(order)">
                                {{ getSummary(order) }}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col gap-1">
                                <span :class="[
                                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : (order.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'),
                                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit'
                                ]">
                                    Pago: {{ order.payment_status === 'paid' ? 'Pagado' : (order.payment_status === 'partial' ? 'Parcial' : 'Pendiente') }}
                                </span>
                                <span :class="[
                                    order.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' : (order.delivery_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'),
                                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit'
                                ]">
                                    Entrega: {{ order.delivery_status === 'delivered' ? 'Entregado' : (order.delivery_status === 'partial' ? 'Parcial' : 'Pendiente') }}
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <button type="button" 
                                @click="toggleVisibility(order)" 
                                :class="[
                                    order.is_visible_to_student ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
                                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-inner'
                                ]"
                                role="switch" 
                                :aria-checked="order.is_visible_to_student">
                                <span class="sr-only">Toggle Visibility</span>
                                <span :class="[
                                    order.is_visible_to_student ? 'translate-x-5' : 'translate-x-0',
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out'
                                ]" />
                            </button>
                        </td>
                    </tr>
                    <tr v-if="orders.length === 0 && !loading">
                        <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron órdenes pendientes.
                        </td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Cargando órdenes...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Paginación -->
        <div v-if="pagination.last_page > 1" class="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700">
            <div class="flex flex-1 justify-between sm:hidden">
                <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando
                        <span class="font-medium">{{ (pagination.current_page - 1) * 15 + 1 }}</span>
                        a
                        <span class="font-medium">{{ Math.min(pagination.current_page * 15, pagination.total) }}</span>
                        de
                        <span class="font-medium">{{ pagination.total }}</span>
                        resultados
                    </p>
                </div>
                <div>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                            <span class="sr-only">Anterior</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button v-for="page in pagination.last_page" :key="page" @click="changePage(page)"
                            :class="[
                                page === pagination.current_page ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600' : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700'
                            ]">
                            {{ page }}
                        </button>
                        <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                            <span class="sr-only">Siguiente</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

definePageMeta({
    middleware: ['auth']
})

const { $api } = useNuxtApp()

const orders = ref([])
const loading = ref(false)
const loadingBulk = ref(false)
const searchQuery = ref('')
const searchTimeout = ref(null)

const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0
})

const fetchOrders = async (page = 1) => {
    loading.value = true
    try {
        const response = await $api.get('/api/admin/uniforms/pending-orders', {
            params: {
                page,
                search: searchQuery.value
            }
        })
        orders.value = response.data
        pagination.value = {
            current_page: response.current_page,
            last_page: response.last_page,
            total: response.total
        }
    } catch (e) {
        console.error('Error cargando órdenes pendientes:', e)
    } finally {
        loading.value = false
    }
}

const debounceSearch = () => {
    if (searchTimeout.value) clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
        fetchOrders(1)
    }, 500)
}

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        fetchOrders(page)
    }
}

const getSummary = (order) => {
    if (!order.details || order.details.length === 0) return 'Sin prendas'
    const items = order.details.map(d => `${d.pending_quantity}x ${d.article?.name || 'Art.'}`)
    return items.join(', ')
}

const getWaitTime = (createdAt) => {
    const start = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return '1 día'
    return `${diffDays} días`
}

const toggleVisibility = async (order) => {
    const previousState = order.is_visible_to_student
    const newState = !previousState
    
    // Optimistic UI update
    order.is_visible_to_student = newState
    
    try {
        await $api.patch(`/api/admin/uniforms/pending-orders/${order.id}/toggle-visibility`, {
            is_visible_to_student: newState
        })
        Swal.fire({
            icon: 'success',
            title: newState ? 'Orden visible para el estudiante' : 'Orden oculta para el estudiante',
            toast: true,
            position: 'top-end',
            timer: 2500,
            showConfirmButton: false
        })
    } catch (e) {
        console.error('Error al actualizar visibilidad de orden:', e)
        // Revert on error
        order.is_visible_to_student = previousState
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la visibilidad',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        })
    }
}

const toggleBulkVisibility = async (visible) => {
    const textAction = visible ? 'mostrar' : 'ocultar'
    const { isConfirmed } = await Swal.fire({
        title: `¿Estás seguro?`,
        text: `Esto va a ${textAction} TODAS las órdenes pendientes a los estudiantes.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: visible ? '#16a34a' : '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Sí, ${textAction}`,
        cancelButtonText: 'Cancelar'
    })

    if (isConfirmed) {
        loadingBulk.value = true
        try {
            await $api.patch('/api/admin/uniforms/pending-orders/bulk-visibility', {
                visible
            })
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: `Todas las órdenes han sido ${visible ? 'mostradas' : 'ocultadas'}.`,
                timer: 2000,
                showConfirmButton: false
            })
            // Recargar órdenes
            await fetchOrders(pagination.value.current_page)
        } catch (e) {
            console.error(e)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al actualizar la visibilidad masiva.'
            })
        } finally {
            loadingBulk.value = false
        }
    }
}

onMounted(() => {
    fetchOrders()
})
</script>
