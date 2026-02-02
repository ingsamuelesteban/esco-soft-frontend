<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900" id="modal-title">
            Editar Perfil
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-500 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px" aria-label="Tabs">
            <button @click="activeTab = 'photo'" :class="[
              activeTab === 'photo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors'
            ]">
              Foto de Perfil
            </button>
            <button @click="activeTab = 'password'" :class="[
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors'
            ]">
              Cambiar Contraseña
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Photo Tab -->
          <div v-if="activeTab === 'photo'" class="space-y-4">
            <!-- Current Photo -->
            <div class="flex justify-center">
              <div class="relative">
                <div v-if="photoPreview || user?.profile_photo_url"
                  class="h-32 w-32 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-100">
                  <img :src="photoPreview || user?.profile_photo_url" alt="Profile" class="h-full w-full object-cover" />
                </div>
                <div v-else
                  class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-100">
                  <span class="text-4xl font-bold text-white">{{ user?.initials || 'ES' }}</span>
                </div>
              </div>
            </div>

            <!-- File Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Nueva Foto
              </label>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/jpg" @change="handleFileChange"
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer" />
              <p class="mt-1 text-xs text-gray-500">JPG, PNG. Máximo 1MB</p>
            </div>

            <!-- Error Message -->
            <div v-if="photoError" class="rounded-md bg-red-50 p-3">
              <p class="text-sm text-red-800">{{ photoError }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="photoSuccess" class="rounded-md bg-green-50 p-3">
              <p class="text-sm text-green-800">{{ photoSuccess }}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="close" type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button @click="savePhoto" :disabled="!selectedFile || photoLoading" type="button" :class="[
                !selectedFile || photoLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700',
                'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors inline-flex items-center'
              ]">
                <svg v-if="photoLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ photoLoading ? 'Guardando...' : 'Guardar Foto' }}
              </button>
            </div>
          </div>

          <!-- Password Tab -->
          <div v-if="activeTab === 'password'" class="space-y-4">
            <form @submit.prevent="savePassword">
              <!-- Current Password -->
              <div>
                <label for="current_password" class="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <input v-model="passwordForm.current_password" type="password" id="current_password" required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>

              <!-- New Password -->
              <div>
                <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input v-model="passwordForm.password" type="password" id="new_password" required minlength="8"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p class="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
              </div>

              <!-- Confirm Password -->
              <div>
                <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input v-model="passwordForm.password_confirmation" type="password" id="confirm_password" required
                  minlength="8"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>

              <!-- Error Message -->
              <div v-if="passwordError" class="rounded-md bg-red-50 p-3">
                <p class="text-sm text-red-800">{{ passwordError }}</p>
              </div>

              <!-- Success Message -->
              <div v-if="passwordSuccess" class="rounded-md bg-green-50 p-3">
                <p class="text-sm text-green-800">{{ passwordSuccess }}</p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3 pt-4">
                <button @click="close" type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" :disabled="passwordLoading" :class="[
                  passwordLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700',
                  'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors inline-flex items-center'
                ]">
                  <svg v-if="passwordLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  {{ passwordLoading ? 'Guardando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const activeTab = ref<'photo' | 'password'>('photo')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)

// Photo state
const photoLoading = ref(false)
const photoError = ref('')
const photoSuccess = ref('')

// Password state
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

// Reset state when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetPhotoState()
    resetPasswordState()
    activeTab.value = 'photo'
  }
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  photoError.value = ''
  photoSuccess.value = ''

  if (!file) {
    selectedFile.value = null
    photoPreview.value = null
    return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    photoError.value = 'Por favor selecciona una imagen válida (JPG o PNG)'
    selectedFile.value = null
    photoPreview.value = null
    return
  }

  // Validate file size (1MB = 1024 * 1024 bytes)
  if (file.size > 1024 * 1024) {
    photoError.value = 'La imagen debe ser menor a 1MB'
    selectedFile.value = null
    photoPreview.value = null
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const savePhoto = async () => {
  if (!selectedFile.value) return

  photoLoading.value = true
  photoError.value = ''
  photoSuccess.value = ''

  try {
    const result = await authStore.updateProfileInformation({
      username: user.value?.username,
      email: user.value?.email,
      nombre: user.value?.name?.split(' ')[0] || '',
      apellido: user.value?.name?.split(' ').slice(1).join(' ') || '',
      photo: selectedFile.value
    })

    if (result.success) {
      photoSuccess.value = 'Foto de perfil actualizada correctamente'
      emit('updated')
      
      // Reset after short delay
      setTimeout(() => {
        resetPhotoState()
      }, 2000)
    } else {
      photoError.value = result.message || 'Error al actualizar la foto'
    }
  } catch (error: any) {
    photoError.value = error.message || 'Error al actualizar la foto'
  } finally {
    photoLoading.value = false
  }
}

const savePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  // Validate password match
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    passwordError.value = 'Las contraseñas no coinciden'
    return
  }

  // Validate password length
  if (passwordForm.value.password.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  passwordLoading.value = true

  try {
    const result = await authStore.updatePassword({
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    })

    if (result.success) {
      passwordSuccess.value = 'Contraseña actualizada correctamente'
      emit('updated')
      
      // Reset after short delay
      setTimeout(() => {
        resetPasswordState()
      }, 2000)
    } else {
      passwordError.value = result.message || 'Error al cambiar la contraseña'
    }
  } catch (error: any) {
    passwordError.value = error.message || 'Error al cambiar la contraseña'
  } finally {
    passwordLoading.value = false
  }
}

const resetPhotoState = () => {
  selectedFile.value = null
  photoPreview.value = null
  photoError.value = ''
  photoSuccess.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const resetPasswordState = () => {
  passwordForm.value = {
    current_password: '',
    password: '',
    password_confirmation: ''
  }
  passwordError.value = ''
  passwordSuccess.value = ''
}

const close = () => {
  emit('close')
}
</script>
