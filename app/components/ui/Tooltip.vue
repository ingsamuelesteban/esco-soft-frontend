<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top' // top, bottom, left, right
  }
});

const isVisible = ref(false);
const tooltipTarget = ref(null);

const show = () => isVisible.value = true;
const hide = () => isVisible.value = false;
const toggle = () => isVisible.value = !isVisible.value;

// Close tooltip if clicking outside (important for touch devices)
const handleClickOutside = (event) => {
  if (tooltipTarget.value && !tooltipTarget.value.contains(event.target)) {
    isVisible.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div 
    ref="tooltipTarget"
    class="relative inline-block"
    @mouseenter="show"
    @mouseleave="hide"
    @click="toggle"
  >
    <slot />
    
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div 
        v-if="isVisible && text"
        class="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl dark:bg-gray-700 whitespace-nowrap pointer-events-none"
        :class="{
          '-top-10 left-1/2 -translate-x-1/2': position === 'top',
          'top-full mt-2 left-1/2 -translate-x-1/2': position === 'bottom',
          'right-full mr-2 top-1/2 -translate-y-1/2': position === 'left',
          'left-full ml-2 top-1/2 -translate-y-1/2': position === 'right',
        }"
      >
        {{ text }}
        <!-- Arrow -->
        <div 
          class="absolute w-2 h-2 bg-gray-900 rotate-45"
          :class="{
            'bottom-[-4px] left-1/2 -translate-x-1/2': position === 'top',
            'top-[-4px] left-1/2 -translate-x-1/2': position === 'bottom',
            'right-[-4px] top-1/2 -translate-y-1/2': position === 'left',
            'left-[-4px] top-1/2 -translate-y-1/2': position === 'right',
          }"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.whitespace-nowrap {
  max-width: 250px;
  white-space: normal;
  text-align: center;
}
</style>
