<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    show: boolean
    columnTitle: string
    estudiantes: any[]
    maxNota: number
}>()

const emit = defineEmits(['close', 'save'])

const pastedContent = ref('')
const parsedGrades = ref<any[]>([])
const step = ref(1) // 1: Paste, 2: Preview
const errors = ref<string[]>([])

// Computar estadísticas de la vista previa
const previewStats = computed(() => {
    const total = parsedGrades.value.length
    const valid = parsedGrades.value.filter(g => g.isValid).length
    const skipped = parsedGrades.value.filter(g => g.status === 'skipped').length
    const errors = parsedGrades.value.filter(g => g.status === 'error').length
    return { total, valid, skipped, errors }
})

const parseData = () => {
    if (!pastedContent.value.trim()) {
        errors.value = ['Por favor pega el contenido primero.']
        return
    }

    const lines = pastedContent.value.split(/\r?\n/)

    // Limpiar errores previos
    errors.value = []

    // Validar si parece totalmente vacío (todas las líneas vacías)
    if (lines.every(l => l.trim() === '')) {
        errors.value = ['No se detectaron datos.']
        return
    }

    // Mapear líneas a estudiantes (asumiendo orden secuencial)
    parsedGrades.value = props.estudiantes.map((estudiante, index) => {
        // Usar la línea correspondiente o string vacío si excede
        const rawValue = lines[index] ? lines[index].trim() : ''
        const numValue = parseFloat(rawValue)

        // Validación básica
        const isNumeric = !isNaN(numValue) && rawValue !== ''
        const inRange = isNumeric && numValue >= 0 && numValue <= props.maxNota

        let status = 'valid'
        let message = ''

        if (!rawValue) {
            status = 'skipped'
            message = 'Se mantendrá igual'
        } else if (!isNumeric) {
            status = 'error'
            message = 'No es numérico'
        } else if (!inRange) {
            status = 'error'
            message = `Fuera de rango (Max: ${props.maxNota})`
        }

        return {
            estudianteId: estudiante.id,
            estudianteNombre: `${estudiante.nombres} ${estudiante.apellidos}`,
            rawValue,
            numericValue: isNumeric ? numValue : null,
            isValid: status === 'valid',
            status,
            message
        }
    })

    // Warning si hay diferencia de cantidad
    if (lines.length !== props.estudiantes.length) {
        errors.value.push(`Atención: Hay ${props.estudiantes.length} estudiantes pero detectamos ${lines.length} líneas de datos. Por favor verifica alineación.`)
    }

    step.value = 2
}

const handleSave = () => {
    // Solo enviar los válidos
    const validGrades = parsedGrades.value
        .filter(g => g.isValid)
        .map(g => ({
            estudiante_id: g.estudianteId,
            nota: g.numericValue
        }))

    emit('save', validGrades)
}

const reset = () => {
    step.value = 1
    pastedContent.value = ''
    parsedGrades.value = []
    errors.value = []
}
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                @click="$emit('close')"></div>

            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Importar Notas: {{ columnTitle }}
                            </h3>

                            <div class="mt-2" v-if="step === 1">
                                <p class="text-sm text-gray-500 mb-2">
                                    Copia la columna de notas desde Excel (Ctrl+C) y pégala aquí (Ctrl+V).
                                    Asegúrate de que el orden coincida con la lista de estudiantes.
                                </p>
                                <div class="bg-blue-50 p-3 rounded-md mb-3 text-xs text-blue-800">
                                    Nota máxima permitida: <strong>{{ maxNota }}</strong>
                                </div>
                                <textarea v-model="pastedContent" rows="10"
                                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Pega aquí tus notas..."></textarea>
                            </div>

                            <div class="mt-2" v-if="step === 2">
                                <!-- Estadísticas -->
                                <div class="flex gap-4 mb-4 text-sm">
                                    <div class="bg-gray-100 px-3 py-1 rounded">
                                        Total filas: <strong>{{ previewStats.total }}</strong>
                                    </div>
                                    <div class="bg-green-100 text-green-800 px-3 py-1 rounded">
                                        Válidos: <strong>{{ previewStats.valid }}</strong>
                                    </div>
                                    <div class="bg-gray-100 text-gray-600 px-3 py-1 rounded"
                                        v-if="previewStats.skipped > 0">
                                        Omitidos: <strong>{{ previewStats.skipped }}</strong>
                                    </div>
                                    <div class="bg-red-100 text-red-800 px-3 py-1 rounded"
                                        v-if="previewStats.errors > 0">
                                        Errores: <strong>{{ previewStats.errors }}</strong>
                                    </div>
                                </div>

                                <!-- Alerta global -->
                                <div v-if="errors.length > 0"
                                    class="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <ul class="list-disc pl-5 text-sm text-yellow-700">
                                        <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
                                    </ul>
                                </div>

                                <!-- Tabla Preview -->
                                <div class="overflow-y-auto max-h-60 border rounded">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Estudiante</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Valor Detectado</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr v-for="item in parsedGrades" :key="item.estudianteId">
                                                <td class="px-3 py-2 text-sm text-gray-900 truncate max-w-xs"
                                                    :title="item.estudianteNombre">
                                                    {{ item.estudianteNombre }}
                                                </td>
                                                <td class="px-3 py-2 text-sm font-mono">
                                                    {{ item.rawValue || '-' }}
                                                </td>
                                                <td class="px-3 py-2 text-sm">
                                                    <span v-if="item.isValid" class="text-green-600 flex items-center">
                                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                        OK
                                                    </span>
                                                    <span v-else-if="item.status === 'skipped'"
                                                        class="text-gray-400 italic text-xs">
                                                        - Omitido -
                                                    </span>
                                                    <span v-else class="text-red-600 text-xs font-bold">
                                                        {{ item.message }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button v-if="step === 2" type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="handleSave" :disabled="previewStats.valid === 0">
                        Importar {{ previewStats.valid }} Notas
                    </button>

                    <button v-if="step === 1" type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="parseData">
                        Procesar Datos
                    </button>

                    <button v-if="step === 2" type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="reset">
                        Atrás
                    </button>

                    <button type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="$emit('close')">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
