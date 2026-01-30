<template>
    <div class="h-full flex flex-col">
        <div class="p-3 border-b border-gray-100 flex items-center gap-2">
            <button @click="$emit('cancel')" class="p-1 hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <h3 class="font-bold text-gray-700">Nuevo Chat</h3>
        </div>

        <div class="p-2 border-b border-gray-100">
            <input type="text" placeholder="Buscar usuario..." v-model="searchQuery"
                class="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <div v-if="loading" class="p-6 text-center text-gray-400">
            Cargando usuarios...
        </div>

        <ul v-else class="divide-y divide-gray-100 overflow-y-auto flex-1">
            <li v-for="user in filteredUsers" :key="user.id" @click="startChat(user)"
                class="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition">
                <div
                    class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {{ (user.name || '?').charAt(0) }}
                </div>
                <div class="min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ user.name }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ user.email }}</div>
                </div>
            </li>
            <li v-if="filteredUsers.length === 0" class="p-4 text-center text-gray-500 text-sm">
                No se encontraron usuarios.
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const emit = defineEmits(['cancel', 'select-user'])
const chatStore = useChatStore()

const loading = ref(true)
const users = ref<any[]>([])
const searchQuery = ref('')

onMounted(async () => {
    loading.value = true
    try {
        const response = await chatStore.fetchUsers()
        users.value = Array.isArray(response) ? response : []
    } finally {
        loading.value = false
    }
})

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const query = searchQuery.value.toLowerCase()
    return users.value.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    )
})

const startChat = (user: any) => {
    emit('select-user', user)
}
</script>
