<template>
    <div class="h-full flex flex-col">
        <!-- Messages Scroll Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messagesContainer">
            <div v-for="message in chatStore.messages" :key="message.id" class="flex"
                :class="isMyMessage(message) ? 'justify-end' : 'justify-start'">
                <div class="max-w-[80%] rounded-lg p-3 text-sm"
                    :class="isMyMessage(message) ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'">
                    <div v-if="!isMyMessage(message) && chatStore.activeConversation?.is_general"
                        class="text-xs font-bold mb-1 opacity-75">
                        {{ message.sender?.name }}
                    </div>
                    <p>{{ message.content }}</p>
                    <div class="text-[10px] mt-1 text-right opacity-70">
                        {{ formatTime(message.created_at) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="bg-white p-3 border-t border-gray-100">
            <MessageInput />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import MessageInput from './MessageInput.vue'
import dayjs from 'dayjs'

const chatStore = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)

const isMyMessage = (message: any) => {
    return message.user_id === useAuthStore().user?.id
}

const formatTime = (date: string) => {
    const d = dayjs(date)
    if (d.isSame(dayjs(), 'day')) {
        return d.format('HH:mm')
    }
    return d.format('DD/MM/YY HH:mm')
}

// Auto scroll to bottom
watch(() => chatStore.messages.length, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
})
</script>
