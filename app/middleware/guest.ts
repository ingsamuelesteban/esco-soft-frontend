import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Si ya está autenticado, redirigir al dashboard (página principal)
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})