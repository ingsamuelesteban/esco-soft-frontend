<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <!-- Copyright -->
        <div class="text-sm text-gray-500">
          © {{ currentYear }} <span class="font-semibold text-gray-700">EscoSoft</span>. Todos los derechos reservados,
          Ing. Samuel Esteban.
        </div>

        <!-- Links y versión -->
        <div class="flex items-center space-x-6 text-sm text-gray-500">
          <a href="#" class="hover:text-primary-600 transition-colors">Soporte</a>
          <a href="#" class="hover:text-primary-600 transition-colors">Documentación</a>
          <span class="text-xs">v1.0.0</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
