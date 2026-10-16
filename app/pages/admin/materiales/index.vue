<template>
  <div class="space-y-6">
    <!-- Vista de acceso restringido si no tiene permiso -->
    <div
      v-if="!can('materiales.index')"
      class="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl p-8 text-center shadow-sm no-print"
    >
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">Acceso Restringido</h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">
        No tienes el permiso necesario (<code class="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">materiales.index</code>) para visualizar este módulo.
      </p>
    </div>

    <!-- Contenido Principal del Módulo (Oculto al imprimir) -->
    <div v-else class="space-y-6 no-print">
      <!-- Encabezado y Acciones Rápidas -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2.5">
              <span class="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </span>
              Entrega de Materiales al Personal
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Registro histórico y trazabilidad de materiales entregados al personal docente y administrativo (sin control de stock).
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button
              v-if="can('materiales.crear')"
              type="button"
              @click="openMaterialModal()"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Material
            </button>

            <button
              v-if="can('materiales.entregar')"
              type="button"
              @click="activeTab = 'nueva'"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Registrar Entrega
            </button>
          </div>
        </div>

        <!-- Navegación por Pestañas -->
        <div class="mt-6 border-b border-gray-200 dark:border-slate-700">
          <nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <button
              type="button"
              @click="activeTab = 'historico'"
              class="whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
              :class="
                activeTab === 'historico'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
              "
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico de Entregas
              <span class="ml-1 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-slate-300">
                {{ materialesStore.pagination.total || materialesStore.entregas.length }}
              </span>
            </button>

            <button
              v-if="can('materiales.entregar')"
              type="button"
              @click="activeTab = 'nueva'"
              class="whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
              :class="
                activeTab === 'nueva'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
              "
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nueva Entrega Múltiple
            </button>

            <button
              type="button"
              @click="activeTab = 'catalogo'"
              class="whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
              :class="
                activeTab === 'catalogo'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
              "
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Catálogo de Materiales
              <span class="ml-1 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-slate-300">
                {{ materialesStore.catalogo.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- PESTAÑA 1: HISTÓRICO DE ENTREGAS                          -->
      <!-- ========================================================= -->
      <div v-if="activeTab === 'historico'" class="space-y-6">
        <!-- Barra de Filtros -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Fecha Desde -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Fecha Desde
              </label>
              <input
                v-model="filters.fecha_desde"
                type="date"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Fecha Hasta -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Fecha Hasta
              </label>
              <input
                v-model="filters.fecha_hasta"
                type="date"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Cargo del Personal -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Cargo / Posición
              </label>
              <select
                v-model="filters.cargo"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los cargos</option>
                <option v-for="cargo in cargosStore.items" :key="cargo.id" :value="cargo.id">
                  {{ cargo.nombre }}
                </option>
              </select>
            </div>

            <!-- Personal Receptor -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Personal Receptor
              </label>
              <select
                v-model="filters.personal_id"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todo el personal</option>
                <option v-for="p in filteredPersonalForSelect" :key="p.id" :value="p.id">
                  {{ p.nombre }} {{ p.apellido }} ({{ p.cargo?.nombre || 'Sin cargo' }})
                </option>
              </select>
            </div>

            <!-- Material -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Material
              </label>
              <select
                v-model="filters.material_id"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los materiales</option>
                <option v-for="m in materialesStore.catalogo" :key="m.id" :value="m.id">
                  {{ m.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-slate-700/60">
            <!-- Buscador general -->
            <div class="relative flex-1 max-w-md">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Buscar por nombre, cédula, material u observación..."
                @keyup.enter="applyFilters(1)"
                class="w-full pl-9 pr-4 py-2 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="resetFilters"
                class="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button
                type="button"
                @click="applyFilters(1)"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Aplicar Filtros
              </button>
              <button
                v-if="can('materiales.imprimir') && materialesStore.entregas.length > 0"
                type="button"
                @click="handlePrintConsolidated"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Listado
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de Entregas -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div v-if="materialesStore.loadingEntregas" class="p-12 flex flex-col items-center justify-center">
            <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p class="mt-3 text-sm text-gray-500 dark:text-slate-400">Cargando histórico de entregas...</p>
          </div>

          <div v-else-if="materialesStore.entregas.length === 0" class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 class="mt-3 text-base font-semibold text-gray-900 dark:text-slate-100">No se encontraron entregas</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
              No hay entregas registradas con los criterios seleccionados.
            </p>
            <button
              v-if="can('materiales.entregar')"
              type="button"
              @click="activeTab = 'nueva'"
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Registrar primera entrega
            </button>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead class="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Acta / Fecha
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Personal Receptor
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Materiales Entregados
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Observaciones / Registrado por
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                <tr
                  v-for="entrega in materialesStore.entregas"
                  :key="entrega.id"
                  class="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <!-- Folio y Fecha -->
                  <td class="px-4 py-4 whitespace-nowrap align-top">
                    <div class="text-sm font-bold text-blue-600 dark:text-blue-400">
                      #{{ String(entrega.id).padStart(5, '0') }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                      {{ formatDateTime(entrega.fecha_entrega) }}
                    </div>
                  </td>

                  <!-- Personal Receptor -->
                  <td class="px-4 py-4 align-top">
                    <div class="flex flex-wrap gap-1.5">
                      <div
                        v-for="person in getUniquePersonal(entrega)"
                        :key="person.id"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                      >
                        <span class="font-semibold">{{ person.nombre }} {{ person.apellido }}</span>
                        <span
                          v-if="person.cargo?.nombre"
                          class="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        >
                          {{ person.cargo.nombre }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Materiales Entregados -->
                  <td class="px-4 py-4 align-top">
                    <div class="space-y-1">
                      <div
                        v-for="mat in getUniqueMaterialsSummary(entrega)"
                        :key="mat.material_id"
                        class="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-200"
                      >
                        <span class="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                          {{ mat.cantidadPorPersona }} c/u
                        </span>
                        <span class="font-medium">{{ mat.nombre }}</span>
                        <span v-if="mat.totalEntregado !== mat.cantidadPorPersona" class="text-gray-400 dark:text-slate-400">
                          (Total: {{ mat.totalEntregado }})
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Observaciones -->
                  <td class="px-4 py-4 align-top text-xs text-gray-600 dark:text-slate-300 max-w-xs">
                    <p v-if="entrega.observaciones" class="line-clamp-2 mb-1">
                      {{ entrega.observaciones }}
                    </p>
                    <p v-else class="text-gray-400 dark:text-slate-500 italic mb-1">Sin observaciones</p>
                    <div class="text-[11px] text-gray-400 dark:text-slate-400">
                      Por: {{ entrega.creado_por_user?.name || entrega.creadoPor?.name || 'Administración' }}
                    </div>
                  </td>

                  <!-- Acciones -->
                  <td class="px-4 py-4 whitespace-nowrap text-right align-top">
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        @click="openPreviewModal(entrega)"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        title="Ver detalle del acta"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>

                      <button
                        v-if="can('materiales.imprimir')"
                        type="button"
                        @click="handlePrintSingle(entrega)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                        title="Imprimir comprobante de entrega"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir comprobante
                      </button>

                      <button
                        v-if="can('materiales.entregar')"
                        type="button"
                        @click="confirmDeleteEntrega(entrega)"
                        class="inline-flex items-center p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                        title="Eliminar entrega"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div
            v-if="materialesStore.pagination.last_page > 1"
            class="px-5 py-3 bg-gray-50 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between"
          >
            <div class="text-xs text-gray-600 dark:text-slate-400">
              Página {{ materialesStore.pagination.current_page }} de {{ materialesStore.pagination.last_page }}
              ({{ materialesStore.pagination.total }} registros)
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="materialesStore.pagination.current_page <= 1"
                @click="applyFilters(materialesStore.pagination.current_page - 1)"
                class="px-3 py-1.5 rounded border border-gray-300 dark:border-slate-600 text-xs font-medium disabled:opacity-40 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"
              >
                Anterior
              </button>
              <button
                type="button"
                :disabled="materialesStore.pagination.current_page >= materialesStore.pagination.last_page"
                @click="applyFilters(materialesStore.pagination.current_page + 1)"
                class="px-3 py-1.5 rounded border border-gray-300 dark:border-slate-600 text-xs font-medium disabled:opacity-40 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- PESTAÑA 2: NUEVA ENTREGA MÚLTIPLE                         -->
      <!-- ========================================================= -->
      <div v-else-if="activeTab === 'nueva' && can('materiales.entregar')" class="space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
            Datos Generales de la Entrega
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Fecha y Hora de Entrega <span class="text-red-500">*</span>
              </label>
              <input
                v-model="entregaForm.fecha_entrega"
                type="datetime-local"
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Observaciones Generales (Opcional)
              </label>
              <input
                v-model="entregaForm.observaciones"
                type="text"
                placeholder="Ej. Entrega de materiales didácticos de inicio de trimestre..."
                class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- COLUMNA 1: Selección Múltiple de Personal con Filtro por Cargo -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
            <div class="p-5 border-b border-gray-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-slate-100">
                    1. Seleccionar Personal Receptor
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-slate-400">
                    Filtra por cargo/posición y marca una o varias personas.
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  {{ entregaForm.personal_ids.length }} seleccionados
                </span>
              </div>

              <!-- Filtros de Personal (Cargo + Buscador) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Filtrar por Cargo
                  </label>
                  <select
                    v-model="personalSelectorCargoId"
                    class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los cargos</option>
                    <option v-for="cargo in cargosStore.items" :key="cargo.id" :value="String(cargo.id)">
                      {{ cargo.nombre }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Buscar Personal
                  </label>
                  <input
                    v-model="personalSelectorSearch"
                    type="text"
                    placeholder="Nombre, apellido o cédula..."
                    class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <!-- Acciones de selección masiva -->
              <div class="mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  @click="selectAllFilteredPersonal"
                  class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Seleccionar visibles ({{ filteredPersonalSelectorList.length }})
                </button>
                <button
                  v-if="entregaForm.personal_ids.length > 0"
                  type="button"
                  @click="entregaForm.personal_ids = []"
                  class="text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Limpiar selección
                </button>
              </div>
            </div>

            <!-- Lista de Personal con Checkboxes -->
            <div class="p-3 max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/60 flex-1">
              <div
                v-if="personalStore.loading"
                class="py-8 text-center text-sm text-gray-500 dark:text-slate-400"
              >
                Cargando listado de personal...
              </div>
              <div
                v-else-if="filteredPersonalSelectorList.length === 0"
                class="py-8 text-center text-sm text-gray-500 dark:text-slate-400"
              >
                No hay personal que coincida con el filtro actual.
              </div>
              <label
                v-for="persona in filteredPersonalSelectorList"
                :key="persona.id"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                :class="entregaForm.personal_ids.includes(persona.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    :value="persona.id"
                    v-model="entregaForm.personal_ids"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div class="truncate">
                    <div class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                      {{ persona.nombre }} {{ persona.apellido }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-slate-400">
                      Cédula: {{ persona.cedula }}
                    </div>
                  </div>
                </div>
                <span class="ml-2 shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                  {{ persona.cargo?.nombre || 'Sin cargo' }}
                </span>
              </label>
            </div>
          </div>

          <!-- COLUMNA 2: Selección Múltiple de Materiales y Cantidades -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
            <div class="p-5 border-b border-gray-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-slate-100">
                    2. Seleccionar Materiales y Cantidades
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-slate-400">
                    Agrega los materiales que recibirá cada persona seleccionada.
                  </p>
                </div>
                <button
                  v-if="can('materiales.crear')"
                  type="button"
                  @click="openMaterialModal()"
                  class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  + Crear en catálogo
                </button>
              </div>

              <!-- Selector para añadir material a la lista -->
              <div class="flex gap-2">
                <select
                  v-model="materialToAddId"
                  class="flex-1 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un material del catálogo...</option>
                  <option
                    v-for="mat in materialesStore.materialesActivos"
                    :key="mat.id"
                    :value="String(mat.id)"
                  >
                    {{ mat.nombre }} {{ mat.descripcion ? `— ${mat.descripcion}` : '' }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="addMaterialToForm"
                  :disabled="!materialToAddId"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors shrink-0"
                >
                  Agregar
                </button>
              </div>
            </div>

            <!-- Lista de materiales agregados a la entrega -->
            <div class="p-4 flex-1 space-y-3 max-h-96 overflow-y-auto">
              <div
                v-if="entregaForm.materiales.length === 0"
                class="py-12 text-center text-sm text-gray-500 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl"
              >
                Aún no has agregado materiales a esta entrega.
              </div>

              <div
                v-for="(item, idx) in entregaForm.materiales"
                :key="item.material_id"
                class="p-3.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 space-y-2"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="font-semibold text-sm text-gray-900 dark:text-slate-100">
                    {{ getMaterialName(item.material_id) }}
                  </div>
                  <button
                    type="button"
                    @click="removeMaterialFromForm(idx)"
                    class="text-red-500 hover:text-red-700 dark:text-red-400 text-xs font-medium"
                  >
                    Quitar
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                      Cantidad unitaria
                    </label>
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      min="1"
                      class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                      Nota / Detalle (opcional)
                    </label>
                    <input
                      v-model="item.notas"
                      type="text"
                      placeholder="Ej. Color negro, Marca Epson..."
                      class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie de Resumen y Botón Guardar -->
            <div class="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
              <div class="text-xs text-gray-600 dark:text-slate-300">
                Se registrará la entrega para
                <strong class="text-gray-900 dark:text-white">{{ entregaForm.personal_ids.length }}</strong>
                persona(s) con
                <strong class="text-gray-900 dark:text-white">{{ entregaForm.materiales.length }}</strong>
                material(es).
              </div>

              <button
                type="button"
                :disabled="materialesStore.saving || entregaForm.personal_ids.length === 0 || entregaForm.materiales.length === 0"
                @click="submitNuevaEntrega"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-colors"
              >
                <span v-if="materialesStore.saving">Guardando...</span>
                <span v-else>Confirmar y Registrar Entrega</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- PESTAÑA 3: CATÁLOGO DE MATERIALES                         -->
      <!-- ========================================================= -->
      <div v-else-if="activeTab === 'catalogo'" class="space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div class="relative flex-1 max-w-md">
              <input
                v-model="catalogoSearch"
                type="text"
                placeholder="Buscar material en el catálogo..."
                class="w-full pl-9 pr-4 py-2 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              v-if="can('materiales.crear')"
              type="button"
              @click="openMaterialModal()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Material al Catálogo
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead class="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Nombre del Material
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Descripción
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Estado
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                <tr v-if="filteredCatalogo.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No hay materiales registrados en el catálogo.
                  </td>
                </tr>
                <tr
                  v-for="mat in filteredCatalogo"
                  :key="mat.id"
                  class="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <td class="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {{ mat.nombre }}
                  </td>
                  <td class="px-4 py-3.5 text-sm text-gray-600 dark:text-slate-300">
                    {{ mat.descripcion || 'Sin descripción' }}
                  </td>
                  <td class="px-4 py-3.5 text-center">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="
                        mat.estado
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      "
                    >
                      {{ mat.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-right whitespace-nowrap">
                    <div v-if="can('materiales.crear')" class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        @click="openMaterialModal(mat)"
                        class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        @click="toggleMaterialEstado(mat)"
                        class="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        {{ mat.estado ? 'Desactivar' : 'Activar' }}
                      </button>
                      <button
                        type="button"
                        @click="confirmDeleteMaterial(mat)"
                        class="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL RÁPIDO: CREAR / EDITAR MATERIAL DEL CATÁLOGO        -->
    <!-- ========================================================= -->
    <div
      v-if="showMaterialModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-slate-100">
            {{ editingMaterial ? 'Editar Material' : 'Nuevo Material de Catálogo' }}
          </h3>
          <button
            type="button"
            @click="showMaterialModal = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="saveMaterialCatalogo" class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Nombre del Material <span class="text-red-500">*</span>
            </label>
            <input
              v-model="materialForm.nombre"
              type="text"
              required
              placeholder="Ej. Cable HDMI, Marcador acrílico, Borrador..."
              class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              v-model="materialForm.descripcion"
              rows="3"
              placeholder="Especificaciones o detalles del material..."
              class="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="mat-estado"
              v-model="materialForm.estado"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <label for="mat-estado" class="text-sm text-gray-700 dark:text-slate-300">
              Material activo y disponible para entregas
            </label>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              @click="showMaterialModal = false"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="materialesStore.saving"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {{ materialesStore.saving ? 'Guardando...' : 'Guardar Material' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL VISTA PREVIA DEL COMPROBANTE                        -->
    <!-- ========================================================= -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-slate-100">
            Vista Previa de Comprobante de Entrega
          </h3>
          <div class="flex items-center gap-2">
            <button
              v-if="can('materiales.imprimir')"
              type="button"
              @click="triggerClientPrint"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Comprobante
            </button>
            <button
              type="button"
              @click="showPreviewModal = false"
              class="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto bg-gray-100 dark:bg-slate-900">
          <div class="bg-white text-gray-900 p-8 rounded shadow mx-auto max-w-[210mm]">
            <!-- Reutiliza el mismo bloque que se imprime -->
            <div v-html="renderedPrintPreviewHtml"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- ÁREA DE IMPRESIÓN 100% FRONTEND (@media print)            -->
    <!-- ========================================================= -->
    <div id="material-print-area" class="hidden print:block bg-white text-black">
      <!-- Encabezado Institucional Estándar del Colegio -->
      <div class="flex items-start justify-between border-b-2 border-blue-700 pb-3 mb-5">
        <div class="w-1/5 flex justify-start">
          <img
            v-if="tenantLogoDept"
            :src="tenantLogoDept"
            alt="Logo Ministerio"
            class="max-h-16 object-contain"
          />
        </div>
        <div class="w-3/5 text-center">
          <div class="font-bold uppercase text-sm tracking-wide text-gray-900">
            Ministerio de Educación (MINERD)
          </div>
          <div v-if="tenant?.departamento" class="text-xs text-gray-700 mt-0.5">
            {{ tenant.departamento }}
          </div>
          <div v-if="tenant?.distrito" class="text-xs text-gray-700">
            {{ tenant.distrito }}
          </div>
          <div class="font-bold text-blue-700 text-base mt-1 uppercase">
            {{ tenant?.name || 'Centro Educativo' }}
          </div>
          <div class="font-bold uppercase text-sm mt-1.5 bg-gray-100 py-1 px-3 inline-block rounded border border-gray-300">
            {{ printMode === 'single' ? 'Acta / Comprobante de Entrega de Materiales' : 'Reporte Histórico de Entrega de Materiales' }}
          </div>
        </div>
        <div class="w-1/5 flex justify-end">
          <img
            v-if="tenantLogoSchool"
            :src="tenantLogoSchool"
            alt="Logo Institución"
            class="max-h-16 object-contain"
          />
        </div>
      </div>

      <!-- Datos de Cabecera del Comprobante -->
      <div v-if="printMode === 'single' && selectedEntregaForPrint" class="mb-4 text-xs grid grid-cols-2 gap-2 border border-gray-300 rounded p-3 bg-gray-50">
        <div>
          <p><strong>No. de Comprobante:</strong> #{{ String(selectedEntregaForPrint.id).padStart(6, '0') }}</p>
          <p class="mt-1"><strong>Fecha de Entrega:</strong> {{ formatDateTime(selectedEntregaForPrint.fecha_entrega) }}</p>
        </div>
        <div class="text-right">
          <p><strong>Entregado por:</strong> {{ selectedEntregaForPrint.creado_por_user?.name || selectedEntregaForPrint.creadoPor?.name || authStore.user?.name || 'Administración' }}</p>
          <p class="mt-1"><strong>Fecha de Impresión:</strong> {{ currentPrintTimestamp }}</p>
        </div>
        <div v-if="selectedEntregaForPrint.observaciones" class="col-span-2 mt-1 pt-1 border-t border-gray-200">
          <strong>Observaciones:</strong> {{ selectedEntregaForPrint.observaciones }}
        </div>
      </div>

      <div v-else class="mb-4 text-xs flex justify-between border border-gray-300 rounded p-2.5 bg-gray-50">
        <div>
          <strong>Total de Entregas en Reporte:</strong> {{ printRows.length }} ítems entregados
        </div>
        <div>
          <strong>Fecha de Emisión:</strong> {{ currentPrintTimestamp }}
        </div>
      </div>

      <!-- Tabla de Materiales Entregados y Firmas -->
      <table class="w-full border-collapse border border-gray-900 text-xs mb-8">
        <thead>
          <tr class="bg-gray-100 uppercase text-gray-900">
            <th class="border border-gray-900 px-2.5 py-2 text-left w-[13%]">Fecha</th>
            <th class="border border-gray-900 px-2.5 py-2 text-left w-[24%]">Personal Receptor</th>
            <th class="border border-gray-900 px-2.5 py-2 text-left w-[16%]">Cargo</th>
            <th class="border border-gray-900 px-2.5 py-2 text-left w-[22%]">Material Entregado</th>
            <th class="border border-gray-900 px-2.5 py-2 text-center w-[8%]">Cant.</th>
            <th class="border border-gray-900 px-2.5 py-2 text-center w-[17%]">Firma de Recibido</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIdx) in printRows" :key="rIdx">
            <td class="border border-gray-900 px-2.5 py-3 align-middle">
              {{ row.fecha }}
            </td>
            <td class="border border-gray-900 px-2.5 py-3 align-middle">
              <div class="font-bold">{{ row.receptorNombre }}</div>
              <div v-if="row.receptorCedula" class="text-[10px] text-gray-600">Céd.: {{ row.receptorCedula }}</div>
            </td>
            <td class="border border-gray-900 px-2.5 py-3 align-middle">
              {{ row.cargo }}
            </td>
            <td class="border border-gray-900 px-2.5 py-3 align-middle">
              <div class="font-semibold">{{ row.material }}</div>
              <div v-if="row.notas" class="text-[10px] text-gray-600 italic">{{ row.notas }}</div>
            </td>
            <td class="border border-gray-900 px-2.5 py-3 text-center font-bold align-middle">
              {{ row.cantidad }}
            </td>
            <td class="border border-gray-900 px-2.5 py-5 align-bottom">
              <div class="border-b border-gray-400 w-full h-4"></div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pie de Firma de Quien Entrega -->
      <div class="mt-12 mb-8 grid grid-cols-2 gap-12 text-center text-xs">
        <div>
          <div class="border-t border-gray-900 mx-8 pt-1.5 font-bold uppercase">
            {{ selectedEntregaForPrint?.creado_por_user?.name || selectedEntregaForPrint?.creadoPor?.name || authStore.user?.name || 'Administración' }}
          </div>
          <div class="text-[10px] text-gray-600">Entregado Por (Firma y Sello)</div>
        </div>
        <div>
          <div class="border-t border-gray-900 mx-8 pt-1.5 font-bold uppercase">
            Dirección / Coordinación Administrativa
          </div>
          <div class="text-[10px] text-gray-600">Visto Bueno</div>
        </div>
      </div>

      <!-- Footer Institucional del Colegio -->
      <div class="border-t border-gray-300 pt-2 text-center text-[10px] text-gray-600 mt-6">
        <div>
          <span v-if="tenant?.address">{{ tenant.address }}</span>
          <span v-if="tenant?.phone"> | Tel: {{ tenant.phone }}</span>
          <span v-if="tenant?.email"> | Email: {{ tenant.email }}</span>
          <span v-if="tenant?.website"> | Web: {{ tenant.website }}</span>
        </div>
        <div class="mt-0.5">
          Generado el {{ currentPrintTimestamp }} — Sistema de Gestión Escolar EscoSoft
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '~/stores/auth'
import { usePersonalStore } from '~/stores/personal'
import { useCargosStore } from '~/stores/cargos'
import { useMaterialesStore, type Material, type MaterialEntrega } from '~/stores/materiales'
import { usePermissions } from '~/composables/usePermissions'
import { normalizeUrl } from '~/utils/url'
import { printClientReceipt } from '~/utils/print'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()
const personalStore = usePersonalStore()
const cargosStore = useCargosStore()
const materialesStore = useMaterialesStore()
const { can } = usePermissions()

const activeTab = ref<'historico' | 'nueva' | 'catalogo'>('historico')

// ── Datos del Tenant para el Comprobante ─────────────────────────────────────
const tenant = computed(() => authStore.tenant)
const tenantLogoDept = computed(() => normalizeUrl(tenant.value?.logo_departamento))
const tenantLogoSchool = computed(() => normalizeUrl(tenant.value?.logo_url))

// ── Filtros del Histórico ────────────────────────────────────────────────────
const filters = ref({
  fecha_desde: '',
  fecha_hasta: '',
  cargo: '',
  personal_id: '',
  material_id: '',
  search: '',
})

const filteredPersonalForSelect = computed(() => {
  if (!filters.value.cargo) return personalStore.items
  return personalStore.items.filter((p) => String(p.cargo_id) === String(filters.value.cargo))
})

const applyFilters = async (page: number = 1) => {
  await materialesStore.fetchEntregas({
    ...filters.value,
    page,
  })
}

const resetFilters = async () => {
  filters.value = {
    fecha_desde: '',
    fecha_hasta: '',
    cargo: '',
    personal_id: '',
    material_id: '',
    search: '',
  }
  await applyFilters(1)
}

// ── Formulario de Nueva Entrega Múltiple ─────────────────────────────────────
const getNowLocalISO = () => {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
}

const entregaForm = ref<{
  fecha_entrega: string
  observaciones: string
  personal_ids: number[]
  materiales: Array<{ material_id: number; cantidad: number; notas: string }>
}>({
  fecha_entrega: getNowLocalISO(),
  observaciones: '',
  personal_ids: [],
  materiales: [],
})

const personalSelectorCargoId = ref('')
const personalSelectorSearch = ref('')
const materialToAddId = ref('')

const filteredPersonalSelectorList = computed(() => {
  return personalStore.items.filter((p) => {
    if (personalSelectorCargoId.value && String(p.cargo_id) !== String(personalSelectorCargoId.value)) {
      return false
    }
    if (personalSelectorSearch.value.trim()) {
      const q = personalSelectorSearch.value.toLowerCase().trim()
      const fullName = `${p.nombre} ${p.apellido}`.toLowerCase()
      const cedula = (p.cedula || '').toLowerCase()
      const cargo = (p.cargo?.nombre || '').toLowerCase()
      return fullName.includes(q) || cedula.includes(q) || cargo.includes(q)
    }
    return true
  })
})

const selectAllFilteredPersonal = () => {
  const currentSet = new Set(entregaForm.value.personal_ids)
  filteredPersonalSelectorList.value.forEach((p) => currentSet.add(p.id))
  entregaForm.value.personal_ids = Array.from(currentSet)
}

const addMaterialToForm = () => {
  if (!materialToAddId.value) return
  const matId = Number(materialToAddId.value)
  const existing = entregaForm.value.materiales.find((m) => m.material_id === matId)
  if (existing) {
    existing.cantidad += 1
  } else {
    entregaForm.value.materiales.push({
      material_id: matId,
      cantidad: 1,
      notas: '',
    })
  }
  materialToAddId.value = ''
}

const removeMaterialFromForm = (index: number) => {
  entregaForm.value.materiales.splice(index, 1)
}

const getMaterialName = (id: number) => {
  return materialesStore.catalogo.find((m) => m.id === id)?.nombre || `Material #${id}`
}

const submitNuevaEntrega = async () => {
  if (entregaForm.value.personal_ids.length === 0) {
    Swal.fire('Atención', 'Selecciona al menos una persona del personal.', 'warning')
    return
  }
  if (entregaForm.value.materiales.length === 0) {
    Swal.fire('Atención', 'Agrega al menos un material a entregar.', 'warning')
    return
  }

  try {
    const res = await materialesStore.createEntrega({
      fecha_entrega: entregaForm.value.fecha_entrega,
      observaciones: entregaForm.value.observaciones || null,
      personal_ids: entregaForm.value.personal_ids,
      materiales: entregaForm.value.materiales,
    })

    entregaForm.value = {
      fecha_entrega: getNowLocalISO(),
      observaciones: '',
      personal_ids: [],
      materiales: [],
    }

    activeTab.value = 'historico'

    const swalRes = await Swal.fire({
      icon: 'success',
      title: 'Entrega Registrada',
      text: 'La entrega de materiales se ha guardado correctamente.',
      showCancelButton: can('materiales.imprimir'),
      confirmButtonText: can('materiales.imprimir') ? 'Imprimir Comprobante' : 'Aceptar',
      cancelButtonText: 'Cerrar',
    })

    if (swalRes.isConfirmed && can('materiales.imprimir') && res.data) {
      await handlePrintSingle(res.data)
    }
  } catch (error: any) {
    Swal.fire('Error', error?.data?.message || 'No se pudo registrar la entrega.', 'error')
  }
}

// ── Catálogo de Materiales (CRUD Modal) ──────────────────────────────────────
const catalogoSearch = ref('')
const showMaterialModal = ref(false)
const editingMaterial = ref<Material | null>(null)
const materialForm = ref({
  nombre: '',
  descripcion: '',
  estado: true,
})

const filteredCatalogo = computed(() => {
  if (!catalogoSearch.value.trim()) return materialesStore.catalogo
  const q = catalogoSearch.value.toLowerCase().trim()
  return materialesStore.catalogo.filter(
    (m) =>
      m.nombre.toLowerCase().includes(q) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q))
  )
})

const openMaterialModal = (material?: Material) => {
  if (material) {
    editingMaterial.value = material
    materialForm.value = {
      nombre: material.nombre,
      descripcion: material.descripcion || '',
      estado: Boolean(material.estado),
    }
  } else {
    editingMaterial.value = null
    materialForm.value = {
      nombre: '',
      descripcion: '',
      estado: true,
    }
  }
  showMaterialModal.value = true
}

const saveMaterialCatalogo = async () => {
  if (!materialForm.value.nombre.trim()) return
  try {
    if (editingMaterial.value) {
      await materialesStore.updateMaterial(editingMaterial.value.id, {
        nombre: materialForm.value.nombre.trim(),
        descripcion: materialForm.value.descripcion.trim() || null,
        estado: materialForm.value.estado,
      })
      Swal.fire('Actualizado', 'El material ha sido actualizado.', 'success')
    } else {
      const created = await materialesStore.createMaterial({
        nombre: materialForm.value.nombre.trim(),
        descripcion: materialForm.value.descripcion.trim() || null,
        estado: materialForm.value.estado,
      })
      if (activeTab.value === 'nueva' && created.data) {
        entregaForm.value.materiales.push({
          material_id: created.data.id,
          cantidad: 1,
          notas: '',
        })
      }
      Swal.fire('Creado', 'Material agregado al catálogo.', 'success')
    }
    showMaterialModal.value = false
  } catch (error: any) {
    Swal.fire('Error', error?.data?.message || 'Error al guardar el material.', 'error')
  }
}

const toggleMaterialEstado = async (mat: Material) => {
  try {
    await materialesStore.updateMaterial(mat.id, { estado: !mat.estado })
  } catch (error: any) {
    Swal.fire('Error', 'No se pudo cambiar el estado del material.', 'error')
  }
}

const confirmDeleteMaterial = async (mat: Material) => {
  const res = await Swal.fire({
    title: '¿Eliminar material?',
    text: `Se eliminará o desactivará "${mat.nombre}" del catálogo.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  })
  if (!res.isConfirmed) return
  try {
    const response = await materialesStore.deleteMaterial(mat.id)
    Swal.fire('Listo', response.message || 'Operación completada.', 'success')
  } catch (error: any) {
    Swal.fire('Error', error?.data?.message || 'No se pudo eliminar el material.', 'error')
  }
}

const confirmDeleteEntrega = async (entrega: MaterialEntrega) => {
  const res = await Swal.fire({
    title: `¿Eliminar entrega #${String(entrega.id).padStart(5, '0')}?`,
    text: 'Esta acción eliminará el registro histórico de esta entrega.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!res.isConfirmed) return
  try {
    await materialesStore.deleteEntrega(entrega.id)
    Swal.fire('Eliminado', 'El registro de entrega fue eliminado.', 'success')
  } catch (error: any) {
    Swal.fire('Error', error?.data?.message || 'No se pudo eliminar la entrega.', 'error')
  }
}

// ── Helpers de Agrupación para Tabla e Impresión ─────────────────────────────
const getUniquePersonal = (entrega: MaterialEntrega) => {
  const map = new Map<number, any>()
  for (const det of entrega.detalles || []) {
    if (det.personal && !map.has(det.personal_id)) {
      map.set(det.personal_id, det.personal)
    }
  }
  return Array.from(map.values())
}

const getUniqueMaterialsSummary = (entrega: MaterialEntrega) => {
  const map = new Map<number, { material_id: number; nombre: string; cantidadPorPersona: number; totalEntregado: number }>()
  for (const det of entrega.detalles || []) {
    const matId = det.material_id
    const current = map.get(matId)
    if (!current) {
      map.set(matId, {
        material_id: matId,
        nombre: det.material?.nombre || `Material #${matId}`,
        cantidadPorPersona: det.cantidad,
        totalEntregado: det.cantidad,
      })
    } else {
      current.totalEntregado += det.cantidad
    }
  }
  return Array.from(map.values())
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Lógica de Impresión 100% en el Cliente con print.ts ──────────────────────
const printMode = ref<'single' | 'consolidated'>('single')
const selectedEntregaForPrint = ref<MaterialEntrega | null>(null)
const showPreviewModal = ref(false)
const renderedPrintPreviewHtml = ref('')

const currentPrintTimestamp = computed(() =>
  new Date().toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
)

const printRows = computed(() => {
  const sourceEntregas =
    printMode.value === 'single' && selectedEntregaForPrint.value
      ? [selectedEntregaForPrint.value]
      : materialesStore.entregas

  const rows: Array<{
    fecha: string
    receptorNombre: string
    receptorCedula: string
    cargo: string
    material: string
    notas: string
    cantidad: number
  }> = []

  for (const entrega of sourceEntregas) {
    const fecha = formatDateShort(entrega.fecha_entrega)
    for (const det of entrega.detalles || []) {
      rows.push({
        fecha,
        receptorNombre: det.personal
          ? `${det.personal.nombre} ${det.personal.apellido}`
          : `Personal #${det.personal_id}`,
        receptorCedula: det.personal?.cedula || '',
        cargo: det.personal?.cargo?.nombre || 'N/A',
        material: det.material?.nombre || `Material #${det.material_id}`,
        notas: det.notas || '',
        cantidad: det.cantidad,
      })
    }
  }

  return rows
})

const openPreviewModal = async (entrega: MaterialEntrega) => {
  printMode.value = 'single'
  selectedEntregaForPrint.value = entrega
  await nextTick()
  const el = document.getElementById('material-print-area')
  renderedPrintPreviewHtml.value = el ? el.innerHTML : ''
  showPreviewModal.value = true
}

const triggerClientPrint = () => {
  const code = selectedEntregaForPrint.value
    ? `Acta_Entrega_${String(selectedEntregaForPrint.value.id).padStart(5, '0')}`
    : 'Reporte_Entregas_Materiales'
  printClientReceipt('material-print-area', {
    title: code,
    filename: `${code}.html`,
  })
}

const handlePrintSingle = async (entrega: MaterialEntrega) => {
  printMode.value = 'single'
  selectedEntregaForPrint.value = entrega
  await nextTick()
  triggerClientPrint()
}

const handlePrintConsolidated = async () => {
  printMode.value = 'consolidated'
  selectedEntregaForPrint.value = null
  await nextTick()
  triggerClientPrint()
}

// ── Inicialización ───────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    cargosStore.fetchAll(),
    personalStore.fetchAll('active'),
    materialesStore.fetchCatalogo(),
    materialesStore.fetchEntregas(),
  ])
})
</script>

<style>
@media print {
  @page {
    size: portrait;
    margin: 12mm;
  }

  body {
    background: #ffffff !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .no-print,
  aside,
  nav,
  header,
  footer {
    display: none !important;
  }

  #material-print-area {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
