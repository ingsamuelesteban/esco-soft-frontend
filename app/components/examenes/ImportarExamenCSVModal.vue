<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Importar CSV de Google Forms</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Descarga el CSV desde Google Sheets y súbelo aquí.
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Contenido con scroll -->
      <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">

        <!-- Paso 0: Instrucciones -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
          <p class="font-semibold mb-1">📝 Cómo descargar el CSV de Google Forms:</p>
          <ol class="list-decimal ml-4 space-y-1 text-xs">
            <li>Abre el Google Form → haz clic en <strong>"Ver respuestas"</strong>.</li>
            <li>En Google Sheets, ve a <strong>Archivo → Descargar → Valores separados por comas (.csv)</strong>.</li>
            <li>Sube ese archivo aquí.</li>
          </ol>
        </div>

        <!-- Paso 1: Seleccionar año lectivo -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Año Lectivo
          </label>
          <select v-model="localAnioId"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option v-for="a in aniosLectivos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
          </select>
        </div>

        <!-- Paso 2: Subir CSV y hacer preview -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Archivo CSV
          </label>
          <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop">

            <ArrowUpTrayIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ csvFile ? csvFile.name : 'Haz clic o arrastra el CSV aquí' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">Máx. 5 MB · Solo archivos .csv</p>
          </div>
          <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="onFileChange" />
        </div>

        <!-- Preview de columnas -->
        <div v-if="preview">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Mapear columnas del CSV
            <span class="font-normal text-gray-400">({{ preview.total_columns }} columnas detectadas)</span>
          </h3>

          <!-- Mini preview de los datos -->
          <div class="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="text-xs min-w-max">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <template v-for="(h, i) in preview.headers" :key="i">
                    <th v-if="!esColumnaRuido(h)"
                      class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 truncate max-w-[150px]"
                      :title="h">
                      <span class="block truncate max-w-[150px]"><span class="text-indigo-500 font-bold">#{{ i }}</span> {{ h }}</span>
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="(row, ri) in preview.preview" :key="ri">
                  <template v-for="(cell, ci) in row" :key="ci">
                    <td v-if="!esColumnaRuido(preview.headers[ci])"
                      class="px-3 py-1.5 text-gray-600 dark:text-gray-400 truncate max-w-[150px]" :title="cell">
                      <span class="block truncate max-w-[150px]">{{ cell }}</span>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>


          <!-- Selectores de columna -->
          <div class="grid grid-cols-2 gap-4">
            <div v-for="campo in camposMapa" :key="campo.key">
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {{ campo.label }}
              </label>
              <select v-model="colMap[campo.key]"
                class="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option v-for="(h, i) in preview.headers" :key="i" :value="i">
                  {{ i }}: {{ h.substring(0, 40) }}{{ h.length > 40 ? '…' : '' }}
                </option>
              </select>
            </div>
            <!-- Selector de Paso -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Paso entre preguntas
              </label>
              <select v-model="colMap.col_step"
                class="w-full text-sm rounded-lg border border-indigo-200 dark:border-indigo-900 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100">
                <option :value="1">1 (Consecutivas)</option>
                <option :value="2">2 (Cada 2 columnas)</option>
                <option :value="3">3 (Google Forms Quizzes)</option>
              </select>
            </div>
          </div>

          <p class="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
            💡 Nota: En cuestionarios con puntuación de Google, usa el paso 3. Se ignorarán las columnas marcadas como [Puntuación] y [Comentarios].
          </p>

        </div>

        <!-- Resultado de importación -->
        <div v-if="importResult">
          <div class="rounded-xl border p-4 space-y-2"
            :class="importResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'">
            <p class="font-semibold text-sm" :class="importResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
              {{ importResult.message }}
            </p>
            <ul v-if="importResult.errores?.length" class="text-xs text-red-700 dark:text-red-400 space-y-0.5 list-disc ml-4">
              <li v-for="(e, i) in importResult.errores" :key="i">{{ e }}</li>
            </ul>
            <div v-if="importResult.importados?.length" class="text-xs text-green-700 dark:text-green-400 space-y-0.5">
              <p class="font-bold mb-1">Importados:</p>
              <p v-for="(r, i) in importResult.importados.slice(0, 5)" :key="i">
                Folder #{{ r.folder }}: {{ r.primaria }} / {{ r.secundaria }}
              </p>
              <p v-if="importResult.importados.length > 5" class="text-gray-400 font-normal">
                … y {{ importResult.importados.length - 5 }} más.
              </p>
            </div>
            <!-- Omitidos -->
            <div v-if="importResult.ignorados?.length" class="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 pt-2 border-t border-amber-200 dark:border-amber-800/30">
              <p class="font-bold mb-1">Omitidos (Ya tenían examen):</p>
              <p v-for="(r, i) in importResult.ignorados.slice(0, 5)" :key="i">
                Folder #{{ r.folder }}: {{ r.nombre }}
              </p>
              <p v-if="importResult.ignorados.length > 5" class="text-gray-400 font-normal">
                … y {{ importResult.ignorados.length - 5 }} más.
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          Cerrar
        </button>
        <button v-if="preview && !importResult" @click="importar" :disabled="importing"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
          <svg v-if="importing" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ importing ? 'Importando...' : 'Confirmar Importación' }}
        </button>
        <button v-if="importResult?.success" @click="$emit('imported')"
          class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
          ✓ Listo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '~/utils/api'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

