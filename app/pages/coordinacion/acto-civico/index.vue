<template>
  <section>
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pase de Lista — Cultura Escolar</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Historial de pases de lista registrados por coordinación.</p>
      </div>
      <NuxtLink
        :to="`/coordinacion/acto-civico/${todayStr}`"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Pasar Lista Hoy
      </NuxtLink>
    </header>

    <!-- Filtros -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por fecha</label>
        <input
          type="date"
          v-model="filtroFecha"
          @change="buscar"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por mes</label>
        <input
          type="month"
          v-model="filtroMes"
          @change="buscar"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div class="flex items-end">
        <button
          @click="limpiarFiltros"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
      Cargando historial...
    </div>

    <!-- Sin resultados -->
    <div v-else-if="historial.length === 0" class="mt-8 text-center py-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
      <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p>No hay pases de lista registrados{{ filtroFecha || filtroMes ? ' para el filtro seleccionado' : '' }}.</p>
    </div>

    <!-- Tabla historial -->
    <div v-else class="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
            <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Aulas</th>
            <th class="px-4 py-3 text-center font-semibold text-green-700 dark:text-green-400">Presentes</th>
            <th class="px-4 py-3 text-center font-semibold text-red-700 dark:text-red-400">Ausentes</th>
            <th class="px-4 py-3 text-center font-semibold text-yellow-700 dark:text-yellow-400">Excusas</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Registrado por</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hora</th>
            <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr v-for="row in historial" :key="row.fecha"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {{ formatFecha(row.fecha) }}
            </td>
            <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{{ row.total_aulas }}</td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                {{ row.presentes }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                {{ row.ausentes }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                {{ row.excusas }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ row.registered_by || '—' }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ row.registered_at || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <NuxtLink
                  :to="`/coordinacion/acto-civico/${row.fecha}`"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver
                </NuxtLink>
                <button
                  @click="imprimir(row.fecha)"
                  :disabled="printingFecha === row.fecha"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                  <svg v-if="printingFecha === row.fecha" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  PDF
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../../utils/api'
import { usePrint } from '../../../composables/usePrint'
import Swal from 'sweetalert2'

const { printPdfBlob } = usePrint()

const loading = ref(false)
const historial = ref<any[]>([])
const filtroFecha = ref('')
const filtroMes = ref('')
const printingFecha = ref<string | null>(null)

const todayStr = new Date().toLocaleDateString('en-CA')

const buscar = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroFecha.value) params.append('fecha', filtroFecha.value)
    if (filtroMes.value) params.append('mes', filtroMes.value)

    const res = await api.get<{ data: any[] }>(`/api/civic-act?${params.toString()}`)
    historial.value = res.data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filtroFecha.value = ''
  filtroMes.value = ''
  buscar()
}

const formatFecha = (f: string) => {
  const d = new Date(f + 'T12:00:00')
  return d.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

const imprimir = async (fecha: string) => {
  printingFecha.value = fecha
  try {
    const blob = await api.getBlob(`/api/civic-act/print/${fecha}`)
    printPdfBlob(blob, `cultura_escolar_${fecha}.pdf`, 'Generando PDF...')
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Impresión',
      text: 'No se pudo generar el PDF para esta fecha.',
    })
  } finally {
    printingFecha.value = null
  }
}

onMounted(buscar)
</script>
