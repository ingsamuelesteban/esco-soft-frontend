import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

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

  // Si el token está ausente, malformado o la sesión está incompleta, eliminar credenciales residuales en lugar de redirigir
  if (!hasValidSession) {
    if (authStore.isAuthenticated || authStore.token || savedToken) {
      authStore.clearTokens()
    }
    return
  }

  // No ejecutar redirecciones si to.path === from.path (navegación redundante)
  if (from?.matched?.length && to.path === from.path) {
    return
  }

  const role = authStore.user?.role?.toLowerCase() || ''
  let targetPath = '/'
  if (role === 'display_horario') {
    targetPath = '/display/horario'
  } else if (role === 'estudiante') {
    targetPath = '/student/dashboard'
  }

  if (to.path !== targetPath) {
    return navigateTo(targetPath)
  }
})