<template>
  <Transition name="fade-slide">
    <div
      v-if="needsUpdate"
      class="fixed bottom-6 right-6 z-[9999] max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-blue-500/20 dark:border-blue-500/40 p-4 flex items-start gap-4 transition-all duration-300 transform hover:scale-[1.02]"
      role="alert"
    >
      <!-- Icono Animado de Actualización -->
      <div class="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 animate-spin-slow">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
        </svg>
      </div>

      <!-- Contenido del Mensaje -->
      <div class="flex-1">
        <h4 class="font-bold text-sm text-gray-900 dark:text-gray-50">¡Actualización Disponible!</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Una nueva versión de EscoSoft está lista. Actualiza ahora para disfrutar de las últimas mejoras y correcciones.
        </p>
        <div class="flex gap-3 mt-3">
          <button
            @click="reloadApp"
            class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
          >
            Actualizar ahora
          </button>
          <button
            @click="dismissBanner"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium px-2 py-1.5 transition-colors cursor-pointer"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { needsUpdate } = useVersionCheck()

const reloadApp = async () => {
  try {
    // Consultar la versión más reciente del servidor antes de recargar para no mostrar el banner de nuevo
    const response = await fetch(`/version.json?t=${Date.now()}`)
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('escosoft_version', data.version)
    }
  } catch (error) {
    console.error('Error al actualizar localStorage antes de recarga:', error)
  }

  // Recarga forzada de página
  window.location.reload()
}

const dismissBanner = () => {
  // Ocultar temporalmente en el estado actual sin actualizar la versión para permitir que sigan operando
  needsUpdate.value = false
}
</script>

<style scoped>
/* Transición elegante */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
