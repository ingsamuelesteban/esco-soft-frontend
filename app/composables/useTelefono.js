/**
 * Composable para formatear números de teléfono
 */

export const useTelefono = () => {
  // Función para limpiar el teléfono (solo números)
  const cleanTelefono = (value) => {
    if (!value) return ''
    return value.toString().replace(/\D/g, '').substring(0, 10)
  }

  // Función para formatear el teléfono con paréntesis y guiones
  const formatTelefono = (value) => {
    const cleaned = cleanTelefono(value)
    if (!cleaned) return ''
    
    if (cleaned.length <= 3) {
      return cleaned.length > 0 ? `(${cleaned}` : ''
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
  }

  // Función para validar si un teléfono es válido (10 dígitos)
  const isValidTelefono = (value) => {
    const cleaned = cleanTelefono(value)
    return cleaned.length === 10
  }

  return {
    cleanTelefono,
    formatTelefono,
    isValidTelefono
  }
}