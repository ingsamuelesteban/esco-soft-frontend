<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Evaluación de Desempeño</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestión de listas de observación docente por clase y período.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="imprimirReporte" :disabled="loadingReport"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
          <svg v-if="loadingReport" class="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" viewBox="0 0 24 24"></svg>
          <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Reporte
        </button>
        <button @click="openModal"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Lista
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="listas.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">No hay listas creadas</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Haz clic en <strong>Crear Lista</strong> para programar una evaluación de desempeño.
      </p>
    </div>

    <!-- Tabla de listas -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto tabla-scroll">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profesor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sección</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Período</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evaluado</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan. Digital</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan. Física</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eval. Planif.</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Obs. Clase</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Observaciones</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="lista in listas" :key="lista.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              <span v-if="lista.fecha">{{ formatDate(lista.fecha) }}</span>
              <span v-else class="text-gray-400 italic">Sin fecha</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-semibold">{{ lista.profesor_nombre?.charAt(0) }}</div>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ lista.profesor_nombre }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ lista.seccion_label }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ lista.periodo_label }}</td>
            <!-- Evaluado -->
            <td class="px-6 py-4 text-center">
              <span v-if="lista.fue_evaluado === null" class="text-gray-300 dark:text-gray-600 text-lg">—</span>
              <span v-else-if="lista.fue_evaluado" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40">
                <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40">
                <svg class="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
            </td>
            <!-- Plan. Digital -->
            <td class="px-6 py-4 text-center">
              <span v-if="lista.cargo_digital === null" class="text-gray-300 dark:text-gray-600 text-lg">—</span>
              <span v-else-if="lista.cargo_digital" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40">
                <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40">
                <svg class="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
            </td>
            <!-- Plan. Física -->
            <td class="px-6 py-4 text-center">
              <span v-if="lista.entrego_fisica === null" class="text-gray-300 dark:text-gray-600 text-lg">—</span>
              <span v-else-if="lista.entrego_fisica" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40">
                <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40">
                <svg class="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
            </td>
            <!-- Eval. Planificación -->
            <td class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
              <span v-if="lista.evaluacion_planificacion == null" class="text-gray-300 dark:text-gray-600">—</span>
              <span v-else>{{ lista.evaluacion_planificacion }}</span>
            </td>
            <!-- Obs. Clase -->
            <td class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
              <span v-if="lista.observacion_clase == null" class="text-gray-300 dark:text-gray-600">—</span>
              <span v-else>{{ lista.observacion_clase }}</span>
            </td>
            <!-- Total -->
            <td class="px-6 py-4 text-center">
              <span v-if="lista.total_evaluacion != null" class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">{{ lista.total_evaluacion }}</span>
              <span v-else class="text-gray-300 dark:text-gray-600">—</span>
            </td>
            <!-- Observaciones -->
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" :title="lista.observaciones || ''">
              {{ lista.observaciones || '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <div class="flex items-center justify-end gap-3">
                <button @click="openEdit(lista)" class="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 font-medium transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Editar
                </button>
                <button @click="eliminarLista(lista)" class="inline-flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Crear Lista -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-indigo-500">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-white">Crear Lista de Evaluación</h2>
              </div>
              <button @click="closeModal" class="text-white/70 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-6 space-y-5">

              <!-- Fecha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Fecha
                  </span>
                </label>
                <input v-model="form.fecha" type="date"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>

              <!-- Profesor -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profesor
                  </span>
                </label>
                <div v-if="personalStore.loading" class="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <div class="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  Cargando profesores...
                </div>
                <select v-else v-model="form.personal_id"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option :value="null">Seleccionar profesor...</option>
                  <option v-for="p in personalStore.items" :key="p.id" :value="p.id">
                    {{ p.nombre }} {{ p.apellido }}
                  </option>
                </select>
              </div>

              <!-- Sección (Aula) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Sección (Aula) <span class="text-gray-400 font-normal ml-1">(Opcional)</span>
                  </span>
                </label>
                <div v-if="aulasStore.loading" class="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <div class="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  Cargando aulas...
                </div>
                <select v-else v-model="form.aula_id"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option :value="null">Seleccionar sección...</option>
                  <option v-for="aula in aulasStore.activas" :key="aula.id" :value="aula.id">
                    {{ aula.grado_cardinal }}° {{ aula.seccion }}
                  </option>
                </select>
              </div>

              <!-- Período / Hora -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Período / Hora <span class="text-gray-400 font-normal ml-1">(Opcional)</span>
                  </span>
                </label>
                <div v-if="periodsStore.loading" class="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <div class="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  Cargando períodos...
                </div>
                <select v-else v-model="form.period_id"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option :value="null">Seleccionar período...</option>
                  <option v-for="p in periodsStore.clases" :key="p.id" :value="p.id">
                    {{ p.label }} — {{ p.start_time.slice(0, 5) }} a {{ p.end_time.slice(0, 5) }}
                  </option>
                </select>
              </div>

              <!-- Evaluación Planificación + Observación Clase -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Eval. Planificación <span class="text-gray-400 font-normal">(Opcional)</span></label>
                  <input v-model.number="form.evaluacion_planificacion" type="number" min="0"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Observación de Clase <span class="text-gray-400 font-normal">(Opcional)</span></label>
                  <input v-model.number="form.observacion_clase" type="number" min="0"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
              </div>

              <!-- Observaciones -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Observaciones (Opcional)
                  </span>
                </label>
                <textarea v-model="form.observaciones" rows="3"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button @click="closeModal"
                class="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button @click="guardarLista" :disabled="!formValido || saving"
                class="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                <div v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {{ saving ? 'Guardando...' : 'Crear Lista' }}
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Modal: Editar Evaluación -->
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-600 to-violet-500">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-white">Editar Evaluación</h2>
                <p class="text-violet-200 text-xs mt-0.5">{{ editTarget?.seccion_label }} - {{ editTarget?.periodo_label }}</p>
              </div>
            </div>
            <button @click="showEditModal = false" class="text-white/70 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 space-y-4">
            <!-- Datos Generales -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                <input v-model="editForm.fecha" type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Profesor</label>
                <select v-model="editForm.personal_id"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="p in personalStore.items" :key="p.id" :value="p.id">
                    {{ p.nombre }} {{ p.apellido }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sección (Aula) - <span class="font-normal text-gray-400">Opcional</span></label>
                <select v-model="editForm.aula_id"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="aula in aulasStore.activas" :key="aula.id" :value="aula.id">
                    {{ aula.grado_cardinal }}° {{ aula.seccion }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Período - <span class="font-normal text-gray-400">Opcional</span></label>
                <select v-model="editForm.period_id"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="p in periodsStore.clases" :key="p.id" :value="p.id">
                    {{ p.label }} — {{ p.start_time.slice(0, 5) }} a {{ p.end_time.slice(0, 5) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Pregunta 1 -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-200">¿Fue evaluado?</span>
              <div class="flex gap-2">
                <button @click="editForm.fue_evaluado = true"
                  :class="editForm.fue_evaluado === true ? 'bg-green-600 text-white ring-2 ring-green-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">Sí</button>
                <button @click="editForm.fue_evaluado = false"
                  :class="editForm.fue_evaluado === false ? 'bg-red-600 text-white ring-2 ring-red-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">No</button>
              </div>
            </div>
            <!-- Pregunta 2 -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-200">¿Cargó planificación a la plataforma?</span>
              <div class="flex gap-2">
                <button @click="editForm.cargo_digital = true"
                  :class="editForm.cargo_digital === true ? 'bg-green-600 text-white ring-2 ring-green-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">Sí</button>
                <button @click="editForm.cargo_digital = false"
                  :class="editForm.cargo_digital === false ? 'bg-red-600 text-white ring-2 ring-red-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">No</button>
              </div>
            </div>
            <!-- Pregunta 3 -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-200">¿Entregó planificación física?</span>
              <div class="flex gap-2">
                <button @click="editForm.entrego_fisica = true"
                  :class="editForm.entrego_fisica === true ? 'bg-green-600 text-white ring-2 ring-green-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">Sí</button>
                <button @click="editForm.entrego_fisica = false"
                  :class="editForm.entrego_fisica === false ? 'bg-red-600 text-white ring-2 ring-red-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'"
                  class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">No</button>
              </div>
            </div>

            <!-- Eval. Planificación + Obs. Clase -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Eval. Planificación</label>
                <input v-model.number="editForm.evaluacion_planificacion" type="number" min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Observación de Clase</label>
                <input v-model.number="editForm.observacion_clase" type="number" min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
              </div>
            </div>

            <!-- Observaciones -->
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Observaciones</label>
              <textarea v-model="editForm.observaciones" rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button @click="showEditModal = false" class="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
            <button @click="guardarEvaluacion" class="px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all">Guardar</button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAulasStore } from '~/stores/aulas'
import { usePersonalStore } from '~/stores/personal'
import { usePeriodsStore } from '~/stores/periods'
import { usePrint } from '~/composables/usePrint'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'

const { printPdfBlob } = usePrint()
const loadingReport = ref(false)

definePageMeta({
  middleware: ['auth', 'role']
})

const aulasStore = useAulasStore()
const personalStore = usePersonalStore()
const periodsStore = usePeriodsStore()

// ── Estado ────────────────────────────────────────────────────
const showModal = ref(false)
const saving = ref(false)

interface ListaItem {
  id: number
  fecha: string
  personal_id: number | null
  profesor_nombre: string
  aula_id: number | null
  seccion_label: string
  period_id: number | null
  periodo_label: string
  fue_evaluado: boolean | null
  cargo_digital: boolean | null
  entrego_fisica: boolean | null
  observaciones: string | null
  evaluacion_planificacion: number | null
  observacion_clase: number | null
  total_evaluacion: number | null
}

// Datos principales — declarados antes de los helpers que los usan
const listas = ref<ListaItem[]>([])

const form = reactive({
  fecha: new Date().toLocaleDateString('en-CA'),
  personal_id: null as number | null,
  aula_id: null as number | null,
  period_id: null as number | null,
  observaciones: '',
  evaluacion_planificacion: null as number | null,
  observacion_clase: null as number | null,
})

// ── Computed ──────────────────────────────────────────────────
const formValido = computed(() =>
  !!form.personal_id
)

// ── Modal Editar ──────────────────────────────────────────────
const showEditModal = ref(false)
const editTarget = ref<ListaItem | null>(null)
const editForm = reactive({
  fecha: '',
  personal_id: null as number | null,
  aula_id: null as number | null,
  period_id: null as number | null,
  fue_evaluado: null as boolean | null,
  cargo_digital: null as boolean | null,
  entrego_fisica: null as boolean | null,
  observaciones: '',
  evaluacion_planificacion: null as number | null,
  observacion_clase: null as number | null,
})

function openEdit(lista: ListaItem) {
  editTarget.value = lista
  editForm.fecha = lista.fecha || ''
  editForm.personal_id = lista.personal_id
  editForm.aula_id = lista.aula_id
  editForm.period_id = lista.period_id
  editForm.fue_evaluado = lista.fue_evaluado
  editForm.cargo_digital = lista.cargo_digital
  editForm.entrego_fisica = lista.entrego_fisica
  editForm.observaciones = lista.observaciones || ''
  editForm.evaluacion_planificacion = lista.evaluacion_planificacion ?? null
  editForm.observacion_clase = lista.observacion_clase ?? null
  showEditModal.value = true
}

function guardarEvaluacion() {
  if (!editTarget.value) return
  const payload = {
    fecha:          editForm.fecha,
    personal_id:    editForm.personal_id,
    aula_id:        editForm.aula_id,
    period_id:      editForm.period_id,
    fue_evaluado:              editForm.fue_evaluado,
    cargo_digital:             editForm.cargo_digital,
    entrego_fisica:            editForm.entrego_fisica,
    observaciones:             editForm.observaciones,
    evaluacion_planificacion:  editForm.evaluacion_planificacion,
    observacion_clase:         editForm.observacion_clase,
  }
  api.put(`/api/performance-evaluations/${editTarget.value.id}`, payload)
    .then((res: any) => {
      const updated = res.data ?? res
      const item = listas.value.find(l => l.id === editTarget.value!.id)
      if (item) {
        item.fecha          = updated.fecha
        item.personal_id    = updated.personal_id
        item.profesor_nombre = updated.profesor_nombre
        item.aula_id        = updated.aula_id
        item.seccion_label  = updated.seccion_label
        item.period_id      = updated.period_id
        item.periodo_label  = updated.periodo_label
        item.fue_evaluado   = updated.fue_evaluado
        item.cargo_digital  = updated.cargo_digital
        item.entrego_fisica = updated.entrego_fisica
        item.observaciones  = updated.observaciones
        item.evaluacion_planificacion = updated.evaluacion_planificacion
        item.observacion_clase        = updated.observacion_clase
        item.total_evaluacion         = updated.total_evaluacion
      }
      showEditModal.value = false
    })
    .catch((e: any) => console.error('Error guardando evaluación:', e))
}

async function eliminarLista(lista: ListaItem) {
  const result = await Swal.fire({
    title: '¿Eliminar evaluación?',
    text: `Se eliminará la evaluación de ${lista.profesor_nombre}. Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (!result.isConfirmed) return

  try {
    await api.delete(`/api/performance-evaluations/${lista.id}`)
    listas.value = listas.value.filter(l => l.id !== lista.id)
    Swal.fire({ icon: 'success', title: 'Eliminada', text: 'La evaluación fue eliminada correctamente.', timer: 2000, showConfirmButton: false })
  } catch (e: any) {
    console.error('Error eliminando evaluación:', e)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la evaluación.' })
  }
}

// ── Métodos ───────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-DO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

function openModal() {
  form.fecha = new Date().toLocaleDateString('en-CA')
  form.personal_id = null
  form.aula_id = null
  form.period_id = null
  form.observaciones = ''
  form.evaluacion_planificacion = null
  form.observacion_clase = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function guardarLista() {
  if (!formValido.value) return
  saving.value = true

  api.post<{ success: boolean; data: ListaItem }>('/api/performance-evaluations', {
    personal_id:              form.personal_id,
    aula_id:                  form.aula_id,
    period_id:                form.period_id,
    fecha:                    form.fecha || null,
    observaciones:            form.observaciones,
    evaluacion_planificacion: form.evaluacion_planificacion,
    observacion_clase:        form.observacion_clase,
  })
    .then((res: any) => {
      // El controlador devuelve { success, message, data: { ...evaluation } }
      const created = res?.data ?? res
      listas.value.unshift(created)
      closeModal()
    })
    .catch((e: any) => {
      console.error('Error creando evaluación:', e?.data ?? e)
    })
    .finally(() => { saving.value = false })
}

async function imprimirReporte() {
  try {
    loadingReport.value = true
    const blob = await api.getBlob('/api/performance-evaluations/pdf')
    printPdfBlob(blob, 'seguimiento_evaluacion_desempeno.pdf', 'Preparando reporte...')
  } catch (e: any) {
    console.error('Error generando reporte:', e)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el reporte PDF.' })
  } finally {
    loadingReport.value = false
  }
}

// ── Carga inicial ───────────────────────────────────────────────
onMounted(async () => {
  // Cargar catálogos en paralelo
  await Promise.all([
    aulasStore.fetchAll(),
    personalStore.fetchTeachers(),
    periodsStore.fetchAll(),
  ])

  // Cargar lista de evaluaciones (independiente para no bloquear si falla)
  try {
    const res = await api.get<{ success: boolean; data: ListaItem[] }>('/api/performance-evaluations')
    // La respuesta viene como { success: true, data: [...] }
    listas.value = (res as any)?.data ?? []
  } catch (e: any) {
    console.error('Error cargando evaluaciones:', e?.data ?? e)
  }
})
</script>

<style scoped>
.tabla-scroll {
  scrollbar-width: thin;
  scrollbar-color: #a5b4fc #f1f5f9;
}
.tabla-scroll::-webkit-scrollbar {
  height: 6px;
}
.tabla-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 0 0 1rem 1rem;
}
.tabla-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #818cf8, #a78bfa);
  border-radius: 9999px;
}
.tabla-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}
/* dark mode */
:global(.dark) .tabla-scroll {
  scrollbar-color: #6366f1 #1f2937;
}
:global(.dark) .tabla-scroll::-webkit-scrollbar-track {
  background: #1f2937;
}
</style>
