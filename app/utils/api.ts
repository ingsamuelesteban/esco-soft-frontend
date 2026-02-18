/**
 * Wrapper para $fetch que automáticamente incluye token de autenticación
 */
export async function apiCall<T = any>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
  const config = useRuntimeConfig()

  // Preparar headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }

  // Solo agregar Content-Type json si NO es FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (process.client) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Tenencia por URL: Inyectar tenant ID si existe y la ruta no es global
    const tenantId = localStorage.getItem('selected_tenant_id')
    const globalRoutes = [
      '/login',
      '/api/login',
      '/change-required-password',
      '/api/change-required-password',

      '/me',
      '/api/me',
      '/logout',
      '/api/logout',
      '/logout-all',
      '/api/logout-all',
      '/profile',
      '/api/profile',
      '/sanctum/csrf-cookie',
      '/tenants',
      '/api/tenants',
      '/storage'
    ]

    // Check if URL triggers isGlobal
    // Be careful: /api/notifications should not match /api logic if we want to inject tenant!
    const isGlobal = globalRoutes.some(route => url === route || url.startsWith(route + '/'))

    if (tenantId && !isGlobal && !url.startsWith('http')) {
      // Clean leading slashes
      const cleanPath = url.startsWith('/') ? url.substring(1) : url;

      // If it already starts with 'api/', inject tenant after 'api/'
      if (cleanPath.startsWith('api/')) {
        // e.g. api/notifications -> api/2/notifications
        url = `api/${tenantId}/${cleanPath.substring(4)}`
      }
      // If it doesn't start with 'api/' (e.g. 'notifications'), assumig it is relative
      // The current backend structure expects /api/{tenant}/...
      // BUT if we use useRuntimeConfig().public.apiBase (which usually includes /api),
      // we might just need to prepend the tenant ID if the endpoint is NOT under /api explicitly in the call?
      // Actually usually API calls are like '/api/resource'.
      // So let's stick to injecting after 'api/'.

      // What if the user calls '/notifications'? 
      // We should probably convert it to `api/${tenantId}/notifications` IF the base url doesn't have it?
      // Let's assume input URLs usually start with /api/ or api/

      else {
        // Fallback for paths without explicit 'api/' prefix if that ever happens
        // e.g. 'dashboard/stats' -> '{tenantId}/dashboard/stats' ? or 'api/{tenantId}/...'?
        // Safest is to inject at root if no api prefix found, assuming tenant prefix is at root of grouped routes
        // Prepend api/ to matching the standard API route structure: api/{tenantId}/resource
        url = `api/${tenantId}/${cleanPath}`
      }

      // Ensure leading slash for consistency if original had it or if we want absolute path from base
      if (!url.startsWith('/')) {
        url = '/' + url
      }
    }
  }

  // Usar baseURL del config si URL es relativa
  const fullUrl = url.startsWith('http') ? url : `${config.public.apiBase}${url}`

  return $fetch<T>(fullUrl, {
    ...options,
    headers,
    // Forzar que $fetch siempre parsee como JSON, a menos que se especifique lo contrario
    responseType: (options.responseType as any) || 'json',
    onResponse({ response }) {
      // Si esperamos un blob, no intentamos parsear errores como JSON structurado del backend
      if (options.responseType === 'blob') {
        if (!response.ok) {
          // Si falla (ej 404), igual lanzamos error
          throw new Error('Error descargando archivo')
        }
        return
      }

      // Verificar si hay errores en el cuerpo, incluso si el status es 200
      if (response._data && (response._data.errors || response._data.error)) {
        const error = new Error(response._data.message || 'Error en la petición')
        // Forzar status 422 si es 200 para que el catch lo procese como error de validación
        const status = response.status >= 200 && response.status < 300 ? 422 : response.status
        Object.assign(error, { data: response._data, statusCode: status, status: status })
        throw error
      }
    },
    onResponseError({ response }) {
      // Manejo global de 401: Redirigir al login si la sesión expiró
      if (response.status === 401) {
        if (process.client) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('selected_tenant_id')
          window.location.href = '/login'
        }
      }

      // Manejo global de 403 (Bloqueo de usuario): Redirigir al login
      if (response.status === 403) {
        const msg = response._data?.message || '';
        if (msg.includes('Acceso bloqueado temporalmente')) {
          // Redirigir a página de bloqueo sin cerrar sesión
          if (window.location.pathname !== '/blocked') {
            window.location.href = '/blocked'
          }
        }
      }

      if (options.responseType === 'blob') {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      // Asegurar que el error se lance con la data correcta
      const error = new Error(response._data?.message || 'Error en la petición')
      Object.assign(error, { data: response._data, statusCode: response.status, status: response.status })
      throw error
    }
  })
}

/**
 * Helper functions for common HTTP methods
 */
export const api = {
  get: <T = any>(url: string, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<T>(url, { ...options, method: 'POST', body }),

  put: <T = any>(url: string, body?: any, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<T>(url, { ...options, method: 'PUT', body }),

  patch: <T = any>(url: string, body?: any, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T = any>(url: string, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<T>(url, { ...options, method: 'DELETE' }),

  getBlob: (url: string, options?: Parameters<typeof $fetch>[1]) =>
    apiCall<Blob>(url, { ...options, method: 'GET', responseType: 'blob' }),
}