<template>
    <TransitionRoot appear :show="open" as="template">
        <Dialog as="div" @close="close" class="relative z-50">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                Transferir Asignaciones
                            </DialogTitle>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    Seleccione el profesor de origen y el profesor destino. Todas las asignaciones
                                    activas serán
                                    transferidas, siempre que no existan conflictos de horario.
                                </p>
                            </div>

                            <div class="mt-4 space-y-4">
                                <!-- Source Teacher -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Profesor Origen
                                        (Actual)</label>
                                    <select ref="initialInput" v-model="form.from_profesor_id"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                        <option :value="null" disabled>Seleccione...</option>
                                        <option v-for="p in props.teachers" :key="p.id" :value="p.id">
                                            {{ p.nombre }} {{ p.apellido }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Arrow Icon -->
                                <div class="flex justify-center text-gray-400">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>

                                <!-- Target Teacher -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Profesor Destino
                                        (Nuevo)</label>
                                    <select v-model="form.to_profesor_id"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                        <option :value="null" disabled>Seleccione...</option>
                                        <option v-for="p in availableTargets" :key="p.id" :value="p.id">
                                            {{ p.nombre }} {{ p.apellido }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Optional Year Override (Hidden or default to current context if needed, but usually context is implied) -->
                            </div>

                            <!-- Error Message -->
                            <div v-if="error" class="mt-4 p-3 rounded-md bg-red-50 text-sm text-red-700">
                                {{ error }}
                            </div>

                            <div class="mt-6 flex justify-end gap-3">
                                <button type="button"
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    @click="close">
                                    Cancelar
                                </button>
                                <button type="button"
                                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    :disabled="loading || !isValid" @click="submit">
                                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    {{ loading ? 'Transfiriendo...' : 'Transferir Asignaciones' }}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import type { Personal } from '../../stores/personal'
import Swal from 'sweetalert2'

const props = defineProps<{
    open: boolean
    teachers: Personal[]
}>()

const emit = defineEmits(['close', 'transfer'])

const loading = ref(false)
const error = ref('')
const initialInput = ref<HTMLSelectElement | null>(null)

const form = reactive({
    from_profesor_id: null as number | null,
    to_profesor_id: null as number | null
})

// Reset form when opened
watch(() => props.open, (val) => {
    if (val) {
        form.from_profesor_id = null
        form.to_profesor_id = null
        error.value = ''
        loading.value = false
        setTimeout(() => {
            initialInput.value?.focus()
        }, 100)
    }
})

const availableTargets = computed(() => {
    return props.teachers.filter(p => p.id !== form.from_profesor_id)
})

const isValid = computed(() => {
    return form.from_profesor_id && form.to_profesor_id && form.from_profesor_id !== form.to_profesor_id
})

const close = () => {
    emit('close')
}

const submit = async () => {
    if (!isValid.value) return

    loading.value = true
    error.value = ''

    try {
        await new Promise<void>((resolve, reject) => {
            emit('transfer', {
                payload: { ...form },
                resolve,
                reject
            })
        })

        close()

        Swal.fire({
            title: '¡Transferencia Exitosa!',
            text: 'Las asignaciones han sido transferidas correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        })

    } catch (e: any) {
        // Close modal or keep open? Usually keep open on error so user can retry or see input.
        // But invalid assignments transfer might be simpler to just show error.

        const errorMsg = e.response?.data?.message || e.message || 'Error al transferir asignaciones.'

        // Use generic Swal if available, ensuring type safety with 'any' cast if needed or just usage
        Swal.fire({
            title: 'Error',
            text: errorMsg,
            icon: 'error',
            confirmButtonText: 'Cerrar'
        })
    } finally {
        loading.value = false
    }
}
</script>
