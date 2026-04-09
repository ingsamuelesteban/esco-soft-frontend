<template>
  <div class="space-y-6">
    <!-- Bienvenida -->
    <div class="glass-card p-6 rounded-xl flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white">Hola, {{ dashboardData?.student?.nombres }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Estudiante de {{ dashboardData?.student?.aula_grado }} "{{ dashboardData?.student?.aula_seccion }}" <span
            v-if="dashboardData?.student?.numero_orden">| #{{ dashboardData?.student?.numero_orden }}</span> | Año
          Lectivo: {{ dashboardData?.academic_year }}
        </p>
      </div>
      <div class="hidden sm:block">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="dashboardData?.is_preadmitted ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'">
          {{ dashboardData?.is_preadmitted ? 'Estudiante-Preadmitido' : 'Estudiante Activo' }}
        </span>
      </div>
    </div>

    <!-- Announcements Banner -->
    <AnnouncementsBanner />

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div v-else-if="dashboardData?.is_preadmitted" class="space-y-6">
      <!-- Top 2-col: Actividades + documentos checklist -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Actividades de Admisión -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white flex items-center">
            <CalendarIcon class="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
            Mi Calendario de Admisión
          </h3>

          <div v-if="dashboardData.admission_activities?.length === 0" class="glass-card p-6 text-center text-gray-500 dark:text-gray-400">
            No hay actividades programadas para tu número de folder aún.
          </div>

          <div v-else class="space-y-4">
            <div v-for="act in dashboardData.admission_activities" :key="act.id"
              class="glass-card p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-all">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-gray-100 dark:text-white">{{ act.actividad }}</h4>
                  <div class="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span class="flex items-center mr-4">
                      <CalendarIcon class="w-4 h-4 mr-1" />
                      {{ formatDate(act.fecha) }}
                    </span>
                    <span v-if="act.hora" class="flex items-center">
                      <ClockIcon class="w-4 h-4 mr-1" />
                      {{ act.hora }}
                    </span>
                  </div>
                </div>
                <div class="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                  <CalendarIcon class="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
            <div class="flex">
              <InformationCircleIcon class="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 class="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide">Información de
                  Inscripción</h4>
                <p class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  Tu número de folder asignado es el <span class="font-black">#{{ dashboardData.student.no_folder
                  }}</span>.
                  Las actividades mostradas corresponden al proceso de admisión del año <span
                    class="font-bold text-blue-900 dark:text-blue-100">{{ dashboardData.academic_year }}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Documentos Pendientes (checklist) -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
            Documentos Pendientes
          </h3>

          <div class="glass-card p-6 bg-white dark:bg-gray-800">
            <div v-if="dashboardData.pending_documents?.length === 0" class="text-center py-4">
              <div
                class="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                <CheckCircleIcon class="w-8 h-8 text-green-600" />
              </div>
              <p class="text-gray-900 dark:text-gray-100 dark:text-white font-bold">¡Expediente Completo!</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Has entregado todos los documentos requeridos.</p>
            </div>
            <div v-else>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Por favor entrega los siguientes documentos en el departamento de admisiones para completar tu
                inscripción.
                <br><br>
                <span class="font-medium text-blue-700 dark:text-blue-400">
                  Luego de completar el proceso de admisión, se le indicará la fecha en que debe traer estos documentos:
                </span>
              </p>
              <ul class="space-y-3">
                <li v-for="doc in dashboardData.pending_documents" :key="doc"
                  class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <XCircleIcon class="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  {{ doc }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta: Examen Vocacional y Psicológico -->
      <div class="glass-card p-5 rounded-xl"
        :class="dashboardData.examen_admision?.completado
          ? 'border-l-4 border-l-green-500'
          : 'border-l-4 border-l-amber-400'">
        <div class="flex items-start justify-between gap-4">
          <!-- Ícono + texto -->
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 p-3 rounded-lg"
              :class="dashboardData.examen_admision?.completado
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6"
                :class="dashboardData.examen_admision?.completado ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-base">
                Examen Vocacional
              </h3>
              <!-- Completado -->
              <div v-if="dashboardData.examen_admision?.completado" class="mt-1">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-bold text-green-700 dark:text-green-400">Examinado: Sí</span>
                </p>
                <p class="text-[10px] text-gray-400 mt-1">
                  Procesado el {{ dashboardData.examen_admision.completado_en }}
                </p>
              </div>

              <!-- Pendiente -->
              <div v-else class="mt-1">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Aún no se han procesado tus resultados del examen vocacional.<br>
                  <span class="text-amber-700 dark:text-amber-400 font-medium">Si ya lo realizaste, los resultados serán cargados próximamente.</span>
                </p>
              </div>
            </div>
          </div>
          <!-- Badge estado -->
          <span class="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
            :class="dashboardData.examen_admision?.completado
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'">
            {{ dashboardData.examen_admision?.completado ? '✓ Completado' : '⏳ Pendiente' }}
          </span>
        </div>
      </div>


      <div v-if="dashboardData.document_requests?.length > 0" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white flex items-center">
          <ArrowUpTrayIcon class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Documentos Solicitados por Administración
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="req in dashboardData.document_requests" :key="req.id"
            class="glass-card p-5 border-l-4 transition-all"
            :class="{
              'border-l-amber-400': req.status === 'pending',
              'border-l-blue-500': req.status === 'uploaded',
              'border-l-green-500': req.status === 'received',
              'border-l-red-500': req.status === 'rejected',
            }">
            <!-- Title & Status -->
            <div class="flex items-start justify-between mb-3">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 dark:text-white text-sm leading-tight pr-2">{{ req.titulo }}</h4>
              <span class="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="{
                  'bg-amber-100 text-amber-800': req.status === 'pending',
                  'bg-blue-100 text-blue-800': req.status === 'uploaded',
                  'bg-green-100 text-green-800': req.status === 'received',
                  'bg-red-100 text-red-800': req.status === 'rejected',
                }">
                {{ ({ pending: 'Pendiente', uploaded: 'Enviado', received: 'Recibido ✓', rejected: 'Rechazado' } as Record<string,string>)[req.status] }}
              </span>
            </div>

            <p v-if="req.descripcion" class="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {{ req.descripcion }}</p>

            <div v-if="req.status === 'rejected' && req.notes" class="mb-3 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
              <span class="font-bold block mb-1">Motivo del rechazo:</span>
              {{ req.notes }}
            </div>

            <!-- Pending / Rejected: show upload button -->
            <div v-if="req.status === 'pending' || req.status === 'rejected'" class="mt-2">
              <label :for="`file-upload-${req.id}`"
                class="cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg px-3 py-2 transition-colors">
                <ArrowUpTrayIcon class="w-4 h-4" />
                {{ uploadingId === req.id ? 'Subiendo...' : 'Subir Archivo' }}
              </label>
              <input :id="`file-upload-${req.id}`" type="file" class="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                @change="(e) => uploadFile(e, req.id)" />
              <p class="text-[10px] text-gray-400 mt-1 text-center">PDF, imagen o Word (máx. 10 MB)</p>
            </div>

            <!-- Uploaded -->
            <div v-else-if="req.status === 'uploaded'"
              class="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <DocumentTextIcon class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ req.file_name }}</span>
            </div>

            <!-- Received -->
            <div v-else-if="req.status === 'received'"
              class="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircleIcon class="w-4 h-4" />
              Recibido por administración
            </div>
          </div>
        </div>
      </div>
    </div>



    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- Calificaciones (3/5 ancho) -->
      <div class="lg:col-span-3 space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mis Calificaciones
        </h3>

        <div v-if="dashboardData?.is_blocked"
          class="glass-card p-8 text-center flex flex-col items-center justify-center min-h-[400px] border-l-4 border-l-red-500">
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <svg class="w-12 h-12 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Acceso a Calificaciones Restringido</h3>

          <div class="max-w-md mx-auto space-y-3">
            <p class="text-gray-600 dark:text-gray-400">
              Tu visualización de calificaciones ha sido bloqueada temporalmente.
            </p>

            <div v-if="dashboardData.lock_details?.reason"
              class="bg-red-50 dark:bg-red-900/20 rounded p-3 text-sm text-red-700 dark:text-red-300 font-medium">
              Motivo: {{ dashboardData.lock_details.reason }}
            </div>

            <p class="text-sm text-gray-500 dark:text-gray-400 pt-2">
              Por favor contacta al <span class="font-bold text-gray-700 dark:text-gray-300">{{
                dashboardData.lock_details?.contact ||
                'Departamento de Psicología' }}</span> para regularizar tu situación.
            </p>
          </div>
        </div>

        <div v-else class="space-y-6">

          <div v-if="dashboardData?.grades?.length === 0" class="glass-card p-6 text-center text-gray-500 dark:text-gray-400">
            No hay calificaciones registradas aún.
          </div>

          <div v-else class="space-y-6">
            <!-- ... existing grades content ... -->
            <!-- TABLA DE CALIFICACIONES ACADÉMICAS -->
            <div v-if="academicSubjects.length > 0" class="glass-card p-0 overflow-hidden">
              <!-- ... content ... -->
              <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50/50 dark:bg-gray-800/50">
                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Calificaciones
                  Académicas</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-800">
                    <tr>
                      <th scope="col"
                        class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                        Asignatura
                      </th>
                      <th scope="col"
                        class="px-2 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P1
                      </th>
                      <th scope="col"
                        class="px-2 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P2
                      </th>
                      <th scope="col"
                        class="px-2 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P3
                      </th>
                      <th scope="col"
                        class="px-2 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P4
                      </th>
                      <th scope="col"
                        class="px-2 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700">
                        Nota Final
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="subject in academicSubjects" :key="subject.materia_id"
                      class="hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-800">
                      <!-- Subject Name -->
                      <td class="px-4 py-3 whitespace-normal">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white">{{ subject.materia }}</div>
                      </td>

                      <!-- Period Averages PC1-PC4 -->
                      <td v-for="p in 4" :key="p" class="px-2 py-3 text-center">
                        <div v-if="subject.promedios_periodo && subject.promedios_periodo[p]" class="text-sm font-bold"
                          :class="getGradeColor(subject.promedios_periodo[p])">
                          {{ subject.promedios_periodo[p] }}
                        </div>
                        <div v-else class="text-xs text-gray-300 dark:text-gray-600 dark:text-gray-400">-</div>
                      </td>

                      <!-- Final Average -->
                      <td class="px-2 py-3 text-center border-l border-gray-200 dark:border-gray-700">
                        <div v-if="subject.promedio_academico" class="text-sm font-bold"
                          :class="getScoreColor(subject.promedio_academico)">
                          {{ subject.promedio_academico }}
                        </div>
                        <div v-else class="text-xs text-gray-300 dark:text-gray-600 dark:text-gray-400">-</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- MÓDULOS TÉCNICOS (Solo RAs) - Render como Cards -->
            <div v-if="technicalSubjects.length > 0">
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3 pl-1">Módulos
                Técnicos</h3>
              <div class="space-y-4">
                <div v-for="subject in technicalSubjects" :key="subject.materia_id"
                  class="glass-card p-5 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h4 class="font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100 text-lg">{{ subject.materia }}</h4>

                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold" :class="getScoreColor(subject.promedio)">
                        {{ subject.promedio ? subject.promedio.toFixed(0) : '-' }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                  </div>

                  <!-- Detalle de notas (RAs) -->
                  <div v-if="subject.notas_ra && subject.notas_ra.length > 0">
                    <h5 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Resultados de
                      Aprendizaje</h5>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div v-for="raItem in subject.notas_ra" :key="raItem.ra"
                        class="bg-gray-50 dark:bg-gray-900/50 rounded p-2 text-center border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">RA {{ raItem.ra }}</div>
                        <div class="flex flex-wrap justify-center gap-1">
                          <span v-for="intento in raItem.intentos" :key="intento.id"
                            class="text-xs font-bold px-1.5 py-0.5 rounded border"
                            :class="intento.is_nc ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 dark:border-gray-600'">
                            {{ intento.nota }}
                          </span>
                        </div>
                        <div class="text-[10px] text-gray-400 mt-1">/{{ raItem.valor_max }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Horario (2/5 ancho) -->
      <div class="lg:col-span-2 space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Horario de Clases
        </h3>

        <div class="glass-card p-4">
          <!-- Selector de día simple -->
          <div class="flex space-x-1 mb-4 overflow-x-auto pb-2">
            <button v-for="(dayName, index) in days" :key="index" @click="selectedDay = index + 1"
              :class="selectedDay === index + 1 ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-600'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border border-transparent flex-shrink-0">
              {{ dayName }}
            </button>
          </div>

          <div v-if="currentSchedule.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No hay clases programadas para este día.
          </div>

          <div v-else class="space-y-3">
            <div v-for="(clase, idx) in currentSchedule" :key="idx"
              class="flex items-start p-3 rounded-lg border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20">
              <div class="mr-3 text-center min-w-[3.5rem]">
                <div class="text-xs font-bold text-purple-800 dark:text-purple-300">{{
                  formatTime(clase.period.start_time) }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ formatTime(clase.period.end_time) }}</div>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 dark:text-white leading-tight">{{ clase.materia.nombre }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{{ clase.docente.nombres }} {{
                  clase.docente.apellidos }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '../../utils/api'
