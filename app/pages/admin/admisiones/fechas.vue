<template>
    <div class="space-y-6 max-w-6xl mx-auto pb-12 px-4 sm:px-6">
        <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
                <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Configuración de Fechas de Admisión
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    Gestione las actividades, exámenes y orientaciones según el número de folder de los pre-admitidos.
                </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0 space-x-3">
                <div class="w-64">
                    <select v-model="selectedAnioLectivoId" @change="fetchActividades"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                        <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">
                            {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                        </option>
                    </select>
                </div>
                <button type="button" @click="openModal()"
                    class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                    <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Nueva Actividad
                </button>
            </div>
        </div>

        <!-- Lista de Actividades -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="actividad in actividades" :key="actividad.id"
                class="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div class="p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <div class="bg-primary-100 p-2 rounded-lg mr-3">
                                <CalendarIcon class="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900">{{ formatDate(actividad.fecha) }}</h3>
                                <p class="text-xs text-gray-500">{{ actividad.actividad }}</p>
                            </div>
                        </div>
                        <div class="flex space-x-1">
                            <button @click="openModal(actividad)" class="text-gray-400 hover:text-primary-600 p-1">
                                <PencilSquareIcon class="h-5 w-5" />
                            </button>
                            <button @click="confirmDelete(actividad)" class="text-gray-400 hover:text-red-600 p-1">
                                <TrashIcon class="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div class="border-t border-gray-100 pt-4">
                        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grupos y Horarios
                        </h4>
                        <div class="space-y-2">
                            <div v-for="grupo in actividad.grupos" :key="grupo.id"
                                class="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                <span class="text-gray-700 font-medium">Folder {{ grupo.folder_desde }} - {{
                                    grupo.folder_hasta }}</span>
                                <span class="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">{{
                                    grupo.hora }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="actividades.length === 0"
                class="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-semibold text-gray-900">No hay actividades</h3>
                <p class="mt-1 text-sm text-gray-500">Comience agregando una nueva fecha importante para este año
                    lectivo.</p>
            </div>
        </div>

        <!-- Modal Formulario -->
        <TransitionRoot as="template" :show="modalOpen">
            <Dialog as="div" class="relative z-50" @close="modalOpen = false">
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
                                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <form @submit.prevent="saveActividad">
                                    <div>
                                        <div class="mt-3 text-left">
                                            <DialogTitle as="h3"
                                                class="text-lg font-bold leading-6 text-gray-900 border-b pb-3 mb-4">
                                                {{ form.id ? 'Editar Actividad' : 'Nueva Actividad de Admisión' }}
                                            </DialogTitle>

                                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">Nombre de la
                                                        Actividad</label>
                                                    <input v-model="form.actividad" type="text" required
                                                        placeholder="Ej: Charla y Evaluación"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                                    <input v-model="form.fecha" type="date" required
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                                </div>
                                            </div>

                                            <div class="space-y-4">
                                                <div class="flex items-center justify-between border-b pb-2">
                                                    <h4 class="text-sm font-bold text-gray-900">Configuración de Grupos
                                                        (Folder/Hora)</h4>
                                                    <button type="button" @click="addGrupo"
                                                        class="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700">
                                                        <PlusIcon class="h-4 w-4 mr-1" /> Agregar Grupo
                                                    </button>
                                                </div>

                                                <div v-for="(grupo, index) in form.grupos" :key="index"
                                                    class="flex items-center gap-3 animate-slide-in">
                                                    <div class="w-24">
                                                        <label v-if="index === 0"
                                                            class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Desde</label>
                                                        <input v-model="grupo.folder_desde" type="number" required
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                                    </div>
                                                    <div class="w-24">
                                                        <label v-if="index === 0"
                                                            class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Hasta</label>
                                                        <input v-model="grupo.folder_hasta" type="number" required
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <label v-if="index === 0"
                                                            class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Hora
                                                            / Turno</label>
                                                        <input v-model="grupo.hora" type="text" required
                                                            placeholder="9:00 am"
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                                    </div>
                                                    <div class="pt-5" :class="index === 0 ? 'pt-5' : ''">
                                                        <button type="button" @click="removeGrupo(index)"
                                                            v-if="form.grupos.length > 1"
                                                            class="text-gray-400 hover:text-red-600">
                                                            <TrashIcon class="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-8 sm:flex sm:flex-row-reverse sm:gap-3">
                                        <button type="submit" :disabled="loading"
                                            class="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:w-auto">
                                            {{ loading ? 'Guardando...' : 'Guardar Actividad' }}
                                        </button>
                                        <button type="button" @click="modalOpen = false"
                                            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                                            Cancelar
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
import { ref, reactive, onMounted } from 'vue'
import { api } from '~/utils/api'
import Swal from 'sweetalert2'
import { PlusIcon, CalendarIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const actividades = ref([])
const aniosLectivos = ref([])
const selectedAnioLectivoId = ref('')
const loading = ref(false)
const modalOpen = ref(false)

const form = reactive({
    id: null,
    actividad: '',
    fecha: '',
    anio_lectivo_id: '',
    grupos: [
        { folder_desde: '', folder_hasta: '', hora: '' }
    ]
})

onMounted(async () => {
    await fetchAniosLectivos()
})

const fetchAniosLectivos = async () => {
    try {
        const res = await api.get('/api/anios-lectivos')
        const data = res.data || res || []
        aniosLectivos.value = data
        if (data.length > 0) {
            const activeAnio = data.find(a => a.activo)
            // Seleccionar el "siguiente" (el primero que no sea el activo y tenga nombre mayor)
            // Si no hay activo, simplemente el primero de la lista (que viene desc por nombre)
            const nextAnio = data.find(a => !a.activo && (!activeAnio || a.nombre > activeAnio.nombre))

            if (nextAnio) {
                selectedAnioLectivoId.value = nextAnio.id
            } else if (activeAnio) {
                selectedAnioLectivoId.value = activeAnio.id
            } else {
                selectedAnioLectivoId.value = data[0].id
            }
            fetchActividades()
        }
    } catch (e) {
        console.error('Error fetching anios lectivos', e)
    }
}

const fetchActividades = async () => {
    try {
        const res = await api.get(`/api/admision-actividades?anio_lectivo_id=${selectedAnioLectivoId.value}`)
        actividades.value = res.data || res || []
    } catch (e) {
        console.error('Error fetching actividades', e)
    }
}

const openModal = (actividad = null) => {
    if (actividad) {
        form.id = actividad.id
        form.actividad = actividad.actividad
        form.fecha = actividad.fecha.split('T')[0]
        form.anio_lectivo_id = actividad.anio_lectivo_id
        form.grupos = JSON.parse(JSON.stringify(actividad.grupos))
    } else {
        form.id = null
        form.actividad = ''
        form.fecha = ''
        form.anio_lectivo_id = selectedAnioLectivoId.value
        form.grupos = [{ folder_desde: '', folder_hasta: '', hora: '' }]
    }
    modalOpen.value = true
}

const addGrupo = () => {
    form.grupos.push({ folder_desde: '', folder_hasta: '', hora: '' })
}

const removeGrupo = (index) => {
    form.grupos.splice(index, 1)
}

const saveActividad = async () => {
    loading.value = true
    try {
        if (form.id) {
            await api.put(`/api/admision-actividades/${form.id}`, form)
        } else {
            await api.post('/api/admision-actividades', form)
        }
        modalOpen.value = false
        Swal.fire('Éxito', 'Actividad guardada correctamente', 'success')
        fetchActividades()
    } catch (e) {
        console.error('Error saving actividad', e)
        Swal.fire('Error', 'Hubo un problema al guardar la actividad', 'error')
    } finally {
        loading.value = false
    }
}

const confirmDelete = (actividad) => {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await api.delete(`/api/admision-actividades/${actividad.id}`)
                Swal.fire('Eliminado', 'La actividad ha sido eliminada', 'success')
                fetchActividades()
            } catch (e) {
                Swal.fire('Error', 'No se pudo eliminar la actividad', 'error')
            }
        }
    })
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-DO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(date)
}
</script>

<style scoped>
.animate-slide-in {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
