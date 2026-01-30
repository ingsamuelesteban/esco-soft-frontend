<template>
    <form @submit.prevent="sendMessage" class="flex items-center space-x-2">
        <input ref="messageInput" v-model="content" type="text" placeholder="Escribe un mensaje..."
            class="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        <button type="submit" :disabled="!content.trim()"
            class="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
        </button>
    </form>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()
const content = ref('')
const messageInput = ref<HTMLInputElement | null>(null)

// Auto-focus al montar el componente
onMounted(() => {
    nextTick(() => {
        messageInput.value?.focus()
    })
})

const sendMessage = async () => {
    if (!content.value.trim()) return

    const text = content.value
    content.value = '' // Optimistic clear
    await chatStore.sendMessage(text)
    
    // Volver a enfocar después de enviar
    nextTick(() => {
        messageInput.value?.focus()
    })
}
</script>
