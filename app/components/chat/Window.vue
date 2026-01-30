<template>
    <div v-if="chatStore.showChatWindow"
        class="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <h3 class="font-bold flex items-center">
                <span v-if="chatStore.activeConversation" class="cursor-pointer hover:text-blue-100 flex items-center"
                    @click="goBack">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clip-rule="evenodd" />
                    </svg>
                    {{ chatStore.activeConversation.name }}
                </span>
                <span v-else>Mensajes</span>
            </h3>
            <button @click="chatStore.toggleChatWindow()" class="hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto bg-gray-50 relative">
            <UserList v-if="isCreatingNew" @cancel="isCreatingNew = false" @select-user="handleUserSelect" />
            <ConversationList v-else-if="!chatStore.activeConversation" @new-chat="isCreatingNew = true" />
            <MessageList v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import ConversationList from './ConversationList.vue'
import MessageList from './MessageList.vue'
import UserList from './UserList.vue'

const chatStore = useChatStore()
const isCreatingNew = ref(false)

onMounted(() => {
    chatStore.fetchConversations()
})

const goBack = () => {
    chatStore.activeConversation = null
}

const handleUserSelect = async (user: any) => {
    try {
        await chatStore.createConversation(user.id)
        isCreatingNew.value = false
    } catch (error) {
        // Error handling if needed
    }
}
</script>
