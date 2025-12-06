/**
 * Composable para manejar CSRF protection con Laravel Sanctum
 * TEMPORALMENTE DESHABILITADO - Solo funciones stub para evitar errores
 * Se reactivará una vez que el login básico funcione correctamente
 */
export const useCsrf = () => {
  /**
   * Inicializa el token CSRF haciendo una petición al endpoint de Sanctum
   * Laravel automáticamente establecerá la cookie XSRF-TOKEN
   * TEMPORALMENTE DESHABILITADO
   */
  const initializeCsrf = async (): Promise<void> => {
    // TODO: Reactivar cuando el login básico funcione
  }

  /**
   * Verifica si es necesario inicializar el CSRF token
   * Laravel Sanctum maneja esto automáticamente con las cookies
   * TEMPORALMENTE DESHABILITADO
   */
  const ensureCsrfToken = async (): Promise<void> => {
    // TODO: Reactivar cuando el login básico funcione
  }

  return {
    initializeCsrf,
    ensureCsrfToken
  }
}