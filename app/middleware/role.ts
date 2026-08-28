import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Solo verificar en cliente
  if (process.client) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated || !authStore.user) {
      return navigateTo('/login')
    }

    try {
      const userRole = authStore.user.role
      const roles = authStore.user.roles || []

      // Verificar rol para rutas administrativas
      checkAdminAccess(to.path, userRole, roles)
    } catch (e) {
      // Si checkAdminAccess lanza error (403), Nuxt lo maneja
      throw e
    }
  }
})

function checkAdminAccess(path: string, userRole: string, roles: any[] = []) {
  // Rutas que pueden acceder todos los usuarios autenticados
  const publicRoutes = [
    '/',
    '/login',
    '/dashboard',
    '/calificaciones',
    '/horarios/en-vivo',
    '/display/horario'
  ]

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.includes(path)) {
    return
  }

  // Rutas que requieren rol de administrador
  const adminOnlyRoutes = [
    '/estudiantes',
    '/profesores',
    '/personal',
    '/aulas',
    '/materias',
    '/titulos',
    '/familias-profesionales',
    '/horarios',
    '/asignaciones',
    '/horario-general',
    '/settings'
  ]

  // Verificar si la ruta requiere permisos de admin
  const requiresAdmin = adminOnlyRoutes.some(route => path.startsWith(route))

  const hasRole = (role) => {
    if (userRole === role) return true;
    return roles.some(r => r.name === role);
  };

  // Excepción: Permitir acceso a Horarios por Profesor para profesores
  // aunque /horarios esté restringido
  // Usamos startsWith para cubrir rutas hijas o trailing slashes
  if (path.startsWith('/horarios/profesores') && (hasRole('profesor') || hasRole('admin') || hasRole('master'))) {
    return
  }

  // Si es master, tiene acceso a todo (skip admin check)
  if (hasRole('master')) {
    return
  }

  if (requiresAdmin && !hasRole('admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permisos para acceder a esta página. Esta función es solo para administradores.'
    })
  }
}