import { useAuthStore } from '~/stores/auth'
import { useMenu } from '~/composables/useMenu'

export const usePermissions = () => {
  const authStore = useAuthStore()
  const { hasMenuItem } = useMenu()

  const can = (permission: string): boolean => {
    if (authStore.can(permission)) {
      return true
    }

    // Fallback en caso de que el menú ya haya sido validado por el backend para el módulo
    if (permission === 'materiales.index' && (hasMenuItem('/admin/materiales') || hasMenuItem('materiales-entrega'))) {
      return true
    }

    return false
  }

  return {
    can
  }
}