const props = defineProps<{
  anioLectivoId: number | null
  aniosLectivos: any[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported'): void
}>()

const localAnioId = ref<number | null>(props.anioLectivoId)
const csvFile = ref<File | null>(null)
const preview = ref<any>(null)
const importing = ref(false)
const importResult = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Columnas a mapear
const camposMapa = [
  { key: 'col_nombre',      label: 'Columna: Nombre' },
  { key: 'col_folder',      label: 'Columna: No. de Folder' },
  { key: 'col_preferencia', label: 'Columna: Preferencia de Área' },
  { key: 'col_q1',          label: 'Columna: Inicio Pregunta 1' },
]

const colMap = ref<Record<string, number>>({
  col_nombre:      0,
  col_folder:      1,
  col_preferencia: 2,
  col_q1:          3,
  col_step:        1,
})


watch(() => props.anioLectivoId, (v) => { localAnioId.value = v })

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) procesarArchivo(file)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) procesarArchivo(input.files[0])
}

function esColumnaRuido(header: string): boolean {
  if (!header) return true
  const h = header.toLowerCase()
  return h.includes('[puntuación]') || h.includes('[comentarios]') || h.includes('[puntos]')
}

async function procesarArchivo(file: File) {

  if (!file.name.endsWith('.csv')) {
    return Swal.fire('Archivo inválido', 'Solo se aceptan archivos CSV.', 'warning')
  }
  csvFile.value = file
  importResult.value = null

  const formData = new FormData()
  formData.append('file', file)

    try {
      const resp = await api.post('/api/admisiones/examenes/preview-csv', formData)
      const data = resp.data || resp
      preview.value = data

      // Autodetectar columnas por nombre de encabezado
      if (data.headers) {
        let hasScores = false
        data.headers.forEach((h: string, i: number) => {
          const norm = h.toLowerCase()
          // Ignorar columnas de puntuación/comentarios para el mapeo principal
          const isMetadata = norm.includes('[puntuación]') || norm.includes('[comentarios]') || norm.includes('[puntos]')
          
          if (isMetadata) hasScores = true
          if (isMetadata) return

          if (norm.includes('nombre') || norm.includes('nombre completo')) colMap.value.col_nombre = i
          if (norm.includes('folder') || norm.includes('número de folder') || norm.includes('numero de folder')) colMap.value.col_folder = i
          if (norm.includes('área') || norm.includes('area') || norm.includes('preferencia') || norm.includes('elige')) colMap.value.col_preferencia = i
          if (norm.includes('cuando veo') || norm.includes('pregunta 1') || norm.match(/^\s*1\.\s/)) colMap.value.col_q1 = i
        })

        // Si detectamos columnas de puntuación, usualmente el paso es 3
        if (hasScores) colMap.value.col_step = 3
      }
    } catch (err: any) {

      Swal.fire('Error', 'No se pudo leer el CSV: ' + (err?.message || ''), 'error')
    }
}

async function importar() {
  if (!csvFile.value || !localAnioId.value) return

  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', csvFile.value)
    formData.append('anio_lectivo_id', String(localAnioId.value))
    Object.entries(colMap.value).forEach(([k, v]) => formData.append(k, String(v)))

    const resp = await api.post('/api/admisiones/examenes/import-csv', formData)
    importResult.value = resp.data || resp
  } catch (err: any) {
    importResult.value = { success: false, message: err?.message || 'Error al importar.' }
  } finally {
    importing.value = false
  }
}

</script>
