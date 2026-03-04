<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Tienda de Uniformes</h1>
            <p class="text-gray-600 mb-8">Selecciona los artículos que necesitas. Una vez generes tu orden, podrás
                pagarla y retirarla por administración.</p>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Catálogo de Productos -->
                <div class="lg:w-2/3">
                    <div v-if="loading" class="text-center py-12">
                        <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="mt-4 text-gray-500">Cargando catálogo...</p>
                    </div>

                    <div v-else-if="catalogItems.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p class="text-gray-500">No hay artículos disponibles en este momento.</p>
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div v-for="article in catalogItems" :key="article.id"
                            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
                            <div class="p-6 flex-1 flex flex-col">
                                <h3 class="text-lg font-bold text-gray-900 mb-2">{{ article.name }}</h3>
                                <p class="text-2xl font-black text-primary-600 mb-4">${{
                                    parseFloat(article.price).toFixed(2) }}</p>
                                <div class="mt-auto pt-4 border-t border-gray-100">
                                    <button @click="addToCart(article)"
                                        class="w-full flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white px-4 py-2 rounded-md font-medium transition-colors">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Agregar a la Orden</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de Orden (Carrito) -->
                <div class="lg:w-1/3">
                    <div class="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-6">
                        <div class="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Resumen de tu Orden
                            </h2>
                        </div>

                        <div class="p-6 max-h-[50vh] overflow-y-auto">
                            <div v-if="cart.length === 0" class="text-center text-gray-500 py-8">
                                <p>Tu orden está vacía.</p>
                                <p class="text-sm mt-2">Agrega artículos desde el catálogo.</p>
                            </div>

                            <ul v-else class="space-y-4">
                                <li v-for="(item, index) in cart" :key="item.article.id"
                                    class="flex flex-col gap-2 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div class="flex justify-between items-start">
                                        <span class="font-medium text-gray-900">{{ item.article.name }}</span>
                                        <button @click="removeFromCart(index)"
                                            class="text-gray-400 hover:text-red-500 transition-colors">
                                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-center mt-1">
                                        <div class="flex items-center border rounded-md border-gray-200 shadow-sm">
                                            <button @click="decreaseQty(index)"
                                                class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                                            <span
                                                class="px-3 py-1 font-medium text-sm w-8 text-center bg-gray-50 border-x border-gray-200">{{
                                                    item.quantity }}</span>
                                            <button @click="increaseQty(index)"
                                                class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                                        </div>
                                        <span class="font-semibold text-gray-900">${{ (item.article.price *
                                            item.quantity).toFixed(2) }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div class="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div class="flex justify-between items-center mb-6">
                                <span class="text-lg font-medium text-gray-700">Total a Pagar:</span>
                                <span class="text-2xl font-bold text-gray-900">${{ cartTotal.toFixed(2) }}</span>
                            </div>
                            <button @click="submitOrder" :disabled="cart.length === 0 || isSubmitting"
                                class="w-full flex justify-center items-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <span v-if="isSubmitting"><svg class="animate-spin h-5 w-5 text-white" fill="none"
                                        viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg> Procesando...</span>
                                <span v-else>Confirmar Orden</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historial de Órdenes (Listado Simple) -->
            <div class="mt-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Mis Órdenes de Uniformes</h2>
                <div v-if="loadingOrders" class="text-center py-4">Cargando órdenes...</div>
                <div v-else-if="myOrders.length === 0"
                    class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
                    Aún no has realizado ninguna orden de uniformes.
                </div>
                <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" class="divide-y divide-gray-200">
                        <li v-for="order in myOrders" :key="order.id">
                            <div class="block hover:bg-gray-50 p-4 sm:px-6">
                                <div class="flex items-center justify-between">
                                    <div class="text-sm font-bold text-primary-600 truncate py-1">
                                        {{ order.invoice_number }}
                                    </div>
                                    <div class="ml-2 flex-shrink-0 flex gap-2">
                                        <span :class="[
                                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                                        ]">
                                            {{ order.payment_status === 'paid' ? 'Pagado' : 'Pago Pendiente' }}
                                        </span>
                                        <span :class="[
                                            order.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.delivery_status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                                        ]">
                                            Entrega: {{ deliveryStatusText(order.delivery_status) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="mt-2 sm:flex sm:justify-between">
                                    <div class="sm:flex flex-col text-sm text-gray-500">
                                        <p>
                                            Total: <span class="font-bold text-gray-900">${{
                                                parseFloat(order.total_amount).toFixed(2) }}</span>
                                        </p>
                                        <ul class="mt-2 pl-4 list-disc list-inside">
                                            <li v-for="d in order.details" :key="d.id" class="text-xs">
                                                {{ d.quantity }}x {{ d.article?.name }} <span
                                                    v-if="d.delivered_quantity > 0" class="text-green-600">({{
                                                        d.delivered_quantity }} entregados)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>
                                            Ordenada el {{ new Date(order.created_at).toLocaleDateString('es-DO') }}
                                        </p>
                                    </div>
                                    <div class="mt-2 text-right">
                                        <button @click="printInvoice(order.id)"
                                            class="text-sm font-medium text-primary-600 hover:text-primary-900 inline-flex items-center">
                                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Imprimir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({ layout: 'student', middleware: ['auth'] })

const auth = useAuthStore()
const { $api } = useNuxtApp()
const { printPdfBlob } = usePrint()

const loading = ref(false)
const catalogItems = ref([])
const cart = ref([])
const isSubmitting = ref(false)

const loadingOrders = ref(false)
const myOrders = ref([])

const fetchCatalog = async () => {
    loading.value = true
    try {
        const resp = await $api.get('/api/admission-articles', { params: { active: 1, per_page: 100 } })
        catalogItems.value = resp
    } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar el catálogo de uniformes.', 'error')
    } finally {
        loading.value = false
    }
}

const fetchMyOrders = async () => {
    loadingOrders.value = true
    try {
        // En backend, StudentInvoiceController index por defecto aplica tenant_id.
        // Pero necesitamos filtrar solo las de ESTE estudiante logueado.
        const resp = await $api.get('/api/student-invoices', {
            params: { estudiante_id: auth.user.estudiante_id || auth.user.estudiante?.id }
        })
        myOrders.value = resp.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingOrders.value = false
    }
}

const addToCart = (article) => {
    const existing = cart.value.find(i => i.article.id === article.id)
    if (existing) {
        existing.quantity++
    } else {
        cart.value.push({ article, quantity: 1 })
    }
}

const increaseQty = (index) => cart.value[index].quantity++
const decreaseQty = (index) => {
    if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
    }
}
const removeFromCart = (index) => cart.value.splice(index, 1)

