<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Acompañamientos - Componente Técnico</h1>
        <p class="text-sm text-gray-500">Gestión de observaciones a maestros</p>
      </div>
      <button @click="$router.push('/coordinacion/acompanamientos/crear')"
        class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Acompañamiento
      </button>
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
                <div class="text-gray-800">{{ obs.assignment?.modulo?.nombre || '-' }}</div>
                <div class="text-xs text-gray-500">{{ obs.assignment?.aula?.nombre || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                {{ obs.observer?.name }}
              </td>
              <td class="px-6 py-4 text-center">
                <button v-if="obs.status === 'draft'" @click="editObservation(obs)"
                  class="mr-3 text-blue-600 hover:text-blue-800 transition-colors" title="Continuar Edición">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="text-gray-500 hover:text-primary-600 transition-colors" title="Ver Detalles">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <!-- <button class="ml-3 text-gray-500 hover:text-red-600" title="Descargar PDF">
                    <Icon name="ph:file-pdf" size="20" />
                 </button> -->
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiCall as useApi } from '@/utils/api';

const router = useRouter();

const loading = ref(true);
const observations = ref<any[]>([]);
const pagination = ref({ total: 0 });

onMounted(() => {
  fetchObservations();
});

async function fetchObservations() {
  try {
    const { data } = await useApi('/observations');
    observations.value = data.data;
    pagination.value = { total: data.total || 0 };
  } catch (e) {
    console.error(e);
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
</script>
