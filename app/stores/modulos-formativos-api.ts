import { defineStore } from 'pinia'
import { startLoading, finishLoading } from '../utils/loading'
import { api } from '../utils/api'

export interface ModuloFormativoApi {
  id: number
  nombre: string
  codigo?: string | null
  tipo: 'Academico' | 'Tecnico'
  cantidad_ra?: number | null
  descripcion?: string | null
  activo: boolean
  deleted_at?: string | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface FetchModulosParams {
  search?: string
  page?: number
  per_page?: number
  status?: 'active' | 'inactive' | 'all'
  all_catalog?: boolean
}

export const useModulosFormativosApiStore = defineStore('modulosFormativosApi', {
  state: () => ({
    items: [] as ModuloFormativoApi[],
    loading: false as boolean,
    error: null as string | null,
    statusFilter: 'active' as 'active' | 'inactive' | 'all',
    search: '' as string,
    page: 1 as number,
    perPage: 15 as number,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0,
    } as PaginationMeta,
  }),
  getters: {
    active: (s) => s.items.filter(m => m.activo),
  },
  actions: {
    async fetchModulos(params: FetchModulosParams = {}) {
      this.loading = true
      this.error = null
      startLoading()

      if (params.search !== undefined) this.search = params.search
      if (params.page !== undefined) this.page = params.page
      if (params.per_page !== undefined) this.perPage = params.per_page
      if (params.status !== undefined) this.statusFilter = params.status

      try {
        const queryParams: Record<string, any> = {
          search: this.search,
          page: this.page,
          per_page: this.perPage,
          status: this.statusFilter,
        }

        if (params.all_catalog) {
          queryParams.all_catalog = true
        }

        const res = await api.get<any>('/api/modulos-formativos', { params: queryParams })

        if (res && typeof res === 'object') {
          if ('data' in res && Array.isArray(res.data)) {
            this.items = res.data

            // Extraer meta o campos a primer nivel
            const meta = res.meta || {}
            this.pagination = {
              current_page: meta.current_page ?? res.current_page ?? this.page,
              last_page: meta.last_page ?? res.last_page ?? 1,
              per_page: meta.per_page ?? res.per_page ?? this.perPage,
              total: meta.total ?? res.total ?? res.data.length,
              from: meta.from ?? res.from ?? (res.data.length > 0 ? 1 : 0),
              to: meta.to ?? res.to ?? res.data.length,
            }
          } else if (Array.isArray(res)) {
            this.items = res
            this.pagination = {
              current_page: 1,
              last_page: 1,
              per_page: res.length,
              total: res.length,
              from: res.length > 0 ? 1 : 0,
              to: res.length,
            }
          } else if ('success' in res && res.success === false) {
            console.warn('API returned error:', res.message)
            this.items = []
            this.error = res.message || 'No se pudieron cargar las materias'
          } else {
            console.error('Expected array of modulos formativos but got:', res)
            this.items = []
          }
        } else {
          console.error('Unexpected response type:', typeof res)
          this.items = []
        }
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudieron cargar los módulos formativos'
        console.error(e)
      } finally {
        this.loading = false
        finishLoading()
      }
    },

    async fetchAll(status: 'active' | 'inactive' | 'all' = 'active') {
      return this.fetchModulos({ status, page: 1, per_page: 250, all_catalog: true })
    },

    async setPage(newPage: number) {
      if (newPage < 1 || (this.pagination.last_page && newPage > this.pagination.last_page)) return
      this.page = newPage
      return this.fetchModulos({ page: newPage })
    },

    async setSearch(newSearch: string) {
      this.search = newSearch
      this.page = 1
      return this.fetchModulos({ search: newSearch, page: 1 })
    },

    async setPerPage(newPerPage: number) {
      this.perPage = newPerPage
      this.page = 1
      return this.fetchModulos({ per_page: newPerPage, page: 1 })
    },

    async create(payload: { nombre: string; codigo?: string | null; tipo: 'Academico' | 'Tecnico'; cantidad_ra?: number | null; descripcion?: string | null; activo?: boolean }) {
      this.error = null
      startLoading()
      try {
        const created = await api.post<ModuloFormativoApi>('/api/modulos-formativos', payload)
        // Refrescar página actual para sincronizar total y paginación
        await this.fetchModulos()
        return created
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo crear el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },

    async update(id: number, payload: Partial<{ nombre: string; codigo: string | null; tipo: 'Academico' | 'Tecnico'; cantidad_ra: number | null; descripcion: string | null; activo: boolean }>) {
      this.error = null
      startLoading()
      try {
        const updated = await api.put<ModuloFormativoApi>(`/api/modulos-formativos/${id}`, payload)
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo actualizar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },

    async toggleActive(id: number, activo: boolean) {
      return this.update(id, { activo })
    },

    async remove(id: number) {
      this.error = null
      startLoading()
      try {
        await api.delete<void>(`/api/modulos-formativos/${id}`)
        // Si borramos el último ítem de una página mayor a 1, retroceder una página
        if (this.items.length === 1 && this.page > 1) {
          this.page -= 1
        }
        await this.fetchModulos()
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo eliminar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },

    async restore(id: number) {
      this.error = null
      startLoading()
      try {
        const response = await api.post<{ success: boolean; data: ModuloFormativoApi; message: string }>(`/api/modulos-formativos/${id}/restore`, {})
        await this.fetchModulos()
        return response.data
      } catch (e: any) {
        this.error = e?.data?.message || 'No se pudo restaurar el módulo formativo'
        throw e
      } finally {
        finishLoading()
      }
    },
  }
})
