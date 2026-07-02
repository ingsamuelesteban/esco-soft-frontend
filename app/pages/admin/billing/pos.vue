<template>
  <div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Punto de Venta (POS)</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Busca un estudiante y gestiona sus cobros.</p>
      </div>
    </div>

    <!-- Buscador -->
    <UCard class="no-print shadow-sm" :ui="{ body: { padding: 'p-4 sm:p-6' } }">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Buscar Estudiante</h2>
      <div class="relative">
        <UInput 
          v-model="searchQuery"
          @input="onSearchInput"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Buscar por matrícula, nombre o apellido..." 
          size="lg"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          class="w-full"
        >
          <template #trailing v-if="isSearching">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="w-5 h-5 animate-spin text-gray-400" />
          </template>
        </UInput>
      
        <!-- Resultados -->
        <div v-if="searchResults.length > 0 && !selectedStudent" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl max-h-72 overflow-y-auto z-50">
          <ul class="divide-y divide-gray-100 dark:divide-gray-700">
            <li v-for="student in searchResults" :key="student.id" 
                @click="selectStudent(student)"
                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex justify-between items-center transition-colors">
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ student.nombres }} {{ student.apellidos }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1"><UIcon name="i-heroicons-identification" class="w-4 h-4"/> {{ student.matricula || 'N/A' }}</span>
                  <span class="flex items-center gap-1"><UIcon name="i-heroicons-building-office-2" class="w-4 h-4"/> {{ student.aula?.nombre || 'N/A' }}</span>
                </div>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
            </li>
          </ul>
        </div>
      </div>
    </UCard>

    <!-- Estudiante Seleccionado & Tarjeta de Cobros -->
    <div v-if="selectedStudent" class="space-y-6 relative z-0">
      <div class="flex justify-between items-center bg-gradient-to-r from-primary-50 to-white dark:from-primary-950/30 dark:to-gray-800 p-6 rounded-xl border border-primary-100 dark:border-primary-900/50 shadow-sm no-print">
        <div class="flex items-center gap-5">
          <div class="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl shadow-inner">
            {{ selectedStudent.nombres.charAt(0) }}{{ selectedStudent.apellidos.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedStudent.nombres }} {{ selectedStudent.apellidos }}</h2>
            <div class="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span class="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">Matrícula: <span class="font-semibold">{{ selectedStudent.matricula }}</span></span>
              <span class="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">Aula: <span class="font-semibold">{{ selectedStudent.aula?.nombre || 'N/A' }}</span></span>
            </div>
          </div>
        </div>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="clearSelection" size="lg" title="Cerrar selección" />
      </div>

      <!-- Grid de Meses (Tarjeta Académica) -->
      <UCard class="no-print shadow-sm" :ui="{ body: { padding: 'p-6' } }">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" />
            </div>
            Tarjeta de Pagos ({{ currentConcept?.name || 'Mensualidad' }})
          </h3>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <USelect 
              v-model="selectedConceptId" 
              :options="conceptOptions"
              @change="loadInvoices" 
              class="w-full md:w-64"
            />
            <UButton v-if="fiscalMonths.length > 0 && invoices.academic.length === 0" color="primary" @click="generateInvoices" icon="i-heroicons-document-plus">
              Generar Cuotas
            </UButton>
          </div>
        </div>

        <div v-if="isLoadingInvoices" class="py-12 flex flex-col items-center justify-center text-gray-500">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mb-4 text-primary-500" />
          <p>Cargando facturas...</p>
        </div>

        <div v-else-if="invoices.academic.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="(invoice, index) in sortedAcademicInvoices" :key="invoice.id" 
               class="relative overflow-hidden border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md group"
               :class="[
                 invoice.payment_status === 'paid' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/10 dark:border-green-800/50' 
                  : 'bg-white border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 shadow-sm hover:border-primary-300 dark:hover:border-primary-700'
               ]">
            <div v-if="invoice.payment_status === 'paid'" class="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-3">
                <span class="font-bold text-sm tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  {{ invoice.month_name }}
                </span>
                <span v-if="invoice.payment_status === 'paid'" class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800/50 shadow-sm">
                  <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                  PAGADO
                </span>
                <span v-else class="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                  PENDIENTE
                </span>
              </div>
              <p class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">${{ Number(invoice.total_amount).toFixed(2) }}</p>
              
              <div v-if="invoice.payment_status === 'paid'" class="mt-4 p-3 bg-white/60 dark:bg-gray-900/40 rounded-xl border border-green-100 dark:border-green-800/30 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <p class="flex items-center justify-between"><span class="flex items-center gap-1.5"><UIcon name="i-heroicons-receipt-refund" class="w-4 h-4 text-green-600 dark:text-green-500"/> Recibo:</span> <span class="font-mono font-medium">{{ invoice.payments[0]?.receipt_number }}</span></p>
                <p class="flex items-center justify-between"><span class="flex items-center gap-1.5"><UIcon name="i-heroicons-calendar" class="w-4 h-4 text-green-600 dark:text-green-500"/> Fecha:</span> <span>{{ formatDate(invoice.payments[0]?.paid_at) }}</span></p>
              </div>
            </div>

            <div v-if="invoice.payment_status !== 'paid'" class="mt-5 relative z-10">
              <UButton @click="openPaymentModal(invoice)" color="primary" block size="lg" class="shadow-sm font-semibold group-hover:shadow transition-shadow">
                <template #leading>
                  <UIcon name="i-heroicons-credit-card" class="w-5 h-5"/>
                </template>
                Cobrar Cuota
              </UButton>
            </div>
            <div v-else class="mt-5 relative z-10">
              <UButton @click="fetchAndPrintTicket(invoice.payments[0]?.id)" color="gray" variant="soft" block size="md">
                <template #leading>
                  <UIcon name="i-heroicons-printer" class="w-4 h-4"/>
                </template>
                Reimprimir Ticket
              </UButton>
            </div>
          </div>
        </div>
        
        <div v-else-if="fiscalMonths.length > 0" class="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
          <div class="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-folder-open" class="w-8 h-8 text-gray-400" />
          </div>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin cargos académicos</h4>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Este estudiante no tiene cuotas generadas para el concepto seleccionado.</p>
          <UButton @click="generateInvoices" color="primary" class="mt-6" icon="i-heroicons-document-plus">
            Generar Cuotas Ahora
          </UButton>
        </div>
        <div v-else class="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p class="text-red-700 dark:text-red-400 font-medium">La institución no tiene los meses fiscales (fiscal_months) configurados.</p>
        </div>
      </UCard>

      <!-- Tienda / Otros Cargos -->
      <UCard v-if="invoices.uniforms.length > 0" class="no-print shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5" />
          </div>
          Cargos por Tienda / Uniformes
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg">
              <tr>
                <th scope="col" class="px-6 py-4 font-semibold rounded-tl-lg">Factura</th>
                <th scope="col" class="px-6 py-4 font-semibold">Fecha</th>
                <th scope="col" class="px-6 py-4 font-semibold">Total</th>
                <th scope="col" class="px-6 py-4 font-semibold">Pagado</th>
                <th scope="col" class="px-6 py-4 font-semibold">Estado</th>
                <th scope="col" class="px-6 py-4 font-semibold text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="inv in invoices.uniforms" :key="inv.id" class="bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                  {{ inv.invoice_number }}
                </td>
                <td class="px-6 py-4 text-gray-500">{{ formatDate(inv.created_at) }}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">${{ Number(inv.total_amount).toFixed(2) }}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${{ Number(inv.amount_paid).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <UBadge :color="inv.payment_status === 'paid' ? 'green' : (inv.payment_status === 'partial' ? 'yellow' : 'red')" variant="subtle" size="sm">
                    {{ inv.payment_status }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 text-right">
                  <UButton @click="navigateTo(`/admin/admisiones/facturas-uniformes?search=${inv.invoice_number}`)" variant="link" color="primary" size="sm">
                    Ver Detalles
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Ticket de Impresión (Solo visible al imprimir) -->
    <div id="printArea" class="hidden print:block print:w-[80mm] print:mx-auto text-black bg-white" v-if="ticketData">
      <div class="text-center mb-4">
        <img v-if="ticketData.tenant.logo_url" :src="ticketData.tenant.logo_url" alt="Logo" class="w-16 h-16 mx-auto mb-2 grayscale">
        <h2 class="font-bold text-lg leading-tight uppercase">{{ ticketData.tenant.name }}</h2>
        <p class="text-xs">{{ ticketData.tenant.address }}</p>
        <p class="text-xs">Tel: {{ ticketData.tenant.phone }}</p>
      </div>
      <div class="border-t border-b border-black py-2 mb-4 text-xs font-mono">
        <p>RECIBO: <span class="font-bold">{{ ticketData.receipt.number }}</span></p>
        <p>FECHA: {{ ticketData.receipt.date }}</p>
        <p>CAJERO: {{ ticketData.receipt.cashier }}</p>
      </div>
      <div class="mb-4 text-sm font-mono">
        <p class="font-bold uppercase mb-1">DATOS DEL ALUMNO:</p>
        <p>{{ ticketData.student.name }}</p>
        <p>Matrícula: {{ ticketData.student.matricula }}</p>
      </div>
      <div class="border-t border-black pt-2 mb-4 text-sm font-mono flex justify-between">
        <span>{{ ticketData.concept.name }}</span>
        <span class="font-bold">${{ Number(ticketData.concept.amount).toFixed(2) }}</span>
      </div>
      <div class="border-t-2 border-black pt-2 mb-6 flex justify-between text-lg font-bold">
        <span>TOTAL:</span>
        <span>${{ Number(ticketData.total).toFixed(2) }}</span>
      </div>
      <div class="text-center text-xs font-mono">
        <p>PAGO EN: {{ ticketData.receipt.payment_method.toUpperCase() }}</p>
        <p class="mt-4">¡GRACIAS POR SU PAGO!</p>
        <p>EscoSoft POS</p>
      </div>
    </div>

    <!-- Modal de Cobro -->
    <UModal v-model="showPaymentModal" prevent-close>
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-primary-500" />
              Procesar Cobro
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="showPaymentModal = false" :disabled="isProcessing" />
          </div>
        </template>
        
        <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl mb-5 border border-gray-100 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Concepto a Pagar</p>
          <p class="font-bold text-lg text-gray-900 dark:text-white">{{ invoiceToPay?.concept_name }} - <span class="text-primary-600 dark:text-primary-400">{{ invoiceToPay?.month_name }}</span></p>
        </div>

        <div class="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl mb-6 border border-primary-100 dark:border-primary-800/50 text-center shadow-inner">
          <p class="text-sm text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider mb-2">Monto Total a Cobrar</p>
          <p class="text-5xl font-black text-primary-700 dark:text-primary-300">${{ Number(invoiceToPay?.total_amount).toFixed(2) }}</p>
        </div>

        <div class="mb-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
          <USelect 
            v-model="paymentMethod" 
            :options="paymentOptions"
            size="lg"
            class="w-full"
            icon="i-heroicons-wallet"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="soft" @click="showPaymentModal = false" :disabled="isProcessing" size="lg">Cancelar</UButton>
            <UButton color="primary" @click="processPayment" :loading="isProcessing" size="lg" class="px-6 font-bold">
              <template #leading v-if="!isProcessing">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
              </template>
              Confirmar Cobro
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'
import { showSuccess, showError, showConfirm, showToast, showLoading, closeLoading } from '~/utils/sweetalert'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const tenantFeatures = authStore.tenantFeatures || []
const fiscalMonths = authStore.tenant?.fiscal_months || []

const searchQuery = ref('')
const searchResults = ref([])
const selectedStudent = ref(null)
const isSearching = ref(false)
let searchTimeout = null

const concepts = ref([])
const selectedConceptId = ref('')

const conceptOptions = computed(() => {
  return concepts.value.map(c => ({
    label: `${c.name} - $${Number(c.amount).toFixed(2)}`,
    value: c.id
  }))
})

const invoices = ref({
  academic: [],
  uniforms: []
})
const isLoadingInvoices = ref(false)

const currentConcept = computed(() => concepts.value.find(c => c.id === selectedConceptId.value))

const showPaymentModal = ref(false)
const invoiceToPay = ref(null)
const paymentMethod = ref('cash')
const isProcessing = ref(false)

const paymentOptions = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta / POS', value: 'card' },
  { label: 'Transferencia', value: 'transfer' }
]

