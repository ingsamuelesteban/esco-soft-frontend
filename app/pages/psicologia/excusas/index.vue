<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 font-outfit">Excusas de Asistencia</h1>
                <p class="text-gray-500 text-sm mt-1">Gestión de ausencias justificadas y licencias médicas</p>
            </div>
            <div class="flex items-center space-x-3">
                <select v-model="selectedAnioId" v-if="aniosStore.items.length > 0"
                    class="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm">
                    <option :value="'all'">Todos los años</option>
                    <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
                        {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                    </option>
                </select>

                <button @click="openModal()"
                    class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-lg shadow-primary-500/30">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Excusa
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
            <div class="w-full sm:w-64">
                <label class="block text-xs font-medium text-gray-700 mb-1">Buscar Estudiante</label>
                <div class="relative">
                    <input v-model="filters.search" type="text" placeholder="Nombre o matrícula..."
                        @input="debouncedFetch"
                        class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500">
                    <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div class="w-full sm:w-64">
                <label class="block text-xs font-medium text-gray-700 mb-1">Aula</label>
                <select v-model="filters.aula_id" @change="fetchExcuses"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Todas las aulas</option>
                    <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                        {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.nivel }}
                    </option>
                </select>
            </div>

            <div class="flex items-end">
                <label class="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" v-model="filters.active_only" @change="fetchExcuses"
                        class="rounded text-primary-600 focus:ring-primary-500 border-gray-300">
                    <span>Solo vigentes hoy</span>
                </label>
            </div>
        </div>

        <!-- Excuses List -->
        <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="mt-4 text-gray-500">Cargando excusas...</p>
        </div>

        <div v-else-if="excuses.length === 0"
            class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div class="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay excusas registradas</h3>
            <p class="mt-1 text-sm text-gray-500">Comienza registrando una nueva excusa.</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fechas</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Concepto</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Archivo</th>
                            <th scope="col"
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="excuse in excuses" :key="excuse.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 flex-shrink-0">
                                        <span
                                            class="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                                            {{ getInitials(excuse.estudiante) }}
                                        </span>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ excuse.estudiante ? (excuse.estudiante.nombres + ' ' +
                                                excuse.estudiante.apellidos) : 'Estudiante Desconocido' }}
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            {{ excuse.estudiante && excuse.estudiante.aula ?
                                                `${excuse.estudiante.aula.grado_cardinal}°
                                            ${excuse.estudiante.aula.seccion}` : 'Sin Aula' }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">
                                    <span class="font-medium">Desde:</span> {{ formatDate(excuse.start_date) }}
                                </div>
                                <div class="text-sm text-gray-500">
                                    <span class="font-medium">Hasta:</span> &nbsp;{{ formatDate(excuse.end_date) }}
                                </div>
                                <span v-if="excuse.cancelled_at"
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                    Cancelada
                                </span>
                                <span v-else-if="isActive(excuse)"
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    Vigente
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-900 line-clamp-2" :title="excuse.concept">
                                    {{ excuse.concept }}
                                </div>
                                <div v-if="excuse.cancelled_at" class="mt-1 text-xs text-red-600">
                                    <strong>Cancelación:</strong> {{ excuse.cancellation_reason }}
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    Reg. por: {{ excuse.user ? excuse.user.name : 'Desconocido' }}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button v-if="excuse.file_path" @click="printFile(excuse.file_path)"
                                    class="text-primary-600 hover:text-primary-900 flex items-center text-sm font-medium focus:outline-none">
                                    <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Ver Adjunto
                                </button>
                                <span v-else class="text-xs text-gray-400 italic">Sin adjunto</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button @click="openDetailModal(excuse)"
                                    class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors mr-2">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button v-if="!excuse.cancelled_at" @click="cancelExcuse(excuse)"
                                    title="Finalizar/Cancelar Excusa"
                                    class="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-2 rounded-full transition-colors">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                                <span v-else class="text-xs text-gray-500 italic">Cancelada</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="lastPage > 1" class="px-6 py-4 border-t border-gray-200 flex justify-center">
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button @click="changePage(page - 1)" :disabled="page === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <span class="sr-only">Anterior</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                    <span
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Página {{ page }} de {{ lastPage }}
                    </span>
                    <button @click="changePage(page + 1)" :disabled="page === lastPage"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <span class="sr-only">Siguiente</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </nav>
            </div>
        </div>

        <!-- Modal de Detalle -->
        <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="detail-modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="closeDetailModal"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div
                    class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="detail-modal-title">Detalles
                                    de la Excusa</h3>
                                <div class="mt-4 border-t border-gray-100 pt-4">
                                    <div class="grid grid-cols-1 gap-y-4">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Estudiante</dt>
                                            <dd class="mt-1 text-sm text-gray-900 font-semibold">{{
                                                selectedExcuse?.estudiante?.nombres }} {{
                                                    selectedExcuse?.estudiante?.apellidos }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Periodo</dt>
                                            <dd class="mt-1 text-sm text-gray-900">Desde {{
                                                formatDate(selectedExcuse?.start_date) }} hasta {{
                                                    formatDate(selectedExcuse?.end_date) }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Concepto/Motivo</dt>
                                            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{
                                                selectedExcuse?.concept }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Registrado por</dt>
                                            <dd class="mt-1 text-sm text-gray-900">{{ selectedExcuse?.user?.name ||
                                                'Desconocido' }}</dd>
                                        </div>
                                        <div v-if="selectedExcuse?.cancelled_at">
                                            <dt class="text-sm font-medium text-red-500">Cancelada/Finalizada</dt>
                                            <dd class="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                {{ selectedExcuse.cancellation_reason }}<br>
                                                <span class="text-gray-400">{{ formatDate(selectedExcuse.cancelled_at)
                                                }}</span>
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" @click="closeDetailModal"
                            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>


        <!-- Create Modal -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                    enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel
                                class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">

                                <DialogTitle as="h3" class="text-lg font-bold leading-6 text-gray-900 mb-4 font-outfit">
                                    Registrar Nueva Excusa
                                </DialogTitle>

                                <form @submit.prevent="submitForm" class="space-y-4">
                                    <!-- Student Search -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Estudiante
                                            *</label>
                                        <div class="relative">
                                            <input type="text" v-model="studentSearch" @input="searchStudents"
                                                placeholder="Escribe el nombre del estudiante..."
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                :class="{ 'border-red-300': errors.student_id }">

                                            <!-- Suggestion Dropdown -->
                                            <div v-if="studentResults.length > 0"
                                                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                <ul>
                                                    <li v-for="student in studentResults" :key="student.id"
                                                        @click="selectStudent(student)"
                                                        class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                                        <span class="font-bold">{{ student.nombres }} {{
                                                            student.apellidos }}</span>
                                                        <span class="text-xs text-gray-500 ml-2" v-if="student.aula">
                                                            ({{ student.aula.grado_cardinal }}° {{ student.aula.seccion
                                                            }})
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <p v-if="selectedStudent"
                                            class="mt-2 text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block">
                                            Seleccionado: <strong>{{ selectedStudent.nombres }} {{
                                                selectedStudent.apellidos }}</strong>
                                        </p>
                                        <p v-if="errors.student_id" class="text-red-500 text-xs mt-1">{{
                                            errors.student_id }}</p>
                                    </div>

                                    <!-- Dates -->
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio
                                                *</label>
                                            <input type="date" v-model="form.start_date"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                :class="{ 'border-red-300': errors.start_date }">
                                            <p v-if="errors.start_date" class="text-red-500 text-xs mt-1">{{
                                                errors.start_date }}</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin
                                                *</label>
                                            <input type="date" v-model="form.end_date"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                :class="{ 'border-red-300': errors.end_date }">
                                            <p v-if="errors.end_date" class="text-red-500 text-xs mt-1">{{
                                                errors.end_date }}</p>
                                        </div>
                                    </div>

                                    <!-- Concept -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Concepto / Motivo
                                            *</label>
                                        <textarea v-model="form.concept" rows="3" maxlength="1000"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Describe el motivo de la excusa (ej. Licencia Médica)..."
                                            :class="{ 'border-red-300': errors.concept }"></textarea>
                                        <div class="flex justify-end mt-1">
                                            <span class="text-xs text-gray-400">{{ form.concept.length }}/1000</span>
                                        </div>
                                        <p v-if="errors.concept" class="text-red-500 text-xs mt-1">{{ errors.concept }}
                                        </p>
                                    </div>

                                    <!-- File -->
                                    <div>
                                        <DropZone v-model="form.file" label="Archivo Adjunto (Opcional)"
                                            accept=".pdf,.jpg,.jpeg,.png" :max-size="10 * 1024 * 1024" />
                                        <p class="text-xs text-gray-500 mt-1">Formatos: PDF, JPEG, PNG. Max: 10MB.</p>
                                        <p v-if="errors.file" class="text-red-500 text-xs mt-1">{{ errors.file }}</p>
                                    </div>


                                    <!-- Footer Actions -->
                                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button"
                                            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            @click="closeModal">
                                            Cancelar
                                        </button>
                                        <button type="submit" :disabled="submitting"
                                            class="px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center">
                                            <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            {{ submitting ? 'Guardando...' : 'Guardar Excusa' }}
                                        </button>
                                    </div>
                                </form>

                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>


    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import DropZone from '~/components/ui/DropZone.vue'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { usePrint } from '~/composables/usePrint'
import { useAniosLectivosStore } from '~/stores/anios_lectivos'

const config = useRuntimeConfig()
const { $api } = useNuxtApp()

// State
const aniosStore = useAniosLectivosStore()
const selectedAnioId = ref(undefined)
const excuses = ref([])
const aulas = ref([])
const loading = ref(false)
const { printFile } = usePrint()
const page = ref(1)
const lastPage = ref(1)

const filters = reactive({
    search: '',
    aula_id: '',
    active_only: false
})

const isOpen = ref(false)
const submitting = ref(false)
const studentSearch = ref('')
const studentResults = ref([])
const selectedStudent = ref(null)

const form = reactive({
    student_id: '',
    start_date: '',
    end_date: '',
    concept: '',
    file: null
})

const errors = reactive({})

// Setup
onMounted(async () => {
    await fetchAulas()
    await aniosStore.fetchAll()

    // Set default active year
    if (aniosStore.activos.length > 0) {
        selectedAnioId.value = aniosStore.activos[0]?.id
    } else if (aniosStore.items.length > 0) {
        selectedAnioId.value = aniosStore.items[0]?.id
    }

    await fetchExcuses()
})

watch(selectedAnioId, () => {
    fetchExcuses()
})

// Validation
const validate = () => {
    Object.keys(errors).forEach(key => errors[key] = '')
    let isValid = true

    if (!form.student_id) { errors.student_id = 'Debes seleccionar un estudiante'; isValid = false; }
    if (!form.start_date) { errors.start_date = 'Fecha inicio requerida'; isValid = false; }
    if (!form.end_date) { errors.end_date = 'Fecha fin requerida'; isValid = false; }
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
        errors.end_date = 'Fecha fin debe ser posterior a inicio'; isValid = false;
    }
    if (!form.concept) { errors.concept = 'El concepto es requerido'; isValid = false; }

    return isValid
}


// Actions
const fetchAulas = async () => {
    try {
        const res = await $api.get('/api/aulas')
        aulas.value = res || []
    } catch (e) {
        console.error('Error fetching aulas', e)
        aulas.value = []
    }
}

const fetchExcuses = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            ...filters,
            anio_lectivo_id: selectedAnioId.value // Add year filter
        }

        // Handle 'all' logic if needed, but backend expects 'all' string or specific ID.
        // If undefined/null, backend defaults to active.
        // Our selector has specific values, so it should be fine.

        const res = await $api.get('/api/psychology/attendance-excuses', { params })
        excuses.value = res.data || []
        lastPage.value = res.last_page || 1
    } catch (e) {
        console.error(e)
        excuses.value = []
    } finally {
        loading.value = false
    }
}

