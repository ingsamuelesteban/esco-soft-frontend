<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center no-print">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Punto de Venta (POS)</h1>
    </div>

    <!-- Buscador -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 no-print">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Buscar Estudiante</h2>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon name="lucide:search" class="w-5 h-5 text-gray-400" />
        </div>
        <input 
          v-model="searchQuery"
          @input="searchStudents"
          type="search" 
          class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="Buscar por matrícula, nombre o apellido..." 
        >
      </div>
      
      <!-- Resultados -->
      <div v-if="searchResults.length > 0 && !selectedStudent" class="mt-2 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 shadow max-h-60 overflow-y-auto">
        <ul class="divide-y divide-gray-200 dark:divide-gray-600">
          <li v-for="student in searchResults" :key="student.id" 
              @click="selectStudent(student)"
              class="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ student.nombres }} {{ student.apellidos }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Matrícula: {{ student.matricula || 'N/A' }} | Aula: {{ student.aula?.nombre || 'N/A' }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Estudiante Seleccionado & Tarjeta de Cobros -->
    <div v-if="selectedStudent" class="space-y-6">
      <div class="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800 no-print">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold text-xl">
            {{ selectedStudent.nombres.charAt(0) }}{{ selectedStudent.apellidos.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedStudent.nombres }} {{ selectedStudent.apellidos }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-300">Matrícula: {{ selectedStudent.matricula }} | Aula: {{ selectedStudent.aula?.nombre || 'N/A' }}</p>
          </div>
        </div>
        <button @click="clearSelection" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Grid de Meses (Tarjeta Académica) -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 no-print">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon name="lucide:calendar-days" class="w-5 h-5 text-blue-500" />
            Tarjeta de Pagos ({{ currentConcept?.name || 'Mensualidad' }})
          </h3>
          <div class="flex items-center gap-4">
            <select v-model="selectedConceptId" @change="loadInvoices" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
              <option v-for="c in concepts" :key="c.id" :value="c.id">{{ c.name }} - ${{ Number(c.amount).toFixed(2) }}</option>
            </select>
            <button v-if="fiscalMonths.length > 0 && invoices.academic.length === 0" @click="generateInvoices" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Generar Cuotas
            </button>
          </div>
        </div>

        <div v-if="invoices.academic.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div v-for="(invoice, index) in sortedAcademicInvoices" :key="invoice.id" 
               class="border rounded-xl p-4 flex flex-col justify-between transition-all"
               :class="[
                 invoice.payment_status === 'paid' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 shadow-sm'
               ]">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-lg uppercase" :class="invoice.payment_status === 'paid' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                  {{ invoice.month_name }}
                </span>
                <span v-if="invoice.payment_status === 'paid'" class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                  PAGADO
                </span>
                <span v-else class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                  PENDIENTE
                </span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ Number(invoice.total_amount).toFixed(2) }}</p>
              
              <div v-if="invoice.payment_status === 'paid'" class="mt-4 space-y-1 text-sm text-green-800 dark:text-green-400">
                <p class="flex items-center gap-1"><Icon name="lucide:check-circle" class="w-4 h-4"/> Rbo: {{ invoice.payments[0]?.receipt_number }}</p>
                <p class="flex items-center gap-1"><Icon name="lucide:calendar" class="w-4 h-4"/> {{ formatDate(invoice.payments[0]?.paid_at) }}</p>
              </div>
            </div>

            <div v-if="invoice.payment_status !== 'paid'" class="mt-4">
              <button @click="openPaymentModal(invoice)" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow flex items-center justify-center gap-2 transition-colors">
                <Icon name="lucide:credit-card" class="w-5 h-5"/>
                Cobrar
              </button>
            </div>
            <div v-else class="mt-4">
              <button @click="fetchAndPrintTicket(invoice.payments[0]?.id)" class="w-full py-2 bg-white dark:bg-gray-800 border border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <Icon name="lucide:printer" class="w-4 h-4"/>
                Reimprimir
              </button>
            </div>
          </div>
        </div>
        
        <div v-else-if="fiscalMonths.length > 0" class="text-center py-10">
          <Icon name="lucide:folder-open" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">Este estudiante no tiene cargos académicos generados para el concepto seleccionado.</p>
        </div>
        <div v-else class="text-center py-10">
          <p class="text-red-500">La institución no tiene los meses fiscales (fiscal_months) configurados.</p>
        </div>
      </div>

      <!-- Tienda / Otros Cargos -->
      <div v-if="invoices.uniforms.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 no-print">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          <Icon name="lucide:shopping-bag" class="w-5 h-5 text-purple-500" />
          Cargos por Tienda / Uniformes
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">Factura</th>
                <th scope="col" class="px-6 py-3">Fecha</th>
                <th scope="col" class="px-6 py-3">Monto Total</th>
                <th scope="col" class="px-6 py-3">Pagado</th>
                <th scope="col" class="px-6 py-3">Estado</th>
                <th scope="col" class="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in invoices.uniforms" :key="inv.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ inv.invoice_number }}
                </td>
                <td class="px-6 py-4">{{ formatDate(inv.created_at) }}</td>
                <td class="px-6 py-4 font-bold">${{ Number(inv.total_amount).toFixed(2) }}</td>
                <td class="px-6 py-4">${{ Number(inv.amount_paid).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs" :class="{
                    'bg-green-100 text-green-800': inv.payment_status === 'paid',
                    'bg-yellow-100 text-yellow-800': inv.payment_status === 'partial',
                    'bg-red-100 text-red-800': inv.payment_status === 'pending'
                  }">{{ inv.payment_status }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="navigateTo(`/admin/admisiones/facturas-uniformes?search=${inv.invoice_number}`)" class="text-blue-600 hover:underline">Ver en Tienda</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Procesar Cobro</h3>
        
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Concepto</p>
          <p class="font-bold text-gray-900 dark:text-white">{{ invoiceToPay?.concept_name }} - {{ invoiceToPay?.month_name }}</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-100 dark:border-blue-800 text-center">
          <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Monto a Cobrar</p>
          <p class="text-4xl font-bold text-blue-700 dark:text-blue-300">${{ Number(invoiceToPay?.total_amount).toFixed(2) }}</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
          <select v-model="paymentMethod" class="w-full p-2 border rounded-lg focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta / POS</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="showPaymentModal = false" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button @click="processPayment" :disabled="isProcessing" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
            <Icon v-if="isProcessing" name="lucide:loader" class="w-5 h-5 animate-spin" />
            <Icon v-else name="lucide:check-circle" class="w-5 h-5" />
            {{ isProcessing ? 'Procesando...' : 'Confirmar Cobro' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const tenantFeatures = authStore.tenantFeatures || []
const fiscalMonths = authStore.user?.tenant?.fiscal_months || []

const searchQuery = ref('')
const searchResults = ref([])
const selectedStudent = ref(null)

const concepts = ref([])
const selectedConceptId = ref('')

const invoices = ref({
  academic: [],
  uniforms: []
})

const currentConcept = computed(() => concepts.value.find(c => c.id === selectedConceptId.value))

const showPaymentModal = ref(false)
const invoiceToPay = ref(null)
const paymentMethod = ref('cash')
const isProcessing = ref(false)

const ticketData = ref(null)

onMounted(async () => {
  await loadConcepts()
})

const loadConcepts = async () => {
  try {
    const res = await api.get('/api/billing/concepts')
    concepts.value = res.data || res || []
    if (concepts.value.length > 0) {
      selectedConceptId.value = concepts.value[0].id
    }
  } catch (error) {
    console.error(error)
  }
}

const searchStudents = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }
  try {
    const response = await api.get('/api/estudiantes', { params: { search: searchQuery.value } })
    // Dependiendo de si es axios o $fetch, extraeremos el array:
    searchResults.value = response.data?.data || response.data || response || []
  } catch (error) {
    console.error('Error buscando estudiantes', error)
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
  try {
    const res = await api.get(`/api/billing/students/${selectedStudent.value.id}/invoices`)
    invoices.value = res.data || res
  } catch (error) {
    console.error('Error cargando facturas', error)
  }
}

const generateInvoices = async () => {
  if (!selectedStudent.value || !selectedConceptId.value) return
  if (!confirm('¿Deseas generar la cuadrícula de cuotas para este estudiante?')) return
  
  try {
    await api.post('/api/billing/generate-invoices', {
      estudiante_id: selectedStudent.value.id,
      concept_id: selectedConceptId.value
    })
    alert('Cuotas generadas con éxito')
    loadInvoices()
  } catch (error) {
    console.error('Error', error)
    alert('Error al generar cuotas')
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
    
    // Obtener ticket de inmediato
    const paymentId = res.payment?.id || res.data?.payment?.id
    await fetchAndPrintTicket(paymentId)
    
    // Recargar data
    await loadInvoices()
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || 'Error procesando cobro')
  } finally {
    isProcessing.value = false
  }
}

const fetchAndPrintTicket = async (paymentId) => {
  try {
    const res = await api.get(`/api/billing/payments/${paymentId}/ticket`)
    ticketData.value = res.data || res
    
    await nextTick()
    setTimeout(() => {
      window.print()
    }, 300)
  } catch (error) {
    console.error('Error al generar ticket', error)
  }
}

// Ordenar las facturas académicas según el orden de los fiscal_months
const sortedAcademicInvoices = computed(() => {
  const acad = [...invoices.value.academic].filter(inv => inv.concept_name === currentConcept.value?.name)
  
  const monthOrder = {}
  fiscalMonths.forEach((m, index) => {
    monthOrder[m.name || m] = index
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
  }
}
</style>
