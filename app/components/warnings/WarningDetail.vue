<template>
    <div v-if="warning" class="space-y-6">
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between">
            <button @click="emit('back')" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Volver
            </button>

            <div class="flex items-center space-x-2">
                <span :class="[
                    warning.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold'
                ]">
                    {{ warning.status === 'open' ? 'Abierta' : 'Cerrada' }}
                </span>

                <button v-if="canEdit && warning.status === 'open'" @click="closeWarning"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Cerrar Advertencia
                </button>

                <button v-if="canEdit && warning.status === 'closed'" @click="reopenWarning"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-  50">
                    Reabrir Advertencia
                </button>
            </div>
        </div>

        <!-- Warning Info Card -->
        <div class="bg-white shadow rounded-lg p-6">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Estudiante</h3>
                    <p class="mt-1 text-sm text-gray-900">
                        {{ warning.student?.apellidos }}, {{ warning.student?.nombres }}
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ warning.student?.aula?.grado_cardinal }}-{{ warning.student?.aula?.seccion }}
                    </p>
                </div>

                <div>
                    <h3 class="text-sm font-medium text-gray-500">Reportado por</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ warning.reportedBy?.name || warning.reported_by?.name ||
                        'Desconocido' }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(warning.created_at) }}</p>
                </div>

                <div class="col-span-2">
                    <h3 class="text-sm font-medium text-gray-500">Título</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ warning.title }}</p>
                </div>

                <div v-if="warning.closed_at" class="col-span-2">
                    <h3 class="text-sm font-medium text-gray-500">Cerrado</h3>
                    <p class="mt-1 text-sm text-gray-900">
                        {{ warning.closedBy?.name }} - {{ formatDate(warning.closed_at) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Entries Timeline -->
        <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Seguimiento</h3>

            <!-- Add Entry Form (if open) -->
            <div v-if="warning.status === 'open' && canEdit" class="mb-6 border-b pb-6">
                <form @submit.prevent="addEntry">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Agregar seguimiento
                        </label>
                        <textarea v-model="newEntryContent" rows="3" required
                            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Escriba el seguimiento..."></textarea>
                    </div>
                    <div class="mt-3 flex justify-end">
                        <button type="submit" :disabled="submitting || !newEntryContent.trim()"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            {{ submitting ? 'Guardando...' : 'Agregar Entrada' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Entries List -->
            <div class="flow-root">
                <ul role="list" class="-mb-8">
                    <li v-for="(entry, idx) in sortedEntries" :key="entry.id">
                        <div class="relative pb-8">
                            <span v-if="idx !== sortedEntries.length - 1"
                                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            <div class="relative flex space-x-3">
                                <div>
                                    <span
                                        class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div class="flex-1">
                                        <p class="text-sm text-gray-500">
                                            <span class="font-medium text-gray-900">{{ entry.author?.name }}</span>
                                            {{ getEntryAction(idx) }}
                                        </p>
                                        <p class="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{{ entry.content }}
                                        </p>
                                    </div>
                                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time :datetime="entry.date_of_event">{{ formatDate(entry.date_of_event)
                                            }}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentWarningsStore } from '~/stores/studentWarnings'
import { useAuthStore } from '~/stores/auth'
import type { StudentWarning } from '~/types/warnings'
import Swal from 'sweetalert2'

const props = defineProps<{
    warningId: number
}>()

const emit = defineEmits<{
    (e: 'back'): void
}>()

const warningsStore = useStudentWarningsStore()
const authStore = useAuthStore()

const warning = ref<StudentWarning | null>(null)
const newEntryContent = ref('')
const submitting = ref(false)

const canEdit = computed(() => {
    const user = authStore.user
    if (!user || !warning.value) return false

    const isPsychOrAdmin = ['psic', 'orient', 'coord', 'admin', 'master'].some(r =>
        user.role?.includes(r)
    )

    return isPsychOrAdmin || warning.value.reported_by_id === user.id
})

const sortedEntries = computed(() => {
    if (!warning.value?.entries) return []
    return [...warning.value.entries].reverse() // Show oldest first (chronological)
})

const getEntryAction = (idx: number) => {
    // Index 0 in chronological view is the creation
    return idx === 0 ? 'creó la advertencia' : 'agregó seguimiento'
}

const loadWarning = async () => {
    const result = await warningsStore.showWarning(props.warningId)
    if (result.success && result.data) {
        warning.value = result.data
    }
}

const addEntry = async () => {
    if (!newEntryContent.value.trim() || !warning.value) return

    submitting.value = true
    const result = await warningsStore.createEntry({
        warning_id: warning.value.id,
        content: newEntryContent.value,
        date_of_event: new Date().toISOString().split('T')[0] || ''
    })

    submitting.value = false

    if (result.success) {
        newEntryContent.value = ''
        // Reload warning to show the new entry
        await loadWarning()
        Swal.fire({
            icon: 'success',
            title: 'Entrada agregada',
            timer: 1500,
            showConfirmButton: false
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.error || 'No se pudo agregar la entrada'
        })
    }
}

const closeWarning = async () => {
    if (!warning.value) return

    const confirm = await Swal.fire({
        title: '¿Cerrar advertencia?',
        text: 'Esta acción marcará la advertencia como cerrada',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    const result = await warningsStore.updateWarning(warning.value.id, { status: 'closed' })

    if (result.success) {
        warning.value = result.data
        Swal.fire({
            icon: 'success',
            title: 'Advertencia cerrada',
            timer: 1500,
            showConfirmButton: false
        })
        emit('back')
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.error || 'No se pudo cerrar la advertencia'
        })
    }
}

const reopenWarning = async () => {
    if (!warning.value) return

    const result = await warningsStore.updateWarning(warning.value.id, { status: 'open' })

    if (result.success) {
        warning.value = result.data
        Swal.fire({
            icon: 'success',
            title: 'Advertencia reabierta',
            timer: 1500,
            showConfirmButton: false
        })
        emit('back')
    }
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

onMounted(() => {
    loadWarning()
})
</script>
