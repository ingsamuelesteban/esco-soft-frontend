<template>
  <div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
    <div class="flex justify-between items-center no-print">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Mi Tarjeta de Pagos</h1>
    </div>

    <div v-if="loading" class="text-center py-10">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-blue-500 mx-auto" />
      <p class="mt-4 text-gray-500">Cargando información...</p>
    </div>

    <div v-else-if="!hasAccess" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
      <Icon name="lucide:shield-alert" class="w-12 h-12 mx-auto mb-4" />
      <h2 class="text-xl font-bold">Acceso Denegado</h2>
      <p>El módulo de pagos no está activo para tu institución.</p>
    </div>

    <div v-else class="space-y-8">
      
      <!-- Cuadrícula de Cuotas Académicas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6 border-b pb-4 dark:border-gray-700">
          <Icon name="lucide:calendar-check" class="w-5 h-5 text-blue-500" />
          Mensualidades
        </h2>
        
        <div v-if="invoices.academic.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="invoice in sortedAcademicInvoices" :key="invoice.id" 
               class="border rounded-xl p-5 relative overflow-hidden transition-all duration-200"
               :class="[
                 invoice.payment_status === 'paid' 
                  ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                  : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800 shadow-sm'
               ]">
            
            <div class="flex justify-between items-start mb-3">
              <span class="font-bold text-lg uppercase tracking-wide" :class="invoice.payment_status === 'paid' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                {{ invoice.month_name }}
              </span>
              <span v-if="invoice.payment_status === 'paid'" class="inline-flex items-center bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                PAGADO
              </span>
              <span v-else class="inline-flex items-center bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300">
                PENDIENTE
              </span>
            </div>
            
            <div class="mb-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ invoice.concept_name }}</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">${{ Number(invoice.total_amount).toFixed(2) }}</p>
            </div>
            
            <div v-if="invoice.payment_status === 'paid'" class="mt-auto pt-4 border-t" :class="invoice.payment_status === 'paid' ? 'border-green-200 dark:border-green-800/50' : 'border-red-200 dark:border-red-800/50'">
              <div class="space-y-2 text-xs text-green-800 dark:text-green-400 font-medium">
                <p class="flex items-center gap-2"><Icon name="lucide:check-circle" class="w-4 h-4"/> Recibo: {{ invoice.payments[0]?.receipt_number }}</p>
                <p class="flex items-center gap-2"><Icon name="lucide:calendar-clock" class="w-4 h-4"/> Pagado el {{ formatDate(invoice.payments[0]?.paid_at) }}</p>
              </div>
            </div>
            
            <div v-else class="mt-auto pt-4 border-t border-red-200 dark:border-red-800/50">
               <p class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                 <Icon name="lucide:alert-circle" class="w-4 h-4" /> Pago requerido en caja
               </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Icon name="lucide:inbox" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400 font-medium">No tienes cuotas generadas actualmente.</p>
        </div>
      </div>

      <!-- Otros Cargos (Uniformes/Tienda) -->
      <div v-if="invoices.uniforms.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6 border-b pb-4 dark:border-gray-700">
          <Icon name="lucide:shopping-bag" class="w-5 h-5 text-purple-500" />
          Cargos por Uniformes y Tienda
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3 rounded-l-lg">Factura No.</th>
                <th scope="col" class="px-6 py-3">Fecha</th>
                <th scope="col" class="px-6 py-3">Monto Total</th>
                <th scope="col" class="px-6 py-3">Monto Pagado</th>
                <th scope="col" class="px-6 py-3 rounded-r-lg">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in invoices.uniforms" :key="inv.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                  {{ inv.invoice_number }}
                </td>
                <td class="px-6 py-4">{{ formatDate(inv.created_at) }}</td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${{ Number(inv.total_amount).toFixed(2) }}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${{ Number(inv.amount_paid).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wide" :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': inv.payment_status === 'paid',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': inv.payment_status === 'partial',
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': inv.payment_status === 'pending'
                  }">{{ inv.payment_status === 'paid' ? 'PAGADO' : (inv.payment_status === 'partial' ? 'PARCIAL' : 'PENDIENTE') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const tenantFeatures = authStore.tenantFeatures || []
const fiscalMonths = authStore.user?.tenant?.fiscal_months || []

const hasAccess = computed(() => tenantFeatures.includes('billing'))
const loading = ref(true)

const invoices = ref({
  academic: [],
  uniforms: []
})

onMounted(async () => {
  if (!hasAccess.value) {
    loading.value = false
    return
  }
  
  try {
    const res = await api.get('/api/billing/my-invoices')
    invoices.value = res.data || res
  } catch (error) {
    console.error('Error cargando cuotas', error)
  } finally {
    loading.value = false
  }
})

// Ordenar las facturas académicas según el orden de los fiscal_months
const sortedAcademicInvoices = computed(() => {
  const monthOrder = {}
  fiscalMonths.forEach((m, index) => {
    monthOrder[m.name || m] = index
  })
  
  return [...invoices.value.academic].sort((a, b) => {
    const indexA = monthOrder[a.month_name] ?? 999
    const indexB = monthOrder[b.month_name] ?? 999
    return indexA - indexB
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
