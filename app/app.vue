<template>
  <!-- Nuxt official loading indicator -->
  <NuxtLoadingIndicator color="linear-gradient(90deg, #3b82f6, #60a5fa)" :height="3" :throttle="0" />

  <!-- Global API loading bar -->
  <GlobalLoadingBar />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
