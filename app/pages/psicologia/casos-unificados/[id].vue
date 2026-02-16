<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Detalle de Caso Unificado #{{ route.params.id }}</h1>
                    <button @click="router.back()"
                        class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mt-2">
                        ← Volver a lista
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto">
            <UnifiedCaseDetail :case-id="Number(route.params.id)" @back="router.back()" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import UnifiedCaseDetail from '~/components/psychology/UnifiedCaseDetail.vue'

useHead({
    title: 'Detalle Caso Unificado - Psicología'
})

definePageMeta({
    layout: 'default',
})

const route = useRoute()
const router = useRouter()
</script>
