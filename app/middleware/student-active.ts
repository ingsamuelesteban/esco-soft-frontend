import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        const authStore = useAuthStore()

        // Si es estudiante y es pre-admitido, no puede entrar
        if (authStore.user?.role === 'estudiante' && authStore.user?.is_preadmitted) {
            console.warn('Acceso denegado: Estudiante pre-admitido intentó acceder a una ruta restringida.')
            return navigateTo('/student/dashboard')
        }
    }
})
