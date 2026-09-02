<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Asignaciones</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Relaciona materias, profesores y aulas por año lectivo.</p>
      </div>
      <div class="flex gap-3">
        <button @click="openBulkDeactivate"
          class="px-3 py-2 bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-500 font-medium rounded-md shadow-sm border border-yellow-300 dark:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Desactivar en Lote
        </button>
        <button @click="openTransfer"
          class="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
          <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <BulkDeactivateAssignmentsModal :open="bulkModalOpen" @close="closeBulkModal" @success="onBulkSuccess" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AssignmentsList from '../../components/assignments/AssignmentsList.vue'
import AssignmentFormModal from '../../components/assignments/AssignmentFormModal.vue'
import TransferAssignmentsModal from '../../components/assignments/TransferAssignmentsModal.vue'
import BulkDeactivateAssignmentsModal from '../../components/assignments/BulkDeactivateAssignmentsModal.vue'
import { useClassAssignmentsStore, type ClassAssignment } from '../../stores/class_assignments'
import { usePersonalStore } from '../../stores/personal'

definePageMeta({
  middleware: ['auth', 'admin']
})

const modalOpen = ref(false)
const transferModalOpen = ref(false)
const bulkModalOpen = ref(false)
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

// Bulk Deactivate Logic
const openBulkDeactivate = () => { bulkModalOpen.value = true }
const closeBulkModal = () => { bulkModalOpen.value = false }
const onBulkSuccess = () => {
  // Store handles fetchAll internally, we just close
  closeBulkModal()
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
  @apply inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:bg-gray-800 transition-colors;
}
</style>
