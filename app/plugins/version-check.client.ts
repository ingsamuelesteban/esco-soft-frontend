export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const { checkVersion } = useVersionCheck()

  nuxtApp.hooks.hook('app:mounted', () => {
    // Verificación inicial inmediata al montar la aplicación
    checkVersion()

    // Intervalo de verificación cada 10 minutos (600,000 milisegundos)
    const interval = setInterval(checkVersion, 10 * 60 * 1000)

    // Asegurar la liberación de recursos al destruir el entorno
    window.addEventListener('beforeunload', () => {
      clearInterval(interval)
    })
  })

  // Verificación en cada cambio de ruta después de cargar
  router.afterEach(() => {
    checkVersion()
  })
})