const debouncedFetch = debounce(() => {
    page.value = 1
    fetchExcuses()
}, 500)

const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage.value) {
        page.value = newPage
        fetchExcuses()
    }
}

// Modal logic
const openModal = () => {
    isOpen.value = true
    resetForm()
}

const closeModal = () => {
    isOpen.value = false
    resetForm()
}

const resetForm = () => {
    form.student_id = ''
    form.start_date = new Date().toISOString().split('T')[0]
    form.end_date = new Date().toISOString().split('T')[0]
    form.concept = ''
    form.file = null
    studentSearch.value = ''
    studentResults.value = []
    selectedStudent.value = null
    Object.keys(errors).forEach(key => errors[key] = '')
}

// Student Search logic
const searchStudents = debounce(async () => {
    if (studentSearch.value.length < 3) {
        studentResults.value = []
        return
    }
    try {
        const res = await $api.get('/api/estudiantes', { params: { search: studentSearch.value, limit: 10 } })
        studentResults.value = Array.isArray(res) ? res : (res.data || [])
    } catch (e) { console.error(e) }
}, 300)

const selectStudent = (student) => {
    selectedStudent.value = student
    form.student_id = student.id
    studentSearch.value = ''
    studentResults.value = [] // clear dropdown
}

const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            errors.file = 'El archivo es demasiado grande (Max 10MB)'
            form.file = null
            return
        }
        form.file = file
    }
}

