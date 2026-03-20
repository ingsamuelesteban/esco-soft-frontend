export const useDomain = () => {
  const config = useRuntimeConfig()
  const url = useRequestURL()
  const hostname = computed(() => url.hostname)

  const isMainDomain = computed(() => {
    // Es dominio principal si es exactamente localhost o escosoft.online (sin subdominio)
    const rawHost = hostname.value || ''
    return rawHost === 'localhost' || rawHost === 'escosoft.online' || rawHost === 'www.escosoft.online'
  })

  const subdomain = computed(() => {
    const rawHostname = hostname.value
    if (!rawHostname) return null
    
    const parts = rawHostname.split('.')
    
    // Caso: localhost subdomains (pnsa.localhost)
    if (rawHostname.endsWith('.localhost') && parts.length >= 2) {
      return parts[0]
    }

    // Caso: produccion (ej. pnsa.escosoft.online)
    // Si tiene 3 partes y no es el dominio base ww.escosoft.online
    if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api') {
      return parts[0]
    }

    return null
  })

  const isPublicSite = computed(() => {
    return !!subdomain.value
  })

  return {
    hostname,
    subdomain,
    isPublicSite,
    isMainDomain
  }
}
