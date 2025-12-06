import { ref, readonly } from 'vue'
import { api } from '~/utils/api'

export interface MenuItem {
  id: string
  label: string
  route?: string
  icon: string
  order: number
  children?: MenuItem[]
}

const menuItems = ref<MenuItem[]>([])
const isMenuLoaded = ref(false)

export const useMenu = () => {
  const loadMenu = async () => {
    try {
      const response: any = await api.get('/api/menu')

      // Handle different response structures
      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          menuItems.value = response.data
        } else if (Array.isArray(response)) {
          menuItems.value = response
        } else {
          console.warn('Unexpected menu response format:', response)
          menuItems.value = []
        }
      } else {
        console.error('Menu response is not an object:', typeof response)
        menuItems.value = []
      }

      isMenuLoaded.value = true
    } catch (error) {
      console.error('Error al cargar el menú:', error)
      menuItems.value = []
      isMenuLoaded.value = true
    }
  }

  const getMenuItems = () => menuItems.value

  const hasMenuItem = (routeOrId: string) => {
    const findItem = (items: MenuItem[], search: string): boolean => {
      return items.some(item => {
        if (item.route === search || item.id === search) {
          return true
        }
        if (item.children) {
          return findItem(item.children, search)
        }
        return false
      })
    }
    return findItem(menuItems.value, routeOrId)
  }

  return {
    menuItems: readonly(menuItems),
    isMenuLoaded: readonly(isMenuLoaded),
    loadMenu,
    getMenuItems,
    hasMenuItem
  }
}