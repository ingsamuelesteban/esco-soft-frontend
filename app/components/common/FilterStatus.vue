<template>
  <div class="flex items-center space-x-3">
    <label class="text-sm font-medium text-gray-700">Estado:</label>
    <div class="flex space-x-2">
      <button
        @click="updateFilter('active')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded-full transition-colors',
          currentStatus === 'active'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        ]"
      >
        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Activos
      </button>
      
      <button
        @click="updateFilter('inactive')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded-full transition-colors',
          currentStatus === 'inactive'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        ]"
      >
        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Eliminados
      </button>
      
      <button
        @click="updateFilter('all')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded-full transition-colors',
          currentStatus === 'all'
            ? 'bg-blue-100 text-blue-800 border border-blue-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        ]"
      >
        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Todos
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type StatusType = 'active' | 'inactive' | 'all'

interface Props {
  modelValue: StatusType
}

interface Emits {
  (e: 'update:modelValue', value: StatusType): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentStatus = computed(() => props.modelValue)

const updateFilter = (status: StatusType) => {
  emit('update:modelValue', status)
}
</script>