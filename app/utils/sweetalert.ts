import Swal from 'sweetalert2'

/**
 * Muestra un mensaje de éxito
 */
export const showSuccess = (message: string, title: string = '¡Éxito!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Aceptar'
  })
}

/**
 * Muestra un mensaje de error
 */
export const showError = (message: string, title: string = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Aceptar'
  })
}

/**
 * Muestra una confirmación
 */
export const showConfirm = async (
  message: string, 
  title: string = '¿Estás seguro?',
  icon: 'warning' | 'question' | 'info' = 'warning',
  confirmButtonText: string = 'Sí, continuar',
  cancelButtonText: string = 'Cancelar'
) => {
  const result = await Swal.fire({
    icon,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText
  })
  return result
}

/**
 * Muestra un mensaje informativo
 */
export const showInfo = (message: string, title: string = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Aceptar'
  })
}

/**
 * Muestra un toast notification
 */
export const showToast = (message: string, icon: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  return Toast.fire({
    icon,
    title: message
  })
}
