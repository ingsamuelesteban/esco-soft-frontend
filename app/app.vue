<template>
  <!-- Nuxt official loading indicator -->
  <NuxtLoadingIndicator color="linear-gradient(90deg, #3b82f6, #60a5fa)" :height="3" :throttle="0" />

  <!-- Global API loading bar -->
  <GlobalLoadingBar />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.initActivityTracker()
  }
})

// Watch for auth changes (e.g. login) to start tracker
watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) {
    authStore.initActivityTracker()
  } else {
    authStore.stopActivityTracker()
  }
})

// Handle window close / refresh to mark offline
const handleBeforeUnload = () => {
  if (authStore.isAuthenticated && authStore.token) {
    // We use fetch with keepalive: true to ensure the request is sent even if the page unloads
    // We cannot use the 'api' wrapper because it might rely on Nuxt context which is closing
    // Construct the URL manually. Assuming public runtime config or hardcoded for now relative to origin if same domain
    // If backend is on different domain, we need the full URL. 
    // Usually api.defaults.baseURL or similar.
    // Let's assume /api/v1 or just /api proxy.
    
    // Careful: accessing store state inside event listener.
    const token = authStore.token
    
    // Determine API Base URL. 
    // If we are served from same origin (likely if nuxt proxy), use relative.
    // Ideally we get this from config.
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || '/api' 
    
    // Retrieve correct tenant context if needed. The route is /{tenant}/user/offline
    // If we are in a tenant context, we need that prefix.
    const user: any = authStore.user
    
    // Actually our route is /{context_tenant}/user/offline.
    // We can try to get it from current route params or store.
    
    // Safer: Just hit the logout endpoint? No, we created specific offline endpoint.
    // Let's use the standard logout route or our new one.
    
    // Issue: The route requires {context_tenant}.
    // If user is global master, context is 'central'.
    // If user is tenant user, context is their tenant.
    // Let's rely on authStore.user.tenant?.id or fallback.
    
    let context: string | number = 'central'
    if (authStore.tenant) {
        context = authStore.tenant.id
    } else if (user?.tenant_id) {
        context = user.tenant_id
    }
    
    const url = `${baseURL}/${context}/user/offline`
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      keepalive: true
    }).catch(err => console.error('Offline signal failed', err))
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.initActivityTracker()
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