const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.article.price * item.quantity), 0)
})

const deliveryStatusText = (status) => {
    const map = { pending: 'Pendiente', partial: 'Parcial', delivered: 'Completada' }
    return map[status] || status
}

const submitOrder = async () => {
    if (cart.value.length === 0) return
    if (!auth.user.estudiante_id && !auth.user.estudiante?.id) {
        Swal.fire('Error', 'No se ha detectado el perfil de estudiante de tu cuenta.', 'error')
        return
    }

    isSubmitting.value = true

    const payload = {
        estudiante_id: auth.user.estudiante_id || auth.user.estudiante?.id,
        notes: 'Orden generada desde el Dashboard del Estudiante',
        items: cart.value.map(item => ({
            article_id: item.article.id,
            quantity: item.quantity
        }))
    }

    try {
        await $api.post('/api/student-invoices', payload)
        Swal.fire({
            title: '¡Orden Creada Exitosamente!',
            text: 'Tu orden ha sido registrada. Puedes pasar por administración a pagarla y retirar tus artículos.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        })
        cart.value = [] // clear cart
        fetchMyOrders() // refresh list
    } catch (e) {
        Swal.fire('Error', e.response?.data?.message || 'Error al procesar tu orden', 'error')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchCatalog()
    if (auth.user.estudiante_id || auth.user.estudiante?.id) {
        fetchMyOrders()
    }
})

const printInvoice = async (id) => {
    try {
        Swal.fire({ title: 'Obteniendo Recibo...', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const response = await $api.get(`/api/student-invoices/${id}/pdf`, { responseType: 'blob' })

        const blob = response.data ? new Blob([response.data], { type: 'application/pdf' }) : new Blob([response], { type: 'application/pdf' });

        Swal.close()
        printPdfBlob(blob, `orden_uniforme_${id}.pdf`, 'Preparando orden para impresión...')
    } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo descargar el recibo.', 'error')
    }
}
</script>
