<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <!-- Cabecera -->
            <header class="mb-6 sm:mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                    Hola, {{ firstName }} 👋
                </h1>
                <p class="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    <template v-if="!loading">
                        Tienes <strong>{{ resumen.pendientes }}</strong>
                        {{ resumen.pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes' }} y
                        <strong>{{ resumen.nuevas }}</strong>
                        {{ resumen.nuevas === 1 ? 'nueva asignación sin revisar' : 'nuevas asignaciones sin revisar' }}.
                    </template>
                    <template v-else>Cargando tus tareas…</template>
                </p>
            </header>

            <!-- Skeleton -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="n in 6" :key="n" class="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>

            <!-- Mosaico -->
            <div v-else-if="subjects.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <NuxtLink v-for="s in subjects" :key="s.id" :to="`/student/tareas/asignatura/${s.id}`"
                    class="group relative min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700 border-l-[6px] p-4 sm:p-5 flex flex-col gap-3"
                    :style="{ borderLeftColor: s.color }">
                    <div class="flex items-start gap-3">
                        <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            :style="{ backgroundColor: s.color + '22' }">
                            {{ s.icono }}
                        </div>
                        <div class="min-w-0 flex-1">
                            <h2 class="font-semibold text-gray-900 dark:text-white leading-snug break-words">{{ s.nombre }}</h2>
                            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                👨‍🏫 {{ s.docente_nombre }}
                            </p>
                        </div>
                        <span v-if="s.total_nuevas > 0"
                            class="shrink-0 animate-pulse px-2.5 py-1 text-xs font-bold rounded-full bg-red-500 text-white shadow">
                            🔥 {{ s.total_nuevas }} {{ s.total_nuevas === 1 ? 'Nueva' : 'Nuevas' }}
                        </span>
                    </div>

                    <div v-if="s.todas_completadas"
                        class="mt-auto flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 text-sm font-medium">
                        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Al día - Sin tareas pendientes
                    </div>
                    <div v-else
                        class="mt-auto rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-2 text-sm">
                        <p class="font-semibold">
                            ⏳ {{ s.total_pendientes }} {{ s.total_pendientes === 1 ? 'pendiente' : 'pendientes' }}
                        </p>
                        <p v-if="s.proxima_tarea" class="text-xs mt-0.5 break-words">
                            Próxima: <span class="font-medium">{{ s.proxima_tarea.titulo }}</span>
                            <span v-if="s.proxima_tarea.fecha_vencimiento">
                                · vence {{ formatDate(s.proxima_tarea.fecha_vencimiento) }}
                            </span>
                        </p>
                    </div>
                </NuxtLink>
            </div>

            <!-- Vacío -->
            <div v-else class="text-center py-16 text-gray-500 dark:text-gray-400">
                <div class="text-5xl mb-3">📭</div>
                <h3 class="font-medium text-gray-900 dark:text-white">No hay tareas</h3>
                <p class="text-sm mt-1">No tienes tareas asignadas en este momento.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useHomeworkStore } from '~/stores/homework'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'role', 'student-active'],
    roles: ['estudiante']
})

const authStore = useAuthStore()
const homeworkStore = useHomeworkStore()
const { subjects, subjectsLoading: loading } = storeToRefs(homeworkStore)

const firstName = computed(() => (authStore.user?.name || 'estudiante').split(' ')[0])

const resumen = computed(() => ({
    pendientes: subjects.value.reduce((a: number, s: any) => a + s.total_pendientes, 0),
    nuevas: subjects.value.reduce((a: number, s: any) => a + s.total_nuevas, 0)
}))

function formatDate(date: string) {
    return dayjs(date).format('DD MMM, HH:mm')
}

onMounted(() => homeworkStore.fetchSubjects())
</script>
