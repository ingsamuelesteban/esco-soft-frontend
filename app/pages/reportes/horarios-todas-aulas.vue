<template>
  <div class="print-container text-gray-900" v-if="!pending && data">
    <div v-for="(item, index) in data.aulasHorarios" :key="index" class="page-container">
      <!-- Header -->
      <div class="flex items-start justify-between border-b-2 border-blue-700 pb-2 mb-4">
        <div class="w-1/5">
          <img v-if="data.logo_dept_base64" :src="data.logo_dept_base64" class="max-h-16 object-contain" />
        </div>
        <div class="w-3/5 text-center">
          <div class="font-bold uppercase text-sm">Ministerio de Educación (MINERD)</div>
          <div v-if="data.tenant?.departamento" class="text-xs mt-1">{{ data.tenant.departamento }}</div>
          <div v-if="data.tenant?.distrito" class="text-xs">{{ data.tenant.distrito }}</div>
          <div v-if="data.tenant" class="font-bold text-blue-700 text-sm mt-1">{{ data.tenant.name }}</div>
          <div class="font-bold uppercase text-base mt-1">{{ item.title }}</div>
        </div>
        <div class="w-1/5 flex justify-end">
          <img v-if="data.logo" :src="data.logo" class="max-h-16 object-contain" />
        </div>
      </div>

      <!-- Schedule Table -->
      <table class="w-full border-collapse border border-gray-900 text-xs text-center table-fixed mb-4">
        <thead>
          <tr class="bg-gray-100 uppercase">
            <th class="border border-gray-900 p-1 w-[12%] font-bold">Hora</th>
            <th v-for="(nombre, num) in data.dias" :key="num" class="border border-gray-900 p-1 w-[17.6%]">{{ nombre }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="periodo in data.periodos" :key="periodo.id">
            <td class="border border-gray-900 p-1 font-bold">
              <div>{{ formatTime(periodo.start_time) }} - {{ formatTime(periodo.end_time) }}</div>
              <div v-if="periodo.type !== 'class'" class="text-[10px] font-normal capitalize">({{ periodo.type }})</div>
            </td>
            <td v-for="(nombre, num) in data.dias" :key="num" class="border border-gray-900 p-1">
              <template v-if="periodo.type === 'class' && item.horario[periodo.id] && item.horario[periodo.id][num]">
                <div class="font-bold text-[11px] mb-0.5 leading-tight">
                  {{ item.horario[periodo.id][num].assignment?.materia?.nombre || 'N/A' }}
                </div>
                <div class="text-[9px] text-gray-600 leading-tight">
                  {{ item.horario[periodo.id][num].assignment?.profesor?.nombre_completo || '' }}
                </div>
              </template>
              <template v-else-if="periodo.type !== 'class'">
                <div class="text-gray-500 italic">Receso</div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div class="fixed-footer flex flex-col items-center justify-center text-[10px] text-gray-500 border-t border-gray-300 pt-1">
        <div>
          <span v-if="data.tenant?.address">{{ data.tenant.address }}</span>
          <span v-if="data.tenant?.phone"> | Tel: {{ data.tenant.phone }}</span>
          <span v-if="data.tenant?.email"> | Email: {{ data.tenant.email }}</span>
          <span v-if="data.tenant?.website"> | Web: {{ data.tenant.website }}</span>
        </div>
        <div class="mt-0.5">
          Generado el {{ currentDate }} - EscoSoft | Pág. {{ index + 1 }}
        </div>
      </div>
      
      <!-- Page Break -->
      <div v-if="index < data.aulasHorarios.length - 1" class="page-break"></div>
    </div>
  </div>
  <div v-else-if="pending" class="flex flex-col items-center justify-center h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p class="mt-4 text-gray-600">Cargando datos para impresión...</p>
  </div>
  <div v-else class="flex flex-col items-center justify-center h-screen text-red-600">
    <p>Error al cargar los datos del horario. Por favor, inténtelo de nuevo.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: false // Unstyled layout for clean print
})

const { $api } = useNuxtApp()
const data = ref<any>(null)
const pending = ref(true)

const formatTime = (time: string) => {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return time
}

const currentDate = new Date().toLocaleString('es-DO', { 
  day: '2-digit', month: '2-digit', year: 'numeric', 
  hour: '2-digit', minute: '2-digit', hour12: true 
})

onMounted(async () => {
  try {
    pending.value = true
    const response = await $api.get('/api/v1/horarios/datos/todas-las-aulas')
    data.value = response.data || response // Fallback based on how $api returns JSON
    
    // Auto-print after small delay to ensure DOM is rendered and images loaded
    setTimeout(() => {
      window.print()
    }, 1000)
  } catch (err) {
    console.error('Error fetching data for print:', err)
  } finally {
    pending.value = false
  }
})
</script>

<style scoped>
@media print {
  @page {
    margin: 10mm;
    size: landscape;
  }
  
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: white !important;
  }
  
  .page-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
  }

  .page-break {
    page-break-after: always;
  }

  .fixed-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

/* Screen styles to preview what will print */
.print-container {
  background: white;
  width: 100%;
  max-width: 297mm; /* A4 landscape width */
  margin: 0 auto;
  padding: 10mm;
}

.page-container {
  position: relative;
  min-height: calc(210mm - 20mm); /* A4 landscape height minus margins */
  margin-bottom: 20px;
}

.fixed-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
