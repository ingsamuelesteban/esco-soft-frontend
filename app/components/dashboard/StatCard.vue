<template>
  <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-transparent dark:border-gray-700">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <component :is="icon" class="h-6 w-6 text-gray-400 dark:text-gray-500 dark:text-gray-400" aria-hidden="true" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{{ title }}</dt>
            <dd>
              <div class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ value }}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="footer" class="bg-gray-50 dark:bg-gray-900/50 dark:bg-gray-700/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700">
      <div class="text-sm">
        <div class="font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 transition-colors">
          {{ footer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  icon?: Component
  footer?: string
}>()
</script>
