<template>
    <div class="h-full bg-gray-50 dark:bg-gray-900/50 flex flex-col p-6 overflow-y-auto">
        <!-- Cabecera -->
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
            <div>
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <NuxtLink to="/admin/admisiones/uniformes" class="hover:text-primary-600 hover:underline flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Catálogo de Almacén
                    </NuxtLink>
                    <span>/</span>
                    <span>Reporte Ejecutivo</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Estado de Situación y Planeación de Compras
                </h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Analiza en tiempo real la demanda de uniformes vs. la disponibilidad física e identifica pedidos requeridos a proveedores.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button @click="fetchReport" :disabled="loading"
                    title="Actualizar Datos"
                    class="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <button @click="downloadExcel"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                    <svg class="-ml-0.5 mr-2 h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel (Proveedor)
                </button>
                <button @click="downloadPdf"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Reporte PDF
                </button>
            </div>
        </div>

        <!-- Tarjetas de KPI -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prendas Requeridas para Pedido
                    </p>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold" :class="kpis.total_prendas_requeridas > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'">
                            {{ Number(kpis.total_prendas_requeridas ?? 0).toLocaleString() }}
                        </span>
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">unidades</span>
                    </div>
                </div>
                <div class="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Entregas Pendientes
                    </p>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            {{ Number(kpis.total_entregas_pendientes ?? 0).toLocaleString() }}
                        </span>
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">en backorder</span>
                    </div>
                </div>
                <div class="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Inversión Estimada de Pedido
                    </p>
                    <div class="mt-2">
                        <span class="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                            ${{ parseFloat(kpis.valor_monetario_estimado ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                        </span>
                    </div>
                </div>
                <div class="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Filtros Rápidos y Buscador -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex flex-wrap gap-2 w-full md:w-auto">
                <button @click="filterStatus = 'all'"
                    :class="filterStatus === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    Todos los Artículos ({{ items.length }})
                </button>
                <button @click="filterStatus = 'deficit'"
                    :class="filterStatus === 'deficit' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    Solo con Déficit ({{ countDeficit }})
                </button>
                <button @click="filterStatus = 'limit'"
                    :class="filterStatus === 'limit' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    Al Límite ({{ countLimit }})
                </button>
                <button @click="filterStatus = 'sufficient'"
                    :class="filterStatus === 'sufficient' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Suficientes ({{ countSufficient }})
                </button>
            </div>

            <div class="relative w-full md:w-72">
                <input type="text" v-model="searchQuery" placeholder="Buscar prenda por nombre..."
                    class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800" />
                <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
            </div>
        </div>

        <!-- Tabla Interactiva -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-x-auto flex-1">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/80 sticky top-0 z-10">
                    <tr>
                        <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Artículo / Prenda
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Precio Unit.
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stock Almacén
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Demanda Pendiente
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cantidad Sugerida
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Inversión Est.
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Estado
                        </th>
                        <th scope="col" class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    <tr v-for="item in filteredItems" :key="item.id"
                        :class="[
                            item.estado_stock === 'Déficit/Requerido' ? 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                            'transition-colors duration-150'
                        ]">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    {{ item.name }}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                            ${{ parseFloat(item.price).toFixed(2) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {{ item.stock_fisico }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-amber-600 dark:text-amber-400">
                            {{ item.cantidad_por_entregar }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-extrabold"
                            :class="item.cantidad_sugerida_compra > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'">
                            {{ item.cantidad_sugerida_compra }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold"
                            :class="item.costo_estimado_pedido > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'">
                            ${{ parseFloat(item.costo_estimado_pedido).toFixed(2) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span :class="getStatusBadgeClass(item.estado_stock)"
                                class="px-2.5 py-1 text-xs font-bold rounded-full border shadow-2xs">
                                {{ item.estado_stock }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div class="flex items-center justify-end gap-3">
                                <button @click="openDrawer(item)"
                                    class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
                                    title="Ver lista de espera (FIFO)">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>Lista FIFO ({{ item.pending_orders?.length || 0 }})</span>
                                </button>
                                <button @click="addStockPrompt(item)"
                                    title="Reabastecer stock de almacén"
                                    class="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 transition-colors text-xs font-bold">
                                    + Stock
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredItems.length === 0 && !loading">
                        <td colspan="8" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            <div class="flex flex-col items-center">
                                <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p class="font-semibold">No se encontraron artículos con el filtro seleccionado</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Drawer / Slide-over de Lista FIFO -->
        <TransitionRoot as="template" :show="isDrawerOpen">
            <Dialog as="div" class="relative z-50" @close="closeDrawer">
                <TransitionChild as="template"
                    enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                    leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-hidden">
                    <div class="absolute inset-0 overflow-hidden">
                        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild as="template"
                                enter="transform transition ease-in-out duration-300 sm:duration-500" enter-from="translate-x-full" enter-to="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500" leave-from="translate-x-0" leave-to="translate-x-full">
                                <DialogPanel class="pointer-events-auto w-screen max-w-2xl">
                                    <div class="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                                        <!-- Cabecera del Drawer -->
                                        <div class="px-6 py-6 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                                            <div>
                                                <DialogTitle class="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    Lista de Espera FIFO - {{ selectedArticle?.name }}
                                                </DialogTitle>
                                                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Estudiantes en backorder ordenados por prioridad (fecha de creación de la factura).
                                                </p>
                                            </div>
                                            <button type="button" @click="closeDrawer"
                                                class="rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                                                <span class="sr-only">Cerrar</span>
                                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>

                                        <!-- Contenido del Drawer -->
                                        <div class="relative flex-1 px-6 py-6 overflow-y-auto space-y-4">
                                            <div class="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-6 text-center">
                                                <div>
                                                    <p class="text-xs text-gray-500">Stock Almacén</p>
                                                    <p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ selectedArticle?.stock_fisico }}</p>
                                                </div>
                                                <div>
                                                    <p class="text-xs text-gray-500">Demanda Pendiente</p>
                                                    <p class="text-lg font-bold text-amber-600">{{ selectedArticle?.cantidad_por_entregar }}</p>
                                                </div>
                                                <div>
                                                    <p class="text-xs text-gray-500">Sugerido Compra</p>
                                                    <p class="text-lg font-extrabold text-rose-600">{{ selectedArticle?.cantidad_sugerida_compra }}</p>
                                                </div>
                                            </div>

                                            <div v-if="selectedArticle?.pending_orders && selectedArticle.pending_orders.length > 0">
                                                <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                    <span>Órdenes en Backorder ({{ selectedArticle.pending_orders.length }})</span>
                                                    <span class="text-xs font-normal text-gray-500">— Prioridad FIFO estricta</span>
                                                </h4>
                                                <div class="space-y-3">
                                                    <div v-for="(order, idx) in selectedArticle.pending_orders" :key="order.detail_id"
                                                        class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm hover:border-primary-400 transition-colors flex items-center justify-between">
                                                        <div class="flex items-start gap-3">
                                                            <div class="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                                #{{ idx + 1 }}
                                                            </div>
                                                            <div>
                                                                <div class="flex items-center gap-2">
                                                                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
                                                                        {{ order.student_name }}
                                                                    </span>
                                                                    <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                                                        {{ order.aula }}
                                                                    </span>
                                                                </div>
                                                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                                                                    <span>Orden: <strong>{{ order.invoice_number }}</strong></span>
                                                                    <span>•</span>
                                                                    <span>Fecha: {{ order.created_at }}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="text-right">
                                                            <div class="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                {{ order.pending_quantity }} und.
                                                            </div>
                                                            <span v-if="order.is_ready_for_pickup"
                                                                class="inline-flex mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                                                Listo Retiro
                                                            </span>
                                                            <span v-else
                                                                class="inline-flex mt-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                                                                En Espera
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
                                                <p class="text-sm font-medium">No hay entregas pendientes para este artículo.</p>
                                            </div>
                                        </div>

                                        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                            <button @click="addStockPrompt(selectedArticle); closeDrawer();"
                                                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors">
                                                Reabastecer Inventario
                                            </button>
                                            <button @click="closeDrawer"
                                                class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({
    middleware: ['auth']
})

const { $api } = useNuxtApp()
const { printPdfBlob } = usePrint()

const loading = ref(false)
const kpis = ref({
    total_prendas_requeridas: 0,
    total_entregas_pendientes: 0,
    valor_monetario_estimado: 0
})
const items = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const isDrawerOpen = ref(false)
const selectedArticle = ref(null)

const fetchReport = async () => {
    loading.value = true
    try {
        const response = await $api.get('/api/admission-articles/procurement-report')
        kpis.value = response.kpis || kpis.value
        items.value = response.items || []
    } catch (e) {
        console.error('Error fetching procurement report:', e)
        Swal.fire('Error', 'No se pudo cargar el reporte de planeación de compras.', 'error')
    } finally {
        loading.value = false
    }
}

const filteredItems = computed(() => {
    let result = items.value

    if (filterStatus.value === 'deficit') {
        result = result.filter(i => i.estado_stock === 'Déficit/Requerido')
    } else if (filterStatus.value === 'limit') {
        result = result.filter(i => i.estado_stock === 'Al Límite')
    } else if (filterStatus.value === 'sufficient') {
        result = result.filter(i => i.estado_stock === 'Suficiente')
    }

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        result = result.filter(i => (i.name || '').toLowerCase().includes(q))
    }

    return result
})

const countDeficit = computed(() => items.value.filter(i => i.estado_stock === 'Déficit/Requerido').length)
const countLimit = computed(() => items.value.filter(i => i.estado_stock === 'Al Límite').length)
const countSufficient = computed(() => items.value.filter(i => i.estado_stock === 'Suficiente').length)

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Déficit/Requerido':
            return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
        case 'Al Límite':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
        case 'Suficiente':
        default:
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
    }
}

