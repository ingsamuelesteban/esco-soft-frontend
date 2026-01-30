import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [] as any[],
        activeConversation: null as any | null,
        messages: [] as any[],
        generalChatId: null as number | null,
        loading: false,
        showChatWindow: false,
    }),

    getters: {
        totalUnreadCount: (state) => {
            return state.conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
        }
    },

    actions: {
        async fetchConversations() {
            this.loading = true
            try {
                // api.get handles Authorization and Tenant Prefixing
                const data = await api.get<any>('/api/chat/conversations')

                // Debugging response
                console.log('Conversations API Response:', data)

                // Ensure array
                if (Array.isArray(data)) {
                    this.conversations = data
                } else if (typeof data === 'object' && data !== null) {
                    this.conversations = Object.values(data)
                } else {
                    this.conversations = []
                    console.error('Unexpected conversations format:', data)
                }

                // Find general chat
                const general = this.conversations.find(c => c.is_general)
                if (general) {
                    this.generalChatId = general.id
                }
            } catch (error) {
                console.error('Error fetching conversations:', error)
            } finally {
                this.loading = false
            }
        },

        async selectConversation(conversation: any) {
            if (this.activeConversation?.id === conversation.id && this.showChatWindow) return

            this.activeConversation = conversation
            this.showChatWindow = true

            // Mark as read immediately
            if (conversation.unread_count > 0) {
                this.markAsRead(conversation.id)
            }

            await this.fetchMessages(conversation.id)
            this.listenForMessages(conversation.id)
        },

        async fetchMessages(conversationId: number) {
            try {
                const data = await api.get<any[]>(`/api/chat/${conversationId}/messages`)
                this.messages = data
            } catch (error) {
                console.error('Error fetching messages:', error)
            }
        },

        async sendMessage(content: string) {
            if (!this.activeConversation) return

            const authStore = useAuthStore()
            const tempMessage = {
                id: Date.now(), // Temp ID
                content,
                user_id: authStore.user?.id,
                created_at: new Date().toISOString(),
                sender: authStore.user,
                pending: true
            }

            this.messages.push(tempMessage)

            try {
                const sentMessage = await api.post(`/api/chat/${this.activeConversation.id}/messages`, { content })

                // Replace temp message
                const index = this.messages.findIndex(m => m.id === tempMessage.id)
                if (index !== -1) {
                    this.messages[index] = sentMessage
                }
            } catch (error) {
                console.error('Error sending message:', error)
                // Handle error (remove temp message, show alert)
            }
        },

        async initChat() {
            if (this.conversations.length === 0) {
                await this.fetchConversations()
            }
            this.subscribeToAll()
        },

        subscribeToAll() {
            const { $echo } = useNuxtApp()
            const authStore = useAuthStore()

            this.conversations.forEach(conversation => {
                $echo.private(`chat.${conversation.id}`)
                    .listen('.MessageSent', (e: any) => {
                        console.log(`[Chat] Event on chat.${conversation.id}:`, e)

                        // Skip if this is our own message (already added optimistically)
                        if (e.message.user_id === authStore.user?.id) {
                            console.log('[Chat] Skipping own message from WebSocket')
                            return
                        }

                        // 1. If inside this chat, push to messages
                        if (this.activeConversation?.id === conversation.id) {
                            console.log('[Chat] Adding message to active conversation')
                            this.messages.push(e.message)
                            if (this.showChatWindow) {
                                this.markAsRead(conversation.id)
                            }
                        } else {
                            // 2. If outside, increment unread count
                            console.log('[Chat] Incrementing unread count')
                            const conv = this.conversations.find(c => c.id === conversation.id)
                            if (conv) {
                                conv.unread_count = (conv.unread_count || 0) + 1
                                conv.latest_message = e.message
                            }
                        }
                    })
            })
        },

        listenForMessages(conversationId: number) {
            // Already handled by subscribeToAll for now, 
            // but we can keep specific logic here if needed.
            // For now, let's rely on the global subscription to avoid duplicate listeners.
        },

        async markAsRead(conversationId: number) {
            try {
                // Find and update UI immediately
                const conv = this.conversations.find(c => c.id === conversationId)
                if (conv && conv.unread_count > 0) {
                    conv.unread_count = 0
                }

                // Call backend
                await api.post(`/api/chat/${conversationId}/read`)
            } catch (error) {
                console.error('Error marking as read:', error)
            }
        },

        async createConversation(userId: number) {
            try {
                // Check if already exists locally
                let conv = this.conversations.find(c => {
                    return !c.is_general && c.users?.some((u: any) => u.id === userId)
                })

                if (conv) {
                    await this.selectConversation(conv)
                    return
                }

                const response = await api.post('/api/chat/conversations', {
                    type: 'private',
                    user_id: userId
                })

                if (response) {
                    this.conversations.unshift(response)

                    // Subscribe to the new conversation's WebSocket channel
                    const { $echo } = useNuxtApp()
                    const authStore = useAuthStore()

                    $echo.private(`chat.${response.id}`)
                        .listen('.MessageSent', (e: any) => {
                            console.log(`[Chat] Event on new chat.${response.id}:`, e)

                            // Skip if this is our own message
                            if (e.message.user_id === authStore.user?.id) {
                                return
                            }

                            if (this.activeConversation?.id === response.id) {
                                this.messages.push(e.message)
                                if (this.showChatWindow) {
                                    this.markAsRead(response.id)
                                }
                            } else {
                                const conv = this.conversations.find(c => c.id === response.id)
                                if (conv) {
                                    conv.unread_count = (conv.unread_count || 0) + 1
                                    conv.latest_message = e.message
                                }
                            }
                        })

                    await this.selectConversation(response)
                }
            } catch (error) {
                console.error('Error creating conversation:', error)
                throw error
            }
        },

        async fetchUsers() {
            // Fetch users capable of chatting (e.g. teachers, admins)
            // This endpoint might need to be adjusted based on backend availability
            try {
                // Using a generic endpoint for now, user might need to specify
                const data = await api.get('/api/users/chat-candidates') // or similar
                return data
            } catch (error) {
                console.error('Error fetching users:', error)
                return []
            }
        },

        toggleChatWindow() {
            this.showChatWindow = !this.showChatWindow
        }
    }
})
