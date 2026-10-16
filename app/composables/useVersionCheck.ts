export const useVersionCheck = () => {
  const needsUpdate = useState<boolean>('needsUpdate', () => false)
  const currentVersion = useState<string>('currentVersion', () => '')
  const remoteVersion = useState<string>('remoteVersion', () => '')

  /** Consulta version.json saltando caché del navegador, del SW y de proxies/CDN. */
  const fetchRemoteVersion = async (): Promise<string | null> => {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.version ? String(data.version) : null
  }

  /**
   * Solo DETECTA diferencias de versión y activa el aviso. Nunca recarga la página.
   */
  const checkVersion = async () => {
    try {
      const serverVersion = await fetchRemoteVersion()
      if (!serverVersion) return
      remoteVersion.value = serverVersion

      if (!currentVersion.value) {
        // Primer montaje: sincronizar el estado local
        const local = localStorage.getItem('escosoft_version')
        if (!local) {
          localStorage.setItem('escosoft_version', serverVersion)
          currentVersion.value = serverVersion
        } else {
          currentVersion.value = local
        }
      }

      needsUpdate.value = serverVersion !== currentVersion.value
    } catch (error) {
      console.error('Error al verificar la versión de EscoSoft:', error)
    }
  }

  /**
   * Única vía de recarga: se invoca solo por clic deliberado del usuario en "Actualizar ahora".
   */
  const applyUpdate = async () => {
    try {
      const latest = (await fetchRemoteVersion()) || remoteVersion.value
      if (latest) {
        localStorage.setItem('escosoft_version', latest)
        currentVersion.value = latest
      }
    } catch (error) {
      console.error('Error al actualizar la versión local antes de recargar:', error)
    }

    needsUpdate.value = false

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        await registration?.update().catch(() => {})
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (error) {
      console.warn('No se pudo notificar al Service Worker', error)
    }

    window.location.reload()
  }

  return {
    needsUpdate,
    currentVersion,
    remoteVersion,
    checkVersion,
    applyUpdate
  }
}