const openDrawer = (article) => {
    selectedArticle.value = article
    isDrawerOpen.value = true
}

const closeDrawer = () => {
    isDrawerOpen.value = false
    selectedArticle.value = null
}

const addStockPrompt = async (article) => {
    const { value: quantity } = await Swal.fire({
        title: 'Reabastecer Existencia',
        text: `¿Cuántas unidades deseas añadir al almacén físico de "${article.name}"?`,
        input: 'number',
        inputAttributes: {
            min: 1,
            step: 1
        },
        inputValue: article.cantidad_sugerida_compra > 0 ? article.cantidad_sugerida_compra : 10,
        showCancelButton: true,
        confirmButtonText: 'Añadir al Almacén',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || parseInt(value) <= 0) {
                return 'Debes ingresar un número entero mayor a cero.'
            }
        }
    })

    if (quantity) {
        try {
            Swal.fire({ title: 'Procesando...', text: 'Asignando existencias FIFO...', didOpen: () => Swal.showLoading() })
            await $api.post(`/api/admission-articles/${article.id}/add-stock`, {
                quantity: parseInt(quantity)
            })
            await fetchReport()
            Swal.fire({
                icon: 'success',
                title: 'Inventario Actualizado',
                text: `Se añadieron ${quantity} unidades a "${article.name}". Las órdenes en backorder se han actualizado.`,
                timer: 2500,
                showConfirmButton: false
            })
        } catch (e) {
            console.error(e)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response?.data?.message || 'Error al actualizar el stock'
            })
        }
    }
}

