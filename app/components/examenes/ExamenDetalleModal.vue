<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
            Detalle del Examen Vocacional
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ props.estudiante?.nombres }} {{ props.estudiante?.apellidos }} — Folder #{{ props.estudiante?.admision?.no_folder }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Scroll -->
      <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        <div v-if="loading" class="flex justify-center py-10">
          <svg class="animate-spin h-7 w-7 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>

        <template v-else-if="examen">
          <!-- Recomendación calculada -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Recomendación Automática
            </h3>

            <!-- Barras de puntaje por área -->
            <div v-if="examen.puntajes_areas" class="space-y-2">
              <div
                v-for="(puntos, codigo) in puntajesOrdenados"
                :key="codigo"
                class="flex items-center gap-3"
              >
                <span class="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 w-6">{{ codigo }}</span>
                <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="h-2.5 rounded-full transition-all duration-500"
                    :style="{ width: barWidth(puntos) }"
                    :class="getBarColor(String(codigo))"
                  ></div>
                </div>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 w-8 text-right">{{ puntos }}</span>
                <div class="text-xs text-gray-400 truncate max-w-[140px]" :title="getAreaLabel(String(codigo))">
                  {{ getAreaLabel(String(codigo)) }}
                </div>
              </div>
            </div>

            <!-- Chips primaria / secundaria -->
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                🥇 {{ examen.area_primaria_label || '—' }}
              </span>
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                🥈 {{ examen.area_secundaria_label || '—' }}
              </span>
            </div>

            <!-- Preferencia declarada -->
            <div v-if="examen.preferencia_directa">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span class="font-semibold text-gray-700 dark:text-gray-300">Preferencia declarada por el estudiante:</span>
                {{ examen.preferencia_directa }}
              </p>
            </div>
          </div>

          <hr class="border-gray-100 dark:border-gray-700" />

          <!-- Override manual -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <PencilSquareIcon class="w-4 h-4 text-purple-500" />
              Ajuste Manual (Psicólogo / Admin)
            </h3>

            <!-- Info override existente -->
            <div
              v-if="examen.override_area_label"
              class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-3 text-sm"
            >
              <p class="font-semibold text-purple-800 dark:text-purple-300">
                Área asignada manualmente: {{ examen.override_area_label }}
              </p>
              <p v-if="examen.override_nota" class="text-purple-600 dark:text-purple-400 mt-1 text-xs">
                Nota: {{ examen.override_nota }}
              </p>
              <p class="text-purple-500 text-xs mt-1">
                Por {{ examen.override_por ? examen.override_por.name : 'N/A' }} — {{ formatDate(examen.override_en) }}
              </p>
            </div>

            <!-- Formulario de override -->
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Cambiar área recomendada (opcional)
                </label>
                <select
                  v-model="overrideForm.override_area_id"
                  class="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option :value="null">— Sin cambio (usar automática) —</option>
                  <option v-for="t in titulos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Nota / Justificación
                </label>
                <textarea
                  v-model="overrideForm.override_nota"
                  rows="2"
                  placeholder="Observaciones del psicólogo..."
                  class="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="guardarOverride"
          :disabled="saving"
          class="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <svg v-if="saving" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Ajuste' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import { XMarkIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

const props = defineProps<{
  examenId: number
  estudiante: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const loading = ref(true)
const saving  = ref(false)
const examen  = ref<any>(null)
const titulos = ref<any[]>([])

const overrideForm = ref({
  override_area_id: null as number | null,
  override_nota: '',
})

const areaLabels: Record<string, string> = {
  CE: 'Cuidados de Enfermería',
  IE: 'Instalaciones Eléctricas',
  GA: 'Gestión Administrativa',
  GR: 'Redes y Sistemas',
  DA: 'Aplicaciones Informáticas',
  SV: 'Servicios de Viajes',
  RA: 'Refrigeración',
}

const barColors: Record<string, string> = {
  CE: 'bg-pink-500',
  IE: 'bg-yellow-500',
  GA: 'bg-blue-500',
  GR: 'bg-cyan-500',
  DA: 'bg-indigo-500',
  SV: 'bg-orange-500',
  RA: 'bg-teal-500',
}

function getAreaLabel(codigo: string): string {
  return areaLabels[codigo] || codigo
}

function getBarColor(codigo: string): string {
  return barColors[codigo] || 'bg-gray-400'
}

const puntajesOrdenados = computed(() => {
  if (!examen.value?.puntajes_areas) return {}
  const entries = Object.entries(examen.value.puntajes_areas as Record<string, number>)
  entries.sort(([, a], [, b]) => b - a)
  return Object.fromEntries(entries)
})

function barWidth(puntos: number): string {
  const values = Object.values(puntajesOrdenados.value) as number[]
  const max = values.length > 0 ? Math.max(...values) : 0
  return max > 0 ? `${Math.round((puntos / max) * 100)}%` : '0%'
}

function formatDate(dt: string | null | undefined): string {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function cargar() {
  loading.value = true
  try {
    const [resExamen, resTitulos] = await Promise.all([
      api.get(`/api/admisiones/examenes/${props.examenId}`),
      api.get('/api/titulos'),
    ])
    examen.value = resExamen.data || resExamen
    titulos.value = Array.isArray(resTitulos) ? resTitulos : (resTitulos.data || [])

    overrideForm.value.override_area_id = examen.value?.override_area_id ?? null
    overrideForm.value.override_nota    = examen.value?.override_nota ?? ''

  } finally {
    loading.value = false
  }
}

async function guardarOverride() {
  saving.value = true
  try {
    await api.put(`/api/admisiones/examenes/${props.examenId}/override`, overrideForm.value)
    Swal.fire({
      icon: 'success',
      title: 'Guardado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
    emit('updated')
    emit('close')
  } catch (err: any) {
    Swal.fire('Error', err?.message || 'No se pudo guardar.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(cargar)
</script>
