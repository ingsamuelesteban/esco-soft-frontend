<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-6">{{ title }}</h3>
    <div class="relative h-64">
      <!-- Grid lines (optional, kept simple for now) -->

      <div class="absolute inset-0 flex items-end justify-between space-x-2">
        <div v-for="(item, index) in data" :key="index"
          class="relative flex flex-col items-center flex-1 h-full justify-end group">

          <!-- Value Label (Visible) -->
          <div class="mb-1 text-xs font-bold text-gray-700">
            {{ item.percentage }}%
          </div>

          <!-- Tooltip (Hover) -->
          <div
            class="opacity-0 group-hover:opacity-100 absolute bottom-full mb-6 bg-gray-900 text-white text-xs rounded py-1 px-2 transition-opacity z-10 whitespace-nowrap pointer-events-none shadow-lg">
            {{ item.label }}: {{ item.value }} ({{ item.percentage }}%)
          </div>

          <!-- Bar -->
          <div
            class="w-full rounded-t relative overflow-hidden transition-all duration-500 hover:brightness-110 cursor-pointer"
            :class="getBgColorClass(index)" :style="{ height: item.percentage + '%' }">
            <!-- Removed inner fill div to allow simple full color bar -->
          </div>

          <!-- Label -->
          <div class="mt-2 text-xs text-gray-500 truncate w-full text-center font-medium">
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

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-cyan-500'
]

const getBgColorClass = (index: number) => {
  return colors[index % colors.length]
}
</script>