const downloadExcel = async () => {
    try {
        Swal.fire({ title: 'Generando Excel...', titleText: 'Preparando listado para proveedor', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const response = await $api.get('/api/admission-articles/procurement-report/excel', { responseType: 'blob' })
        
        const blob = response.data ? new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `pedido_proveedor_uniformes_${new Date().toISOString().slice(0, 10)}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        Swal.close()
    } catch (error) {
        console.error('Error downloading Excel:', error)
        Swal.fire('Error', 'No se pudo descargar el archivo Excel.', 'error')
    }
}

const downloadPdf = async () => {
    try {
        Swal.fire({ title: 'Obteniendo PDF...', titleText: 'Por favor espere', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const response = await $api.get('/api/admission-articles/procurement-report/pdf', { responseType: 'blob' })

        const blob = response.data ? new Blob([response.data], { type: 'application/pdf' }) : new Blob([response], { type: 'application/pdf' });

        Swal.close()
        printPdfBlob(blob, `planeacion_compras_uniformes_${new Date().toISOString().slice(0, 10)}.pdf`, 'Preparando reporte oficial para impresión...')
    } catch (error) {
        console.error('Error generating PDF:', error)
        Swal.fire('Error', 'No se pudo generar el documento PDF.', 'error')
    }
}

onMounted(() => {
    fetchReport()
})
</script>
