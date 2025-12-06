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

  // Añadir token si está disponible (solo en client-side)
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  // Usar baseURL del config si URL es relativa
  const fullUrl = url.startsWith('http') ? url : `${config.public.apiBase}${url}`

  return $fetch<T>(fullUrl, {
    ...options,
    headers,
    // Forzar que $fetch siempre parsee como JSON
    responseType: 'json'
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