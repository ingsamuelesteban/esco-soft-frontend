<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal content -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  {{ isEdit ? 'Editar Personal' : 'Añadir Personal' }}
                </h3>

                <!-- Grid de campos -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Cédula -->
                  <div>
                    <CedulaInput v-model="form.cedula" label="Cédula" placeholder="000-0000000-0" required />
                  </div>

                  <!-- Nombre -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input v-model="form.nombre" type="text" required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>

                  <!-- Apellido -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Apellido *</label>
                    <input v-model="form.apellido" type="text" required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>

                  <!-- Sexo -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Sexo</label>
                    <select v-model="form.sexo"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                      <option :value="null">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>

                  <!-- Cargo -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Cargo</label>
                    <select v-model.number="form.cargo_id"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                      <option :value="''">Seleccionar</option>
                      <option v-for="opt in cargosOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Sueldo -->
                  <div>
                    <SueldoInput :model-value="form.sueldo || 0" @update:model-value="form.sueldo = $event"
                      label="Sueldo" placeholder="0.00" :min="0" />
                  </div>

                  <!-- Tarjeta -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">No. de Tarjeta</label>
                    <input v-model="form.tarjeta_numero" type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>

                  <!-- Fecha de ingreso -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
                    <input v-model="form.fecha_ingreso" type="date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>

                  <!-- Formación académica -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Formación Académica</label>
                    <input v-model="form.formacion_academica" type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Ej: Licenciatura en Educación" />
                  </div>

                  <!-- Otros títulos -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Otros Títulos</label>
                    <textarea v-model="form.otros_titulos" rows="2"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Certificaciones, diplomados, etc."></textarea>
                  </div>

                  <!-- Teléfono -->
                  <div>
                    <TelefonoInput :model-value="form.telefono || ''"
                      @update:model-value="form.telefono = $event || null" label="Teléfono"
                      placeholder="(000) 000-0000" />
                  </div>
                </div>

                <!-- Error message -->
                <div v-if="error" class="mt-4 text-sm text-red-600 whitespace-pre-line">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" @click="$emit('close')" :disabled="loading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePersonalStore, type Personal } from '../../stores/personal'
import { useCargosStore } from '../../stores/cargos'
import { showError } from '../../utils/sweetalert'
import CedulaInput from '../forms/CedulaInput.vue'
import TelefonoInput from '../forms/TelefonoInput.vue'
import SueldoInput from '../forms/SueldoInput.vue'

const props = defineProps<{
  personal: Personal | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = usePersonalStore()
const cargosStore = useCargosStore()
const loading = ref(false)
const error = ref<string | null>(null)

const isEdit = computed(() => !!props.personal)

const form = ref<Omit<Personal, 'id' | 'cargo'>>({
  cedula: '',
  nombre: '',
  apellido: '',
  sexo: null,
  cargo_id: null,
  sueldo: null,
  tarjeta_numero: null,
  fecha_ingreso: null,
  formacion_academica: null,
  otros_titulos: null,
  telefono: null
})

// Cargar datos si es edición
watch(() => props.personal, (newVal) => {
  if (newVal) {
    form.value = {
      cedula: newVal.cedula,
      nombre: newVal.nombre,
      apellido: newVal.apellido,
      sexo: newVal.sexo,
      cargo_id: newVal.cargo_id ?? newVal.cargo?.id ?? null,
      sueldo: newVal.sueldo,
      tarjeta_numero: newVal.tarjeta_numero,
      fecha_ingreso: newVal.fecha_ingreso,
      formacion_academica: newVal.formacion_academica,
      otros_titulos: newVal.otros_titulos,
      telefono: newVal.telefono
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const payload = {
      ...form.value,
      cargo_id: (form.value as any).cargo_id === '' || (form.value as any).cargo_id == null
        ? null
        : Number((form.value as any).cargo_id)
    }
    if (isEdit.value && props.personal) {
      await store.update(props.personal.id, payload)
    } else {
      await store.create(payload)
    }
    emit('saved')
  } catch (e: any) {
    let errorMsg = e.data?.message || 'Error al guardar el registro'

    // Si hay errores de validación específicos, mostrarlos
    if (e.data?.errors) {
      const detailedErrors = Object.values(e.data.errors).flat()
      if (detailedErrors.length > 0) {
        // Mostrar el primer error o todos unidos
        errorMsg = detailedErrors.join('\n')
      }
    }

    error.value = errorMsg
    showError(errorMsg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargosStore.fetchAll()
})

const cargosOptions = computed(() => cargosStore.options)
</script>
