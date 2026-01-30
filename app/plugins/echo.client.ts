import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { api } from '~/utils/api'

declare global {
    interface Window {
        Pusher: any
        Echo: any
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    if (process.server) return

    window.Pusher = Pusher

    const config = useRuntimeConfig()

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'reverbappkey',
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: config.public.apiBase + '/api/broadcasting/auth',
        auth: {
            headers: {
                Accept: 'application/json',
            }
        },
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    api.post('api/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                        .then(response => {
                            callback(null, response as any)
                        })
                        .catch(error => {
                            callback(error, null)
                        })
                }
            }
        }
    })

    return {
        provide: {
            echo: window.Echo
        }
    }
})

declare module '#app' {
    interface NuxtApp {
        $echo: Echo<'reverb'>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $echo: Echo<'reverb'>
    }
}

