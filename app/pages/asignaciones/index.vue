<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Asignaciones</h1>
        <p class="mt-1 text-sm text-gray-600">Relaciona materias, profesores y aulas por año lectivo.</p>
      </div>
    </header>

    <div class="mt-6">
      <AssignmentsList @new="openNew" @edit="openEdit" @deactivate="onDeactivate" />
    </div>

    <AssignmentFormModal :open="modalOpen" :model="current" @close="closeModal" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AssignmentsList from '../../components/assignments/AssignmentsList.vue'
import AssignmentFormModal from '../../components/assignments/AssignmentFormModal.vue'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'

definePageMeta({
  middleware: ['auth', 'admin']
})

const modalOpen = ref(false)
const current = ref<ClassAssignment | null>(null)
const store = useClassAssignmentsStore()

const openNew = () => { current.value = null; modalOpen.value = true }
const openEdit = (a: ClassAssignment) => { current.value = a; modalOpen.value = true }
const closeModal = () => { modalOpen.value = false }
const onSaved = (a: ClassAssignment) => {
  // already handled in the store's create/update
}
const onDeactivate = async (id: number) => {
  await store.deactivate(id)
}
</script>

<style scoped lang="postcss">
.icon-btn {
  @apply inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors;
}
</style>
