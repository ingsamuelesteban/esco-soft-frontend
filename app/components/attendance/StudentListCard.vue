<template>
    <div class="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden flex flex-col h-full max-h-96">
        <div class="px-4 py-2 border-b border-gray-100" :class="headerColor">
            <h3 class="font-semibold text-xs uppercase">{{ title }}</h3>
        </div>

        <div class="flex-1 overflow-y-auto">
            <div v-if="students.length > 0">
                <!-- Femeninas -->
                <div v-if="females.length > 0">
                    <div class="bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        Femenino ({{ females.length }})
                    </div>
                    <ul class="divide-y divide-gray-100">
                        <li v-for="student in females" :key="student.id"
                            class="px-3 py-2 flex items-center hover:bg-gray-50">
                            <span
                                class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-pink-100 text-[10px] font-medium text-pink-700 mr-2">
                                {{ student.numero_orden }}
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="text-xs font-medium text-gray-900 truncate">
                                    {{ student.apellidos }}, {{ student.nombres }}
                                </p>
                                <p class="text-[10px] text-gray-500" v-if="student.observaciones">
                                    {{ student.observaciones }}
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Masculinos -->
                <div v-if="males.length > 0">
                    <div
                        class="bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide border-t border-gray-100">
                        Masculino ({{ males.length }})
                    </div>
                    <ul class="divide-y divide-gray-100">
                        <li v-for="student in males" :key="student.id"
                            class="px-3 py-2 flex items-center hover:bg-gray-50">
                            <span
                                class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[10px] font-medium text-blue-700 mr-2">
                                {{ student.numero_orden }}
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="text-xs font-medium text-gray-900 truncate">
                                    {{ student.apellidos }}, {{ student.nombres }}
                                </p>
                                <p class="text-[10px] text-gray-500" v-if="student.observaciones">
                                    {{ student.observaciones }}
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div v-else class="p-6 text-center text-xs text-gray-400">
                {{ emptyText }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    title: string
    students: any[]
    headerColor: string
    emptyText: string
}>()

const males = computed(() => {
    return props.students.filter(s => ['M', 'Masculino'].includes(s.sexo)).sort((a, b) => a.numero_orden - b.numero_orden)
})

const females = computed(() => {
    return props.students.filter(s => ['F', 'Femenino'].includes(s.sexo)).sort((a, b) => a.numero_orden - b.numero_orden)
})
</script>
