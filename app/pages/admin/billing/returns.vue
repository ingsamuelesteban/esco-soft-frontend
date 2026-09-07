<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Devoluciones y Cambios de Uniformes</h1>
    </div>

    <!-- Buscador -->
    <div class="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Factura o Estudiante</label>
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchInvoices"
            type="text" 
            placeholder="N° Factura, Matrícula o Nombre..." 
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <button 
          @click="searchInvoices" 
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading"
        >
          <span v-if="loading">Buscando...</span>
          <span v-else>Buscar</span>
        </button>
      </div>
    </div>

    <!-- Resultados Búsqueda -->
    <div v-if="invoices.length > 0 && !selectedInvoice" class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="inv in invoices" :key="inv.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ inv.invoice_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ inv.estudiante?.nombres }} {{ inv.estudiante?.apellidos }}
              <span class="text-xs text-gray-400 block">{{ inv.estudiante?.matricula }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(inv.created_at).toLocaleDateString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="selectInvoice(inv)" class="text-blue-600 hover:text-blue-900">Seleccionar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="searchPerformed && invoices.length === 0" class="text-center py-8 text-gray-500 bg-white rounded-lg border">
      No se encontraron facturas con artículos disponibles para devolución o cambio.
    </div>

    <!-- Procesador de Devolución -->
    <div v-if="selectedInvoice" class="bg-white rounded-lg shadow-sm border overflow-hidden mt-6">
      <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Factura: {{ selectedInvoice.invoice_number }}</h3>
          <p class="text-sm text-gray-500">{{ selectedInvoice.estudiante?.nombres }} {{ selectedInvoice.estudiante?.apellidos }}</p>
        </div>
        <button @click="selectedInvoice = null" class="text-gray-500 hover:text-gray-700">Cambiar Factura</button>
      </div>

      <div class="p-6">
        <h4 class="font-medium text-gray-800 mb-4">Artículos Entregados Disponibles</h4>
        
        <div class="space-y-4">
          <div v-for="detail in selectedInvoice.details" :key="detail.id" class="border rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span class="font-bold block">{{ detail.article?.name }}</span>
                <span class="text-sm text-gray-500">Disponible: {{ detail.delivered_quantity - detail.returned_quantity }} ud(s)</span>
              </div>
              <button 
                v-if="!isProcessing(detail.id)"
                @click="startProcess(detail)" 
                class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded shadow-sm text-sm hover:bg-gray-50"
              >
                Devolver / Cambiar
              </button>
              <button 
                v-else
                @click="cancelProcess(detail.id)" 
                class="text-red-600 text-sm hover:underline"
              >
                Cancelar Acción
              </button>
            </div>

            <!-- Formulario por Renglón -->
            <div v-if="isProcessing(detail.id)" class="bg-white p-4 border rounded shadow-inner mt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label class="block text-xs font-medium text-gray-700">Cantidad a Devolver</label>
                  <input 
                    type="number" 
                    v-model.number="getProcessingData(detail.id).quantity" 
                    min="1" 
                    :max="detail.delivered_quantity - detail.returned_quantity"
                    class="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700">Motivo</label>
                  <select v-model="getProcessingData(detail.id).reason" class="mt-1 block w-full text-sm border-gray-300 rounded-md">
                    <option value="Cambio de talla">Cambio de talla</option>
                    <option value="Defecto de fábrica">Defecto de fábrica</option>
                    <option value="Devolución definitiva">Devolución definitiva (Sin cambio)</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div class="md:col-span-2" v-if="getProcessingData(detail.id).reason !== 'Devolución definitiva'">
                  <label class="block text-xs font-medium text-gray-700 mb-1">Entregar a Cambio (Nuevo Artículo)</label>
                  <!-- En un sistema real esto usaría un combobox autocompletable. Simulamos un select -->
                  <select v-model="getProcessingData(detail.id).exchange_article_id" class="block w-full text-sm border-gray-300 rounded-md">
                    <option :value="null">Seleccionar artículo...</option>
                    <option v-for="art in articles" :key="art.id" :value="art.id" :disabled="art.stock < getProcessingData(detail.id).quantity">
                      {{ art.name }} (Stock: {{ art.stock }}) - ${{ art.price }}
                    </option>
                  </select>
                  <p v-if="getProcessingData(detail.id).exchange_article_id" class="text-xs mt-1" :class="isStockSufficient(detail.id) ? 'text-green-600' : 'text-red-600'">
                    Stock disponible: {{ getSelectedArticleStock(detail.id) }} | Requerido: {{ getProcessingData(detail.id).quantity }}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="mt-6 pt-6 border-t">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas Generales (Opcional)</label>
          <textarea v-model="notes" rows="2" class="w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>

        <div class="mt-6 flex justify-end">
          <button 
            @click="submitReturn"
            :disabled="!canSubmit || submitting"
            class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            <span v-if="submitting">Procesando...</span>
            <span v-else>Procesar y Emitir Comprobante</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'

const { $api } = useNuxtApp()

const searchQuery = ref('')
const loading = ref(false)
const searchPerformed = ref(false)
const invoices = ref([])
const selectedInvoice = ref(null)
const articles = ref([]) // Para el dropdown de cambios
const notes = ref('')
const submitting = ref(false)

const processingItems = ref({}) // map de detail_id => datos del form

onMounted(async () => {
  // Cargar artículos para el selector de cambios
  try {
    const res = await $api.get('/admission-articles')
    articles.value = res.data.data || res.data
  } catch (error) {
    console.error('Error fetching articles', error)
  }
})

const searchInvoices = async () => {
  if (!searchQuery.value) return
  loading.value = true
  searchPerformed.value = true
  try {
    const res = await $api.get('/uniformes/devoluciones/facturas-disponibles', {
      params: { search: searchQuery.value }
    })
    invoices.value = res.data
    selectedInvoice.value = null
    processingItems.value = {}
  } catch (e) {
    Swal.fire('Error', 'No se pudo buscar las facturas.', 'error')
  } finally {
    loading.value = false
  }
}

const selectInvoice = (inv) => {
  selectedInvoice.value = inv
  processingItems.value = {}
  notes.value = ''
}

const startProcess = (detail) => {
  processingItems.value[detail.id] = {
    student_invoice_detail_id: detail.id,
    quantity: 1,
    reason: 'Cambio de talla',
    exchange_article_id: null
  }
}

const cancelProcess = (id) => {
  delete processingItems.value[id]
}

const isProcessing = (id) => {
  return !!processingItems.value[id]
}

const getProcessingData = (id) => {
  return processingItems.value[id]
}

const getSelectedArticleStock = (id) => {
  const data = processingItems.value[id]
  if (!data || !data.exchange_article_id) return 0
  const art = articles.value.find(a => a.id === data.exchange_article_id)
  return art ? art.stock : 0
}

const isStockSufficient = (id) => {
  const data = processingItems.value[id]
  if (!data) return false
  return getSelectedArticleStock(id) >= data.quantity
}

const canSubmit = computed(() => {
  const keys = Object.keys(processingItems.value)
  if (keys.length === 0) return false
  
  // Validar que todos los items en proceso sean válidos
  for (let key of keys) {
    const item = processingItems.value[key]
    if (item.quantity <= 0) return false
    if (item.reason !== 'Devolución definitiva' && !item.exchange_article_id) return false
    if (item.exchange_article_id && !isStockSufficient(key)) return false
  }
  return true
})

const submitReturn = async () => {
  if (!canSubmit.value) return

  const items = Object.values(processingItems.value).map(item => ({
    student_invoice_detail_id: item.student_invoice_detail_id,
    quantity: item.quantity,
    reason: item.reason,
    exchange_article_id: item.reason === 'Devolución definitiva' ? null : item.exchange_article_id
  }))

  submitting.value = true
  
  try {
    const res = await $api.post('/uniformes/devoluciones', {
      student_invoice_id: selectedInvoice.value.id,
      notes: notes.value,
      items
    })

    const returnId = res.data.uniform_return.id

    Swal.fire({
      icon: 'success',
      title: 'Devolución Procesada',
      text: 'Se ha registrado el movimiento de inventario correctamente.',
      showConfirmButton: true,
      confirmButtonText: 'Descargar Comprobante'
    }).then(async (result) => {
      // Descargar PDF
      window.open(`${$api.defaults.baseURL}/uniformes/devoluciones/${returnId}/pdf`, '_blank')
      
      // Reset
      selectedInvoice.value = null
      searchInvoices() // refresh list
    })

  } catch (error) {
    const msg = error.response?.data?.message || 'Error al procesar la devolución'
    Swal.fire('Error', msg, 'error')
  } finally {
    submitting.value = false
  }
}
</script>
