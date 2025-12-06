<template>
  <div>
    <!-- Redirigir automáticamente a la página principal -->
  </div>
</template>

<script setup lang="ts">
// Definir el middleware de autenticación
definePageMeta({
  middleware: 'auth' // Requiere autenticación
})

// Redirigir inmediatamente a la página principal
await navigateTo('/', { replace: true })
</script>