<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Casos Unificados</h1>
                    <p class="text-sm text-gray-600 mt-1">Gestión y Unificación de Casos Múltiples</p>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto">
            <UnifiedCaseList @select="handleSelect" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UnifiedCaseList from '~/components/psychology/UnifiedCaseList.vue'

useHead({
    title: 'Casos Unificados - Psicología'
})

definePageMeta({
    layout: 'default',
})

const router = useRouter()

const handleSelect = (unifiedCase: any) => {
    router.push(`/psicologia/casos-unificados/${unifiedCase.id}`)
}
</script>
