export default defineNuxtRouteMiddleware((to, from) => {
  // Solo verificar en cliente
  if (process.client) {
    const authData = localStorage.getItem('auth')
    if (!authData) {
      return navigateTo('/login')
    }
    
    try {
      const auth = JSON.parse(authData)
      const userRole = auth.user?.role
      
      // Verificar rol para rutas administrativas
      checkAdminAccess(to.path, userRole)
    } catch (e) {
      return navigateTo('/login')
    }
  }
})

function checkAdminAccess(path: string, userRole: string) {
  // Rutas que pueden acceder todos los usuarios autenticados
  const publicRoutes = [
    '/', 
    '/login', 
    '/dashboard',
    '/calificaciones',
    '/horarios/en-vivo'
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
  
  if (requiresAdmin && userRole !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permisos para acceder a esta página. Esta función es solo para administradores.'
    })
  }
}