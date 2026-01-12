<template>
  <section>
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Estudiantes</h1>
        <p class="mt-1 text-sm text-gray-600">Gestión completa del registro de estudiantes del centro educativo.</p>
      </div>
      <div>
        <button @click="openCreateModal"
          class="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Añadir Estudiante">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Filtro de estado -->
    <div class="mt-4 flex justify-between items-center">
      <FilterStatus v-model="statusFilter" />
    </div>

    <div class="mt-6">
      <EstudiantesList :status-filter="statusFilter" @edit="openEditModal" @delete="handleDelete"
        @restore="handleRestore" @generate-user="handleGenerateUser" @generate-batch="handleGenerateBatch"
        @reset-password="handleResetPassword" @saved="onSaved" />
    </div>

    <!-- Modal para crear/editar -->
    <EstudiantesFormModal v-if="showModal" :open="showModal" :model="selectedEstudiante" @close="closeModal"
      @saved="onSaved" />

    <!-- Modal de Credenciales -->
    <CredentialsModal :is-open="showCredentialsModal" :credentials="generatedCredentials" :pdf-token="currentPdfToken"
      @close="showCredentialsModal = false" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEstudiantesStore, type Estudiante } from '../../stores/estudiantes'
import { showConfirm, showError, showToast } from '../../utils/sweetalert'
import FilterStatus from '../../components/common/FilterStatus.vue'
import CredentialsModal from '../../components/estudiantes/CredentialsModal.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const store = useEstudiantesStore()
const showModal = ref(false)
const selectedEstudiante = ref<Estudiante | null>(null)
const statusFilter = ref<'active' | 'inactive' | 'retirado' | 'all'>('active')

// Estado para credenciales
const showCredentialsModal = ref(false)
const generatedCredentials = ref<any[]>([])
const currentPdfToken = ref<string | undefined>(undefined)

// Watcher para el filtro de estado
watch(statusFilter, async (newStatus) => {
  await store.fetchAll(newStatus)
}, { immediate: true })

const openCreateModal = () => {
  selectedEstudiante.value = null
  showModal.value = true
}

const openEditModal = (estudiante: Estudiante) => {
  selectedEstudiante.value = estudiante
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEstudiante.value = null
}

const onSaved = async () => {
  closeModal()
  await reloadData('Actualizando lista...')
  showToast('Estudiante guardado correctamente', 'success')
}

const reloadData = async (message: string) => {
  const { default: Swal } = await import('sweetalert2')

  Swal.fire({
    title: message,
    text: 'Por favor espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    await store.reordenarNumeros()
    await store.fetchAll(statusFilter.value)
    Swal.close()
  } catch (error) {
    Swal.close()
    console.error(error)
  }
}

const handleDelete = async (estudiante: Estudiante) => {
  const result = await showConfirm(
    `¿Estás seguro de que deseas eliminar a ${estudiante.nombres} ${estudiante.apellidos}?`,
    'Esta acción se puede deshacer más tarde.',
    'warning'
  )

  if (result.isConfirmed) {
    try {
      await store.delete(estudiante.id)
      await store.reordenarNumeros()
      showToast('Estudiante eliminado correctamente', 'success')
    } catch (error: any) {
      showError(error?.data?.message || 'Error al eliminar el estudiante')
    }
  }
}

const handleRestore = async (estudiante: Estudiante) => {
  const result = await showConfirm(
    `¿Restaurar a ${estudiante.nombres} ${estudiante.apellidos}?`,
    'El estudiante volverá a estar activo en el sistema.',
    'question'
  )

  if (result.isConfirmed) {
    try {
      await store.restore(estudiante.id)
      showToast('Estudiante restaurado correctamente', 'success')
    } catch (error: any) {
      showError(error?.data?.message || 'Error al restaurar el estudiante')
    }
  }
}

const handleGenerateUser = async (estudiante: Estudiante) => {
  const result = await showConfirm(
    `¿Generar usuario para ${estudiante.nombres}?`,
    'Se creará una cuenta de usuario con contraseña aleatoria.',
    'question'
  )

  if (result.isConfirmed) {
    try {
      const response = await store.generateUser(estudiante.id)
      generatedCredentials.value = [response.data]
      currentPdfToken.value = response.pdf_token
      showCredentialsModal.value = true

      // Recargar para actualizar el estado del botón
      await store.fetchAll(statusFilter.value)
    } catch (error: any) {
      showError(error?.data?.message || 'Error al generar usuario')
    }
  }
}

const handleGenerateBatch = async (aulaId: number) => {
  const result = await showConfirm(
    '¿Generar usuarios para toda el aula?',
    'Se crearán cuentas solo para los estudiantes que no tengan una asignada.',
    'question'
  )

  if (result.isConfirmed) {
    try {
      const response = await store.generateUsersBatch(aulaId)

      if (response.data.length === 0) {
        showToast('Todos los estudiantes ya tienen usuario asignado', 'info')
        return
      }

      generatedCredentials.value = response.data
      currentPdfToken.value = response.pdf_token
      showCredentialsModal.value = true

      // Recargar lista
      await store.fetchAll(statusFilter.value)
    } catch (error: any) {
      showError(error?.data?.message || 'Error al generar usuarios')
    }
  }
}

const handleResetPassword = async (estudiante: Estudiante) => {
  const result = await showConfirm(
    `¿Restablecer contraseña para ${estudiante.nombres}?`,
    'Se generará una nueva contraseña aleatoria y se solicitará cambiarla al iniciar sesión.',
    'warning'
  )

  if (result.isConfirmed) {
    try {
      const response = await store.resetPassword(estudiante.id)
      generatedCredentials.value = [response.data]
      currentPdfToken.value = response.pdf_token
      showCredentialsModal.value = true
    } catch (error: any) {
      showError(error?.data?.message || 'Error al restablecer contraseña')
    }
  }
}
</script>
