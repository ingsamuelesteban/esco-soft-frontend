import { useAuthStore } from '../stores/auth'
import { useDomain } from '../composables/useDomain'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const { isPublicSite } = useDomain()

  // Si es un sitio público (subdominio) y vamos a la raíz o a una página de noticias pública, NO redirigir a login
  const isPublicRoute = to.path === '/' || to.path.startsWith('/noticias/')
  
  console.log('[DEBUG auth middleware] path:', to.path, '| isPublicSite:', isPublicSite.value, '| isPublicRoute:', isPublicRoute)

  if (to.path === '/login' && authStore.isAuthenticated) {
    if (authStore.user?.role === 'estudiante') {
      return navigateTo('/student/dashboard')
    }
    return navigateTo('/')
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    if (isPublicSite.value && isPublicRoute) {
      console.log('[DEBUG auth middleware] Public access allowed')
      return // Permitir acceso
    }
    console.log('[DEBUG auth middleware] Redirecting to /login')
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

  // Protect all /admin routes from non-administrative users
  if (to.path.startsWith('/admin')) {
    const nonAdminRoles = ['estudiante', 'padre', 'profesor'];
    if (authStore.user && nonAdminRoles.includes(authStore.user.role)) {
      // Redirect teachers to their dashboard, otherwise home
      if (authStore.user.role === 'profesor') {
        return navigateTo('/dashboard');
      }
      return navigateTo('/');
    }
  }
})