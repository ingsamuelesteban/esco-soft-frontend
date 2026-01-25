<template>
    <div class="px-4 py-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Gestión de Feriados</h1>
                <p class="mt-2 text-sm text-gray-700">
                    Administra los días no laborables, feriados nacionales y días de contingencia.
                </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
                <select v-model="selectedAnioLectivoId"
                    class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">{{ anio.nombre }}</option>
                </select>
                <button @click="openModal()" type="button"
                    class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                    Agregar Feriado
                </button>
            </div>
        </div>

        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Fecha</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Nombre</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Tipo</th>
                                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span class="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="holiday in holidays" :key="holiday.id">
                                    <td
                                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {{ formatDate(holiday.date) }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ holiday.name }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                                            :class="{
                                                'bg-green-100 text-green-800': holiday.type === 'nacional',
                                                'bg-blue-100 text-blue-800': holiday.type === 'local',
                                                'bg-yellow-100 text-yellow-800': holiday.type === 'contingencia'
                                            }">
                                            {{ holiday.type }}
                                        </span>
                                    </td>
                                    <td
                                        class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button @click="openModal(holiday)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <span class="sr-only">Editar</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button @click="confirmDelete(holiday)" class="text-red-600 hover:text-red-900">
                                            <span class="sr-only">Eliminar</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="holidays.length === 0">
                                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay feriados registrados para este año lectivo.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <TransitionRoot as="template" :show="showModal">
            <Dialog as="div" class="relative z-10" @close="showModal = false">
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0"
                    enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <div class="fixed inset-0 z-10 overflow-y-auto">
                    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <TransitionChild as="template" enter="ease-out duration-300"
                            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                            leave-from="opacity-100 translate-y-0 sm:scale-100"
                            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                            <DialogPanel
                                class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div>
                                    <div class="mt-3 text-center sm:mt-5">
                                        <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                            {{ isEditing ? 'Editar Feriado' : 'Nuevo Feriado' }}
                                        </DialogTitle>
                                        <div class="mt-2 space-y-4 text-left">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                                                <input v-model="form.name" type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                                <input v-model="form.date" type="date"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                                                <select v-model="form.type"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                                    <option value="nacional">Nacional</option>
                                                    <option value="local">Local</option>
                                                    <option value="contingencia">Contingencia (Lluvias, etc)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button @click="save()" type="button"
                                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm">
                                        Guardar
                                    </button>
                                    <button @click="showModal = false" type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm">
                                        Cancelar
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { api } from '~/utils/api'
import { useAniosLectivosStore } from '~/stores/anios_lectivos'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

interface Holiday {
    id?: number
    name: string
    date: string
    type: string
}

const aniosStore = useAniosLectivosStore()
const aniosLectivos = computed(() => aniosStore.items)
const selectedAnioLectivoId = ref<number | null>(null)
const holidays = ref<Holiday[]>([])

const showModal = ref(false)
const isEditing = ref(false)
const form = ref<Holiday>({ name: '', date: '', type: 'nacional' })

const fetchHolidays = async () => {
    if (!selectedAnioLectivoId.value) return

    try {
        const response = await api.get('/api/holidays', { params: { anio_lectivo_id: selectedAnioLectivoId.value } })
        holidays.value = Array.isArray(response) ? response : (response.data || [])
    } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudieron cargar los feriados', 'error')
    }
}

const formatDate = (date: string) => {
    return dayjs.utc(date).format('DD/MM/YYYY (dddd)')
}

const openModal = (holiday?: Holiday) => {
    if (holiday) {
        isEditing.value = true
        // Ensure date is formatted as YYYY-MM-DD for the date input
        form.value = { 
            ...holiday,
            date: dayjs.utc(holiday.date).format('YYYY-MM-DD') 
        }
    } else {
        isEditing.value = false
        form.value = { name: '', date: '', type: 'nacional' }
    }
    showModal.value = true
}

const save = async () => {
    if (!form.value.name || !form.value.date) {
        return Swal.fire('Atención', 'Nombre y fecha son requeridos', 'warning')
    }

    try {
        if (isEditing.value && form.value.id) {
            await api.put(`/api/holidays/${form.value.id}`, form.value)
        } else {
            await api.post('/api/holidays', form.value)
        }
        showModal.value = false
        Swal.fire('Éxito', 'Feriado guardado correctamente', 'success')
        fetchHolidays()
    } catch (e: any) {
        console.error(e)
        Swal.fire('Error', e.message || 'Error al guardar', 'error')
    }
}

const confirmDelete = async (holiday: Holiday) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        try {
            await api.delete(`/api/holidays/${holiday.id}`)
            Swal.fire('Eliminado', 'El feriado ha sido eliminado', 'success')
            fetchHolidays()
        } catch (e) {
            Swal.fire('Error', 'No se pudo eliminar', 'error')
        }
    }
}

watch(selectedAnioLectivoId, () => {
    fetchHolidays()
})

onMounted(async () => {
    await aniosStore.fetchAll()
    // Select the active school year by default
    const activeAnio = aniosLectivos.value.find(a => a.activo)
    if (activeAnio) {
        selectedAnioLectivoId.value = activeAnio.id
    } else if (aniosLectivos.value?.length > 0) {
        selectedAnioLectivoId.value = aniosLectivos.value[0].id
    }
})
</script>
