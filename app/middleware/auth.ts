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