<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Overlay para móvil -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
        @click="closeSidebar"
      ></div>
    </Transition>

    <!-- Sidebar para móvil -->
    <Transition
      enter-active-class="transition duration-300 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isSidebarOpen"
        class="fixed inset-y-0 left-0 w-64 z-40 md:hidden"
      >
        <EscosoftAside @close-sidebar="closeSidebar" />
      </aside>
    </Transition>

    <!-- Layout principal -->
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar desktop -->
      <aside class="hidden md:flex md:flex-shrink-0">
        <div class="w-64">
          <EscosoftAside @close-sidebar="closeSidebar" />
        </div>
      </aside>

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
  <EscosoftNav @toggle-sidebar="toggleSidebar" />

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto bg-gray-50">
          <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <slot />
          </div>
        </main>

        <!-- Footer -->
  <EscosoftFooter />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

