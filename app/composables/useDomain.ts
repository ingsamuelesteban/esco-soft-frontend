export const useDomain = () => {
  const config = useRuntimeConfig()
  const url = useRequestURL()
  const hostname = computed(() => url.hostname)

  const isMainDomain = computed(() => {
    // Es dominio principal si es exactamente localhost o escosoft.online (sin subdominio)
    return hostname.value === 'localhost' || hostname.value === 'escosoft.online'
  })

  const subdomain = computed(() => {
    const rawHostname = hostname.value
    if (!rawHostname) return null
    
    const parts = rawHostname.split('.')
    console.log('[DEBUG useDomain] hostname:', rawHostname, 'parts:', parts.length)

    // Caso: pnsa.localhost (length 2)
    if (rawHostname.endsWith('.localhost') && parts.length >= 2) {
      console.log('[DEBUG useDomain] Detected localhost subdomain:', parts[0])
      return parts[0]
    }
    // Caso: colegio.escosoft.online (length 3)
    if (parts.length >= 3) {
      console.log('[DEBUG useDomain] Detected production subdomain:', parts[0])
      return parts[0]
    }
    console.log('[DEBUG useDomain] No subdomain detected')
    return null
  })

  const isPublicSite = computed(() => {
    const sub = subdomain.value
    const isPublic = !!sub && hostname.value !== 'api.escosoft.online' && sub !== 'www'
    console.log('[DEBUG useDomain] isPublicSite:', isPublic, '| subdomain:', sub)
    return isPublic
  })

  return {
    hostname,
    subdomain,
    isMainDomain,
    isPublicSite
  }
}
