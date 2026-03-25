<template>
    <div class="h-full bg-gray-50 dark:bg-gray-900/50 flex flex-col p-6">
        <div class="mb-6 flex justify-between items-center flex-shrink-0">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Facturación de Uniformes</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona las órdenes de uniformes, pagos y entregas de estudiantes
                    activos.</p>
            </div>
            <div>
                <button @click="openCreateModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Orden / Factura
                </button>
            </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700 mb-6 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar Factura o Estudiante</label>
                <input type="text" v-model="filters.search" @keyup.enter="fetchInvoices(1)"
                    placeholder="Nº Factura o Nombre..."
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div class="flex-1 min-w-[150px]">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado de Pago</label>
                <select v-model="filters.payment_status" @change="fetchInvoices"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                </select>
            </div>
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado de Entrega</label>
                <select v-model="filters.delivery_status" @change="fetchInvoices"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="partial">Parcial</option>
                    <option value="delivered">Entregado</option>
                </select>
            </div>
            <div class="flex-none">
                <button @click="fetchInvoices(1)"
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
                    Buscar
                </button>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Factura</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Estudiante</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pago
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Entrega</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50 dark:bg-gray-900/50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{
                            invoice.invoice_number }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ invoice.estudiante?.nombres }} {{ invoice.estudiante?.apellidos }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{
                            parseFloat(invoice.total_amount).toFixed(2) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                            ]">
                                {{ invoice.payment_status === 'paid' ? 'Pagado' : 'Pendiente' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                invoice.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    invoice.delivery_status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                            ]">
                                {{ deliveryStatusText(invoice.delivery_status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button @click="openManageModal(invoice)"
                                class="text-primary-600 hover:text-primary-900 ml-4">Gestionar</button>
                        </td>
                    </tr>
                    <tr v-if="(invoices || []).length === 0 && !loading">
                        <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No hay facturas registradas.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Paginación -->
        <div class="mt-4 flex items-center justify-between" v-if="pagination.last_page > 1">
            <button @click="fetchInvoices(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
                class="px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50">Anterior</button>
            <span class="text-sm text-gray-600 dark:text-gray-400">Página {{ pagination.current_page }} de {{ pagination.last_page
                }}</span>
            <button @click="fetchInvoices(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
                class="px-4 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50">Siguiente</button>
        </div>


        <!-- MODAL GESTION (Pago / Entregas) -->
        <TransitionRoot appear :show="isManageOpen" as="template">
            <Dialog as="div" @close="closeManageModal" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                    enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel
                                class="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <form @submit.prevent="submitDeliveries">
                                    <div
                                        class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                        <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                            Gestionar Factura {{ selectedInvoice?.invoice_number }}
                                        </DialogTitle>
                                        <button type="button" @click="closeManageModal"
                                            class="text-gray-400 hover:text-gray-500 dark:text-gray-400">
                                            <span class="sr-only">Cerrar</span>
                                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="px-6 py-4 space-y-6" v-if="selectedInvoice">
                                        <!-- Pago -->
                                        <div
                                            class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                                            <div class="flex flex-col gap-1 w-full md:w-auto">
                                                <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Balance de Factura</h4>
                                                <p class="text-xs text-gray-500 dark:text-gray-400">Monto Total: <span
                                                        class="font-semibold text-gray-700 dark:text-gray-300">${{
                                                            parseFloat(selectedInvoice.total_amount).toFixed(2) }}</span>
                                                </p>
                                                <p class="text-xs text-green-600">Pagado: <span
                                                        class="font-semibold">${{ parseFloat(selectedInvoice.amount_paid
                                                            || 0).toFixed(2) }}</span></p>
                                                <p class="text-sm text-red-600 mt-1">Pendiente: <span
                                                        class="font-bold">${{ (parseFloat(selectedInvoice.total_amount)
                                                            - parseFloat(selectedInvoice.amount_paid || 0)).toFixed(2)
                                                        }}</span></p>
                                            </div>
                                            <div class="w-full md:w-auto flex flex-col items-end justify-center">
                                                <span v-if="selectedInvoice.payment_status === 'paid'"
                                                    class="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 self-end">
                                                    Pagado en su totalidad
                                                </span>
                                                <div v-else class="flex flex-col gap-2 w-full md:w-auto">
                                                    <div class="flex flex-row items-center justify-end gap-2">
                                                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Abonar:</span>
                                                        <div class="relative rounded-md shadow-sm w-32">
                                                            <div
                                                                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                                <span class="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                                            </div>
                                                            <input type="number" v-model="abonoAmount" min="1"
                                                                :max="parseFloat(selectedInvoice.total_amount) - parseFloat(selectedInvoice.amount_paid || 0)"
                                                                step="0.01"
                                                                class="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-7 focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                                        </div>
                                                    </div>
                                                    <button @click.prevent="registerAbono" type="button"
                                                        :disabled="!abonoAmount || abonoAmount <= 0"
                                                        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                                                        Registrar Abono
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Entregas -->
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Artículos a Entregar</h4>

                                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead class="bg-gray-50 dark:bg-gray-900/50">
                                                    <tr>
                                                        <th
                                                            class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            Artículo</th>
                                                        <th
                                                            class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            Solicitado</th>
                                                        <th
                                                            class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            Pendiente</th>
                                                        <th
                                                            class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            Marcar Entrega</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                                    <tr v-for="(detail, index) in selectedInvoice.details"
                                                        :key="detail.id">
                                                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{
                                                            detail.article?.name }}</td>
                                                        <td class="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{{
                                                            detail.quantity }}</td>
                                                        <td
                                                            class="px-4 py-3 text-sm text-center text-red-600 font-medium">
                                                            {{ detail.pending_quantity }}</td>
                                                        <td class="px-4 py-3 text-sm text-center">
                                                            <input type="number" v-model.number="deliveries[detail.id]"
                                                                min="0" :max="detail.pending_quantity"
                                                                :disabled="detail.pending_quantity === 0"
                                                                class="w-20 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-center disabled:opacity-50">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div
                                        class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-between items-center rounded-b-xl border-t border-gray-200 dark:border-gray-700">
                                        <button type="button" @click="printInvoice(selectedInvoice?.id)"
                                            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 font-medium text-sm flex items-center">
                                            <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Imprimir Factura
                                        </button>
                                        <div class="flex gap-2">
                                            <button type="button" @click="closeManageModal"
                                                class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900/50">
                                                Cerrar
                                            </button>
                                            <button type="submit" :disabled="!hasPendingDeliveriesToSave"
                                                class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50">
                                                Guardar Entregas
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- MODAL CREACIÓN -->
        <TransitionRoot appear :show="isCreateOpen" as="template">
            <Dialog as="div" @close="closeCreateModal" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                    enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel
                                class="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                                <div
                                    class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                                    <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                        Nueva Factura de Uniformes
                                    </DialogTitle>
                                    <button type="button" @click="closeCreateModal"
                                        class="text-gray-400 hover:text-gray-500 dark:text-gray-400">
                                        <span class="sr-only">Cerrar</span>
                                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row gap-6">
                                    <!-- Selección de Estudiante -->
                                    <div class="md:w-1/3 space-y-4">
                                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b pb-2">Selección
                                                de Estudiante</h4>

                                            <div v-if="!selectedStudent">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por
                                                    nombre, apellido o matrícula</label>
                                                <div class="flex gap-2">
                                                    <input type="text" v-model="searchQuery"
                                                        @keyup.enter="searchStudents"
                                                        class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                        placeholder="Ej. Juan Pérez">
                                                    <button type="button" @click="searchStudents"
                                                        class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700">Buscar</button>
                                                </div>

                                                <div v-if="searchResults.length > 0"
                                                    class="mt-4 border rounded-md divide-y overflow-y-auto max-h-40 bg-white dark:bg-gray-800">
                                                    <div v-for="student in searchResults" :key="student.id"
                                                        @click="selectStudent(student)"
                                                        class="p-3 text-sm cursor-pointer hover:bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                                                        <div>
                                                            <div class="font-medium text-gray-900 dark:text-gray-100">{{ student.nombres }}
                                                                {{ student.apellidos }}</div>
                                                            <div class="text-xs text-gray-500 dark:text-gray-400" v-if="student.matricula">
                                                                Matrícula: {{ student.matricula }}</div>
                                                        </div>
                                                        <svg class="w-4 h-4 text-primary-500" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div v-if="searchPerformed && searchResults.length === 0"
                                                    class="mt-2 text-sm text-red-500">
                                                    No se encontraron estudiantes.
                                                </div>
                                            </div>

                                            <div v-else
                                                class="flex justify-between items-center border border-primary-200 bg-primary-50 p-3 rounded-md">
                                                <div>
                                                    <div class="font-medium text-primary-900">{{ selectedStudent.nombres
                                                        }} {{ selectedStudent.apellidos }}</div>
                                                    <div class="text-xs text-primary-700">{{ selectedStudent.matricula
                                                        || 'Sin matrícula' }}</div>
                                                </div>
                                                <button type="button" @click="clearStudent"
                                                    class="text-primary-600 hover:text-primary-800 text-sm font-medium">Cambiar</button>
                                            </div>
                                        </div>

                                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas
                                                (Opcional)</label>
                                            <textarea v-model="createNotes" rows="3"
                                                class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                placeholder="Observaciones de la factura..."></textarea>
                                        </div>
                                    </div>

                                    <!-- Catálogo y Carrito -->
                                    <div class="md:w-2/3 flex flex-col gap-4">
                                        <!-- Catálogo -->
                                        <div
                                            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div
                                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                                                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Artículos Disponibles
                                                </h4>
                                            </div>
                                            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700 max-h-48 overflow-y-auto">
                                                <li v-for="article in catalogItems" :key="article.id"
                                                    class="p-4 flex items-center justify-between hover:bg-gray-50 dark:bg-gray-900/50">
                                                    <div>
                                                        <div class="font-medium text-sm text-gray-900 dark:text-gray-100">{{ article.name
                                                            }}</div>
                                                        <div class="text-sm text-primary-600 font-semibold">${{
                                                            parseFloat(article.price).toFixed(2) }}</div>
                                                    </div>
                                                    <button type="button" @click="addToCart(article)"
                                                        class="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                                            stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </li>
                                                <li v-if="catalogItems.length === 0"
                                                    class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Cargando catálogo...
                                                </li>
                                            </ul>
                                        </div>

                                        <!-- Carrito -->
                                        <div
                                            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                                            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Factura Actual</h4>
                                            </div>
                                            <div class="flex-1 overflow-y-auto p-4">
                                                <div v-if="cart.length === 0"
                                                    class="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                                                    No hay artículos seleccionados
                                                </div>
                                                <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                                                    <li v-for="(item, index) in cart" :key="item.article.id"
                                                        class="py-3 flex justify-between items-center">
                                                        <div class="flex-1">
                                                            <div class="font-medium text-sm text-gray-900 dark:text-gray-100">{{
                                                                item.article.name }}</div>
                                                            <div class="text-sm text-gray-500 dark:text-gray-400">${{
                                                                parseFloat(item.article.price).toFixed(2) }} × {{
                                                                    item.quantity }} = <span
                                                                    class="text-gray-900 dark:text-gray-100 font-medium">${{
                                                                        (item.article.price * item.quantity).toFixed(2)
                                                                    }}</span></div>
                                                        </div>
                                                        <div class="flex items-center gap-3">
                                                            <div class="flex items-center border rounded-md">
                                                                <button type="button" @click="decreaseQty(index)"
                                                                    class="p-1 px-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-900/50">-</button>
                                                                <span
                                                                    class="px-2 text-sm text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">{{
                                                                        item.quantity }}</span>
                                                                <button type="button" @click="increaseQty(index)"
                                                                    class="p-1 px-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-900/50">+</button>
                                                            </div>
                                                            <button type="button" @click="removeFromCart(index)"
                                                                class="text-red-500 hover:text-red-700 p-1">
                                                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                                                    stroke="currentColor">
                                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                                        stroke-width="2"
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                                <div
                                                    class="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    <span>Total Factura:</span>
                                                    <span>${{ cartTotal.toFixed(2) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                                    <button type="button" @click="closeCreateModal"
                                        class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900/50">
                                        Cancelar
                                    </button>
                                    <button type="button" @click="createInvoice"
                                        :disabled="!isCreateValid || isSubmitting"
                                        class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 min-w-[120px]">
                                        <span v-if="isSubmitting"><svg
                                                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline flex-shrink-0"
                                                fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg> Generando...</span>
                                        <span v-else>Generar Factura</span>
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({ middleware: ['auth'] })

const { $api } = useNuxtApp()
const { printPdfBlob } = usePrint()

const invoices = ref([])
const loading = ref(false)
const isManageOpen = ref(false)
const isCreateOpen = ref(false)
const selectedInvoice = ref(null)
const deliveries = ref({}) // map of detail_id -> qty to deliver
const abonoAmount = ref('')

// Creation state
const selectedStudent = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const searchPerformed = ref(false)
const catalogItems = ref([])
const cart = ref([])
const createNotes = ref('')
const isSubmitting = ref(false)

const filters = ref({
    search: '',
    payment_status: '',
    delivery_status: ''
})

const pagination = ref({ current_page: 1, last_page: 1 })

const fetchInvoices = async (page = 1) => {
    loading.value = true
    try {
        const response = await $api.get('/api/student-invoices', {
            params: { page, ...filters.value }
        })
        invoices.value = response.data
        pagination.value = {
            current_page: response.current_page,
            last_page: response.last_page
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const deliveryStatusText = (status) => {
    const map = { pending: 'Pendiente', partial: 'Parcial', delivered: 'Entregado' }
    return map[status] || status
}

const openManageModal = (invoice) => {
    selectedInvoice.value = invoice
    abonoAmount.value = ''
    deliveries.value = {}
    invoice.details.forEach(d => {
        deliveries.value[d.id] = 0 // Inicializar inputs en 0
    })
    isManageOpen.value = true
}

const closeManageModal = () => {
    isManageOpen.value = false
    selectedInvoice.value = null
}

const registerAbono = async () => {
    if (!abonoAmount.value || abonoAmount.value <= 0) return

    try {
        const response = await $api.post(`/api/student-invoices/${selectedInvoice.value.id}/pay`, {
            amount: parseFloat(abonoAmount.value)
        })
        // Se actualiza localmente el invoice del modal activo
        selectedInvoice.value.amount_paid = response.invoice.amount_paid
        selectedInvoice.value.payment_status = response.invoice.payment_status
        
        abonoAmount.value = ''
        Swal.fire('Éxito', 'Abono registrado exitosamente', 'success')
        
        // Se fuerza la recarga estricta de la tabla desde la base de datos (respetando filtros)
        await fetchInvoices(pagination.value.current_page)
    } catch (e) {
        console.error(e)
        Swal.fire('Error', e.response?.data?.message || 'Error al registrar el abono', 'error')
    }
}

const hasPendingDeliveriesToSave = computed(() => {
    return Object.values(deliveries.value).some(qty => qty > 0)
})

const submitDeliveries = async () => {
    const items = []
    let hasValidationError = false

    for (const [detail_id, qty] of Object.entries(deliveries.value)) {
        if (qty > 0) {
            const detail = selectedInvoice.value.details.find(d => d.id === parseInt(detail_id))
            if (qty > detail.pending_quantity) {
                Swal.fire('Error', `La cantidad a entregar del artículo ${detail.article?.name || ''} sobrepasa su límite de ${detail.pending_quantity}`, 'error')
                hasValidationError = true
                break
            }
            items.push({ detail_id: parseInt(detail_id), deliver_qty: qty })
        }
    }

    if (hasValidationError || items.length === 0) return

    try {
        const resp = await $api.post(`/api/student-invoices/${selectedInvoice.value.id}/deliver`, { items })
        Swal.fire('Éxito', 'Entregas registradas', 'success')

        // Actualizar estados reactivos
        selectedInvoice.value = resp.invoice // Update locally

        // Se fuerza la recarga estricta de la tabla desde BD (respetando filtros)
        await fetchInvoices(pagination.value.current_page)
        
        deliveries.value = {}
        selectedInvoice.value.details.forEach(d => { deliveries.value[d.id] = 0 })
    } catch (e) {
        Swal.fire('Error', e.response?.data?.message || 'Error al registrar entregas', 'error')
    }
}

const printInvoice = async (id) => {
    try {
        Swal.fire({ title: 'Obteniendo PDF...', titleText: 'Por favor espere', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const response = await $api.get(`/api/student-invoices/${id}/pdf`, { responseType: 'blob' })

        // Ensure we retrieve the Blob payload properly according to Axios structure
        const blob = response.data ? new Blob([response.data], { type: 'application/pdf' }) : new Blob([response], { type: 'application/pdf' });

        Swal.close()
        printPdfBlob(blob, `factura_orden_${id}.pdf`, 'Preparando factura para impresión...')
    } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo generar el documento PDF.', 'error')
    }
}

// Modal Creacion Logic
const openCreateModal = () => {
    isCreateOpen.value = true
    cart.value = []
    selectedStudent.value = null
    searchQuery.value = ''
    searchResults.value = []
    searchPerformed.value = false
    createNotes.value = ''
    fetchCatalog()
}

const closeCreateModal = () => {
    isCreateOpen.value = false
}

const fetchCatalog = async () => {
    try {
        const resp = await $api.get('/api/admission-articles', { params: { active: 1, per_page: 50 } })
        catalogItems.value = resp
    } catch (e) { console.error(e) }
}

const searchStudents = async () => {
    if (!searchQuery.value.trim()) return
    searchPerformed.value = false
    try {
        const resp = await $api.get('/api/estudiantes', { params: { search: searchQuery.value, active: 1, limit: 10 } })
        searchResults.value = resp.data || resp // depending on pagination
        searchPerformed.value = true
    } catch (e) { console.error(e) }
}

const selectStudent = (student) => {
    selectedStudent.value = student
    searchResults.value = []
}

const clearStudent = () => {
    selectedStudent.value = null
    searchQuery.value = ''
    searchPerformed.value = false
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

const isCreateValid = computed(() => {
    return selectedStudent.value && cart.value.length > 0
})

const createInvoice = async () => {
    if (!isCreateValid.value) return
    isSubmitting.value = true

    const payload = {
        estudiante_id: selectedStudent.value.id,
        notes: createNotes.value,
        items: cart.value.map(item => ({
            article_id: item.article.id,
            quantity: item.quantity
        }))
    }

    try {
        await $api.post('/api/student-invoices', payload)
        Swal.fire('Éxito', 'Factura/Orden creada correctamente', 'success')
        closeCreateModal()
        fetchInvoices(1)
    } catch (e) {
        Swal.fire('Error', e.response?.data?.message || 'Error al crear la orden', 'error')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => fetchInvoices())
</script>
