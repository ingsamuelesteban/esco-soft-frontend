import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useAuthStore } from './auth'
import { api } from '../app/utils/api'

// Tipos específicos para materias
interface MateriaQueImparte {
  id: number
  materia?: {
    id: number
    nombre: string
  }
  aula?: {
    id: number
    nombre: string
  }
}

export const useMateriasProfesorStore = defineStore('materiasProfesor', () => {
  // Estado específico de materias
  const materiasQueImparte = ref<MateriaQueImparte[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const materiasCount = computed(() => materiasQueImparte.value.length)
  const hasMateriasActivas = computed(() => materiasQueImparte.value.length > 0)

  // Cargar materias que imparte el profesor autenticado
  const cargarMaterias = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.user?.personal_id) {
      console.warn('Usuario no autenticado o sin personal_id')
      return
    }

    if (!authStore.isProfesor) {
      console.warn('Usuario no es profesor')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Usar api helper que automáticamente incluye el token
      const data = await api.get<MateriaQueImparte[]>(`/api/profesores/${authStore.user.personal_id}/materias`)
      materiasQueImparte.value = data
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar materias'
      console.error('Error al cargar materias:', err)
      materiasQueImparte.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Verificar si el profesor puede calificar una materia específica
  const puedeCalificarMateria = async (materiaId: string | number): Promise<boolean> => {
    try {
      const authStore = useAuthStore()
      
      // Los admins pueden calificar cualquier materia
      if (authStore.isAdmin) return true
      
      // Solo profesores pueden calificar
      if (!authStore.isProfesor) return false
      
      // Verificar si la materia está en la lista del profesor
      return materiasQueImparte.value.some(item => 
        item.materia?.id === parseInt(materiaId.toString())
      )
    } catch (error) {
      console.error('Error al verificar permisos de calificación:', error)
      return false
    }
  }

  // Buscar una materia específica que imparte
  const getMateriaById = (materiaId: string | number): MateriaQueImparte | undefined => {
    return materiasQueImparte.value.find(item => 
      item.materia?.id === parseInt(materiaId.toString())
    )
  }

  // Limpiar estado (útil para logout)
  const limpiarEstado = () => {
    materiasQueImparte.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    // Estado
    materiasQueImparte: readonly(materiasQueImparte),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Getters
    materiasCount,
    hasMateriasActivas,
    
    // Acciones
    cargarMaterias,
    puedeCalificarMateria,
    getMateriaById,
    limpiarEstado
  }
})