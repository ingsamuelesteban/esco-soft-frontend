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
      <button @click="openModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear Lista
      </button>
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
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="lista in listas" :key="lista.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ formatDate(lista.fecha) }}</td>
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
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <button @click="openEdit(lista)" class="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Editar
              </button>
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
                    Sección (Aula)
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
                    Período / Hora
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
                <h2 class="text-base font-bold text-white">Registrar Evaluación</h2>
                <p class="text-violet-200 text-xs mt-0.5">{{ editTarget?.profesor_nombre }}</p>
              </div>
            </div>
            <button @click="showEditModal = false" class="text-white/70 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 space-y-4">
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
}

// Edit modal
const showEditModal = ref(false)
const editTarget = ref<ListaItem | null>(null)
const editForm = reactive({ fue_evaluado: null as boolean | null, cargo_digital: null as boolean | null, entrego_fisica: null as boolean | null })

function openEdit(lista: ListaItem) {
  editTarget.value = lista
  editForm.fue_evaluado = lista.fue_evaluado
  editForm.cargo_digital = lista.cargo_digital
  editForm.entrego_fisica = lista.entrego_fisica
  showEditModal.value = true
}

function guardarEvaluacion() {
  if (!editTarget.value) return
  const idx = listas.value.findIndex(l => l.id === editTarget.value!.id)
  if (idx !== -1) {
    listas.value[idx].fue_evaluado = editForm.fue_evaluado
    listas.value[idx].cargo_digital = editForm.cargo_digital
    listas.value[idx].entrego_fisica = editForm.entrego_fisica
  }
  showEditModal.value = false
}

const listas = ref<ListaItem[]>([])

const form = reactive({
  fecha: new Date().toLocaleDateString('en-CA'),
  personal_id: null as number | null,
  aula_id: null as number | null,
  period_id: null as number | null,
})

// ── Computed ──────────────────────────────────────────────────
const formValido = computed(() =>
  form.fecha && form.personal_id && form.aula_id && form.period_id
)

// ── Métodos ───────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-DO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

function openModal() {
  form.fecha = new Date().toLocaleDateString('en-CA')
  form.personal_id = null
  form.aula_id = null
  form.period_id = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function guardarLista() {
  if (!formValido.value) return
  saving.value = true

  // Resolver etiquetas para la tabla
  const profesor = personalStore.items.find(p => p.id === form.personal_id)
  const aula = aulasStore.items.find(a => a.id === form.aula_id)
  const period = periodsStore.items.find(p => p.id === form.period_id)

  setTimeout(() => {
    listas.value.push({
      id: Date.now(),
      fecha: form.fecha,
      personal_id: form.personal_id,
      profesor_nombre: profesor ? `${profesor.nombre} ${profesor.apellido}` : '—',
      aula_id: form.aula_id,
      seccion_label: aula ? `${aula.grado_cardinal}° ${aula.seccion}` : '—',
      period_id: form.period_id,
      periodo_label: period ? `${period.label} (${period.start_time.slice(0, 5)})` : '—',
      fue_evaluado: null,
      cargo_digital: null,
      entrego_fisica: null,
    })
    saving.value = false
    closeModal()
  }, 600)
}

// ── Carga inicial ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    aulasStore.fetchAll(),
    personalStore.fetchTeachers(),
    periodsStore.fetchAll(),
  ])
})
</script>
