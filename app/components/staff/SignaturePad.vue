<template>
    <div class="signature-pad-container">
        <div class="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
            <canvas ref="canvasRef" class="signature-canvas"></canvas>
        </div>

        <div class="mt-3 flex justify-between items-center">
            <button @click="clear" type="button"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar
            </button>

            <span v-if="!isEmpty" class="text-xs text-green-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
                Firma capturada
            </span>
            <span v-else class="text-xs text-gray-400 italic">
                Firme en el recuadro
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SignaturePad from 'signature_pad'

const emit = defineEmits<{
    update: [signature: string]
    change: [isEmpty: boolean]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let signaturePad: SignaturePad | null = null
const isEmpty = ref(true)

onMounted(() => {
    if (canvasRef.value) {
        // Ajustar tamaño del canvas
        resizeCanvas()

        signaturePad = new SignaturePad(canvasRef.value, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
        })

        signaturePad.addEventListener('endStroke', () => {
            isEmpty.value = signaturePad!.isEmpty()
            if (!isEmpty.value) {
                emit('update', signaturePad!.toDataURL())
            }
            emit('change', isEmpty.value)
        })

        window.addEventListener('resize', resizeCanvas)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas)
})

const resizeCanvas = () => {
    if (!canvasRef.value) return

    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvasRef.value.width = canvasRef.value.offsetWidth * ratio
    canvasRef.value.height = canvasRef.value.offsetHeight * ratio
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
        ctx.scale(ratio, ratio)
    }

    if (signaturePad) {
        signaturePad.clear()
    }
}

const clear = () => {
    if (signaturePad) {
        signaturePad.clear()
        isEmpty.value = true
        emit('change', true)
    }
}

// Exponer métodos para uso externo
defineExpose({
    clear,
    isEmpty: () => isEmpty.value,
    getSignature: () => signaturePad?.toDataURL() || null
})
</script>

<style scoped>
.signature-canvas {
    width: 100%;
    height: 200px;
    cursor: crosshair;
    touch-action: none;
}

@media (max-width: 640px) {
    .signature-canvas {
        height: 150px;
    }
}
</style>
