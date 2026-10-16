import { defineStore } from 'pinia'
import { api } from '~/utils/api'
import type { Personal } from './personal'

export interface Material {
  id: number
  tenant_id?: number
  nombre: string
  descripcion?: string | null
  estado: boolean
  created_at?: string
  updated_at?: string
}

export interface MaterialEntregaDetalle {
  id: number
  material_entrega_id: number
  personal_id: number
  material_id: number
  cantidad: number
  notas?: string | null
  personal?: Personal
  material?: Material
}

export interface MaterialEntrega {
  id: number
  tenant_id?: number
  fecha_entrega: string
  observaciones?: string | null
  creado_por?: number | null
  creado_por_user?: { id: number; name: string; username: string } | null
  creadoPor?: { id: number; name: string; username: string } | null
  detalles: MaterialEntregaDetalle[]
  created_at?: string
  updated_at?: string
}

export interface EntregaFilters {
  fecha_desde?: string
  fecha_hasta?: string
  personal_id?: number | string
  cargo?: number | string
  material_id?: number | string
  search?: string
  page?: number
  per_page?: number
}

export const useMaterialesStore = defineStore('materiales', {
  state: () => ({
    catalogo: [] as Material[],
    entregas: [] as MaterialEntrega[],
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    loadingCatalogo: false,
    loadingEntregas: false,
    saving: false,
  }),

  getters: {
    materialesActivos: (state) => state.catalogo.filter((m) => Boolean(m.estado)),
  },

  actions: {
    async fetchCatalogo(params: { search?: string; estado?: boolean | string } = {}) {
      this.loadingCatalogo = true
      try {
        const query = new URLSearchParams()
        if (params.search) query.set('search', params.search)
        if (params.estado !== undefined && params.estado !== '') {
          query.set('estado', String(params.estado))
        }
        const qs = query.toString() ? `?${query.toString()}` : ''
        const res = await api.get<{ success: boolean; data: Material[] }>(`/api/materiales${qs}`)
        this.catalogo = res.data || []
        return this.catalogo
      } finally {
        this.loadingCatalogo = false
      }
    },

    async createMaterial(payload: { nombre: string; descripcion?: string | null; estado?: boolean }) {
      this.saving = true
      try {
        const res = await api.post<{ success: boolean; data: Material; message?: string }>('/api/materiales', payload)
        if (res.data) {
          this.catalogo.push(res.data)
          this.catalogo.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }
        return res
      } finally {
        this.saving = false
      }
    },

    async updateMaterial(id: number, payload: Partial<{ nombre: string; descripcion: string | null; estado: boolean }>) {
      this.saving = true
      try {
        const res = await api.put<{ success: boolean; data: Material; message?: string }>(`/api/materiales/${id}`, payload)
        if (res.data) {
          const idx = this.catalogo.findIndex((m) => m.id === id)
          if (idx !== -1) this.catalogo[idx] = res.data
        }
        return res
      } finally {
        this.saving = false
      }
    },

    async deleteMaterial(id: number) {
      this.saving = true
      try {
        const res = await api.delete<{ success: boolean; data?: Material; message?: string }>(`/api/materiales/${id}`)
        if (res.data) {
          const idx = this.catalogo.findIndex((m) => m.id === id)
          if (idx !== -1) this.catalogo[idx] = res.data
        } else {
          this.catalogo = this.catalogo.filter((m) => m.id !== id)
        }
        return res
      } finally {
        this.saving = false
      }
    },

    async fetchEntregas(filters: EntregaFilters = {}) {
      this.loadingEntregas = true
      try {
        const query = new URLSearchParams()
        if (filters.fecha_desde) query.set('fecha_desde', filters.fecha_desde)
        if (filters.fecha_hasta) query.set('fecha_hasta', filters.fecha_hasta)
        if (filters.personal_id) query.set('personal_id', String(filters.personal_id))
        if (filters.cargo) query.set('cargo', String(filters.cargo))
        if (filters.material_id) query.set('material_id', String(filters.material_id))
        if (filters.search) query.set('search', filters.search)
        if (filters.page) query.set('page', String(filters.page))
        if (filters.per_page) query.set('per_page', String(filters.per_page))

        const qs = query.toString() ? `?${query.toString()}` : ''
        const res = await api.get<{ success: boolean; data: any }>(`/api/material-entregas${qs}`)
        const paginated = res.data
        if (paginated && Array.isArray(paginated.data)) {
          this.entregas = paginated.data
          this.pagination = {
            current_page: paginated.current_page || 1,
            last_page: paginated.last_page || 1,
            per_page: paginated.per_page || 15,
            total: paginated.total || paginated.data.length,
          }
        } else if (Array.isArray(paginated)) {
          this.entregas = paginated
        }
        return this.entregas
      } finally {
        this.loadingEntregas = false
      }
    },

    async createEntrega(payload: {
      fecha_entrega: string
      observaciones?: string | null
      personal_ids: number[]
      materiales: Array<{ material_id: number; cantidad: number; notas?: string | null }>
    }) {
      this.saving = true
      try {
        const res = await api.post<{ success: boolean; data: MaterialEntrega; message?: string }>(
          '/api/material-entregas',
          payload
        )
        if (res.data) {
          this.entregas.unshift(res.data)
        }
        return res
      } finally {
        this.saving = false
      }
    },

    async deleteEntrega(id: number) {
      this.saving = true
      try {
        const res = await api.delete<{ success: boolean; message?: string }>(`/api/material-entregas/${id}`)
        this.entregas = this.entregas.filter((e) => e.id !== id)
        return res
      } finally {
        this.saving = false
      }
    },
  },
})
