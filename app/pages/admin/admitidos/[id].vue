<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
      <div>
        <nav class="flex text-sm text-gray-500 dark:text-gray-400 mb-2">
          <NuxtLink to="/admin/admitidos" class="hover:text-primary-600 transition-colors">Admitidos</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-gray-900 dark:text-gray-100 font-medium">Perfil del Estudiante</span>
        </nav>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Perfil de Admisión: {{ estudiante?.nombres }} {{ estudiante?.apellidos }}
        </h1>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-if="estudiante?.admision?.pdf_token"
          @click="downloadBasicPdf"
          type="button"
          :disabled="isPrintingBasic"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
        >
          <svg v-if="isPrintingBasic" class="animate-spin h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg v-else class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Formulario Simple
        </button>

        <button
          v-if="estudiante?.admision?.pdf_token"
          @click="downloadCompletePdf"
          type="button"
          :disabled="isPrintingComplete"
          class="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
        >
          <svg v-if="isPrintingComplete" class="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg v-else class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Perfil Completo
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <svg class="animate-spin h-10 w-10 text-primary-600 mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 font-medium">Cargando perfil del estudiante...</p>
    </div>

    <!-- Contenido del Perfil -->
    <div v-else-if="estudiante" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Columna Principal -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Datos Generales -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Datos Personales y de Admisión</h3>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Cédula o Pasaporte</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ estudiante.cedula || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Nacimiento</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {{ formatDate(estudiante.fecha_nacimiento) }}
                  <span class="text-gray-500 dark:text-gray-400 text-xs">({{ edadCalculada }})</span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ estudiante.sexo }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10 uppercase">
                    {{ estudiante.estado }}
                  </span>
                </dd>
              </div>

              <div class="sm:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-3">Detalle de Solicitud</h4>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Centro de Procedencia</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ getCentroProcedenciaName() }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Área Solicitada</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ estudiante.admision?.titulo?.nombre || 'General' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Registro</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(estudiante.admision?.fecha) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Aula Asignada</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <span v-if="estudiante.aula">{{ aulaLabel(estudiante.aula) }}</span>
                  <span v-else class="text-gray-400 italic">Sin aula</span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Recomendado</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <div v-if="estudiante.admision?.recomendado">
                    <span class="text-green-600 font-medium">Sí</span>
                    <span v-if="estudiante.admision?.recomendado_por" class="ml-2 text-xs text-gray-500 italic">
                      (Por: {{ estudiante.admision.recomendado_por }})
                    </span>
                  </div>
                  <span v-else class="text-gray-400">No</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Historia Médica -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Historia Médica</h3>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Discapacidades / Necesidades Especiales</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-100 flex flex-wrap gap-2">
                  <template v-if="estudiante.historia_clinica?.discapacidades?.length">
                    <span v-for="d in estudiante.historia_clinica.discapacidades" :key="d"
                      class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                      {{ d }}
                    </span>
                  </template>
                  <span v-else class="text-gray-400 italic">Ninguna registrada</span>
                </dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Enfermedades Padecidas</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-100 flex flex-wrap gap-2">
                  <template v-if="estudiante.historia_clinica?.enfermedades?.length">
                    <span v-for="e in estudiante.historia_clinica.enfermedades" :key="e"
                      class="inline-flex items-center rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      {{ e }}
                    </span>
                  </template>
                  <span v-else class="text-gray-400 italic">Ninguna registrada</span>
                </dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Vacunas Aplicadas</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-100 flex flex-wrap gap-2">
                  <template v-if="estudiante.historia_clinica?.vacunas?.length">
                    <span v-for="v in estudiante.historia_clinica.vacunas" :key="v"
                      class="inline-flex items-center rounded-md bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {{ v }}
                    </span>
                  </template>
                  <span v-else class="text-gray-400 italic">Ninguna registrada</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Familiares -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
              Familiares Registrados ({{ estudiante.familiares?.length || 0 }})
            </h3>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <template v-if="estudiante.familiares?.length">
              <div v-for="fam in estudiante.familiares" :key="fam.id" class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ fam.nombres }} {{ fam.apellidos }}</h4>
                  <span class="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {{ fam.parentesco }}
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium">Cédula</span>
                    <span class="block text-sm text-gray-900 dark:text-gray-100 mt-1">{{ fam.cedula_pasaporte || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium">Profesión/Ocupación</span>
                    <span class="block text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {{ fam.profesion_oficio || 'N/A' }}
                      <span class="text-gray-400 text-xs">({{ fam.nivel_academico || 'N/A' }})</span>
                    </span>
                  </div>
                  <div>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium">Celular</span>
                    <span class="block text-sm text-gray-900 dark:text-gray-100 mt-1">{{ fam.celular || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 font-medium">Teléfono Fijo</span>
                    <span class="block text-sm text-gray-900 dark:text-gray-100 mt-1">{{ fam.telefono_casa || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="p-6 text-center text-gray-500 dark:text-gray-400">
              No se han registrado familiares.
            </div>
          </div>
        </div>

      </div>

      <!-- Columna Lateral -->
      <div class="space-y-6">

        <!-- Resumen -->
        <div class="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
          <div class="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-full text-primary-600 shadow-sm mb-4">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Folder No. {{ estudiante.admision?.no_folder || '...' }}
          </h2>
          <p class="text-primary-700 text-sm font-medium mb-4">{{ estudiante.admision?.anio_lectivo?.nombre || 'Año Lectivo' }}</p>

          <div class="border-t border-primary-200 pt-4 flex justify-between items-center px-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Folleto Pagado:</span>
            <span v-if="estudiante.admision?.pago"
              class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
              Sí
            </span>
            <span v-else
              class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
              NO
            </span>
          </div>
        </div>

        <!-- Dirección -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Ubicación y Dirección</h3>
          </div>
          <div class="p-6">
            <template v-if="estudiante.direccion">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Residencia Actual:</p>
              <address class="text-sm text-gray-900 dark:text-gray-100 not-italic bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-100 dark:border-gray-700">
                {{ estudiante.direccion.calle }}<br>
                {{ estudiante.direccion.sector }}<br>
                {{ estudiante.direccion.municipio }}, {{ estudiante.direccion.provincia }}
              </address>
            </template>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">No hay dirección registrada.</div>
          </div>
        </div>

        <!-- Acta de Nacimiento -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Origen y Acta de Nacimiento</h3>
          </div>
          <div class="p-6">
            <template v-if="estudiante.es_extranjero">
              <dl class="space-y-3">
                <div class="flex justify-between border-b pb-1 border-gray-100 dark:border-gray-700">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Estudiante Extranjero</dt>
                  <dd class="text-xs font-semibold text-primary-700 text-right">Sí</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Nacionalidad</dt>
                  <dd class="text-xs text-gray-900 dark:text-gray-100 text-right">{{ estudiante.nacionalidad || 'N/A' }}</dd>
                </div>
              </dl>
            </template>
            <template v-else-if="estudiante.acta">
              <dl class="space-y-3">
                <div class="flex justify-between border-b pb-1 border-gray-100 dark:border-gray-700">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Provincia/Mun.</dt>
                  <dd class="text-xs text-gray-900 dark:text-gray-100 text-right">{{ estudiante.acta.provincia }} / {{ estudiante.acta.municipio }}</dd>
                </div>
                <div class="flex justify-between border-b pb-1 border-gray-100 dark:border-gray-700">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Oficialía</dt>
                  <dd class="text-xs text-gray-900 dark:text-gray-100 text-right">{{ estudiante.acta.oficialia || 'N/A' }}</dd>
                </div>
                <div class="flex justify-between border-b pb-1 border-gray-100 dark:border-gray-700">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Libro / Folio</dt>
                  <dd class="text-xs text-gray-900 dark:text-gray-100 text-right">{{ estudiante.acta.libro || 'N/A' }} / {{ estudiante.acta.folio || 'N/A' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-xs text-gray-500 dark:text-gray-400 font-medium">Acta No. / Año</dt>
                  <dd class="text-xs text-gray-900 dark:text-gray-100 text-right">{{ estudiante.acta.acta_numero || 'N/A' }} / {{ estudiante.acta.anio || 'N/A' }}</dd>
                </div>
              </dl>
            </template>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">No se registraron datos de acta.</div>
          </div>
        </div>

        <!-- Documentos Entregados -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Documentos Entregados</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li v-for="doc in documentos" :key="doc.key" class="flex items-center text-sm">
                <svg :class="[estudiante.historia_clinica?.[doc.key] ? 'text-green-500' : 'text-gray-300', 'h-5 w-5 mr-3 shrink-0']" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span :class="[estudiante.historia_clinica?.[doc.key] ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400']">{{ doc.label }}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route              = useRoute()
const { printPdfBlob }   = usePrint()
const estudiante         = ref(null)
const loading            = ref(true)
const isPrintingBasic    = ref(false)
const isPrintingComplete = ref(false)

const documentos = [
  { key: 'documento_acta_nacimiento',     label: 'Acta de Nacimiento' },
  { key: 'documento_record_notas',        label: 'Récord de Notas' },
  { key: 'documento_certificado_sigerd',  label: 'Certificado SIGERD' },
  { key: 'documento_buena_conducta',      label: 'Buena Conducta' },
  { key: 'documento_fotos',               label: 'Fotos 2x2' },
  { key: 'documento_certificado_medico',  label: 'Certificado Médico' },
  { key: 'documento_tarjeta_vacuna',      label: 'Tarjeta Vacunas' },
  { key: 'documento_copia_cedula_padres', label: 'Copia Cédula Padres' },
]

const aulaLabel = (aula) => {
  if (!aula) return ''
  const grado   = aula.grado_cardinal ?? ''
  const seccion = aula.seccion        ?? ''
  const titulo  = aula.titulo?.nombre ?? ''
  return `${grado}° ${seccion}${titulo ? ' – ' + titulo : ''}`.trim()
}

const loadProfile = async () => {
  try {
    loading.value = true
    const res = await api.get(`/api/admisiones/${route.params.id}`)
    if (res.success && res.data) {
      estudiante.value = res.data
    } else {
      throw new Error('No se encontró el perfil')
    }
  } catch (error) {
    console.error('Error fetching student profile:', error)
    Swal.fire('Error', 'No se pudo cargar la información del perfil del estudiante.', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const edadCalculada = computed(() => {
  if (!estudiante.value?.fecha_nacimiento) return ''
  const dob    = new Date(estudiante.value.fecha_nacimiento)
  const age_dt = new Date(Date.now() - dob.getTime())
  return Math.abs(age_dt.getUTCFullYear() - 1970) + ' años'
})

const getCentroProcedenciaName = () => {
  try {
    const rel = estudiante.value?.admision?.centro_procedencia_rel
    if (rel && typeof rel === 'object' && rel.nombre) return rel.nombre
    return 'N/A'
  } catch {
    return 'N/A'
  }
}

const downloadBasicPdf = async () => {
  if (!estudiante.value?.admision?.pdf_token) return
  isPrintingBasic.value = true
  try {
    const token = estudiante.value.admision.pdf_token
    const blob  = await api.getBlob(`/api/admisiones/download-pdf/${token}`)
    printPdfBlob(blob, `formulario_admision_${estudiante.value.nombres}_${estudiante.value.apellidos}.pdf`, 'Preparando re-impresión...')
  } catch (error) {
    console.error('Error downloading basic pdf:', error)
    Swal.fire('Error', 'No se pudo generar el documento.', 'error')
  } finally {
    isPrintingBasic.value = false
  }
}

const downloadCompletePdf = async () => {
  if (!estudiante.value?.admision?.pdf_token) return
  isPrintingComplete.value = true
  try {
    const token = estudiante.value.admision.pdf_token
    const blob  = await api.getBlob(`/api/admisiones/download-full-pdf/${token}`)
    printPdfBlob(blob, `perfil_completo_${estudiante.value.nombres}_${estudiante.value.apellidos}.pdf`, 'Preparando perfil...')
  } catch (error) {
    console.error('Error downloading complete pdf:', error)
    Swal.fire('Error', 'No se pudo generar el documento de perfil completo.', 'error')
  } finally {
    isPrintingComplete.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
