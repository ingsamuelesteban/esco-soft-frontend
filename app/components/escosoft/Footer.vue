<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <!-- Copyright -->
        <div class="text-sm text-gray-500 dark:text-gray-400">
          © 2026 <span class="font-semibold text-gray-700 dark:text-gray-300">EscoSoft</span>. Todos los derechos reservados, Ing. Samuel
          Esteban.
        </div>

        <!-- Links y versión -->
        <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Soporte</a>
          <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Documentación</a>
          <span class="text-xs">v2.0.0</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
