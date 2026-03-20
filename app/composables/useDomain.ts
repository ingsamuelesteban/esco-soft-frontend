export const useDomain = () => {
  const config = useRuntimeConfig()
  const hostname = ref('')
  
  if (process.client) {
    hostname.value = window.location.hostname
  }

  const isMainDomain = computed(() => {
    // Es dominio principal si es exactamente localhost o escosoft.online (sin subdominio)
    return hostname.value === 'localhost' || hostname.value === 'escosoft.online'
  })

  const subdomain = computed(() => {
    if (!hostname.value) return null
    
    const parts = hostname.value.split('.')
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
    // Si hay un subdominio y no es el dominio principal directo
    return !!subdomain.value && hostname.value !== 'api.escosoft.online'
  })

  return {
    hostname,
    subdomain,
    isMainDomain,
    isPublicSite
  }
}
