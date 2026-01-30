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
    const reverbConfig = config.public.reverb as { appKey: string, host: string, port: string, scheme: string }

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbConfig.appKey,
        wsHost: reverbConfig.host,
        wsPort: parseInt(reverbConfig.port),
        wssPort: parseInt(reverbConfig.port),
        forceTLS: reverbConfig.scheme === 'https',
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

