export const useDomain = () => {
  const config = useRuntimeConfig()
  const url = useRequestURL()
  const hostname = computed(() => url.hostname)

  const isMainDomain = computed(() => {
    // Es dominio principal si es exactamente localhost o escosoft.online (sin subdominio)
    return hostname.value === 'localhost' || hostname.value === 'escosoft.online'
  })

  const subdomain = computed(() => {
    if (!hostname.value) return null
    
    const parts = hostname.value.split('.')
    console.log('DEBUG [useDomain]: hostname =', hostname.value, 'parts =', parts.length)

    // Caso: pnsa.localhost (length 2)
    if (hostname.value.endsWith('.localhost') && parts.length >= 2) {
      return parts[0]
    }
    // Caso: colegio.escosoft.online (length 3)
    if (parts.length >= 3) {
      return parts[0]
    }
    return null
  })

  const isPublicSite = computed(() => {
    const sub = subdomain.value
    const isPublic = !!sub && hostname.value !== 'api.escosoft.online' && sub !== 'www'
    console.log('DEBUG [useDomain]: isPublicSite =', isPublic, 'subdomain =', sub)
    return isPublic
  })

  return {
    hostname,
    subdomain,
    isMainDomain,
    isPublicSite
  }
}
