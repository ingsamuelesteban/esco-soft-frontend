import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { startLoading, finishLoading } from '../utils/loading'

export interface Estudiante {
  id: number
  numero_orden: number | null
  orden_manual?: boolean
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  cedula: string
  edad?: number // calculada automáticamente
  sexo: 'Masculino' | 'Femenino'
  rne: string // código único alfanumérico
  aula_id?: number | null
  estado?: string
  fecha_retiro?: string | null
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
    statusFilter: 'active' as 'active' | 'inactive' | 'retirado' | 'all' // Nuevo filtro
  }),

  getters: {
    total: (state) => state.items.length,
    byId: (state) => (id: number) => state.items.find(e => e.id === id),
    ordenados: (state) => {
      // Ordenados por aula, luego número de orden, luego apellidos y nombres
      return [...state.items].sort((a, b) => {
        // 1. Por Aula
        if ((a.aula_id || 0) !== (b.aula_id || 0)) {
          return (a.aula_id || 0) - (b.aula_id || 0)
        }

        // 2. Por Número de Orden (si existe)
        if (a.numero_orden && b.numero_orden) {
          return a.numero_orden - b.numero_orden
        }
        // Si uno tiene numero y otro no, el que tiene numero va primero (opcional, o al revés)
        if (a.numero_orden && !b.numero_orden) return -1
        if (!a.numero_orden && b.numero_orden) return 1

        // 3. Alfabético (fallback)
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
    async fetchAll(options: { status?: 'active' | 'inactive' | 'retirado' | 'all', aula_id?: number, include_psychology?: boolean } | string = 'active') {
      this.loading = true
      this.error = null

      // Backward compatibility for string argument
      const status = (typeof options === 'string' ? options : (options.status || 'active')) as 'active' | 'inactive' | 'retirado' | 'all'
      const aula_id = typeof options === 'object' ? options.aula_id : undefined
      const include_psychology = typeof options === 'object' ? options.include_psychology : undefined

      this.statusFilter = status
      startLoading()
      try {
        const params = new URLSearchParams()
        params.append('status', status)
        if (aula_id) params.append('aula_id', aula_id.toString())
        if (include_psychology) params.append('include_psychology', '1')

        const url = `/api/estudiantes?${params.toString()}`
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