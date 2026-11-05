<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header con Búsqueda y Selector de Tamaño de Página -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Input de Búsqueda con Icono -->
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchInput"
            @input="onSearchInput"
            type="text"
            class="block w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            placeholder="Buscar por nombre, código o descripción..."
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Limpiar búsqueda"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Controles a la derecha: Selector por Página y Contador -->
        <div class="flex items-center justify-between sm:justify-end gap-3 text-sm">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <label for="perPageSelect" class="text-xs font-medium">Mostrar:</label>
            <select
              id="perPageSelect"
              :value="store.perPage"
              @change="onPerPageChange"
              class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-xs py-1 px-2 focus:ring-1 focus:ring-blue-500"
            >
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <span v-if="loading" class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Buscando...
            </span>
            <span v-else>
              Total: <strong class="text-gray-900 dark:text-gray-100">{{ pagination.total }}</strong> módulos
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto relative">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Código</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Módulo Formativo</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Tipo</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Estado</th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Acciones</th>
          </tr>
        </thead>

        <!-- Skeleton Loader mientras carga -->
        <tbody v-if="loading" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="i in skeletonCount" :key="'skel-' + i" class="animate-pulse">
            <td class="px-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5"></div>
              <div class="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-1/2"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex gap-1">
                <div class="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div class="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Contenido Real -->
        <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="m in modulos"
            :key="m.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
          >
            <td class="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
              <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                {{ m.codigo || '—' }}
              </span>
            </td>

            <td class="px-4 py-3 text-sm">
              <div class="font-medium text-gray-900 dark:text-gray-100">{{ m.nombre }}</div>
              <div v-if="m.descripcion" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {{ m.descripcion }}
              </div>
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-xs">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium"
                :class="m.tipo === 'Tecnico'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'"
              >
                {{ m.tipo }}
              </span>
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-xs">
              <span
                v-if="!m.deleted_at"
                class="inline-flex items-center gap-1 font-medium"
                :class="m.activo ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="m.activo ? 'bg-green-600 dark:bg-green-400' : 'bg-amber-600 dark:bg-amber-400'"></span>
                {{ m.activo ? 'Activa' : 'Inactiva' }}
              </span>
              <span v-else class="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Eliminada
              </span>
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-right text-xs space-x-1">
              <template v-if="!m.deleted_at">
                <button
                  @click="$emit('edit', m)"
                  type="button"
                  class="inline-flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                  title="Editar módulo formativo"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete', m)"
                  type="button"
                  class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 rounded-md transition-colors"
                  title="Eliminar módulo formativo"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
              <template v-else>
                <button
                  @click="$emit('restore', m)"
                  type="button"
                  class="inline-flex items-center justify-center p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 rounded-md transition-colors"
                  title="Restaurar módulo formativo"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </template>
            </td>
          </tr>

          <!-- Estado Vacío -->
          <tr v-if="modulos.length === 0">
            <td colspan="5" class="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <div class="flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No se encontraron módulos formativos</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ searchInput ? 'Prueba con otros términos de búsqueda o limpia el filtro.' : 'No hay módulos registrados con el filtro actual.' }}
                </p>
                <button
                  v-if="searchInput"
                  @click="clearSearch"
                  type="button"
                  class="mt-3 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Controles de Paginación al Pie -->
    <div
      v-if="pagination.total > 0"
      class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400"
    >
      <!-- Resumen de registros -->
      <div>
        Mostrando <strong class="text-gray-900 dark:text-gray-100">{{ pagination.from || 0 }}</strong> a
        <strong class="text-gray-900 dark:text-gray-100">{{ pagination.to || 0 }}</strong> de
        <strong class="text-gray-900 dark:text-gray-100">{{ pagination.total }}</strong> módulos
      </div>

      <!-- Botones de Navegación -->
      <div class="flex items-center gap-1">
        <!-- Botón Anterior -->
        <button
          @click="goToPage(pagination.current_page - 1)"
          :disabled="pagination.current_page <= 1 || loading"
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <svg class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <!-- Páginas Visibles -->
        <div class="hidden sm:flex items-center gap-1">
          <template v-for="p in visiblePages" :key="'page-' + p">
            <span v-if="p === -1" class="px-2 py-1 text-gray-400">...</span>
            <button
              v-else
              @click="goToPage(p)"
              :disabled="loading"
              type="button"
              class="px-3 py-1 rounded font-medium transition-colors"
              :class="p === pagination.current_page
                ? 'bg-blue-600 text-white dark:bg-blue-600'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              {{ p }}
            </button>
          </template>
        </div>

        <!-- Botón Siguiente -->
        <button
          @click="goToPage(pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page || loading"
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Siguiente
          <svg class="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useModulosFormativosApiStore, type ModuloFormativoApi } from '../../stores/modulos-formativos-api'

defineEmits<{
  edit: [m: ModuloFormativoApi];
  delete: [moduloFormativo: ModuloFormativoApi];
  restore: [moduloFormativo: ModuloFormativoApi];
}>()

const store = useModulosFormativosApiStore()
const searchInput = ref(store.search || '')
const skeletonCount = computed(() => Math.min(store.perPage, 8))

let debounceTimeout: any = null

onMounted(() => {
  if (store.items.length === 0) {
    store.fetchModulos()
  }
})

const loading = computed(() => store.loading)
const modulos = computed<ModuloFormativoApi[]>(() => store.items)
const pagination = computed(() => store.pagination)

// Búsqueda con Debounce de 350ms
const onSearchInput = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    store.setSearch(searchInput.value)
  }, 350)
}

const clearSearch = () => {
  searchInput.value = ''
  if (debounceTimeout) clearTimeout(debounceTimeout)
  store.setSearch('')
}

const onPerPageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const val = parseInt(target.value, 10) || 15
  store.setPerPage(val)
}

const goToPage = (pageNumber: number) => {
  if (pageNumber < 1 || pageNumber > pagination.value.last_page) return
  store.setPage(pageNumber)
}

// Cálculo inteligente de páginas a mostrar con elipsis (...)
const visiblePages = computed(() => {
  const current = pagination.value.current_page
  const total = pagination.value.last_page

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: number[] = []
  pages.push(1)

  if (current > 3) {
    pages.push(-1) // Ellipsis
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(-1) // Ellipsis
  }

  pages.push(total)
  return pages
})
</script>
