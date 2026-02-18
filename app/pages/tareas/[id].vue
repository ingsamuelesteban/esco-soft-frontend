<template>
    <NuxtPage />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['profesor', 'admin']
})

const route = useRoute()
const router = useRouter()
interface ClassAssignment {
    id: number
    materia?: {
        nombre?: string
    }
    aula?: {
        titulo?: {
            nombre?: string
        }
        grado_cardinal?: string
        seccion?: string
    }
}

interface Homework {
    id: number
    title: string
    description: string
    due_date?: string
    submission_count?: number
    is_overdue?: boolean
}

const classAssignmentId = computed(() => {
    const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    return id || ''
})

const loading = ref(true)
const classAssignment = ref<ClassAssignment | null>(null)
const homeworks = ref<Homework[]>([])
const showCreateModal = ref(false)
const editingHomework = ref<Homework | null>(null)
const currentFilter = ref('all')

const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Activas', value: 'active' },
    { label: 'Vencidas', value: 'overdue' },
    { label: 'Próximas', value: 'upcoming' }
]

const filteredHomeworks = computed(() => {
    if (currentFilter.value === 'all') return homeworks.value
    if (currentFilter.value === 'active') return homeworks.value.filter(h => !h.is_overdue)
    if (currentFilter.value === 'overdue') return homeworks.value.filter(h => h.is_overdue)
    if (currentFilter.value === 'upcoming') {
        return homeworks.value.filter(h => {
            if (!h.due_date) return false
            return dayjs(h.due_date).isAfter(dayjs())
        })
    }
    return homeworks.value
})

onMounted(async () => {
    await Promise.all([
        fetchClassAssignment(),
        fetchHomeworks()
    ])
})

async function fetchClassAssignment() {
    try {
        const response = await api.get(`/api/class-assignments/${classAssignmentId.value}`)
        classAssignment.value = response
    } catch (error) {
        console.error('Error fetching class assignment:', error)
    }
}

async function fetchHomeworks() {
    try {
        loading.value = true
        const response = await api.get('/api/homeworks', {
            params: {
                class_assignment_id: classAssignmentId.value
            }
        })
        homeworks.value = response.data || response || []
    } catch (error) {
        console.error('Error fetching homeworks:', error)
    } finally {
        loading.value = false
    }
}

function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY')
}

function editHomework(homework: any) {
    editingHomework.value = homework
    showCreateModal.value = true
}

async function deleteHomework(homework: any) {
    if (!confirm(`¿Estás seguro de eliminar la tarea "${homework.title}"?`)) return

    try {
        await api.delete(`/api/homeworks/${homework.id}`)
        await fetchHomeworks()
    } catch (error) {
        console.error('Error deleting homework:', error)
        alert('Error al eliminar la tarea')
    }
}

function closeModal() {
    showCreateModal.value = false
    editingHomework.value = null
}

async function handleHomeworkSaved() {
    closeModal()
    await fetchHomeworks()
}
</script>
