<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Calificaciones por Curso</h1>
          <p class="text-sm text-gray-600 mt-1">Gestión de calificaciones de módulos formativos</p>
        </div>
        <div>
          <!-- Espacio para futuros botones si es necesario -->
        </div>
      </div>
    </header>

    <!-- Mensaje de feedback -->
    <div v-if="mostrarMensaje" class="mx-6 mt-4">
      <div :class="[
        'p-4 rounded-md flex items-center justify-between',
        tipoMensaje === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      ]">
        <div class="flex items-center">
          <svg v-if="tipoMensaje === 'success'" class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span :class="tipoMensaje === 'success' ? 'text-green-800' : 'text-red-800'" class="text-sm font-medium">
            {{ mensaje }}
          </span>
        </div>
        <button @click="cerrarMensaje"
          :class="tipoMensaje === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="p-6">
      <!-- Selector de curso -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Seleccionar Curso</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
            <div class="relative">
              <select v-model="aulaSeleccionada" @change="cargarModulosYEstudiantes" :disabled="loadingAulas"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">{{ loadingAulas ? 'Cargando aulas...' : 'Seleccionar aula...' }}</option>
                <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                  {{ aula.grado_cardinal }}° {{ aula.seccion }}
                  <template v-if="aula.titulo">- {{ aula.titulo.nombre }}</template>
                </option>
              </select>
              <div v-if="loadingAulas" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z">
                  </path>
                </svg>
              </div>
            </div>
          </div>

          <div v-if="aulaSeleccionada">
            <label class="block text-sm font-medium text-gray-700 mb-2">Módulo Formativo</label>
            <div class="relative">
              <select v-model="moduloSeleccionado" @change="cargarCalificaciones" :disabled="loadingModulosYEstudiantes"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">{{ loadingModulosYEstudiantes ? 'Cargando módulos...' : 'Seleccionar módulo...' }}
                </option>
                <option v-for="modulo in modulosDisponibles" :key="modulo.id" :value="modulo.id">
                  {{ modulo.nombre }} ({{ modulo.tipo }})
                </option>
              </select>
              <div v-if="loadingModulosYEstudiantes" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z">
                  </path>
                </svg>
              </div>
            </div>
          </div>

          <div v-if="moduloSeleccionado && moduloData?.tipo === 'Tecnico'" class="flex items-end">
            <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div class="text-sm font-medium text-blue-900">
                RAs en este módulo: {{ moduloData.cantidad_ra }}
              </div>
              <div class="text-xs text-blue-600">
                Cada RA tiene hasta 4 oportunidades
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de estudiantes y calificaciones -->
      <div v-if="aulaSeleccionada && moduloSeleccionado" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Loading state para calificaciones -->
        <div v-if="loadingCalificaciones" class="p-8 text-center">
          <div class="inline-flex items-center justify-center space-x-2">
            <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z"></path>
            </svg>
            <span class="text-sm font-medium text-gray-600">Cargando calificaciones...</span>
          </div>
        </div>

        <!-- Content when not loading -->
        <div v-if="!loadingCalificaciones">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              Estudiantes - {{ moduloData?.nombre }}
              <span v-if="moduloData?.tipo === 'Academico'" class="text-sm text-green-600 font-normal">(Académico)</span>
              <span v-if="moduloData?.tipo === 'Tecnico'" class="text-sm text-blue-600 font-normal">(Técnico - {{
                moduloData.cantidad_ra
              }} RAs)</span>
              
              <!-- Indicador de actualización en segundo plano -->
              <span v-if="isRefreshing && !loadingCalificaciones" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                <svg class="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </span>
            </h3>
          </div>

          <div v-if="estudiantes.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
            <p class="mt-1 text-sm text-gray-500">Esta aula no tiene estudiantes asignados.</p>
          </div>

          <!-- Tabla de estudiantes -->
          <div v-else class="overflow-x-auto">
            <!-- Calificaciones para módulos académicos -->
            <div v-if="moduloData?.tipo === 'Academico'">
              <div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Estudiante
                      </th>
                      <!-- Bloques 1-4 -->
                      <th v-for="bloque in 4" :key="bloque"
                        class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                        <div class="flex justify-center space-x-4">
                          <div v-for="comp in getCompetenciasPorBloque(bloque)" :key="comp" class="flex flex-col">
                            <span class="text-[10px] text-gray-500">{{ comp }}</span>
                          </div>
                        </div>
                      </th>
                      <!-- Promedios PC1-PC4 -->
                      <th
                        class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-gray-300 bg-gray-100">
                        <div class="flex flex-col items-center">
                          <span>Promedio Competencias</span>
                          <div class="flex space-x-4 mt-1">
                            <span v-for="b in 4" :key="`h-pc${b}`" class="w-8 text-center">PC{{ b }}</span>
                          </div>
                        </div>
                      </th>
                      <!-- Calificación Final -->
                      <th
                        class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-300 bg-gray-200 sticky right-0 z-10">
                        Final
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="estudiante in estudiantes" :key="estudiante.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div class="flex items-center space-x-3">
                          <div class="flex-shrink-0">
                             <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span class="text-xs font-bold text-blue-800">
                                {{ estudiante.numero_orden || '?' }}
                              </span>
                            </div>
                          </div>
                          <div class="hidden sm:block">
                            <div class="text-sm font-medium text-gray-900">
                              {{ estudiante.nombres }} {{ estudiante.apellidos }}
                            </div>
                            <div class="text-sm text-gray-500">{{ estudiante.rne }}</div>
                          </div>
                        </div>
                      </td>
                      <!-- Celdas por Bloque -->
                      <td v-for="bloque in 4" :key="bloque" class="px-3 py-4 text-center border-l border-gray-200">
                        <div class="flex justify-center space-x-4">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="flex space-x-1">
                              <div v-for="p in 4" :key="p" class="flex flex-col space-y-1">
                                <button :disabled="isRefreshing"
                                  @click="abrirModalCompetencia(estudiante, getCompetenciasPorBloque(bloque)[0], bloque, `P${p}`)"
                                  class="w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors border disabled:opacity-50 disabled:cursor-wait"
                                  :class="getCompetenciaButtonClass(estudiante.id, getCompetenciasPorBloque(bloque)[0], bloque, `P${p}`)"
                                  :title="`Calificar Bloque ${bloque} - P${p}`">
                                  {{ getNotaCompetencia(estudiante.id, getCompetenciasPorBloque(bloque)[0], bloque,
                                    `P${p}`) ||
                                    `P${p}` }}
                                </button>
                                <!-- Botón de Recuperación (RP) Condicional -->
                                <button
                                  v-if="shouldShowRecovery(estudiante.id, getCompetenciasPorBloque(bloque)[0], bloque, `P${p}`)"
                                  :disabled="isRefreshing"
                                  @click="abrirModalCompetencia(estudiante, getCompetenciasPorBloque(bloque)[0], bloque, `RP${p}`)"
                                  class="w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-wait"
                                  :class="getCompetenciaButtonClass(estudiante.id, getCompetenciasPorBloque(bloque)[0], bloque, `RP${p}`)"
                                  :title="`Recuperación Bloque ${bloque} - RP${p}`">
                                  {{ getNotaCompetencia(estudiante.id, getCompetenciasPorBloque(bloque)[0], bloque,
                                    `RP${p}`) ||
                                    `R${p}` }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <!-- Celdas Promedios PC1-PC4 -->
                      <td class="px-3 py-4 text-center border-l-2 border-gray-300 bg-gray-50">
                        <div class="flex justify-center space-x-4">
                          <div v-for="b in 4" :key="`pc${b}`" class="w-8 flex items-center justify-center font-medium"
                            :class="getPromedioClass(calcularPromedioBloque(estudiante.id, b))">
                            {{ calcularPromedioBloque(estudiante.id, b) ?? '-' }}
                          </div>
                        </div>
                      </td>
                      <!-- Celda Calificación Final -->
                      <td
                        class="px-3 py-4 text-center border-l border-gray-300 bg-gray-100 font-bold text-lg sticky right-0 z-10"
                        :class="getPromedioClass(calcularCalificacionFinal(estudiante.id))">
                        {{ calcularCalificacionFinal(estudiante.id) ?? '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Modal de Competencias -->
            <CalificacionCompetenciaModal v-if="mostrarModalCompetencia" :estudiante="estudianteParaCalificar"
              :modulo="moduloData" :competencia-titulo="competenciaParaCalificar" :bloque-index="bloqueParaCalificar"
              :periodo="tipoParaCalificar" :tipo="tipoParaCalificar"
              :calificacion-actual="calificacionCompetenciaActual"
              :observaciones-actuales="observacionesCompetenciaActual" @close="cerrarModalCompetencia"
              @save="guardarCalificacionCompetencia" />

            <!-- Calificaciones para módulos técnicos (RA) -->
            <div v-if="moduloData?.tipo === 'Tecnico'">
              <div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        Estudiante
                      </th>
                      <th v-for="ra in Array.from({ length: moduloData.cantidad_ra }, (_, i) => i + 1)" :key="ra"
                        class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div class="flex flex-col items-center space-y-1">
                          <span>RA {{ ra }}</span>
                          <div v-if="moduloData?.valores_ra && moduloData.valores_ra[`ra_${ra}`]"
                            class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {{ moduloData.valores_ra[`ra_${ra}`] }}%
                          </div>
                          <button @click="abrirModalValorRA(ra)"
                            class="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            :title="`${moduloData?.valores_ra && moduloData.valores_ra[`ra_${ra}`] ? 'Editar' : 'Configurar'} porcentaje del RA ${ra}`">
                            <!-- Icono de + para agregar valor -->
                            <svg v-if="!moduloData?.valores_ra || !moduloData.valores_ra[`ra_${ra}`]" class="w-4 h-4"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <!-- Icono de lápiz para editar valor -->
                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </th>
                      <th
                        class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 border-l border-gray-200">
                        <div class="flex flex-col items-center space-y-1">
                          <span>Total</span>
                          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            :class="getTotalRAClass(calcularTotalRA(moduloData))">
                            {{ calcularTotalRA(moduloData) }}%
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="estudiante in estudiantes" :key="estudiante.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                        <div class="flex items-center space-x-3">
                          <div class="flex-shrink-0">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span class="text-xs font-bold text-blue-800">
                                {{ estudiante.numero_orden || '?' }}
                              </span>
                            </div>
                          </div>
                          <div class="hidden sm:block">
                            <div class="text-sm font-medium text-gray-900">
                              {{ estudiante.nombres }} {{ estudiante.apellidos }}
                            </div>
                            <div class="text-sm text-gray-500">{{ estudiante.rne }}</div>
                          </div>
                        </div>
                      </td>
                      <td v-for="ra in Array.from({ length: moduloData.cantidad_ra }, (_, i) => i + 1)" :key="ra"
                        class="px-2 py-4 text-center">
                        <div class="flex justify-center space-x-1">
                          <button v-for="oportunidad in 4" :key="`${estudiante.id}-ra${ra}-op${oportunidad}`"
                            :disabled="isRefreshing"
                            @click="abrirModalCalificarOportunidad(estudiante, ra, oportunidad)"
                            class="w-5 h-5 border border-gray-300 rounded-sm flex items-center justify-center text-xs font-bold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-wait disabled:hover:shadow-none"
                            :class="getCasillaOportunidadClass(estudiante.id, ra, oportunidad)"
                            :title="getTitleCasilla(estudiante.id, ra, oportunidad)">
                            <span v-if="tieneCalificacionEnOportunidad(estudiante.id, ra, oportunidad)">
                              {{ getDisplayCalificacion(estudiante.id, ra, oportunidad) }}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-center sticky right-0 bg-white border-l border-gray-200">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getEstadoGeneralClass(estudiante.id)">
                          {{ getEstadoGeneral(estudiante.id) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> <!-- Cierre del div v-if="!loadingCalificaciones" -->
      </div>

      <!-- Mensaje cuando no hay selección -->
      <div v-if="!aulaSeleccionada || !moduloSeleccionado" class="text-center py-16">
        <div class="mx-auto max-w-md">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Selecciona un curso</h3>
          <p class="mt-1 text-sm text-gray-500">
            Primero selecciona un aula y luego un módulo formativo para gestionar las calificaciones.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal para configurar valor del RA -->
    <div v-if="mostrarModalValorRA" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Configurar Valor del RA {{ raParaConfigurar }}
            </h3>
            <button @click="cerrarModalValorRA" :disabled="guardandoValorRA"
              class="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje del RA {{ raParaConfigurar }}
            </label>

            <!-- Información del porcentaje disponible -->
            <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex justify-between text-sm">
                <span class="text-blue-700 font-medium">Porcentaje disponible:</span>
                <span class="text-blue-900 font-bold">{{ porcentajeDisponible }}%</span>
              </div>
              <div v-if="porcentajeDisponible < 100" class="text-xs text-blue-600 mt-1">
                Ya se ha asignado {{ 100 - porcentajeDisponible }}% a otros RA
              </div>
            </div>

            <input v-model="valorRAActual" type="number" min="0" :max="porcentajeDisponible" step="0.1"
              :disabled="guardandoValorRA"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              :placeholder="`Máximo ${porcentajeDisponible}%`" />
            <p class="text-xs text-gray-500 mt-1">
              Ingresa el porcentaje que representa este RA (todos los RA deben sumar 100%)
            </p>

            <!-- Advertencia si se excede el límite -->
            <div v-if="valorRAActual && parseFloat(valorRAActual) > porcentajeDisponible"
              class="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p class="text-xs text-red-600">
                ⚠️ El valor ingresado excede el porcentaje disponible ({{ porcentajeDisponible }}%)
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button @click="cerrarModalValorRA" :disabled="guardandoValorRA"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancelar
            </button>
            <button @click="guardarValorRA(valorRAActual)"
              :disabled="guardandoValorRA || !valorRAActual || valorRAActual <= 0 || parseFloat(valorRAActual) > porcentajeDisponible"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center">
              <svg v-if="guardandoValorRA" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z"></path>
              </svg>
              {{ guardandoValorRA ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para calificar oportunidad -->
    <div v-if="mostrarModalCalificarOportunidad"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Calificar RA {{ raParaCalificar }} - Oportunidad {{ oportunidadParaCalificar }}
            </h3>
            <button @click="cerrarModalCalificarOportunidad" :disabled="guardandoCalificacion"
              class="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="text-sm">
                <div class="font-medium text-blue-700">{{ estudianteParaCalificar?.nombres }} {{
                  estudianteParaCalificar?.apellidos }}</div>
                <div class="text-blue-600 mt-1">RNE: {{ estudianteParaCalificar?.rne }}</div>
                <div class="text-blue-600 mt-1">
                  Valor del RA: {{ moduloData?.valores_ra?.[`ra_${raParaCalificar}`] || 20 }} puntos
                </div>
                <div class="text-blue-600">
                  Nota mínima: {{ (moduloData?.valores_ra?.[`ra_${raParaCalificar}`] || 20) * 0.7 }} (70%)
                </div>
              </div>
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
              Calificación obtenida
            </label>
            <input v-model="calificacionActual" type="number" min="0"
              :max="moduloData?.valores_ra?.[`ra_${raParaCalificar}`] || 20" step="0.1"
              :disabled="guardandoCalificacion"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ingresa la calificación" />
            <p class="text-xs text-gray-500 mt-1">
              Ingresa la calificación numérica obtenida por el estudiante
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea v-model="observacionesActual" :disabled="guardandoCalificacion" rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              placeholder="Ingresa observaciones sobre el desempeño del estudiante (opcional)"></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Puedes agregar comentarios sobre el desempeño o aspectos a mejorar
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button @click="cerrarModalCalificarOportunidad" :disabled="guardandoCalificacion"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancelar
            </button>
            <button @click="guardarCalificacion"
              :disabled="guardandoCalificacion || !calificacionActual || calificacionActual < 0"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center">
              <svg v-if="guardandoCalificacion" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="m15.99 4.99c.96.38 1.87.89 2.68 1.5l-2.83 2.83-.01-.01c-.39-.39-.9-.67-1.49-.83l1.65-3.49z"></path>
              </svg>
              {{ guardandoCalificacion ? 'Guardando...' : 'Guardar Calificación' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CalificacionCompetenciaModal from '~/components/calificaciones/CalificacionCompetenciaModal.vue'
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// Constantes


// Estado de la página
const loading = ref(false)
const loadingAulas = ref(false)
const loadingModulosYEstudiantes = ref(false)
const loadingCalificaciones = ref(false)
const isRefreshing = ref(false)
const aulas = ref([])
const estudiantes = ref([])
const modulosDisponibles = ref([])
const calificacionesRA = ref([])
const calificacionesCompetencias = ref([])

// Selecciones
const aulaSeleccionada = ref('')
const moduloSeleccionado = ref('')
const moduloData = ref(null)

// Modal Valor RA
const mostrarModalValorRA = ref(false)
const raParaConfigurar = ref(null)
const valorRAActual = ref('')
const guardandoValorRA = ref(false)

// Modal Calificar Oportunidad (RA)
const mostrarModalCalificarOportunidad = ref(false)
const estudianteParaCalificar = ref(null)
const raParaCalificar = ref(null)
const oportunidadParaCalificar = ref(null)
const calificacionActual = ref('')
const observacionesActual = ref('')
const guardandoCalificacion = ref(false)

// Modal Calificar Competencia (Académico)
const mostrarModalCompetencia = ref(false)
const competenciaParaCalificar = ref('')
const bloqueParaCalificar = ref(null)
const tipoParaCalificar = ref('P')
const calificacionCompetenciaActual = ref('')
const observacionesCompetenciaActual = ref('')

// Mensajes de feedback
const mensaje = ref('')
const tipoMensaje = ref('') // 'success' o 'error'
const mostrarMensaje = ref(false)

// Computed para calcular porcentaje disponible
const porcentajeDisponible = computed(() => {
  if (!moduloData.value?.valores_ra || !raParaConfigurar.value) return 100

  let totalUsado = 0
  const valoresRA = moduloData.value.valores_ra

  // Sumar todos los porcentajes excepto el RA actual que se está editando
  for (let i = 1; i <= moduloData.value.cantidad_ra; i++) {
    if (i !== raParaConfigurar.value && valoresRA[`ra_${i}`]) {
      totalUsado += parseFloat(valoresRA[`ra_${i}`]) || 0
    }
  }

  return Math.max(0, 100 - totalUsado)
})

// Computed para calcular el total de porcentajes asignados
const calcularTotalRA = (moduloData) => {
  if (!moduloData?.valores_ra) return 0

  let total = 0
  const valoresRA = moduloData.valores_ra

  // Sumar todos los porcentajes asignados
  for (let i = 1; i <= moduloData.cantidad_ra; i++) {
    if (valoresRA[`ra_${i}`]) {
      total += parseFloat(valoresRA[`ra_${i}`]) || 0
    }
  }

  return total
}

// Métodos
const cargarAulas = async () => {
  loadingAulas.value = true
  try {
    const response = await api.get('/api/aulas')
    aulas.value = response || []
  } catch (error) {
    console.error('Error al cargar aulas:', error)
  } finally {
    loadingAulas.value = false
  }
}

const cargarModulosYEstudiantes = async () => {
  if (!aulaSeleccionada.value) return

  loadingModulosYEstudiantes.value = true
  try {
    // Cargar estudiantes del aula
    const estudiantesResponse = await api.get(`/api/aulas/${aulaSeleccionada.value}/estudiantes`)
    estudiantes.value = estudiantesResponse.data || []

    // Construir URL para class assignments
    let url = `/api/class-assignments?aula_id=${aulaSeleccionada.value}&only_active=true`

    // Si es profesor, filtrar por su ID para ver solo sus materias
    if (authStore.user?.role === 'profesor' && authStore.user?.personal_id) {
      url += `&profesor_id=${authStore.user.personal_id}`
    }

    // Cargar class assignments
    const assignmentsResponse = await api.get(url)

    // Extraer los módulos formativos de los assignments
    const assignments = assignmentsResponse.data?.data || assignmentsResponse.data || []

    // Crear array de módulos únicos desde los assignments
    const modulosMap = new Map()
    assignments.forEach(assignment => {
      if (assignment.materia && !modulosMap.has(assignment.materia.id)) {
        modulosMap.set(assignment.materia.id, {
          id: assignment.materia.id,
          nombre: assignment.materia.nombre,
          tipo: assignment.materia.tipo,
          cantidad_ra: assignment.materia.cantidad_ra,
          valores_ra: assignment.materia.valores_ra
        })
      }
    })

    modulosDisponibles.value = Array.from(modulosMap.values())

    // Limpiar selección de módulo
    moduloSeleccionado.value = ''
    moduloData.value = null
  } catch (error) {
    console.error('Error al cargar datos:', error)
    modulosDisponibles.value = []
  } finally {
    loadingModulosYEstudiantes.value = false
  }
}

const cargarCalificaciones = async (background = false) => {
  if (!moduloSeleccionado.value) return

  isRefreshing.value = true
  if (!background) {
    loadingCalificaciones.value = true
  }
  
  try {
    // Encontrar datos del módulo seleccionado
    moduloData.value = modulosDisponibles.value.find(m => m.id == moduloSeleccionado.value)

    if (moduloData.value?.tipo === 'Tecnico') {
      // Cargar calificaciones RA para módulos técnicos
      const response = await api.get(`/api/calificaciones-ra?aula_id=${aulaSeleccionada.value}&materia_id=${moduloSeleccionado.value}`)
      calificacionesRA.value = response.data || []
    } else if (moduloData.value?.tipo === 'Academico') {
      // Cargar calificaciones de competencias para módulos académicos
      const response = await api.get(`/api/calificaciones-competencias?aula_id=${aulaSeleccionada.value}&materia_id=${moduloSeleccionado.value}`)
      calificacionesCompetencias.value = response.data || []
    }
  } catch (error) {
    console.error('Error al cargar calificaciones:', error)
    calificacionesRA.value = []
    calificacionesCompetencias.value = []
  } finally {
    isRefreshing.value = false
    if (!background) {
      loadingCalificaciones.value = false
    }
  }
}


const actualizarCalificaciones = async () => {
  await cargarCalificaciones()
  cerrarModalRA()
}

// Métodos para modal de valor RA
const abrirModalValorRA = async (raNumero) => {
  raParaConfigurar.value = raNumero
  // Cargar el valor actual del RA si existe
  await cargarValorRAActual(raNumero)
  mostrarModalValorRA.value = true
}

const cerrarModalValorRA = () => {
  mostrarModalValorRA.value = false
  raParaConfigurar.value = null
  valorRAActual.value = ''
  guardandoValorRA.value = false
}

const cargarValorRAActual = async (raNumero) => {
  try {
    const response = await api.get(`/api/modulos-formativos/${moduloSeleccionado.value}/ra/${raNumero}/valor`)
    valorRAActual.value = response.valor || ''
  } catch (error) {
    console.error('Error al cargar valor del RA:', error)
    valorRAActual.value = ''
  }
}

const guardarValorRA = async (valor) => {
  const raNumero = raParaConfigurar.value // Capturar valor antes de que se limpie
  guardandoValorRA.value = true
  try {
    await api.post(`/api/modulos-formativos/${moduloSeleccionado.value}/ra/${raNumero}/valor`, {
      valor: valor
    })

    // Actualizar los datos del módulo con el nuevo valor
    if (moduloData.value) {
      if (!moduloData.value.valores_ra) {
        moduloData.value.valores_ra = {}
      }
      moduloData.value.valores_ra[`ra_${raNumero}`] = valor
    }

    // Actualizar también en modulosDisponibles para mantener consistencia
    const modulo = modulosDisponibles.value.find(m => m.id == moduloSeleccionado.value)
    if (modulo) {
      if (!modulo.valores_ra) {
        modulo.valores_ra = {}
      }
      modulo.valores_ra[`ra_${raNumero}`] = valor
    }

    cerrarModalValorRA()

    // Mostrar mensaje de éxito usando la variable local
    mostrarMensajeExito(`Valor del RA ${raNumero} actualizado correctamente: ${valor}%`)
  } catch (error) {
    console.error('Error al guardar valor del RA:', error)
    // Mostrar mensaje específico del servidor si está disponible
    const mensajeError = error.data?.message || 'Error al guardar el valor del RA. Inténtalo nuevamente.'
    mostrarMensajeError(mensajeError)
  } finally {
    guardandoValorRA.value = false
  }
}

// Métodos para mensajes de feedback
const mostrarMensajeExito = (texto) => {
  mensaje.value = texto
  tipoMensaje.value = 'success'
  mostrarMensaje.value = true
  setTimeout(() => {
    mostrarMensaje.value = false
  }, 5000)
}

const mostrarMensajeError = (texto) => {
  mensaje.value = texto
  tipoMensaje.value = 'error'
  mostrarMensaje.value = true
  setTimeout(() => {
    mostrarMensaje.value = false
  }, 5000)
}

const cerrarMensaje = () => {
  mostrarMensaje.value = false
}

// Métodos para modal de calificar oportunidad
const abrirModalCalificarOportunidad = async (estudiante, raNumero, oportunidad) => {
  estudianteParaCalificar.value = estudiante
  raParaCalificar.value = raNumero
  oportunidadParaCalificar.value = oportunidad

  // Cargar calificación y observaciones existentes si existen
  const calificacionExistente = getNotaOportunidad(estudiante.id, raNumero, oportunidad)
  const observacionesExistentes = getObservacionesOportunidad(estudiante.id, raNumero, oportunidad)

  calificacionActual.value = calificacionExistente > 0 ? calificacionExistente : ''
  observacionesActual.value = observacionesExistentes

  mostrarModalCalificarOportunidad.value = true
}

const cerrarModalCalificarOportunidad = () => {
  mostrarModalCalificarOportunidad.value = false
  estudianteParaCalificar.value = null
  raParaCalificar.value = null
  oportunidadParaCalificar.value = null
  calificacionActual.value = ''
  observacionesActual.value = ''
  guardandoCalificacion.value = false
}

const guardarCalificacion = async () => {
  guardandoCalificacion.value = true
  try {
    const response = await api.post('/api/calificaciones-ra', {
      estudiante_id: estudianteParaCalificar.value.id,
      materia_id: moduloSeleccionado.value,
      ra_numero: raParaCalificar.value,
      oportunidad: oportunidadParaCalificar.value,
      nota: parseFloat(calificacionActual.value),
      observaciones: observacionesActual.value || null
    })

    // Actualizar los datos locales
    await cargarCalificaciones(true)

    cerrarModalCalificarOportunidad()

    // Usar el estado devuelto por el backend
    const estadoBackend = response.data?.estado === 'Logrado' ? 'Completó' : 'No Completó'
    mostrarMensajeExito(`Calificación guardada: ${response.data?.nota} (${estadoBackend})`)
  } catch (error) {
    console.error('Error al guardar calificación:', error)
    const mensajeError = error.data?.message || 'Error al guardar la calificación. Inténtalo nuevamente.'
    mostrarMensajeError(mensajeError)
  } finally {
    guardandoCalificacion.value = false
  }
}

// Helpers para mostrar estado de RA
const getCalificacionesRA = (estudianteId, raNumero) => {
  if (!estudianteId || !raNumero) return []
  return calificacionesRA.value.filter(cal =>
    cal.estudiante_id === estudianteId && cal.ra_numero === raNumero
  )
}

const getRAEstado = (estudianteId, raNumero) => {
  const cals = getCalificacionesRA(estudianteId, raNumero)
  if (cals.length === 0) return 'Sin evaluar'

  const logrado = cals.some(cal => cal.estado === 'Logrado')
  return logrado ? 'Logrado' : 'No Logrado'
}

const getRAOportunidades = (estudianteId, raNumero) => {
  const cals = getCalificacionesRA(estudianteId, raNumero)
  return cals.length
}

const getRAButtonClass = (estudianteId, raNumero) => {
  const estado = getRAEstado(estudianteId, raNumero)
  switch (estado) {
    case 'Logrado':
      return 'border-green-300 bg-green-50 text-green-700'
    case 'No Logrado':
      return 'border-red-300 bg-red-50 text-red-700'
    default:
      return 'border-gray-300 bg-gray-50 text-gray-600'
  }
}

const getEstadoGeneral = (estudianteId) => {
  if (!moduloData.value?.cantidad_ra) return '0/0'

  const puntosObtenidos = calcularPuntosObtenidos(estudianteId)
  const puntosMaximos = calcularPuntosMaximos()

  return `${puntosObtenidos}/${puntosMaximos}`
}

const getEstadoGeneralClass = (estudianteId) => {
  if (!moduloData.value?.cantidad_ra) return 'bg-gray-100 text-gray-800'

  const puntosObtenidos = calcularPuntosObtenidos(estudianteId)
  const puntosMaximos = calcularPuntosMaximos()
  const porcentaje = puntosMaximos > 0 ? (puntosObtenidos / puntosMaximos) * 100 : 0

  if (porcentaje >= 70) return 'bg-green-100 text-green-800'
  if (porcentaje >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

// Función para calcular puntos obtenidos por el estudiante (suma de la última calificación de cada RA)
const calcularPuntosObtenidos = (estudianteId) => {
  let puntosObtenidos = 0

  if (!moduloData.value?.cantidad_ra) return 0

  for (let ra = 1; ra <= moduloData.value.cantidad_ra; ra++) {
    // Buscar calificaciones de este RA
    const calificaciones = getCalificacionesRA(estudianteId, ra)

    if (calificaciones.length > 0) {
      // Encontrar la calificación con la oportunidad más alta (última ingresada)
      const ultimaCalificacion = calificaciones.reduce((prev, current) => {
        return (prev.oportunidad > current.oportunidad) ? prev : current
      })

      if (ultimaCalificacion && ultimaCalificacion.nota !== undefined) {
        puntosObtenidos += parseFloat(ultimaCalificacion.nota)
      }
    }
  }

  return Math.round(puntosObtenidos)
}

// Función para calcular puntos máximos posibles
const calcularPuntosMaximos = () => {
  if (!moduloData.value?.cantidad_ra) return 0

  let total = 0
  for (let ra = 1; ra <= moduloData.value.cantidad_ra; ra++) {
    total += parseFloat(moduloData.value.valores_ra?.[`ra_${ra}`] || 20)
  }

  return Math.round(total)
}

// Helpers para estilos de casillas
const getTotalRAClass = (total) => {
  if (total === 100) return 'bg-green-100 text-green-800'
  if (total > 100) return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

const getCasillaOportunidadClass = (estudianteId, raNumero, oportunidad) => {
  if (tieneCalificacionEnOportunidad(estudianteId, raNumero, oportunidad)) {
    const nota = getNotaOportunidad(estudianteId, raNumero, oportunidad)
    const notaMinima = getNotaMinima(raNumero)

    if (nota >= notaMinima) {
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
    } else {
      return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
    }
  } else {
    return 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
  }
}

// Función para verificar si tiene calificación en una oportunidad específica
const tieneCalificacionEnOportunidad = (estudianteId, raNumero, oportunidad) => {
  const calificaciones = getCalificacionesRA(estudianteId, raNumero)
  return calificaciones.some(cal => cal.oportunidad === oportunidad && cal.nota !== null)
}

// Función para obtener la nota de una oportunidad específica
const getNotaOportunidad = (estudianteId, raNumero, oportunidad) => {
  const calificaciones = getCalificacionesRA(estudianteId, raNumero)
  const calificacion = calificaciones.find(cal => cal.oportunidad === oportunidad)
  return calificacion?.nota || 0
}

// Función para obtener las observaciones de una oportunidad específica
const getObservacionesOportunidad = (estudianteId, raNumero, oportunidad) => {
  const calificaciones = getCalificacionesRA(estudianteId, raNumero)
  const calificacion = calificaciones.find(cal => cal.oportunidad === oportunidad)
  return calificacion?.observaciones || ''
}

// Función para obtener la nota mínima (70% del valor del RA)
const getNotaMinima = (raNumero) => {
  const valorRA = moduloData.value?.valores_ra?.[`ra_${raNumero}`] || 20
  return (valorRA * 0.7) // 70% del valor del RA
}

// Función para mostrar la calificación en la casilla
const getDisplayCalificacion = (estudianteId, raNumero, oportunidad) => {
  const nota = getNotaOportunidad(estudianteId, raNumero, oportunidad)
  const notaMinima = getNotaMinima(raNumero)

  if (nota >= notaMinima) {
    return Math.round(nota) // Mostrar la nota si aprobó
  } else {
    return 'NC' // NC (No Completó) si no aprobó
  }
}

// Función para el título del tooltip de cada casilla
const getTitleCasilla = (estudianteId, raNumero, oportunidad) => {
  if (tieneCalificacionEnOportunidad(estudianteId, raNumero, oportunidad)) {
    const nota = getNotaOportunidad(estudianteId, raNumero, oportunidad)
    const notaMinima = getNotaMinima(raNumero)
    const display = getDisplayCalificacion(estudianteId, raNumero, oportunidad)

    if (display === 'NC') {
      return `RA ${raNumero} - Oportunidad ${oportunidad}: ${nota} (No Completó)`
    } else {
      return `RA ${raNumero} - Oportunidad ${oportunidad}: ${nota} (Completó)`
    }
  } else {
    return `RA ${raNumero} - Oportunidad ${oportunidad}: Sin calificar`
  }
}

// Lifecycle
onMounted(async () => {
  await cargarAulas()
})

// Meta
definePageMeta({
  layout: 'default',
  title: 'Calificaciones',
  middleware: 'auth' // Requiere autenticación
})
// Helpers para Calificaciones Académicas
const getModulePrefix = (nombre) => {
  if (!nombre) return 'XX'
  const words = nombre.split(' ').filter(w => w.length > 0)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  } else if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase()
  }
  return 'XX'
}

const getCompetenciasPorBloque = (bloque) => {
  const prefix = getModulePrefix(moduloData.value?.nombre)
  const base = `CE-${prefix}`

  switch (bloque) {
    case 1: return [`${base}1`]
    case 2: return [`${base}2`, `${base}3`]
    case 3: return [`${base}4`, `${base}7`]
    case 4: return [`${base}5`, `${base}6`]
    default: return []
  }
}

const getCalificacionCompetencia = (estudianteId, competencia, bloque, tipo) => {
  return calificacionesCompetencias.value.find(c =>
    c.estudiante_id === estudianteId &&
    c.competencia_codigo === competencia &&
    c.bloque === bloque &&
    c.tipo === tipo
  )
}

const getNotaCompetencia = (estudianteId, competencia, bloque, tipo) => {
  const cal = getCalificacionCompetencia(estudianteId, competencia, bloque, tipo)
  return cal ? cal.nota : null
}

const getCompetenciaButtonClass = (estudianteId, competencia, bloque, tipo) => {
  const nota = getNotaCompetencia(estudianteId, competencia, bloque, tipo)

  if (nota === null || nota === undefined) {
    return 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50'
  }

  const notaNum = parseFloat(nota)
  if (notaNum >= 70) {
    return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
  } else {
    return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
  }
}

const shouldShowRecovery = (estudianteId, competencia, bloque, periodo) => {
  // periodo es ej. 'P1'
  const numeroPeriodo = periodo.replace('P', '')
  const tipoRecuperacion = `RP${numeroPeriodo}`

  // Mostrar recuperación si existe nota de recuperación
  const hasRecovery = getNotaCompetencia(estudianteId, competencia, bloque, tipoRecuperacion) !== null
  if (hasRecovery) return true

  // O si la nota del periodo es menor a 70 (reprobado)
  const periodoNota = getNotaCompetencia(estudianteId, competencia, bloque, periodo)
  if (periodoNota !== null && parseInt(periodoNota) < 70) return true

  return false
}

// Cálculos para Promedios y Finales
const getNotaDefinitivaPeriodo = (estudianteId, competencia, bloque, periodoIndex) => {
  // periodoIndex es 1, 2, 3, 4
  const rp = getNotaCompetencia(estudianteId, competencia, bloque, `RP${periodoIndex}`)
  if (rp !== null && rp !== undefined) return parseInt(rp)

  const p = getNotaCompetencia(estudianteId, competencia, bloque, `P${periodoIndex}`)
  if (p !== null && p !== undefined) return parseInt(p)

  return null
}

const calcularPromedioCompetencia = (estudianteId, competencia, bloque) => {
  let suma = 0
  let cantidad = 0

  for (let i = 1; i <= 4; i++) {
    const nota = getNotaDefinitivaPeriodo(estudianteId, competencia, bloque, i)
    if (nota !== null) {
      suma += nota
      cantidad++
    }
  }

  return cantidad > 0 ? Math.round(suma / cantidad) : null
}

const calcularPromedioBloque = (estudianteId, bloque) => {
  const competencias = getCompetenciasPorBloque(bloque)
  if (competencias.length === 0) return null

  let suma = 0
  let cantidad = 0

  competencias.forEach(comp => {
    const promedioComp = calcularPromedioCompetencia(estudianteId, comp, bloque)
    if (promedioComp !== null) {
      suma += promedioComp
      cantidad++
    }
  })

  return cantidad > 0 ? Math.round(suma / cantidad) : null
}

const calcularCalificacionFinal = (estudianteId) => {
  let suma = 0
  let cantidad = 0

  for (let b = 1; b <= 4; b++) {
    const promedioBloque = calcularPromedioBloque(estudianteId, b)
    if (promedioBloque !== null) {
      suma += promedioBloque
      cantidad++
    }
  }

  return cantidad > 0 ? Math.round(suma / cantidad) : null
}

const getPromedioClass = (nota) => {
  if (nota === null) return 'text-gray-400'
  if (nota >= 70) return 'text-green-700 font-bold'
  return 'text-red-700 font-bold'
}

// Métodos para Modal de Competencias
const abrirModalCompetencia = (estudiante, competencia, bloque, tipo) => {
  estudianteParaCalificar.value = estudiante
  competenciaParaCalificar.value = competencia
  bloqueParaCalificar.value = bloque
  tipoParaCalificar.value = tipo

  const cal = getCalificacionCompetencia(estudiante.id, competencia, bloque, tipo)
  calificacionCompetenciaActual.value = cal ? cal.nota : ''
  observacionesCompetenciaActual.value = cal ? cal.observaciones : ''

  mostrarModalCompetencia.value = true
}

const cerrarModalCompetencia = () => {
  mostrarModalCompetencia.value = false
  estudianteParaCalificar.value = null
  competenciaParaCalificar.value = ''
  bloqueParaCalificar.value = null
  calificacionCompetenciaActual.value = ''
  observacionesCompetenciaActual.value = ''
}

const guardarCalificacionCompetencia = async (payload) => {
  // Actualizar localmente
  await cargarCalificaciones(true)
  cerrarModalCompetencia()
  mostrarMensajeExito('Calificación guardada correctamente')
}
</script>
