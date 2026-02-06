<script setup lang="ts">
definePageMeta({
    layout: 'default'
})
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div class="mb-8 p-6 bg-blue-50 rounded-full">
            <Icon name="lucide:hard-hat" class="w-24 h-24 text-blue-500" />
        </div>

        <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Página en Construcción
        </h1>

        <p class="text-xl text-gray-600 mb-8 max-w-md">
            Estamos trabajando duro para traerte esta funcionalidad.
            Regresa pronto para ver las novedades.
        </p>

        <UButton to="/" color="primary" size="xl" icon="i-heroicons-home">
            Volver al Inicio
        </UButton>
    </div>
</template>
