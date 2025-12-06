<template>
  <transition name="glb-fade">
    <div v-if="ui.loading" class="glb-bar"></div>
  </transition>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/ui'
const ui = useUiStore()
</script>

<style scoped>
.glb-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  z-index: 2147483647;
  /* on top of everything */
  box-shadow: 0 0 10px #3b82f6, 0 0 5px #3b82f6;
}

.glb-fade-enter-active,
.glb-fade-leave-active {
  transition: opacity 0.2s ease;
}

.glb-fade-enter-from,
.glb-fade-leave-to {
  opacity: 0;
}
</style>
