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
</script>
