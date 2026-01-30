<template>
    <button @click="chatStore.toggleChatWindow()"
        class="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform transform hover:scale-105 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <!-- Badge for unread messages -->
        <span v-if="chatStore.totalUnreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {{ chatStore.totalUnreadCount }}
        </span>
    </button>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()
</script>