const ticketData = ref(null)

onMounted(async () => {
  await loadConcepts()
})

const loadConcepts = async () => {
  try {
    const res = await api.get('/api/billing/concepts')
    concepts.value = res.data?.data || res.data || res || []
    if (concepts.value.length > 0) {
      selectedConceptId.value = concepts.value[0].id
    }
  } catch (error) {
    console.error(error)
    showToast('Error cargando conceptos', 'error')
  }
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(() => {
    searchStudents()
  }, 500)
}

const searchStudents = async () => {
  try {
    const response = await api.get('/api/estudiantes', { params: { search: searchQuery.value } })
    searchResults.value = response.data?.data || response.data || response || []
  } catch (error) {
    console.error('Error buscando estudiantes', error)
    showToast('Error buscando estudiantes', 'error')
  } finally {
    isSearching.value = false
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
  searchQuery.value = ''
  searchResults.value = []
  loadInvoices()
}

const clearSelection = () => {
  selectedStudent.value = null
  invoices.value = { academic: [], uniforms: [] }
}

const loadInvoices = async () => {
  if (!selectedStudent.value) return
  isLoadingInvoices.value = true
  try {
    const res = await api.get(`/api/billing/students/${selectedStudent.value.id}/invoices`)
    invoices.value = res.data || res
  } catch (error) {
    console.error('Error cargando facturas', error)
    showToast('Error cargando facturas', 'error')
  } finally {
    isLoadingInvoices.value = false
  }
}

const generateInvoices = async () => {
  if (!selectedStudent.value || !selectedConceptId.value) return
  
  const result = await showConfirm(
    'Se generarán las cuotas para este estudiante. Esta acción es segura y omitirá los meses que ya tengan factura.',
    '¿Generar Cuadrícula de Cuotas?',
    'question',
    'Sí, generar cuotas'
  )
  
  if (!result.isConfirmed) return
  
  showLoading('Generando cuotas...')
  try {
    await api.post('/api/billing/generate-invoices', {
      estudiante_id: selectedStudent.value.id,
      concept_id: selectedConceptId.value
    })
    closeLoading()
    showSuccess('Las cuotas se han generado exitosamente', '¡Completado!')
    loadInvoices()
  } catch (error) {
    console.error('Error', error)
    closeLoading()
    showError(error.response?.data?.message || 'Ocurrió un error al intentar generar las cuotas.')
  }
}

const openPaymentModal = (invoice) => {
  invoiceToPay.value = invoice
  paymentMethod.value = 'cash'
  showPaymentModal.value = true
}

const processPayment = async () => {
  if (!invoiceToPay.value) return
  isProcessing.value = true
  
  try {
    const res = await api.post('/api/billing/collect-payment', {
      invoice_id: invoiceToPay.value.id,
      payment_method: paymentMethod.value
    })
    
    showPaymentModal.value = false
    showToast('Cobro procesado correctamente', 'success')
    
    // Obtener ticket de inmediato
    const paymentId = res.payment?.id || res.data?.payment?.id
    if (paymentId) {
      await fetchAndPrintTicket(paymentId)
    }
    
    // Recargar data
    await loadInvoices()
  } catch (error) {
    console.error(error)
    showError(error.response?.data?.message || 'Error procesando cobro. Por favor, inténtelo de nuevo.')
  } finally {
    isProcessing.value = false
  }
}

const fetchAndPrintTicket = async (paymentId) => {
  if (!paymentId) return
  
  showToast('Preparando ticket para impresión...', 'info')
  try {
    const res = await api.get(`/api/billing/payments/${paymentId}/ticket`)
    ticketData.value = res.data || res
    
    await nextTick()
    // Give more time for the DOM to render the printArea completely
    setTimeout(() => {
      window.print()
    }, 800)
  } catch (error) {
    console.error('Error al generar ticket', error)
    showError('No se pudo generar el ticket de impresión.')
  }
}

// Ordenar las facturas académicas según el orden de los fiscal_months
const sortedAcademicInvoices = computed(() => {
  if (!invoices.value.academic) return []
  const acad = [...invoices.value.academic].filter(inv => inv.concept_name === currentConcept.value?.name)
  
  const monthOrder = {}
  fiscalMonths.forEach((m, index) => {
    monthOrder[m.month_name || m.name || m] = index
  })
  
  return acad.sort((a, b) => {
    const indexA = monthOrder[a.month_name] ?? 999
    const indexB = monthOrder[b.month_name] ?? 999
    return indexA - indexB
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .no-print {
    display: none !important;
  }
  #printArea, #printArea * {
    visibility: visible;
  }
  #printArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 0;
  }
}
</style>
