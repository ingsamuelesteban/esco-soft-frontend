<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <NuxtLink to="/student/tareas"
                class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:underline mb-4">
                ← Todas las asignaturas
            </NuxtLink>

            <div v-if="loading && !subject" class="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />

            <div v-else-if="!subject" class="text-center py-16 text-gray-500 dark:text-gray-400">
                <div class="text-5xl mb-3">🔍</div>
                Asignatura no encontrada.
            </div>

            <template v-else>
                <!-- Encabezado de asignatura -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-[6px] p-4 sm:p-5 flex items-center gap-3 mb-5"
                    :style="{ borderLeftColor: subject.color }">
                    <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        :style="{ backgroundColor: subject.color + '22' }">{{ subject.icono }}</div>
                    <div class="min-w-0 flex-1">
                        <h1 class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{{ subject.nombre }}</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">👨‍🏫 {{ subject.docente_nombre }}</p>
                    </div>
                    <span v-if="subject.total_nuevas > 0"
                        class="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                        🔥 {{ subject.total_nuevas }}
                    </span>
                </div>

                <!-- Pestañas -->
                <div class="flex gap-1 p-1 bg-gray-200/70 dark:bg-gray-800 rounded-xl mb-4">
                    <button v-for="t in tabs" :key="t.value" @click="tab = t.value"
                        class="flex-1 min-w-0 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition truncate"
                        :class="tab === t.value
                            ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400'">
                        {{ t.label }} ({{ counts[t.value] }})
                    </button>
                </div>

                <!-- Lista -->
                <div class="space-y-3">
                    <NuxtLink v-for="h in filtered" :key="h.id" :to="`/student/tareas/${h.id}`"
                        @click="homeworkStore.marcarComoVista(h.id)"
                        class="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="font-semibold text-gray-900 dark:text-white break-words">{{ h.title }}</h3>
                                    <span v-if="h.es_nueva"
                                        class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white">NUEVA</span>
                                </div>
                                <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span v-if="h.due_date">📅 {{ formatDate(h.due_date) }}</span>
                                    <span v-else>📅 Sin fecha límite</span>
                                    <span v-if="h.max_score">⭐ {{ h.max_score }} pts</span>
                                </div>
                            </div>
                            <div class="shrink-0 text-right">
                                <span v-if="h.estado === 'calificada'"
                                    class="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                    {{ h.score }}/{{ h.max_score }}
                                </span>
                                <span v-else-if="h.estado === 'entregada'"
                                    class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    Enviada
                                </span>
                                <span v-else-if="h.is_overdue"
                                    class="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                    Vencida
                                </span>
                                <span v-else
                                    class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                    Pendiente
                                </span>
                            </div>
                        </div>
                    </NuxtLink>

                    <div v-if="!filtered.length" class="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                        No hay tareas en esta categoría.
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeworkStore } from '~/stores/homework'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

definePageMeta({
    layout: 'student',
    middleware: ['auth', 'role', 'student-active'],
    roles: ['estudiante']
})

type Tab = 'pendiente' | 'entregada' | 'calificada'

const route = useRoute()
const homeworkStore = useHomeworkStore()
const loading = computed(() => homeworkStore.subjectsLoading)
const tab = ref<Tab>('pendiente')

const tabs: { label: string; value: Tab }[] = [
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Entregadas', value: 'entregada' },
    { label: 'Calificadas', value: 'calificada' }
]

const subject = computed(() =>
    homeworkStore.subjects.find((s: any) => String(s.id) === String(route.params.id))
)

const counts = computed(() => {
    const list: any[] = subject.value?.tareas || []
    return {
        pendiente: list.filter(h => h.estado === 'pendiente').length,
        entregada: list.filter(h => h.estado === 'entregada').length,
        calificada: list.filter(h => h.estado === 'calificada').length
    }
})

const filtered = computed(() =>
    (subject.value?.tareas || []).filter((h: any) => h.estado === tab.value)
)

function formatDate(date: string) {
    return dayjs(date).format('DD MMM YYYY, HH:mm')
}

onMounted(async () => {
    if (!homeworkStore.subjects.length) await homeworkStore.fetchSubjects()
    if (subject.value && counts.value.pendiente === 0) {
        tab.value = counts.value.entregada ? 'entregada' : 'calificada'
    }
})
</script>
