<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-gray-900 truncate">Pre-admisiones</h1>
        <p class="text-sm text-gray-500 mt-1">Gestión de nuevas inscripciones pendientes de revisión</p>
      </div>
      <div class="flex flex-wrap gap-2 items-center flex-shrink-0">
        <!-- Barra de búsqueda -->
        <div class="relative rounded-md shadow-sm sm:w-64">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" @keyup.enter="handleSearch" placeholder="Buscar aspirante..."
            class="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
        </div>

        <!-- Filtro por Área Solicitada -->
        <select v-model="tituloFilter" @change="handleSearch"
          class="w-48 block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
          <option value="">Todas las áreas</option>
          <option v-for="titulo in titulos" :key="titulo.id" :value="titulo.id">
            {{ titulo.nombre }}
          </option>
        </select>

        <button type="button" @click="promptPrintListado"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto transition-colors">
          <svg class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Listado
        </button>

        <NuxtLink to="/admin/admisiones/nueva"
          class="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto transition-colors">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Admisión
        </NuxtLink>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Estudiante
                Aspirante</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">Centro Procedencia</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">No. Folder</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sexo</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">Área Solicitada</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha de Registro</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6 whitespace-nowrap">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                <div class="flex justify-center items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  Cargando admisiones...
                </div>
              </td>
            </tr>
            <tr v-else-if="estudiantes.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <h3 class="mt-2 text-sm font-semibold text-gray-900">No hay admisiones</h3>
                <p class="mt-1 text-sm text-gray-500">Comience creando una nueva admisión para pre-inscribir a un
                  estudiante.</p>
              </td>
            </tr>
            <tr v-for="estudiante in estudiantes" :key="estudiante.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {{ estudiante.nombres }} {{ estudiante.apellidos }}
              </td>
              <td class="px-3 py-4 text-sm text-gray-500 w-48 whitespace-normal break-words">
                {{ estudiante.admision?.centro_procedencia || 'N/A' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-bold text-primary-700">
                {{ estudiante.admision?.no_folder || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ estudiante.sexo }}
              </td>
              <td class="px-3 py-4 text-sm text-gray-500 w-48 whitespace-normal break-words">
                {{ estudiante.admision?.titulo?.nombre || 'General' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ formatDate(estudiante.created_at) }}
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 min-w-[120px]">
                <div class="flex items-center justify-end gap-2">
                  <button type="button" @click="viewDetails(estudiante)" title="Ver Perfil"
                    class="text-primary-600 hover:text-primary-900 hover:bg-primary-50 p-2 rounded-md transition-colors">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button type="button" @click="editAdmission(estudiante)" title="Editar"
                    class="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-colors">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación Simple -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{
                totalPages }}</span>
              (Total: <span class="font-medium">{{ totalItems }}</span> registros)
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({
  middleware: ['auth']
})

const router = useRouter()
const { printPdfBlob } = usePrint()

const estudiantes = ref([])
const loading = ref(true)
const searchQuery = ref('')
const tituloFilter = ref('')
const titulos = ref([])

const fetchTitulos = async () => {
  try {
    const res = await api.get('/api/titulos')
    titulos.value = Array.isArray(res) ? res : (res.data ?? [])
  } catch (e) {
    console.error('Error fetching titulos:', e)
  }
}

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(15)

const fetchAdmitidos = async (page = 1) => {
  try {
    loading.value = true
    let url = `/api/admisiones?page=${page}&search=${searchQuery.value}`
    if (tituloFilter.value) url += `&titulo_id=${tituloFilter.value}`
    const res = await api.get(url)

    if (res.success && res.data) {
      estudiantes.value = res.data.data
      currentPage.value = res.data.current_page
      totalPages.value = res.data.last_page
      totalItems.value = res.data.total
      perPage.value = res.data.per_page
    }
  } catch (error) {
    console.error('Error fetching admisiones:', error)
    Swal.fire('Error', 'No se pudieron cargar las admisiones', 'error')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAdmitidos(1)
}

// Live search with debounce
let searchTimeout = null
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500) // 500ms debounce
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchAdmitidos(page)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('es-DO', options)
}

const viewDetails = (estudiante) => {
  router.push(`/admin/admisiones/${estudiante.id}`)
}

const editAdmission = (estudiante) => {
  router.push(`/admin/admisiones/editar/${estudiante.id}`)
}

const promptPrintListado = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Imprimir Listado',
    html:
      '<div class="text-sm text-left mb-4">Ingrese el rango de números de folder a imprimir. Deje en blanco para incluir todos.</div>' +
      '<div class="flex gap-4">' +
      '<div class="flex-1"><label class="block text-xs font-medium text-gray-700 mb-1">Desde Folder No.</label><input id="swal-input1" type="number" class="swal2-input !m-0 !w-full" placeholder="Ej. 1"></div>' +
      '<div class="flex-1"><label class="block text-xs font-medium text-gray-700 mb-1">Hasta Folder No.</label><input id="swal-input2" type="number" class="swal2-input !m-0 !w-full" placeholder="Ej. 100"></div>' +
      '</div>',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Generar PDF',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        desde: document.getElementById('swal-input1').value,
        hasta: document.getElementById('swal-input2').value
      }
    }
  })

  if (formValues) {
    printListadoUrl(formValues.desde, formValues.hasta)
  }
}

const printListadoUrl = async (desde, hasta) => {
  try {
    Swal.fire({
      title: 'Generando documento...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    let url = '/api/admisiones/listado-pdf?'
    if (desde) url += `folder_desde=${desde}&`
    if (hasta) url += `folder_hasta=${hasta}`

    const blob = await api.getBlob(url)
    printPdfBlob(blob, `listado_admisiones.pdf`, 'Preparando impresión...')
    
    Swal.close()
  } catch (error) {
    console.error('Error al generar PDF del listado:', error)
    Swal.fire('Error', 'No se pudo generar el listado. Intenta nuevamente.', 'error')
  }
}

onMounted(() => {
  fetchTitulos()
  fetchAdmitidos()
})
</script>
