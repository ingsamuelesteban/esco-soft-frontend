<template>
    <div class="h-full flex flex-col">
        <!-- Header with Search and New Chat -->
        <div class="p-3 border-b border-gray-100 flex gap-2">
            <div class="relative flex-1">
                <input type="text" placeholder="Buscar chat..."
                    class="w-full text-sm pl-8 pr-3 py-1.5 bg-gray-100 border-none rounded-md focus:ring-1 focus:ring-blue-500"
                    v-model="searchQuery">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2 text-gray-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <button @click="$emit('new-chat')"
                class="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition" title="Nuevo Chat">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>

        <div v-if="filteredConversations.length === 0 && !chatStore.loading"
            class="p-6 text-center text-gray-500 text-sm">
            No se encontraron conversaciones.
        </div>
        <div v-if="chatStore.loading" class="p-6 text-center text-gray-400">
            Cargando chats...
        </div>

        <ul class="divide-y divide-gray-100 overflow-y-auto flex-1">
            <li v-for="conversation in filteredConversations" :key="conversation.id"
                @click="chatStore.selectConversation(conversation)"
                class="p-4 hover:bg-gray-50 cursor-pointer flex items-center transition relative"
                :class="{ 'bg-blue-50/50': conversation.unread_count > 0 }">

                <!-- Unread Indicator Dot -->
                <div v-if="conversation.unread_count > 0"
                    class="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>

                <!-- Avatar -->
                <div
                    class="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0 relative">
                    <img v-if="conversation.avatar" :src="conversation.avatar"
                        class="h-10 w-10 rounded-full object-cover" />
                    <span v-else>{{ (conversation.name || '?').charAt(0) }}</span>

                    <!-- Unread Badge -->
                    <span v-if="conversation.unread_count > 0"
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                        {{ conversation.unread_count }}
                    </span>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-1">
                        <h4 class="text-sm truncate"
                            :class="conversation.unread_count > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'">
                            {{ conversation.name || 'Chat sin nombre' }}
                        </h4>
                        <span v-if="conversation.latest_message" class="text-xs shrink-0"
                            :class="conversation.unread_count > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'">
                            {{ formatDate(conversation.latest_message.created_at) }}
                        </span>
                    </div>
                    <p class="text-xs truncate"
                        :class="conversation.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'">
                        <span v-if="conversation.latest_message">
                            {{ conversation.latest_message.sender_id === useAuthStore().user?.id ? 'Tú: ' : '' }}
                            {{ conversation.latest_message.content }}
                        </span>
                        <span v-else class="italic">Iniciar conversación</span>
                    </p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import dayjs from 'dayjs'

const chatStore = useChatStore()
const searchQuery = ref('')

const filteredConversations = computed(() => {
    if (!searchQuery.value) return chatStore.conversations
    const query = searchQuery.value.toLowerCase()
    return chatStore.conversations.filter(c =>
        (c.name || '').toLowerCase().includes(query)
    )
})

const formatDate = (date: string) => {
    return dayjs(date).format('HH:mm')
}
</script>