const submitForm = async () => {
    if (!validate()) return

    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('student_id', form.student_id)
        formData.append('start_date', form.start_date)
        formData.append('end_date', form.end_date)
        formData.append('concept', form.concept)
        if (form.file) {
            formData.append('file', form.file)
        }

        await $api.post('/api/psychology/attendance-excuses', formData)

        await Swal.fire({
            icon: 'success',
            title: 'Excusa Registrada',
            text: 'La excusa ha sido guardada correctamente y se aplicará automáticamente a la asistencia.',
            timer: 2000,
            showConfirmButton: false
        })

        closeModal()
        fetchExcuses()

    } catch (e) {
        console.error(e)
        // Handle validation errors from backend
        if (e.response?.data?.errors) {
            // map to errors object
            const backErrors = e.response.data.errors
            if (backErrors.student_id) errors.student_id = backErrors.student_id[0]
            // ... etc
        }
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar la excusa. Verifica los datos.'
        })
    } finally {
        submitting.value = false
    }
}



const cancelExcuse = async (excuse) => {
    const { value: text } = await Swal.fire({
        title: 'Cancelar / Finalizar Excusa',
        input: 'textarea',
        inputLabel: 'Motivo de la cancelación',
        inputPlaceholder: 'Escribe el motivo por el cual se cancela la excusa...',
        inputAttributes: {
            'aria-label': 'Motivo de la cancelación'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar Cancelación',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#ea580c', // orange-600
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
            if (!reason) {
                Swal.showValidationMessage('Debes escribir un motivo')
                return false
            }
            try {
                await $api.post(`/api/psychology/attendance-excuses/${excuse.id}/cancel`, { reason })
                return true
            } catch (error) {
                Swal.showValidationMessage(
                    `Solicitud fallida: ${error}`
                )
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    })

    if (text) {
        Swal.fire({
            title: 'Cancelada',
            text: 'La excusa ha sido marcada como cancelada/finalizada.',
            icon: 'success'
        })
        fetchExcuses()
    }
}

// Detail Modal Logic
const showDetailModal = ref(false)
const selectedExcuse = ref(null)

const openDetailModal = (excuse) => {
    selectedExcuse.value = excuse
    showDetailModal.value = true
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedExcuse.value = null
}


// Helpers
const getInitials = (student) => {
    if (!student) return '??'
    return (student.nombres[0] || '') + (student.apellidos[0] || '')
}

const formatDate = (dateStr) => {
    return dayjs(dateStr).format('DD MMM YYYY')
}

const isActive = (excuse) => {
    const today = dayjs()
    const start = dayjs(excuse.start_date)
    const end = dayjs(excuse.end_date)
    return today.isAfter(start.subtract(1, 'day')) && today.isBefore(end.add(1, 'day'))
}

</script>
