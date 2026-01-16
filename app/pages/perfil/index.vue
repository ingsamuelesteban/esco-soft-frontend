<template>
    <div class="space-y-6">
        <div class="md:grid md:grid-cols-3 md:gap-6">
            <div class="md:col-span-1">
                <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Perfil de Usuario</h3>
                </div>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="shadow rounded-md overflow-hidden">
                    <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                        <!-- Foto de Perfil -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Foto</label>
                            <div class="mt-2 flex items-center space-x-5">
                                <span class="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                    <div v-if="photoPreview" class="h-full w-full">
                                        <img :src="photoPreview" alt="Preview" class="h-full w-full object-cover">
                                    </div>
                                    <div v-else-if="authStore.user?.profile_photo_path" class="h-full w-full">
                                        <img :src="`${$config.public.apiBase}/storage/${authStore.user.profile_photo_path}`"
                                            alt="Profile" class="h-full w-full object-cover">
                                    </div>
                                    <svg v-else class="h-full w-full text-gray-300" fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                                <button type="button" @click="selectNewPhoto"
                                    class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Cambiar Foto
                                </button>
                                <input type="file" ref="photoInput" class="hidden" @change="updatePhotoPreview"
                                    accept="image/*">
                            </div>
                        </div>

                        <div class="grid grid-cols-6 gap-6">
                            <div class="col-span-6 sm:col-span-4">
                                <FormsCedulaInput v-model="form.cedula" label="Cédula" :disabled="true"
                                    help-text="La cédula no se puede modificar." />
                            </div>

                            <div class="col-span-6 sm:col-span-3">
                                <label for="first-name" class="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" v-model="form.nombre" id="first-name" autocomplete="given-name"
                                    disabled
                                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed">
                                <p class="text-xs text-gray-500 mt-1">El nombre no se puede modificar.</p>
                            </div>

                            <div class="col-span-6 sm:col-span-3">
                                <label for="last-name" class="block text-sm font-medium text-gray-700">Apellido</label>
                                <input type="text" v-model="form.apellido" id="last-name" autocomplete="family-name"
                                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                                <input type="text" v-model="form.username" id="username" autocomplete="username"
                                    class="bg-gray-50 mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                                    readonly>
                                <p class="text-xs text-gray-500 mt-1">El nombre de usuario no se puede cambiar.</p>
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <label for="email" class="block text-sm font-medium text-gray-700">Correo
                                    Electrónico</label>
                                <input type="text" v-model="form.email" id="email" autocomplete="email"
                                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <FormsTelefonoInput v-model="form.telefono" label="Teléfono" />
                            </div>
                        </div>
                    </div>
                    <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button type="submit" @click="updateProfile" :disabled="authStore.isLoading"
                            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {{ authStore.isLoading ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="hidden sm:block" aria-hidden="true">
            <div class="py-5">
                <div class="border-t border-gray-200"></div>
            </div>
        </div>

        <div class="md:grid md:grid-cols-3 md:gap-6">
            <div class="md:col-span-1">
                <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Seguridad</h3>
                    <p class="mt-1 text-sm text-gray-600">
                        Actualiza tu contraseña para mantener tu cuenta segura.
                    </p>
                </div>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="shadow overflow-hidden sm:rounded-md">
                    <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                        <div class="grid grid-cols-6 gap-6">
                            <div class="col-span-6 sm:col-span-4">
                                <label for="current-password" class="block text-sm font-medium text-gray-700">Contraseña
                                    Actual</label>
                                <div class="relative mt-1">
                                    <input :type="showCurrentPassword ? 'text' : 'password'"
                                        v-model="passwordForm.current_password" id="current-password"
                                        @blur="checkCurrentPassword"
                                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md pr-10"
                                        :class="{
                                            'border-red-300': currentPasswordStatus === 'invalid',
                                            'border-green-300': currentPasswordStatus === 'valid',
                                            'border-gray-300': currentPasswordStatus === 'idle'
                                        }">
                                    <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <svg v-if="!showCurrentPassword" class="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    </button>
                                </div>
                                <div v-if="currentPasswordStatus !== 'idle'" class="mt-1 flex items-center text-xs"
                                    :class="currentPasswordStatus === 'valid' ? 'text-green-600' : 'text-red-600'">
                                    <svg v-if="currentPasswordStatus === 'valid'" class="w-4 h-4 mr-1" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    {{ currentPasswordFeedback }}
                                </div>
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <label for="new-password" class="block text-sm font-medium text-gray-700">Nueva
                                    Contraseña</label>
                                <div class="relative mt-1">
                                    <input :type="showNewPassword ? 'text' : 'password'" v-model="passwordForm.password"
                                        id="new-password"
                                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md pr-10"
                                        :class="{ 'border-red-300': passwordForm.password && !isPasswordLengthValid, 'border-green-300': isPasswordLengthValid, 'border-gray-300': !passwordForm.password }">
                                    <button type="button" @click="showNewPassword = !showNewPassword"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <svg v-if="!showNewPassword" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="mt-1 flex items-center text-xs"
                                    :class="isPasswordLengthValid ? 'text-green-600' : (passwordForm.password ? 'text-red-600' : 'text-gray-500')">
                                    <svg v-if="isPasswordLengthValid" class="w-4 h-4 mr-1" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <svg v-if="passwordForm.password && !isPasswordLengthValid" class="w-4 h-4 mr-1"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Mínimo 8 caracteres
                                </div>
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmar
                                    Contraseña</label>
                                <div class="relative mt-1">
                                    <input :type="showConfirmPassword ? 'text' : 'password'"
                                        v-model="passwordForm.password_confirmation" id="confirm-password"
                                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md pr-10"
                                        :class="{ 'border-red-300': passwordForm.password_confirmation && !doPasswordsMatch, 'border-green-300': doPasswordsMatch, 'border-gray-300': !passwordForm.password_confirmation }">
                                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <svg v-if="!showConfirmPassword" class="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="mt-1 flex items-center text-xs"
                                    :class="doPasswordsMatch ? 'text-green-600' : (passwordForm.password_confirmation ? 'text-red-600' : 'text-gray-500')">
                                    <svg v-if="doPasswordsMatch" class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <svg v-if="passwordForm.password_confirmation && !doPasswordsMatch"
                                        class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Las contraseñas coinciden
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button type="submit" @click="updatePassword"
                            :disabled="authStore.isLoading || !isPasswordLengthValid || !doPasswordsMatch"
                            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ authStore.isLoading ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { api } from '../../utils/api'
import Swal from 'sweetalert2'

useHead({
    title: 'Mi Perfil'
})

definePageMeta({
    layout: 'default'
})

const authStore = useAuthStore()
const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)

