<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ title }}</h3>
    <div class="relative h-64">
      <div class="absolute inset-0 flex items-end justify-between space-x-2">
        <div v-for="(item, index) in data" :key="index" class="relative flex flex-col items-center flex-1 h-full justify-end group">
          
          <!-- Tooltip -->
          <div class="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-black text-white text-xs rounded py-1 px-2 transition-opacity z-10 whitespace-nowrap pointer-events-none">
            {{ item.label }}: {{ item.value }} ({{ item.percentage }}%)
          </div>

          <!-- Bar -->
          <div class="w-full bg-blue-100 rounded-t relative overflow-hidden transition-all duration-500" :style="{ height: item.percentage + '%' }">
             <div class="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500" :style="{ height: '100%' }"></div>
          </div>
          
          <!-- Label -->
          <div class="mt-2 text-xs text-gray-500 truncate w-full text-center">
            {{ item.shortLabel || item.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ChartData {
  label: string
  shortLabel?: string
  value: number
  percentage: number
}

defineProps<{
  title: string
  data: ChartData[]
}>()
</script>
