<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Asignaciones</h1>
        <p class="mt-1 text-sm text-gray-600">Relaciona materias, profesores y aulas por año lectivo.</p>
      </div>
      <div class="flex gap-3">
        <button @click="openTransfer"
          class="px-3 py-2 bg-white text-gray-700 font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 flex items-center gap-2">
          <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transferir
        </button>
      </div>
    </header>

    <div class="mt-6">
      <AssignmentsList @new="openNew" @edit="openEdit" @deactivate="onDeactivate" />
    </div>

    <AssignmentFormModal :open="modalOpen" :model="current" @close="closeModal" @saved="onSaved" />
    <TransferAssignmentsModal :open="transferModalOpen" :teachers="teachers" @close="closeTransferModal"
      @transfer="onTransfer" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AssignmentsList from '../../components/assignments/AssignmentsList.vue'
import AssignmentFormModal from '../../components/assignments/AssignmentFormModal.vue'
import TransferAssignmentsModal from '../../components/assignments/TransferAssignmentsModal.vue'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'
import { usePersonalStore } from '../../stores/personal'

definePageMeta({
  middleware: ['auth', 'admin']
})

const modalOpen = ref(false)
const transferModalOpen = ref(false)
const current = ref<ClassAssignment | null>(null)
const store = useClassAssignmentsStore()
const personalStore = usePersonalStore()

const teachers = ref<any[]>([])

const openNew = () => { current.value = null; modalOpen.value = true }
const openEdit = (a: ClassAssignment) => { current.value = a; modalOpen.value = true }
const closeModal = () => { modalOpen.value = false }
const onSaved = (a: ClassAssignment) => {
  // handled in component/store
}
const onDeactivate = async (id: number) => {
  await store.deactivate(id)
}

// Transfer Logic
const openTransfer = async () => {
  if (teachers.value.length === 0) {
    await personalStore.fetchTeachers()
    teachers.value = personalStore.items
  }
  transferModalOpen.value = true
}

const closeTransferModal = () => { transferModalOpen.value = false }

const onTransfer = async ({ payload, resolve, reject }: any) => {
  try {
    const res = await store.transfer(payload)
    resolve(res)
  } catch (e) {
    reject(e)
  }
}

onMounted(async () => {
  // Pre-load teachers if not already? Or wait until modal open.
  // Better to load on click to save bandwidth if unused.
})
</script>

<style scoped lang="postcss">
.icon-btn {
  @apply inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors;
}
</style>