const form = ref({
    cedula: '',
    username: '',
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    photo: null as File | null
})

const passwordForm = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const currentPasswordStatus = ref<'idle' | 'valid' | 'invalid'>('idle')

const isPasswordLengthValid = computed(() => {
    return passwordForm.value.password && passwordForm.value.password.length >= 8
})

const doPasswordsMatch = computed(() => {
    return passwordForm.value.password &&
        passwordForm.value.password_confirmation &&
        passwordForm.value.password === passwordForm.value.password_confirmation
})

const currentPasswordFeedback = computed(() => {
    if (currentPasswordStatus.value === 'valid') return 'Contraseña correcta'
    if (currentPasswordStatus.value === 'invalid') return 'Contraseña incorrecta'
    return ''
})

const initForm = async () => {
    // Si tenemos datos del usuario en el store, usarlos
    if (authStore.user) {
        form.value.username = authStore.user.username || authStore.user.email
        form.value.email = authStore.user.email

        // Intentar separar nombre si viene junto
        const parts = (authStore.user.name || '').split(' ')
        if (parts.length > 0) {
            form.value.nombre = parts[0] || ''
            form.value.apellido = parts.slice(1).join(' ')
        }

        // Cargar datos adicionales desde el endpoint de perfil para obtener teléfono, etc.
        try {
            const res: any = await api.get('/api/user/profile')
            const user = res.user
            const personal = res.personal

            form.value.username = user.username
            form.value.email = user.email

            if (personal) {
                form.value.cedula = personal.cedula
                form.value.nombre = personal.nombre
                form.value.apellido = personal.apellido
                form.value.telefono = personal.telefono
            } else {
                // Fallback si no hay personal linkeado
            }
        } catch (e) {
            console.error('Error fetching full profile', e)
        }
    }
}

const selectNewPhoto = () => {
    photoInput.value?.click()
}

const updatePhotoPreview = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        form.value.photo = file

        const reader = new FileReader()
        reader.onload = (e) => {
            photoPreview.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const updateProfile = async () => {
    const res = await authStore.updateProfileInformation(form.value)
    if (res.success) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Perfil actualizado', timer: 2000, showConfirmButton: false })
    } else {
        Swal.fire('Error', res.message, 'error')
    }
}

const updatePassword = async () => {
    if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error')
        return
    }

    const res = await authStore.updatePassword(passwordForm.value)
    if (res.success) {
        passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
        currentPasswordStatus.value = 'idle' // Reset status
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Contraseña actualizada', timer: 2000, showConfirmButton: false })
    } else {
        Swal.fire('Error', res.message, 'error')
    }
}

const checkCurrentPassword = async () => {
    if (!passwordForm.value.current_password) {
        currentPasswordStatus.value = 'idle'
        return
    }

    const { valid } = await authStore.validateCurrentPassword(passwordForm.value.current_password)
    currentPasswordStatus.value = valid ? 'valid' : 'invalid'
}

onMounted(() => {
    initForm()
})
</script>
