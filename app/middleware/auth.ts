import { useAuthStore } from '../stores/auth'
import { useDomain } from '../composables/useDomain'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const { isPublicSite } = useDomain()

  const savedToken = process.client ? localStorage.getItem('auth_token') : null
  const activeToken = authStore.token || savedToken
  const isTokenValid = Boolean(
    activeToken &&
    typeof activeToken === 'string' &&
    activeToken.trim().length > 10 &&
    activeToken !== 'null' &&
    activeToken !== 'undefined'
  )

  const hasValidSession = Boolean(
    authStore.isAuthenticated &&
    authStore.user &&
    authStore.user.id &&
    isTokenValid
  )

  if (!hasValidSession && (authStore.isAuthenticated || authStore.token || savedToken)) {
    authStore.clearTokens()
  }

  if (to.path === '/login') {
    if (!hasValidSession) {
      return
    }
    if (from?.matched?.length && to.path === from.path) {
      return
    }
    if (authStore.user?.role === 'display_horario') {
      return navigateTo('/display/horario')
    }
    if (authStore.user?.role === 'estudiante') {
      return navigateTo('/student/dashboard')
    }
    return navigateTo('/')
  }

  // Kiosk isolation
  if (authStore.user?.role === 'display_horario') {
    if (to.path !== '/display/horario' && to.path !== '/login') {
      return navigateTo('/display/horario')
    }
  }

  // Si es un sitio público (subdominio) y vamos a la raíz o a una página de noticias pública, NO redirigir a login
  const isPublicRoute = to.path === '/' || to.path.startsWith('/noticias/')
  
  if (to.path !== '/login' && !hasValidSession) {
    if (isPublicSite.value && isPublicRoute) {
      return // Permitir acceso
    }
    return navigateTo('/login')
  }

  // Protect /student routes
  if (to.path.startsWith('/student') && authStore.user?.role !== 'estudiante') {
    return navigateTo('/')
  }

  const hasAdminOverride = () => {
    if (!authStore.user) return false;
    const roles = authStore.user.roles || [];
    return roles.some(r => ['master', 'admin', 'soporte_tecnico'].includes(r.name));
  };

  // Protect admin routes from students
  if (!to.path.startsWith('/student') && authStore.user?.role === 'estudiante' && to.path !== '/login') {
    if (!hasAdminOverride()) {
      return navigateTo('/student/dashboard')
    }
  }

  // Protect all /admin routes from non-administrative users
  if (to.path.startsWith('/admin')) {
    const nonAdminRoles = ['estudiante', 'padre', 'profesor'];
    if (authStore.user && nonAdminRoles.includes(authStore.user.role)) {
      if (!hasAdminOverride()) {
        // Redirect teachers to their dashboard, otherwise home
        if (authStore.user.role === 'profesor') {
          return navigateTo('/dashboard');
        }
        return navigateTo('/');
      }
    }
  }
})