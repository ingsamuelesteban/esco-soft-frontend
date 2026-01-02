import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (to.path === '/login' && authStore.isAuthenticated) {
    if (authStore.user?.role === 'estudiante') {
      return navigateTo('/student/dashboard')
    }
    return navigateTo('/')
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Protect /student routes
  if (to.path.startsWith('/student') && authStore.user?.role !== 'estudiante') {
    return navigateTo('/')
  }

  // Protect admin routes from students
  if (!to.path.startsWith('/student') && authStore.user?.role === 'estudiante' && to.path !== '/login') {
    return navigateTo('/student/dashboard')
  }
})