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
      '/change-required-password',
      '/estudiantes',
      '/me',
      '/logout',
      '/logout-all',
      '/profile',
      '/sanctum/csrf-cookie',
      '/sanctum/csrf-cookie',
      '/tenants',
      '/api/tenants'
    ]

    // Check if URL matches any global route (exact or start)
    const isGlobal = globalRoutes.some(route => url === route || url.startsWith(route + '/'))

    if (tenantId && !isGlobal) {
      if (url.startsWith('/api/')) {
        // Ejemplo: /api/menu -> /api/2/menu
        url = `/api/${tenantId}${url.substring(4)}`
      } else if (url.startsWith('api/')) {
        // Ejemplo: api/menu -> api/2/menu
        url = `api/${tenantId}${url.substring(3)}`
      } else if (!url.startsWith('http')) {
        // Si no tiene prefijo api, lo inyectamos al principio si asumimos que va a la API
        // Ejemplo: /menu -> /2/menu (esto estaba causando el error)
        // Pero si el backend espera /api/2/menu, el baseURL debe manejar el api prefix
        // O debemos inyectarlo.
        // Asumiendo que las llamadas relativas son recursos API:
        // url = `/${tenantId}${url.startsWith('/') ? url : '/' + url}`

        // CORRECCIÓN: Si el baseURL ya tiene /api, entonces /2/menu resulta en .../api/2/menu
        // El error previo fue "The route 2/api/menu could not be found". 
        // Eso significa que la URL final fue .../2/api/menu.

        // Si url era '/api/menu', mi código anterior hizo '/2/api/menu'.
        // Con este cambio de arriba (startsWith /api/), eso se arregla.

        // Si url NO empieza con api... dejemos la lógica simple de prepender,
        // asumiendo que el baseURL se encarga del resto o que la ruta es relativa al root.
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url
        url = `/${tenantId}/${cleanUrl}`
      }
    }
  }

  // Usar baseURL del config si URL es relativa
  const fullUrl = url.startsWith('http') ? url : `${config.public.apiBase}${url}`

  return $fetch<T>(fullUrl, {
    ...options,
    headers,
    // Forzar que $fetch siempre parsee como JSON
    responseType: 'json',
    onResponse({ response }) {
      // Verificar si hay errores en el cuerpo, incluso si el status es 200
      if (response._data && (response._data.errors || response._data.error)) {
        const error = new Error(response._data.message || 'Error en la petición')
        // Forzar status 422 si es 200 para que el catch lo procese como error de validación
        const status = response.status >= 200 && response.status < 300 ? 422 : response.status
        Object.assign(error, { data: response._data, statusCode: status })
        throw error
      }

      if (!response.ok) {
        // Fallback por si no entró en el if anterior
        // En Nuxt 3/OhMyFetch, esto usualmente ya lanza error, 
        // pero podemos asegurarnos o formatear el error aquí si es necesario.
      }
    },
    onResponseError({ response }) {
      // Asegurar que el error se lance con la data correcta
      const error = new Error(response._data?.message || 'Error en la petición')
      Object.assign(error, { data: response._data, statusCode: response.status })
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
}