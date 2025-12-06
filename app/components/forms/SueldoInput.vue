<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">RD$</span>
      </div>
      <input
        :id="inputId"
        ref="input"
        v-model="displayValue"
        type="text"
        inputmode="decimal"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
    type: [String, Number],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '0.00'
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
    default: 'Ingrese el monto en pesos dominicanos'
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// Generar ID único para el input
const inputId = ref(`sueldo-input-${Math.random().toString(36).substr(2, 9)}`)

// Referencia al input
const input = ref(null)

// Estado interno
const displayValue = ref('')
const isFocused = ref(false)

// Computed
const hasError = computed(() => !!props.errorMessage)

// Función para limpiar el sueldo (solo números y punto decimal)
const cleanSueldo = (value) => {
  if (!value) return ''
  
  // Convertir a string y limpiar
  const stringValue = value.toString().replace(/[^\d.]/g, '')
  
  // Permitir solo un punto decimal
  const parts = stringValue.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  
  // Limitar decimales a 2 lugares
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  return stringValue
}

// Función para formatear el sueldo con separadores de miles
const formatSueldo = (value) => {
  const cleaned = cleanSueldo(value)
  if (!cleaned) return ''
  
  const parts = cleaned.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Formatear la parte entera con separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Combinar con decimales si existen
  if (decimalPart !== undefined) {
    return formattedInteger + '.' + decimalPart
  }
  
  return formattedInteger
}

// Función para convertir el valor formateado a número
const parseToNumber = (formattedValue) => {
  const cleaned = cleanSueldo(formattedValue)
  return cleaned ? parseFloat(cleaned) : null
}

// Manejar entrada de texto
const handleInput = (event) => {
  const inputValue = event.target.value
  
  // Obtener valor limpio
  const cleanValue = cleanSueldo(inputValue)
  
  // Formatear el valor limpio
  const formattedValue = formatSueldo(cleanValue)
  
  // Actualizar el valor mostrado
  displayValue.value = formattedValue
  
  // Emitir el valor numérico al v-model
  const numericValue = parseToNumber(formattedValue)
  emit('update:modelValue', numericValue)
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
  
  // Permitir punto decimal (solo uno)
  if (event.keyCode === 190 || event.keyCode === 110) {
    if (displayValue.value.includes('.')) {
      event.preventDefault()
    }
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
  
  // Formatear valor final al perder el foco
  if (displayValue.value && !displayValue.value.includes('.')) {
    displayValue.value = displayValue.value + '.00'
    const numericValue = parseToNumber(displayValue.value)
    emit('update:modelValue', numericValue)
  }
  
  emit('blur', event)
}

// Manejar focus
const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

// Watcher para sincronizar con el modelo
watch(() => props.modelValue, (newValue) => {
  const currentNumericValue = parseToNumber(displayValue.value)
  if (newValue !== currentNumericValue) {
    if (newValue === null || newValue === undefined || newValue === '') {
      displayValue.value = ''
    } else {
      displayValue.value = formatSueldo(newValue.toString())
    }
  }
}, { immediate: true })

// Método público para enfocar el input
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur()
})
</script>