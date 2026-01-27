<template>
    <div class="w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
            {{ label }}
        </label>

        <div @dragenter.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
            @dragover.prevent="isDragging = true" @drop.prevent="handleDrop" @click="triggerFileInput" :class="[
                'relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center',
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
                error ? 'border-red-300 bg-red-50' : ''
            ]">
            <input ref="fileInput" type="file" class="hidden" :accept="accept" @change="handleFileChange" />

            <!-- Preview Mode -->
            <div v-if="modelValue" class="w-full">
                <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-3 overflow-hidden">
                        <!-- File Icon/Preview -->
                        <div
                            class="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            <template v-if="isImage">
                                <img v-if="previewUrl" :src="previewUrl" class="h-full w-full object-cover rounded" />
                            </template>
                            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <div class="flex-1 min-w-0 text-left">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                {{ modelValue.name }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ formatSize(modelValue.size) }}
                            </p>
                        </div>
                    </div>

                    <button @click.stop="removeFile"
                        class="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                        title="Eliminar archivo">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Empty Mode -->
            <div v-else class="space-y-1">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"
                    aria-hidden="true">
                    <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600 justify-center">
                    <span class="font-medium text-blue-600 hover:text-blue-500">
                        Seleccionar archivo
                    </span>
                    <p class="pl-1">o arrastrar aquí</p>
                </div>
                <p class="text-xs text-gray-500">
                    {{ accept ? accept.split(',').join(', ') : 'Cualquier archivo' }}
                    <span v-if="maxSize">(Max {{ formatSize(maxSize) }})</span>
                </p>
            </div>
        </div>

        <p v-if="error" class="mt-1 text-sm text-red-600">
            {{ error }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{
    modelValue: File | null
    accept?: string
    maxSize?: number // bytes
    label?: string
    error?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', file: File | null): void
    (e: 'error', message: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)

const isImage = computed(() => {
    return props.modelValue?.type.startsWith('image/')
})

// Create preview URL if image
watch(() => props.modelValue, (newFile) => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = null
    }

    if (newFile && newFile.type.startsWith('image/')) {
        previewUrl.value = URL.createObjectURL(newFile)
    }
}, { immediate: true })

onUnmounted(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
})

const triggerFileInput = () => {
    fileInput.value?.click()
}

const validateFile = (file: File) => {
    // Check type if accept is provided
    if (props.accept) {
        // Simple check - for robust check we'd parse the accept string thoroughly
        const acceptedTypes = props.accept.split(',').map(t => t.trim())
        // If file extension or mime type matches
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
        const matches = acceptedTypes.some(type => {
            if (type.startsWith('.')) return type.toLowerCase() === fileExt
            if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''))
            return file.type === type
        })

        if (!matches) {
            emit('error', 'Tipo de archivo no permitido')
            return false
        }
    }

    // Check size
    if (props.maxSize && file.size > props.maxSize) {
        emit('error', `El archivo excede el tamaño máximo de ${formatSize(props.maxSize)}`)
        return false
    }

    emit('error', '') // Clear error
    return true
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
        if (validateFile(file)) {
            emit('update:modelValue', file)
        } else {
            target.value = '' // Reset input
        }
    }
}

const handleDrop = (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files
    const file = files?.[0]

    if (file) {
        if (validateFile(file)) {
            emit('update:modelValue', file)
        }
    }
}

const removeFile = () => {
    emit('update:modelValue', null)
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>
