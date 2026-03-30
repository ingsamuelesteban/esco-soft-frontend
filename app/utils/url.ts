/**
 * Normaliza una URL o ruta de archivo para que sea accesible desde el frontend,
 * prefijándola con el apiBase si es necesario y manejando URLs completas 
 * de diferentes entornos.
 */
export function normalizeUrl(url: string | undefined | null): string {
  if (!url) return ''
  
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string).replace(/\/$/, '')

  // Si ya es una URL completa
  if (url.startsWith('http')) {
    // Normalizar dominios conocidos al apiBase actual para evitar problemas de CORS o puertos
    // Esta lista debe coincidir con lo que el backend pueda devolver en diferentes entornos
    const domainsToReplace = [
      'localhost:8010',
      '127.0.0.1:8010',
      'localhost:8000',
      '127.0.0.1:8000',
      'escosoft.online',
      'api.escosoft.online'
    ]
    
    let normalized = url
    for (const domain of domainsToReplace) {
      if (normalized.includes(domain)) {
        // Reemplazar el protocolo y dominio por apiBase
        normalized = normalized.replace(new RegExp(`https?://${domain.replace(/\./g, '\\.')}`), apiBase)
        break
      }
    }
    return normalized
  }

  // Si es una ruta relativa, prefijarla con apiBase
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${apiBase}${cleanPath}`
}
