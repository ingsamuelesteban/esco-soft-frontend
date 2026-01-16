<template>
    <div class="space-y-4">
        <div v-if="loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>

        <div v-else-if="cases.length === 0" class="text-center py-12 bg-gray-50 rounded-lg dashed-border">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay casos {{ status === 'open' ? 'activos' :
                'cerrados' }}</h3>
            <p v-if="status === 'open'" class="mt-1 text-sm text-gray-500">Acepte un referimiento para iniciar un
                caso.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="caso in cases" :key="caso.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="$emit('select', caso)">
                <div class="flex items-center space-x-3 mb-3">
                    <div
                        class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {{ getInitials(caso.student?.nombres, caso.student?.apellidos) }}
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-900">{{ caso.student?.nombres }} {{
                            caso.student?.apellidos }}</h3>
                        <p class="text-xs text-gray-500">#{{ caso.student?.numero_orden || '?' }} • {{
                            caso.student?.aula ? (caso.student.aula.grado_cardinal + '° ' +
                                caso.student.aula.seccion) :
                                'Sin curso' }}</p>
                    </div>
                </div>

                <div class="mb-3">
                    <h4 class="text-sm font-medium text-gray-800">{{ caso.title }}</h4>
                    <div class="flex flex-wrap gap-1 mt-1" v-if="caso.categories && caso.categories.length">
                        <span v-for="cat in caso.categories" :key="cat.id"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                            :style="{ backgroundColor: cat.color ? cat.color + '20' : '', color: cat.color }">
                            {{ cat.name }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        Iniciado el {{ formatDate(caso.start_date) }}
                    </p>
                    <div class="mt-2 text-xs">
                        <p v-if="caso.status === 'open' && caso.assigned_to" class="text-indigo-600 font-medium">
                            Asignado a: {{ caso.assigned_to.name }}
                        </p>
                        <p v-else-if="caso.status === 'closed' && caso.closed_by" class="text-red-600 font-medium">
                            Cerrado por: {{ caso.closed_by.name }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center justify-between mt-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="caso.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                        {{ caso.status === 'open' ? 'Activo' : 'Cerrado' }}
                    </span>
                    <span class="text-xs text-gray-400">
                        Última act. {{ formatDate(caso.updated_at) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePsychologyStore } from '../../stores/psychology'
import { useAuthStore } from '../../stores/auth'

const props = withDefaults(defineProps<{
    status?: 'open' | 'closed'
}>(), {
    status: 'open'
})

const emit = defineEmits(['select'])
const store = usePsychologyStore()
const authStore = useAuthStore()
const cases = ref<any[]>([])
const loading = ref(true)

watch(() => props.status, () => {
    loadCases()
})

const loadCases = async () => {
    loading.value = true
    const userRole = authStore.user?.role?.toLowerCase()
    const isPowerful = userRole === 'admin' || userRole === 'master'

    const filter: any = { status: props.status }
    if (!isPowerful) {
        filter.assigned_to = 'me'
    }

    const res = await store.fetchCases(filter)
    if (res.data) {
        cases.value = res.data
    }
    loading.value = false
}

const getInitials = (n: string, a: string) => {
    return `${n?.charAt(0) || ''}${a?.charAt(0) || ''}`
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
    loadCases()
})

// Expose reload function
defineExpose({ loadCases })
</script>
