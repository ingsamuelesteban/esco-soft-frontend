<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        ref="input"
        v-model="displayValue"
        type="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        maxlength="14"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        :class="{
          'bg-gray-50 text-gray-500': disabled,
          'border-red-300 focus:border-red-500 focus:ring-red-500': hasError
        }"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      <div v-if="hasError" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    <p v-else-if="helpText" class="text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '(000) 000-0000'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: 'Formato: (000) 000-0000'
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// Generar ID único para el input
const inputId = ref(`telefono-input-${Math.random().toString(36).substr(2, 9)}`)

// Referencia al input
const input = ref(null)

// Estado interno
const displayValue = ref('')
const isFocused = ref(false)

// Computed
const hasError = computed(() => !!props.errorMessage)

// Usar el composable de teléfono
const { cleanTelefono, formatTelefono } = useTelefono()

// Manejar entrada de texto
const handleInput = (event) => {
  const inputValue = event.target.value
  
  // Obtener solo los números del valor actual
  const cleanValue = cleanTelefono(inputValue)
  
  // Formatear el valor limpio
  const formattedValue = formatTelefono(cleanValue)
  
  // Actualizar el valor mostrado sin mover el cursor automáticamente
  displayValue.value = formattedValue
  
  // Emitir solo los números limpios al v-model
  emit('update:modelValue', cleanValue)
}

// Manejar teclas especiales
const handleKeydown = (event) => {
  // Permitir: backspace, delete, tab, escape, enter
  if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      // Permitir: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39)) {
    return
  }
  
  // Asegurar que es un número
  if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
    event.preventDefault()
  }
}

// Manejar blur
const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

// Manejar focus
const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

// Watcher para sincronizar con el modelo
watch(() => props.modelValue, (newValue) => {
  if (newValue !== cleanTelefono(displayValue.value)) {
    displayValue.value = formatTelefono(newValue || '')
  }
}, { immediate: true })

// Método público para enfocar el input
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur()
})
</script>