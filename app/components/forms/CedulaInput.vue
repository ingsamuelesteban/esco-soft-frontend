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
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        maxlength="13"
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
    default: '000-0000000-0'
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
    default: 'Formato: 000-0000000-0'
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// Generar ID único para el input
const inputId = ref(`cedula-input-${Math.random().toString(36).substr(2, 9)}`)

// Referencia al input
const input = ref(null)

// Estado interno
const displayValue = ref('')
const isFocused = ref(false)

// Computed
const hasError = computed(() => !!props.errorMessage)

// Función para limpiar la cédula (solo números)
const cleanCedula = (value) => {
  return value.replace(/\D/g, '').substring(0, 11)
}

// Función para formatear la cédula con guiones
const formatCedula = (value) => {
  const cleaned = cleanCedula(value)
  if (cleaned.length <= 3) {
    return cleaned
  } else if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`
  }
}

// Validar formato de cédula dominicana
const isValidCedula = (value) => {
  const cleaned = cleanCedula(value)
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned)
}

// Manejar input
const handleInput = (event) => {
  const inputValue = event.target.value
  const formatted = formatCedula(inputValue)
  
  // Actualizar el valor mostrado
  displayValue.value = formatted
  
  // Emitir solo los números al componente padre
  const cleanValue = cleanCedula(formatted)
  emit('update:modelValue', cleanValue)
  
  // Validación automática si tiene contenido
  if (cleanValue && !isValidCedula(cleanValue)) {
    // Se podría emitir un evento de validación aquí si fuera necesario
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

// Manejar teclas especiales
const handleKeydown = (event) => {
  // Permitir teclas de control (backspace, delete, arrows, etc.)
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]
  
  // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
    return
  }
  
  // Si no es una tecla permitida y no es un número, prevenir
  if (!allowedKeys.includes(event.key) && !/\d/.test(event.key)) {
    event.preventDefault()
  }
}

// Sincronizar con el valor del prop cuando cambie
watch(() => props.modelValue, (newValue) => {
  if (newValue !== cleanCedula(displayValue.value)) {
    displayValue.value = formatCedula(newValue || '')
  }
}, { immediate: true })

// Método para enfocar el input (útil para validaciones)
const focus = () => {
  input.value?.focus()
}

// Método para obtener el valor limpio
const getCleanValue = () => {
  return cleanCedula(displayValue.value)
}

// Método para validar
const validate = () => {
  const cleanValue = getCleanValue()
  if (!cleanValue) return true // Permitir vacío si no es requerido
  return isValidCedula(cleanValue)
}

// Exponer métodos al componente padre
defineExpose({
  focus,
  getCleanValue,
  validate,
  isValid: computed(() => validate())
})
</script>