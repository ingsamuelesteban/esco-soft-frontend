<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Acompañamientos - Componente Técnico</h1>
        <p class="text-sm text-gray-500">Gestión de observaciones a maestros</p>
      </div>
      <div class="flex items-center space-x-3">
        <select v-model="selectedAnioId" v-if="aniosStore.items.length > 0"
          class="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm">
          <option :value="'all'">Todos los años</option>
          <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
            {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
          </option>
        </select>
        <button @click="$router.push('/coordinacion/acompanamientos/crear')"
          class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Acompañamiento
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th class="px-6 py-3">Fecha</th>
              <th class="px-6 py-3">Maestro</th>
              <th class="px-6 py-3">Módulo / Aula</th>
              <th class="px-6 py-3">Observador</th>
              <th class="px-6 py-3">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="border-b">
              <td colspan="5" class="py-8 text-center">
                <Icon name="svg-spinners:180-ring-with-bg" size="24" class="text-primary-600" />
              </td>
            </tr>
            <tr v-else-if="observations.length === 0" class="border-b">
              <td colspan="5" class="py-8 text-center text-gray-500">No hay observaciones registradas.</td>
            </tr>
            <tr v-for="obs in observations" :key="obs.id" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900">{{ formatDate(obs.observed_at) }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-800">{{ obs.teacher?.name }} {{ obs.teacher?.last_name }}</div>
                <div class="text-xs text-gray-500">Maestro Técnico</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-800">{{ obs.assignment?.materia?.nombre || '-' }}</div>
                <div class="text-xs text-gray-500">{{ obs.assignment?.aula?.nombre || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                {{ obs.observer?.name }}
              </td>
              <td class="px-6 py-4">
                <span v-if="obs.status === 'draft'"
                  class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Borrador
                </span>
                <span v-else
                  class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Finalizado
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button v-if="obs.status === 'draft'" @click="editObservation(obs)"
                  class="mr-3 text-blue-600 hover:text-blue-800 transition-colors" title="Continuar Edición">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="text-gray-500 hover:text-primary-600 transition-colors" title="Ver Detalles"
                  @click="$router.push({ path: '/coordinacion/acompanamientos/crear', query: { id: obs.id, mode: 'view' } })">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button v-if="obs.status === 'finalized'" class="ml-3 text-gray-500 hover:text-red-600"
                  title="Descargar PDF" @click="downloadPdf(obs.id)" :disabled="generatingPdfId === obs.id">
                  <svg v-if="generatingPdfId === obs.id" class="animate-spin h-5 w-5 text-red-600"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (Simple implementation) -->
      <div v-if="pagination.total > 20" class="flex justify-end p-4">
        <!-- Add pagination controls here if needed -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { apiCall as useApi, api } from '@/utils/api';
import { usePrint } from '@/composables/usePrint';
import { useAniosLectivosStore } from '~/stores/anios_lectivos';

const router = useRouter();
const aniosStore = useAniosLectivosStore();

const loading = ref(true);
const observations = ref<any[]>([]);
const pagination = ref({ total: 0 });
const selectedAnioId = ref<string | number | undefined>(undefined);

onMounted(async () => {
  await aniosStore.fetchAll();

  // Set default active year
  if (aniosStore.activos.length > 0) {
    selectedAnioId.value = aniosStore.activos[0]?.id;
  } else if (aniosStore.items.length > 0) {
    selectedAnioId.value = aniosStore.items[0]?.id;
  }

  fetchObservations();
});

watch(selectedAnioId, () => {
  fetchObservations();
})

async function fetchObservations() {
  loading.value = true;
  try {
    const params: any = {
      anio_lectivo_id: selectedAnioId.value
    };

    const response = await api.get('/observations', { params });
    // Handle both wrapped { data: { ... } } and direct structure
    const data = response.data || response;

    // Check if data is paginated (has data property array inside) or is direct array
    // The Controller returns { success: true, data: { ...paginate... } }
    // Or sometimes directly pagination object.
    // Let's adjust based on common pattern. 
    // Usually response.data is the body. body.data is the pagination object?
    // Let's inspect response structure safely.

    // Adjusted logic based on controller return:
    // return response()->json(['success' => true, 'data' => $observations]);
    // So axios response.data = { success: true, data: { current_page: ..., data: [...] } }

    const pageData = data.data || data; // This should be the paginator object

    if (pageData && Array.isArray(pageData.data)) {
      observations.value = pageData.data;
      pagination.value = { total: pageData.total };
    } else if (Array.isArray(pageData)) {
      observations.value = pageData;
      pagination.value = { total: pageData.length };
    } else {
      observations.value = [];
      pagination.value = { total: 0 };
    }

  } catch (e) {
    console.error("Error fetching observations", e);
    observations.value = [];
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-DO');
}
function editObservation(obs: any) {
  router.push({ path: '/coordinacion/acompanamientos/crear', query: { id: obs.id } });
}

const generatingPdfId = ref<number | null>(null);

async function downloadPdf(id: number) {
  try {
    generatingPdfId.value = id;
    const { printPdfBlob } = usePrint();
    const res = await api.getBlob(`/observations/${id}/pdf`);
    const blob = new Blob([res], { type: 'application/pdf' });

    printPdfBlob(blob, `acompanamiento_${id}.pdf`, 'Generando reporte...');
  } catch (e) {
    console.error("Error downloading PDF", e);
  } finally {
    // Small delay to ensure spinner is seen and to handle printJS async nature (it returns immediately)
    setTimeout(() => {
      generatingPdfId.value = null;
    }, 1000);
  }
}
</script>
