export default defineNuxtPlugin(async () => {
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()

  // Solo inicializar si no estamos en la página de login para evitar loops
  const route = useRoute()
  if (route.path !== '/login') {
    // Inicializar autenticación al cargar la app
    await authStore.initializeAuth()
  }
})