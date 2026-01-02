import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { startLoading, finishLoading } from '../utils/loading'

export interface Estudiante {
  id: number
  numero_orden: number | null
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  cedula: string
  edad?: number // calculada automáticamente
  sexo: 'Masculino' | 'Femenino'
  rne: string // código único alfanumérico
  aula_id?: number | null
  aula?: {
    id: number
    grado_cardinal: number
    seccion: string
    titulo_id?: number | null
    titulo?: {
      id: number
      nombre: string
      codigo: string
      familia?: {
        id: number
        nombre: string
        codigo: string
      }
    }
  }
  user?: {
    id: number
    username: string
    name: string
    active: boolean
  }
  created_at?: string
  updated_at?: string
}

export const useEstudiantesStore = defineStore('estudiantes', {
  state: () => ({
    items: [] as Estudiante[],
    loading: false as boolean,
    error: null as string | null,
    statusFilter: 'active' as 'active' | 'inactive' | 'all' // Nuevo filtro
  }),

  getters: {
    total: (state) => state.items.length,
    byId: (state) => (id: number) => state.items.find(e => e.id === id),
    ordenados: (state) => {
      // Ordenados por apellidos, luego nombres
      return [...state.items].sort((a, b) => {
        const apellidosA = a.apellidos.toLowerCase()
        const apellidosB = b.apellidos.toLowerCase()
        if (apellidosA !== apellidosB) {
          return apellidosA.localeCompare(apellidosB)
        }
        return a.nombres.toLowerCase().localeCompare(b.nombres.toLowerCase())
      })
    }
  },

  actions: {
    async fetchAll(status: 'active' | 'inactive' | 'all' = 'active') {
      this.loading = true
      this.error = null
      this.statusFilter = status
      startLoading()
      try {
        const url = `/api/estudiantes?status=${status}`
        const response = await api.get<{ success: boolean; data: Estudiante[]; status: string }>(url)
        // El API ya devuelve la edad calculada, no necesitamos recalcularla
        this.items = response.data
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudieron cargar los estudiantes'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async create(payload: Omit<Estudiante, 'id' | 'numero_orden' | 'edad' | 'created_at' | 'updated_at'>) {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: Estudiante }>('/api/estudiantes', payload)
        // El API ya devuelve la edad calculada
        this.items.push(response.data)
        return response.data
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<Omit<Estudiante, 'id' | 'numero_orden' | 'edad' | 'created_at' | 'updated_at'>>) {
      startLoading()
      try {
        const response = await api.put<{ success: boolean; data: Estudiante }>(`/api/estudiantes/${id}`, payload)
        // El API ya devuelve la edad calculada
        const idx = this.items.findIndex(e => e.id === id)
        if (idx !== -1) this.items[idx] = response.data
        return response.data
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async delete(id: number) {
      startLoading()
      try {
        await api.delete(`/api/estudiantes/${id}`)
        this.items = this.items.filter(e => e.id !== id)
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async reordenarNumeros() {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: Estudiante[] }>('/api/estudiantes/reordenar', {})
        // Actualizar la lista con los números reordenados
        this.items = response.data
        return response.data
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async restore(id: number) {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: Estudiante; message: string }>(`/api/estudiantes/${id}/restore`, {})
        // Actualizar la lista después de restaurar
        await this.fetchAll(this.statusFilter)
        return response.data
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    // Función para calcular edad automáticamente
    calcularEdad(fechaNacimiento: string): number {
      if (!fechaNacimiento) return 0
      const hoy = new Date()
      const nacimiento = new Date(fechaNacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mesActual = hoy.getMonth()
      const mesNacimiento = nacimiento.getMonth()

      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      return edad
    },

    async generateUser(estudianteId: number) {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: any; message: string; pdf_token?: string }>(`/api/estudiantes/${estudianteId}/generate-user`, {})
        return response
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async generateUsersBatch(aulaId: number) {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: any[]; message: string; pdf_token?: string }>('/api/estudiantes/generate-users-batch', { aula_id: aulaId })
        return response
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    },

    async resetPassword(estudianteId: number) {
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: any; message: string; pdf_token?: string }>(`/api/estudiantes/${estudianteId}/reset-password`, {})
        return response
      } catch (e: any) {
        console.error(e)
        throw e
      } finally {
        finishLoading()
      }
    }
  }
})