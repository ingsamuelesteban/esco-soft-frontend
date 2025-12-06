<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Seleccionar Institución
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Bienvenido, Super Admin. Por favor selecciona la institución a gestionar.
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div class="space-y-6">
                    <div v-if="authStore.availableTenants.length === 0" class="text-center text-gray-500">
                        No hay instituciones disponibles.
                    </div>

                    <div v-else class="space-y-4">
                        <button v-for="tenant in authStore.availableTenants" :key="tenant.id"
                            @click="selectTenant(tenant)"
                            class="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all group bg-white">
                            <div class="flex items-center space-x-3">
                                <div
                                    class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                    {{ tenant.name.charAt(0).toUpperCase() }}
                                </div>
                                <div class="text-left">
                                    <p class="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                                        {{ tenant.name }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ tenant.domain || 'Sin dominio' }}
                                    </p>
                                </div>
                            </div>
                            <svg class="h-5 w-5 text-gray-400 group-hover:text-primary-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div class="mt-6">
                        <button @click="logout"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import type { Tenant } from '../stores/auth'

definePageMeta({
    layout: 'empty',
    middleware: ['auth']
})

const authStore = useAuthStore()

const selectTenant = async (tenant: Tenant) => {
    await authStore.selectTenant(tenant)
}

const logout = async () => {
    await authStore.logout()
}
</script>