import AnnouncementsBanner from '~/components/anuncios/AnnouncementsBanner.vue'
import Swal from 'sweetalert2'
import {
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'student',
  middleware: ['auth']
})

const loading = ref(true)
const dashboardData = ref<any>(null)
const selectedDay = ref<number>(new Date().getDay() || 1) // Default to today (or Mon if Sun)
const uploadingId = ref<number | null>(null)

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const currentSchedule = computed(() => {
  if (!dashboardData.value?.schedule) return []
  return dashboardData.value.schedule[selectedDay.value] || []
})

// Computed filter for Academic Subjects (Have Competencies)
const academicSubjects = computed(() => {
  if (!dashboardData.value?.grades) return []
  return dashboardData.value.grades.filter((s: any) => s.notas_competencia && s.notas_competencia.length > 0)
})

// Computed filter for Technical Subjects (Have RAs)
const technicalSubjects = computed(() => {
  if (!dashboardData.value?.grades) return []
  return dashboardData.value.grades.filter((s: any) => s.notas_ra && s.notas_ra.length > 0)
})



const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-400 dark:text-gray-500 dark:text-gray-400'
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 80) return 'text-blue-600 dark:text-blue-400'
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getGradeColor = (score: number | null) => {
  if (score === null) return 'text-gray-300 dark:text-gray-600 dark:text-gray-400'
  if (score < 70) return 'text-red-600 dark:text-red-400'
  return 'text-gray-900 dark:text-gray-100 dark:text-white'
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long'
  })
}

const formatTime = (time: string) => {
  return time.substring(0, 5)
}

const uploadFile = async (event: Event, uploadId: number) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  if (file.size > 10 * 1024 * 1024) {
    return Swal.fire('Archivo muy grande', 'El archivo no puede superar los 10 MB.', 'warning')
  }
  uploadingId.value = uploadId
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/api/student/solicitudes-documentos/${uploadId}/upload`, formData)
    if (res.success) {
      // Update local state reactively
      const req = dashboardData.value?.document_requests?.find((r: any) => r.id === uploadId)
      if (req) {
        req.status = 'uploaded'
        req.file_name = file.name
      }
      Swal.fire({ icon: 'success', title: 'Archivo enviado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    }
  } catch (e: any) {
    Swal.fire('Error', e?.message || 'No se pudo subir el archivo.', 'error')
  } finally {
    uploadingId.value = null
    input.value = '' // reset input
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/api/student/dashboard')
    dashboardData.value = response.data
  } catch (e) {
    console.error("Dashboard error:", e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.glass-card {
  @apply bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300;
}
</style>
