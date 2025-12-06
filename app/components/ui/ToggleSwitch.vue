<template>
  <button
    type="button"
    :class="[
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
      modelValue ? 'bg-primary-600' : 'bg-gray-200'
    ]"
    @click="toggle"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      :class="[
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      ]"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>