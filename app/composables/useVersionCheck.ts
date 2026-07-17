import { ref } from 'vue'

export const useVersionCheck = () => {
  const needsUpdate = useState<boolean>('needsUpdate', () => false)
  const currentVersion = useState<string>('currentVersion', () => '')

  const checkVersion = async () => {
    try {
      // Evitar la caché del navegador añadiendo un query param dinámico
      const response = await fetch(`/version.json?t=${Date.now()}`)
      if (!response.ok) return
      
      const data = await response.json()
      const serverVersion = data.version

      if (!currentVersion.value) {
        // Inicialización en el primer montaje
        currentVersion.value = serverVersion
        const local = localStorage.getItem('escosoft_version')
        if (!local) {
          localStorage.setItem('escosoft_version', serverVersion)
        } else if (local !== serverVersion) {
          // El usuario tenía una versión vieja guardada en localStorage
          needsUpdate.value = true
        }
      } else if (serverVersion !== currentVersion.value) {
        // Nueva versión detectada con la app abierta
        needsUpdate.value = true
      }
    } catch (error) {
      console.error('Error al verificar la versión de EscoSoft:', error)
    }
  }

  return {
    needsUpdate,
    currentVersion,
    checkVersion
  }
}
