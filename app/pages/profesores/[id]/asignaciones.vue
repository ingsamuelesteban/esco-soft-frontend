<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-4">
            <button @click="$router.back()"
              class="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                <span v-if="loading">Cargando asignaciones...</span>
                <span v-else-if="profesor">
                  Asignaciones de {{ profesor.nombre_completo || `${profesor.nombre} ${profesor.apellido}` }}
                </span>
                <span v-else>Asignaciones de Profesor</span>
              </h1>
              <p class="text-sm text-gray-600 mt-1">
                Módulos formativos y aulas asignados al profesor
              </p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex items-center space-x-3">
            <button @click="mostrarModalNuevaAsignacion = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Asignación
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error al cargar las asignaciones</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Asignaciones
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ asignaciones.length }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Asignaciones Activas
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{asignaciones.filter(a => a.activo).length}}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Horas Semanales
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ totalHorasSemanales }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asignaciones por aula -->
        <div v-if="asignaciones.length > 0" class="space-y-6">
          <div v-for="(grupo, aula) in asignacionesPorAula" :key="aula"
            class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">
                {{ aula }} ({{ grupo.length }} asignaciones)
              </h3>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Módulo Formativo
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año Lectivo
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas Semanales
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="asignacion in grupo" :key="asignacion.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ asignacion.materia?.nombre || 'Sin nombre' }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ asignacion.materia?.codigo || 'Sin código' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ asignacion.anioLectivo?.nombre || '—' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div class="flex items-center">
                        <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ asignacion.horas_semanales || 0 }} hrs/semana
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span v-if="asignacion.activo"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                      <span v-else
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactiva
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <!-- Editar asignación -->
                        <button @click="editarAsignacion(asignacion)"
                          class="inline-flex items-center p-1.5 border border-transparent rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          title="Editar asignación">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <!-- Duplicar asignación -->
                        <button @click="duplicarAsignacion(asignacion)"
                          class="inline-flex items-center p-1.5 border border-transparent rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          title="Duplicar a otras aulas">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Sin asignaciones</h3>
          <p class="mt-1 text-sm text-gray-500">Este profesor no tiene módulos formativos asignados.</p>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Asignación -->
    <div v-if="mostrarModalNuevaAsignacion"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Nueva Asignación</h3>

          <form @submit.prevent="crearNuevaAsignacion" class="space-y-4">
            <!-- Módulo Formativo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Módulo Formativo</label>
              <select ref="nuevaAsignacionInput" v-model="nuevaAsignacion.materia_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar módulo...</option>
                <option v-for="modulo in modulosFormativos" :key="modulo.id" :value="modulo.id">
                  {{ modulo.nombre }} ({{ modulo.codigo }})
                </option>
              </select>
            </div>

            <!-- Aula -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
              <select v-model="nuevaAsignacion.aula_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar aula...</option>
                <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                  {{ aula.grado_cardinal }}° - {{ aula.seccion }} ({{ aula.estudiantes_count || 0 }} inscritos)
                </option>
              </select>
            </div>

            <!-- Año Lectivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Año Lectivo</label>
              <select v-model.number="nuevaAsignacion.anio_lectivo_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="undefined">Seleccionar...</option>
                <option v-for="a in anios" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>

            <!-- Horas Semanales -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Horas Semanales</label>
              <input v-model.number="nuevaAsignacion.horas_semanales" type="number" min="1" max="40"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Cantidad RAs (Solo Técnicos) -->
            <div v-if="isTecnicoNueva">
              <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad de RAs</label>
              <input v-model.number="nuevaAsignacion.cantidad_ra" type="number" min="1" max="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. 4" />
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="mostrarModalNuevaAsignacion = false; resetearFormulario()"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancelar
              </button>
              <button type="submit" :disabled="procesandoAccion"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {{ procesandoAccion ? 'Creando...' : 'Crear Asignación' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Duplicar Asignación -->
    <div v-if="mostrarModalDuplicar" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Duplicar: {{ asignacionADuplicar?.materia?.nombre }}
          </h3>

          <form @submit.prevent="ejecutarDuplicacion" class="space-y-4">
            <!-- Aulas a asignar -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Aulas</label>
              <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                <div v-for="aula in aulasDisponiblesParaDuplicacion" :key="aula.id" class="flex items-center mb-2">
                  <input :id="`aula-${aula.id}`" v-model="opcionesDuplicacion.aulas_ids" :value="aula.id"
                    type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label :for="`aula-${aula.id}`" class="ml-2 text-sm text-gray-700">
                    {{ aula.grado_cardinal }}° - {{ aula.seccion }} ({{ aula.estudiantes_count || 0 }} inscritos)
                  </label>
                </div>
              </div>
            </div>

            <!-- Año Lectivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Año Lectivo</label>
              <select ref="duplicarInput" v-model.number="opcionesDuplicacion.anio_lectivo_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="undefined">Seleccionar...</option>
                <option v-for="a in anios" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>

            <!-- Horas Semanales -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Horas Semanales</label>
              <input v-model.number="opcionesDuplicacion.horas_semanales" type="number" min="1" max="40"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="mostrarModalDuplicar = false; asignacionADuplicar = null"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancelar
              </button>
              <button type="submit" :disabled="procesandoAccion || opcionesDuplicacion.aulas_ids.length === 0"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {{ procesandoAccion ? 'Duplicando...' : `Duplicar a ${opcionesDuplicacion.aulas_ids.length} aula(s)` }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Editar Asignación -->
    <div v-if="mostrarModalEditarAsignacion"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Editar Asignación: {{ asignacionAEditar?.materia?.nombre }}
          </h3>

          <form @submit.prevent="actualizarAsignacion" class="space-y-4">
            <!-- Módulo Formativo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Módulo Formativo</label>
              <select ref="editarAsignacionInput" v-model="datosEdicion.materia_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar módulo...</option>
                <option v-for="modulo in modulosFormativos" :key="modulo.id" :value="modulo.id">
                  {{ modulo.nombre }} ({{ modulo.codigo }})
                </option>
              </select>
            </div>

            <!-- Aula -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
              <select v-model="datosEdicion.aula_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar aula...</option>
                <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                  {{ aula.grado_cardinal }}° - {{ aula.seccion }} ({{ aula.estudiantes_count || 0 }} inscritos)
                </option>
              </select>
            </div>

            <!-- Año Lectivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Año Lectivo</label>
              <select v-model.number="datosEdicion.anio_lectivo_id" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="undefined">Seleccionar...</option>
                <option v-for="a in anios" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>

            <!-- Horas Semanales -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Horas Semanales</label>
              <input v-model.number="datosEdicion.horas_semanales" type="number" min="1" max="40"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Cantidad RAs (Solo Técnicos) -->
            <div v-if="isTecnicoEdicion">
              <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad de RAs</label>
              <input v-model.number="datosEdicion.cantidad_ra" type="number" min="1" max="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. 4" />
            </div>

            <!-- Estado Activo -->
            <div>
              <label class="flex items-center">
                <input v-model="datosEdicion.activo" type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span class="ml-2 text-sm text-gray-700">Asignación activa</span>
              </label>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="mostrarModalEditarAsignacion = false; asignacionAEditar = null"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancelar
              </button>
              <button type="submit" :disabled="procesandoAccion"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                {{ procesandoAccion ? 'Actualizando...' : 'Actualizar Asignación' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


interface Profesor {
  id: number
  nombre: string
  apellido: string
  nombre_completo: string
  cedula: string
  cargo_id: number
}

interface ModuloFormativo {
  id: number
  nombre: string
  codigo: string
  tipo?: string
}

interface Aula {
  id: number
  grado_cardinal: number
  seccion: string
  capacidad: number
  activo: boolean
  estudiantes_count?: number
}

interface AnioLectivo {
  id: number
  nombre: string
}

interface Asignacion {
  id: number
  materia_id: number
  profesor_id: number
  aula_id: number
  anio_lectivo_id: number
  horas_semanales: number | null
  cantidad_ra?: number | null
  activo: boolean
  materia?: ModuloFormativo
  aula?: Aula
  anioLectivo?: AnioLectivo
}



// Store
import { useAuthStore } from '../../../stores/auth'
import { useAniosLectivosStore } from '../../../stores/anios_lectivos'

// Composables
const route = useRoute()
const config = useRuntimeConfig()

// Store
const authStore = useAuthStore()
const aniosStore = useAniosLectivosStore()

// Estado reactivo
const loading = ref(true)
const error = ref<string | null>(null)
const profesor = ref<Profesor | null>(null)
const asignaciones = ref<Asignacion[]>([])

// Estados para modales
const mostrarModalNuevaAsignacion = ref(false)
const mostrarModalDuplicar = ref(false)
const mostrarModalEditarAsignacion = ref(false)
const asignacionADuplicar = ref<Asignacion | null>(null)
const asignacionAEditar = ref<Asignacion | null>(null)
const procesandoAccion = ref(false)

// Datos para formularios
const nuevaAsignacion = ref({
  materia_id: '',
  aula_id: '',
  anio_lectivo_id: undefined as number | undefined,
  horas_semanales: 1,
  cantidad_ra: null as number | null,
  activo: true
})

const opcionesDuplicacion = ref({
  aulas_ids: [] as number[],
  anio_lectivo_id: undefined as number | undefined,
  horas_semanales: 1
})

const datosEdicion = ref({
  id: 0,
  materia_id: '',
  aula_id: '',
  anio_lectivo_id: undefined as number | undefined,
  horas_semanales: 1,
  cantidad_ra: null as number | null,
  activo: true
})

// Datos para dropdowns
const modulosFormativos = ref<ModuloFormativo[]>([])
const aulas = ref<Aula[]>([])
const anios = computed(() => aniosStore.items);

// Refs for autofocus
const nuevaAsignacionInput = ref<HTMLSelectElement | null>(null)
const duplicarInput = ref<HTMLSelectElement | null>(null)
const editarAsignacionInput = ref<HTMLSelectElement | null>(null)

// Watchers for autofocus
watch(mostrarModalNuevaAsignacion, (val) => {
  if (val) {
    setTimeout(() => {
      nuevaAsignacionInput.value?.focus()
    }, 100)
  }
})

watch(mostrarModalDuplicar, (val) => {
  if (val) {
    setTimeout(() => {
      duplicarInput.value?.focus()
    }, 100)
  }
})

watch(mostrarModalEditarAsignacion, (val) => {
  if (val) {
    setTimeout(() => {
      editarAsignacionInput.value?.focus()
    }, 100)
  }
})

// Computed
const profesorId = computed(() => Number(route.params.id))

const isTecnicoNueva = computed(() => {
  if (!nuevaAsignacion.value.materia_id) return false
  const m = modulosFormativos.value.find(m => m.id === Number(nuevaAsignacion.value.materia_id))
  return m?.tipo === 'Tecnico'
})

const isTecnicoEdicion = computed(() => {
  if (!datosEdicion.value.materia_id) return false
  const m = modulosFormativos.value.find(m => m.id === Number(datosEdicion.value.materia_id))
  return m?.tipo === 'Tecnico'
})

const totalHorasSemanales = computed(() => {
  return asignaciones.value
    .filter(a => a.activo)
    .reduce((total, a) => total + (a.horas_semanales || 0), 0)
})

const asignacionesPorAula = computed(() => {
  const grupos: Record<string, Asignacion[]> = {}

  asignaciones.value.forEach(asignacion => {
    const aulaKey = asignacion.aula
      ? `${asignacion.aula.grado_cardinal}° - ${asignacion.aula.seccion}`
      : 'Sin aula asignada'

    if (!grupos[aulaKey]) {
      grupos[aulaKey] = []
    }
    grupos[aulaKey].push(asignacion)
  })

  // Ordenar por grado y sección
  const sorted: Record<string, Asignacion[]> = {}
  Object.keys(grupos)
    .sort((a, b) => {
      // "Sin aula asignada" va al final
      if (a === 'Sin aula asignada') return 1
      if (b === 'Sin aula asignada') return -1

      // Extraer grado y sección para ordenar correctamente
      const parseAula = (str: string) => {
        const match = str.match(/(\d+)° - (.+)/)
        if (match && match[1] && match[2]) {
          return { grado: parseInt(match[1]), seccion: match[2] }
        }
        return { grado: 0, seccion: str }
      }

      const aulaA = parseAula(a)
      const aulaB = parseAula(b)

      if (aulaA.grado !== aulaB.grado) {
        return aulaA.grado - aulaB.grado
      }
      return aulaA.seccion.localeCompare(aulaB.seccion)
    })
    .forEach(key => {
      const grupo = grupos[key]
      if (grupo) {
        // Ordenar dentro del grupo por módulo formativo y año lectivo
        sorted[key] = grupo.sort((a, b) => {
          const materiaCompare = (a.materia?.nombre || '').localeCompare(b.materia?.nombre || '')
          if (materiaCompare !== 0) return materiaCompare

          return (b.anioLectivo?.nombre || '').localeCompare(a.anioLectivo?.nombre || '') // Año más reciente primero
        })
      }
    })

  return sorted
})

const aulasDisponiblesParaDuplicacion = computed(() => {
  if (!asignacionADuplicar.value) return aulas.value

  return aulas.value.filter(aula =>
    aula.id !== asignacionADuplicar.value?.aula_id
  )
})


// Métodos
const editarAsignacion = (asignacion: Asignacion) => {
  asignacionAEditar.value = asignacion
  datosEdicion.value = {
    id: asignacion.id,
    materia_id: asignacion.materia_id.toString(),
    aula_id: asignacion.aula_id.toString(),
    anio_lectivo_id: asignacion.anio_lectivo_id,
    horas_semanales: asignacion.horas_semanales || 1,
    cantidad_ra: asignacion.cantidad_ra || null,
    activo: asignacion.activo
  }
  mostrarModalEditarAsignacion.value = true
}

const duplicarAsignacion = (asignacion: Asignacion) => {
  asignacionADuplicar.value = asignacion

  opcionesDuplicacion.value.anio_lectivo_id = asignacion.anio_lectivo_id
  opcionesDuplicacion.value.horas_semanales = asignacion.horas_semanales || 1
  opcionesDuplicacion.value.aulas_ids = []
  mostrarModalDuplicar.value = true
}

const crearNuevaAsignacion = async () => {
  try {
    procesandoAccion.value = true

    const payload = {
      ...nuevaAsignacion.value,
      profesor_id: profesorId.value,
      materia_id: Number(nuevaAsignacion.value.materia_id),
      aula_id: Number(nuevaAsignacion.value.aula_id),
      anio_lectivo_id: nuevaAsignacion.value.anio_lectivo_id!
    }

    await api.post('/api/class-assignments', payload)

    // Recargar datos y cerrar modal
    await cargarDatos()
    mostrarModalNuevaAsignacion.value = false
    resetearFormulario()

  } catch (err: any) {
    console.error('Error al crear asignación:', err)
    alert('Error al crear la asignación: ' + (err.data?.message || err.message))
  } finally {
    procesandoAccion.value = false
  }
}

const ejecutarDuplicacion = async () => {
  if (!asignacionADuplicar.value || opcionesDuplicacion.value.aulas_ids.length === 0) {
    alert('Selecciona al menos un aula para duplicar')
    return
  }

  try {
    procesandoAccion.value = true

    // Crear una asignación para cada aula seleccionada
    const promesas = opcionesDuplicacion.value.aulas_ids.map(aulaId => {
      const payload = {
        materia_id: asignacionADuplicar.value!.materia_id,
        profesor_id: profesorId.value,
        aula_id: aulaId,

        anio_lectivo_id: opcionesDuplicacion.value.anio_lectivo_id!,
        horas_semanales: opcionesDuplicacion.value.horas_semanales,
        activo: true
      }

      return api.post('/api/class-assignments', payload)
    })

    await Promise.all(promesas)

    // Recargar datos y cerrar modal
    await cargarDatos()
    mostrarModalDuplicar.value = false
    asignacionADuplicar.value = null

  } catch (err: any) {
    console.error('Error al duplicar asignaciones:', err)
    alert('Error al duplicar las asignaciones: ' + (err.data?.message || err.message))
  } finally {
    procesandoAccion.value = false
  }
}

const actualizarAsignacion = async () => {
  if (!asignacionAEditar.value) return

  try {
    procesandoAccion.value = true

    const payload = {
      materia_id: Number(datosEdicion.value.materia_id),
      aula_id: Number(datosEdicion.value.aula_id),
      anio_lectivo_id: datosEdicion.value.anio_lectivo_id!,
      horas_semanales: datosEdicion.value.horas_semanales,
      cantidad_ra: datosEdicion.value.cantidad_ra,
      activo: datosEdicion.value.activo
    }

    await api.put(`/api/class-assignments/${asignacionAEditar.value.id}`, payload)

    // Recargar datos y cerrar modal
    await cargarDatos()
    mostrarModalEditarAsignacion.value = false
    asignacionAEditar.value = null

  } catch (err: any) {
    console.error('Error al actualizar asignación:', err)
    alert('Error al actualizar la asignación: ' + (err.data?.message || err.message))
  } finally {
    procesandoAccion.value = false
  }
}

const resetearFormulario = () => {
  nuevaAsignacion.value = {
    materia_id: '',
    aula_id: '',
    anio_lectivo_id: aniosStore.items.length > 0 ? aniosStore.items[0]?.id : undefined,
    horas_semanales: 1,
    cantidad_ra: null,
    activo: true
  }
}

const cargarDatos = async () => {
  try {
    loading.value = true
    error.value = null

    // Cargar datos del profesor
    const profesorResponse = await api.get(`/api/personal/${profesorId.value}`)

    if ((profesorResponse as any).success) {
      profesor.value = (profesorResponse as any).data
    }

    // Cargar asignaciones del profesor
    const asignacionesResponse = await api.get(`/api/class-assignments`, {
      params: {
        profesor_id: profesorId.value,
        per_page: 100
      }
    })

    if ((asignacionesResponse as any).data) {
      asignaciones.value = (asignacionesResponse as any).data
    }

    // Cargar módulos formativos y aulas para los formularios
    const [modulosResponse, aulasResponse] = await Promise.all([
      api.get('/api/modulos-formativos', {
        params: { per_page: 1000, only_active: true }
      }),
      api.get('/api/aulas', {
        params: { per_page: 1000 }
      })
    ])

    // Los módulos vienen en formato paginado
    if ((modulosResponse as any).data) {
      modulosFormativos.value = (modulosResponse as any).data
    }

    // Las aulas vienen directamente en la respuesta, no en un campo 'data'
    if (Array.isArray(aulasResponse)) {
      aulas.value = aulasResponse as Aula[]
    }

  } catch (err: any) {
    console.error('Error al cargar datos:', err)
    error.value = err.message || 'Error al cargar los datos del profesor'
  } finally {
    loading.value = false
  }
}

const cargarAnios = async () => {
  if (aniosStore.items.length === 0) await aniosStore.fetchAll({ activo: true })
  if (aniosStore.items.length > 0 && !nuevaAsignacion.value.anio_lectivo_id) {
    nuevaAsignacion.value.anio_lectivo_id = aniosStore.items[0]?.id
  }
}

// Lifecycle
onMounted(() => {
  cargarAnios()
  cargarDatos()
})

// Meta - título dinámico
watch(profesor, (newProfesor) => {
  if (newProfesor) {
    const nombreCompleto = newProfesor.nombre_completo || `${newProfesor.nombre} ${newProfesor.apellido}`
    useHead({
      title: `Asignaciones de ${nombreCompleto} - EscoSoft`
    })
  }
}, { immediate: true })

// Título inicial
useHead({
  title: 'Asignaciones de Profesor - EscoSoft'
})
</script>