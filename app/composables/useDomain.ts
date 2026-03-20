export const useDomain = () => {
  const config = useRuntimeConfig()
  const url = useRequestURL()
  const hostname = computed(() => url.hostname)

  // Debug logs de la URL real en el cliente
  if (process.client) {
    console.log('[DEBUG useDomain] FULL URL (HREF):', window.location.href)
    console.log('[DEBUG useDomain] HOSTNAME:', window.location.hostname)
  }

  const isMainDomain = computed(() => {
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
      console.log('[DEBUG useDomain] SUBDOMINIO DETECTADO:', parts[0])
      return parts[0]
    }

    return null
  })

  const isPublicSite = computed(() => {
    const sub = subdomain.value
    const isPublic = !!sub
    console.log('[DEBUG useDomain] isPublicSite:', isPublic, '| subdomain:', sub)
    return isPublic
  })

  return {
    hostname,
    subdomain,
    isPublicSite,
    isMainDomain
  }
}
