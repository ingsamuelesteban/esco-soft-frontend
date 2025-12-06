export const useRoleGuard = () => {
  const checkAdminAccess = () => {
    if (process.client) {
      const authData = localStorage.getItem('auth')
      if (!authData) {
        throw createError({
          statusCode: 401,
          statusMessage: 'No autorizado'
        })
      }
      
      try {
        const auth = JSON.parse(authData)
        if (auth.user?.role !== 'admin') {
          throw createError({
            statusCode: 403,
            statusMessage: 'No tienes permisos para acceder a esta página. Esta función es solo para administradores.'
          })
        }
      } catch (e) {
        throw createError({
          statusCode: 403,
          statusMessage: 'No tienes permisos para acceder a esta página.'
        })
      }
    }
  }

  return {
    checkAdminAccess
  }
}