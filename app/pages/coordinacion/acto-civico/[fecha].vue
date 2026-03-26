<template>
  <section>
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <NuxtLink to="/coordinacion/acto-civico" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Pase de Lista Acto Cívico
          </NuxtLink>
          <span>/</span>
          <span>{{ fechaLabel }}</span>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Pase de Lista — <span class="capitalize">{{ fechaLabel }}</span>
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Docentes del primer período por aula.
          <span v-if="yaRegistrado" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
            ✓ Registrado
          </span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="yaRegistrado"
          @click="imprimir"
          :disabled="imprimiendo"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <svg v-if="imprimiendo" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {{ imprimiendo ? 'Generando PDF...' : 'Imprimir PDF' }}
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="mt-10 text-center text-gray-500 dark:text-gray-400 text-sm">
      Cargando...
    </div>

    <!-- Sin docentes -->
    <div v-else-if="registros.length === 0" class="mt-8 text-center py-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
      <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p>No hay docentes asignados al primer período en este día.</p>
    </div>

    <!-- Formulario de pase de lista -->
    <div v-else class="mt-6">
      <div class="space-y-3">
        <div
          v-for="(reg, i) in registros" :key="reg.aula_id"
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all"
          :class="{
            'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10': reg.estado === 'presente',
            'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10': reg.estado === 'ausente',
            'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10': reg.estado === 'excusa',
          }">
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <!-- Info del aula/docente -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-base">
                  {{ reg.aula_nombre }}<span v-if="reg.titulo" class="text-gray-400 dark:text-gray-500 font-normal"> · {{ reg.titulo }}</span>
                </span>
                <span class="text-gray-400 dark:text-gray-500">—</span>
                <span class="text-gray-700 dark:text-gray-300">{{ reg.profesor_nombre }}</span>
              </div>
            </div>

            <!-- Opciones de estado -->
            <div class="flex flex-col gap-2 shrink-0">
              <div class="flex items-center gap-3 flex-wrap">
                <label
                  v-for="opcion in opciones" :key="opcion.value"
                  class="inline-flex items-center gap-1.5 cursor-pointer select-none"
                  :class="{ 'opacity-60': yaRegistrado && !editando }">
                  <input
                    type="radio"
                    :name="`estado-${i}`"
                    :value="opcion.value"
                    v-model="reg.estado"
                    :disabled="yaRegistrado && !editando"
                    class="h-4 w-4 accent-blue-600"
                  />
                  <span class="text-sm font-medium" :class="opcion.textClass">{{ opcion.label }}</span>
                </label>
              </div>

              <!-- Input observación (solo para excusa) -->
              <div v-if="reg.estado === 'excusa'" class="mt-1">
                <textarea
                  v-model="reg.observacion"
                  :disabled="yaRegistrado && !editando"
                  placeholder="Escriba la observación de la excusa..."
                  rows="2"
                  class="w-full sm:w-72 text-sm rounded-lg border border-yellow-300 dark:border-yellow-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <!-- Guard: si ya está registrado, ofrecer modo edición -->
        <template v-if="yaRegistrado && !editando">
          <p class="text-sm text-gray-500 dark:text-gray-400 flex-1">
            Este pase fue guardado a las <strong>{{ horaRegistro }}</strong> por <strong>{{ registradoPor }}</strong>.
          </p>
          <button
            @click="startEdit"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Editar
          </button>
        </template>

        <template v-else>
          <button
            v-if="editando"
            @click="cancelarEdicion"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button
            @click="guardar"
            :disabled="guardando || !todoMarcado"
            class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-sm">
            <svg v-if="guardando" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.373 22 12h-4z"/>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ editando ? 'Guardar cambios' : 'Guardar Pase de Lista' }}
          </button>
          <p v-if="!todoMarcado" class="text-xs text-yellow-600 dark:text-yellow-400">
            Debe marcar todos los docentes antes de guardar.
          </p>
        </template>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="mensajeExito"
        class="mt-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 px-4 py-3 text-green-800 dark:text-green-300 text-sm">
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ mensajeExito }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../../utils/api'
import { useAniosLectivosStore } from '../../../stores/anios_lectivos'
import { usePrint } from '../../../composables/usePrint'
import Swal from 'sweetalert2'

const route = useRoute()
const aniosStore = useAniosLectivosStore()

const fecha = computed(() => route.params.fecha as string)
const fechaLabel = computed(() => {
  try {
    const d = new Date(fecha.value + 'T12:00:00')
    return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return fecha.value }
})

const loading = ref(false)
const guardando = ref(false)
const imprimiendo = ref(false)
const registros = ref<any[]>([])
const yaRegistrado = ref(false)
const horaRegistro = ref('')
const registradoPor = ref('')
const editando = ref(false)
const mensajeExito = ref('')
let backupRegistros: any[] = []

const { printPdfBlob } = usePrint()

const opciones = [
  { value: 'presente', label: 'Presente', textClass: 'text-green-700 dark:text-green-400' },
  { value: 'ausente',  label: 'Ausente',  textClass: 'text-red-700 dark:text-red-400' },
  { value: 'excusa',   label: 'Excusa',   textClass: 'text-yellow-700 dark:text-yellow-400' },
]

const todoMarcado = computed(() => registros.value.every(r => r.estado !== null && r.estado !== ''))

const cargar = async () => {
  loading.value = true
  try {
    // Intentar cargar datos guardados del día
    const existente = await api.get<{ data: any[], exists: boolean }>(`/api/civic-act/${fecha.value}`)
    if (existente.exists && existente.data.length) {
      yaRegistrado.value = true
      const first = existente.data[0]
      horaRegistro.value = first.registered_at
        ? new Date(first.registered_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
        : ''
      registradoPor.value = first.registered_by?.name || ''
      registros.value = existente.data.map((d: any) => ({
        aula_id: d.aula_id,
        aula_nombre: d.aula ? (d.aula.grado_cardinal ? `${d.aula.grado_cardinal}°` : '') + (d.aula.seccion || '') : '—',
        titulo: d.aula?.titulo?.nombre || null,
        profesor_id: d.profesor_id,
        profesor_nombre: d.profesor ? `${d.profesor.nombre} ${d.profesor.apellido}` : '—',
        estado: d.estado,
        observacion: d.observacion || '',
      }))
    } else {
      // Cargar desde el primer período activo del día
      const info = await api.get<{ data: any[] }>(`/api/civic-act/first-period-info?fecha=${fecha.value}`)
      registros.value = (info.data ?? []).map((d: any) => ({
        aula_id: d.aula_id,
        aula_nombre: d.aula_nombre,
        titulo: d.titulo || null,
        profesor_id: d.profesor_id,
        profesor_nombre: d.profesor_nombre,
        estado: '',
        observacion: '',
      }))
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const cancelarEdicion = () => {
  editando.value = false
  registros.value = backupRegistros.map(r => ({ ...r }))
}

const guardar = async () => {
  if (!todoMarcado.value) return

  // Obtener año lectivo activo
  let anioId: number | null = null
  try {
    const activo = aniosStore.items.find(a => a.activo)
    if (activo) {
      anioId = activo.id
    } else {
      await aniosStore.fetchAll({ activo: true })
      anioId = aniosStore.items.find(a => a.activo)?.id ?? null
    }
  } catch {}

  if (!anioId) { alert('No se encontró año lectivo activo.'); return }

  guardando.value = true
  mensajeExito.value = ''
  try {
    await api.post('/api/civic-act', {
      fecha: fecha.value,
      anio_lectivo_id: anioId,
      registros: registros.value.map(r => ({
        aula_id: r.aula_id,
        profesor_id: r.profesor_id,
        estado: r.estado,
        observacion: r.observacion || null,
      })),
    })
    yaRegistrado.value = true
    editando.value = false
    mensajeExito.value = 'Pase de lista guardado correctamente. Se ha enviado una notificación a los administradores.'
    // Recargar para mostrar datos actualizados
    await cargar()
  } catch (e: any) {
    alert(e?.data?.message || 'Error al guardar el pase de lista.')
  } finally {
    guardando.value = false
  }
}

const imprimir = async () => {
  imprimiendo.value = true
  try {
    const blob = await api.getBlob(`/api/civic-act/print/${fecha.value}`)
    printPdfBlob(blob, `acto_civico_${fecha.value}.pdf`, 'Generando PDF del pase de lista...')
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Impresión',
      text: 'No se pudo generar el PDF. Verifica que el pase esté guardado y que el servidor esté disponible.',
    })
  } finally {
    imprimiendo.value = false
  }
}

// Guardar backup cuando entrar en modo edición
const startEdit = () => {
  backupRegistros = registros.value.map(r => ({ ...r }))
  editando.value = true
}

onMounted(cargar)
</script>
