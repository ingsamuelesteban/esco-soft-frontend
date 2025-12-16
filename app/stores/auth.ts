import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'profesor' | 'master'
  personal_id?: number
  active: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  requires_password_change?: boolean
  user_id?: number
}

export interface Tenant {
  id: number
  name: string
  domain?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
}

export interface LoginResponse {
  user: User
  token: string
  tenant?: Tenant
  requires_tenant_selection?: boolean
  tenants?: Tenant[]
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    tenant: null as Tenant | null,
    availableTenants: [] as Tenant[],
    isAuthenticated: false as boolean,
    isLoading: false as boolean,
  }),

  getters: {
    isProfesor: (state) => state.user?.role === 'profesor',
    isAdmin: (state) => state.user?.role === 'admin',
    isMaster: (state) => state.user?.role === 'master',
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.isLoading = true

      try {
        const config = useRuntimeConfig()

        // Login usa $fetch directamente porque no necesita token de autenticación
        const response = await $fetch<ApiResponse<LoginResponse>>('/api/login', {
          method: 'POST',
          body: credentials,
          baseURL: config.public.apiBase
        })

        let data: any = response
        if (typeof response === 'string') {
          try {
            const jsonStart = (response as string).indexOf('{')
            const jsonEnd = (response as string).lastIndexOf('}')
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = (response as string).substring(jsonStart, jsonEnd + 1)
              data = JSON.parse(jsonStr)
            }
          } catch (e) {
            console.error('Error parsing response string:', e)
          }
        }

        if (data.success) {
          this.user = data.data.user
          this.token = data.data.token

          if (process.client) {
            localStorage.setItem('auth_token', data.data.token)

            // Save Remember Me preference immediately after successful login
            if (credentials.remember) {
              localStorage.setItem('remember_me', 'true')
              localStorage.setItem('remembered_username', credentials.username)
            } else {
              localStorage.removeItem('remember_me')
              localStorage.removeItem('remembered_username')
            }
          }

          if (data.data.requires_tenant_selection) {
            this.availableTenants = data.data.tenants || []
            this.isAuthenticated = true // Autenticado pero sin tenant seleccionado aún
            return { success: true, requiresTenantSelection: true }
          }

          console.log('Login successful, tenant:', data.data.tenant)
          this.tenant = data.data.tenant || null
          this.isAuthenticated = true

          if (process.client) {
            // Fix: Asegurar que el ID del tenant esté en localStorage para que api.ts pueda construir la URL correcta
            if (this.tenant) {
              localStorage.setItem('selected_tenant_id', this.tenant.id.toString())
            }
          }

          await this.loadUserMenu()
          return { success: true }
        }



        if (data.requires_password_change) {
          return {
            success: false,
            requiresPasswordChange: true,
            userId: data.user_id,
            message: data.message || 'Debes cambiar tu contraseña antes de continuar'
          }
        }

        console.warn('Login failed with success: false', data)
        return { success: false, message: data.message || 'Login fallido' }
      } catch (error: any) {
        console.error('Login error caught:', error)

        if (error.status === 202 || error.statusCode === 202) {
          const errorData = error.data || error.response?._data || error
          if (errorData?.requires_password_change) {
            return {
              success: false,
              requiresPasswordChange: true,
              userId: errorData.user_id,
              message: errorData.message || 'Debes cambiar tu contraseña antes de continuar'
            }
          }
        }

        const errorData = error.data || error.response?._data || error
        if (errorData?.requires_password_change) {
          return {
            success: false,
            requiresPasswordChange: true,
            userId: errorData.user_id,
            message: errorData.message || 'Debes cambiar tu contraseña antes de continuar'
          }
        }

        return {
          success: false,
          message: error.data?.message || 'Error al iniciar sesión. Si el problema persiste, contacta al administrador.'
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.tenant = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('auth_token')
      }

      await navigateTo('/login')
    },

    async initializeAuth() {
      if (process.client && !this.isAuthenticated) {
        const savedToken = localStorage.getItem('auth_token')
        const savedTenantId = localStorage.getItem('selected_tenant_id')

        if (savedToken) {
          this.token = savedToken
          try {
            // Usar api.get que ya incluye el token automáticamente
            const response = await api.get<ApiResponse<{ user: User, isAuthenticated: boolean, tenant?: Tenant }>>('/api/me')

            if (response.success) {
              console.log('Auth initialized, tenant:', response.data.tenant)
              this.user = response.data.user
              this.tenant = response.data.tenant || null

              // Fix: Asegurar que se restaure el tenant ID en localStorage
              // PERO: Si ya hay uno seleccionado y somos master, no lo sobrescribamos con el default del backend (que suele ser localhost=tenant1)
              if (this.tenant && process.client) {
                // Si no hay nada guardado, guardamos lo que llega
                if (!savedTenantId) {
                  localStorage.setItem('selected_tenant_id', this.tenant.id.toString())
                }
                // Si hay algo guardado
                else if (savedTenantId !== this.tenant.id.toString()) {
                  // Si somos master, DAMOS PRIORIDAD al guardado (el backend devuelve tenant1 por defecto en localhost)
                  if (this.isMaster) {
                    console.log('Manteniendo tenant seleccionado manualmente (Master):', savedTenantId);

                    // Buscar el tenant correcto
                    try {
                      const tenantRes = await api.get<ApiResponse<Tenant>>(`/api/tenants/${savedTenantId}`)
                      if (tenantRes.success && tenantRes.data) {
                        this.tenant = tenantRes.data
                        console.log('Tenant corregido en frontend:', this.tenant)
                      }
                    } catch (e) {
                      console.warn('No se pudo recuperar el tenant guardado, manteniendo el default', e)
                    }
                  } else {
                    // Si no somos master, forzamos el tenant que dice el backend
                    localStorage.setItem('selected_tenant_id', this.tenant.id.toString())
                  }
                }
              }

              // Si tenemos un tenant ID guardado pero la API no devolvió tenant (ej: global user), podríamos intentar restaurarlo
              if (!this.tenant && savedTenantId && this.availableTenants.length > 0) {
                const found = this.availableTenants.find(t => t.id === Number(savedTenantId))
                if (found) {
                  this.tenant = found
                }
              }

              await this.loadUserMenu()
            } else {
              this.clearTokens()
            }
          } catch (error: any) {
            console.error('Error in initializeAuth:', error)
            // Only clear tokens if unauthorized (401) or forbidden (403)
            // Do not clear on network errors or 500s
            if (error.status === 401 || error.statusCode === 401 ||
              error.status === 403 || error.statusCode === 403) {
              this.clearTokens()
            }
          }
        }
      }
    },

    clearTokens() {
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
      this.token = null
      this.user = null
      this.isAuthenticated = false
    },

    getRememberedCredentials() {
      if (process.client) {
        const rememberMe = localStorage.getItem('remember_me') === 'true'
        const rememberedUsername = localStorage.getItem('remembered_username') || ''
        return {
          remember: rememberMe,
          username: rememberedUsername
        }
      }
      return {
        remember: false,
        username: ''
      }
    },

    clearRememberedCredentials() {
      if (process.client) {
        localStorage.removeItem('remember_me')
        localStorage.removeItem('remembered_username')
      }
    },

    async changeRequiredPassword(data: {
      userId: number,
      currentPassword: string,
      newPassword: string,
      newPasswordConfirmation: string
    }) {
      this.isLoading = true
      try {
        // Usar api.post que maneja el parsing automáticamente
        const response = await api.post<ApiResponse<LoginResponse>>('/api/change-required-password', {
          user_id: data.userId,
          current_password: data.currentPassword,
          new_password: data.newPassword,
          new_password_confirmation: data.newPasswordConfirmation
        })

        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true
          this.tenant = response.data.tenant || null

          if (process.client) {
            localStorage.setItem('auth_token', response.data.token)

            if (this.tenant) {
              localStorage.setItem('selected_tenant_id', this.tenant.id.toString())
            }
          }

          // If tenant selection is required, we shouldn't load the menu yet?
          // But usually change-password logs you fully in. 
          // If requires_tenant_selection is true, we should probably handle that, 
          // but for now let's fix the missing tenant case.

          await this.loadUserMenu()
          return { success: true, message: response.message || 'Contraseña cambiada exitosamente' }
        }

        return { success: false, message: 'Error al cambiar contraseña' }
      } catch (error: any) {
        return {
          success: false,
          message: error.data?.message || 'Error al cambiar contraseña',
          errors: error.data?.errors
        }
      } finally {
        this.isLoading = false
      }
    },

    async loadUserMenu() {
      if (!this.isAuthenticated || !this.token) {
        return
      }

      try {
        if (process.client) {
          const { useMenu } = await import('../composables/useMenu')
          const { loadMenu } = useMenu()
          await loadMenu()
        }
      } catch (error) {
        console.error('Error loading user menu:', error)
      }
    },

    async selectTenant(tenant: Tenant) {
      this.tenant = tenant
      // Guardar preferencia si es necesario, o simplemente establecer el estado
      // El header X-Tenant-ID se debe configurar en api.ts o interceptor
      // Pero como api.ts lee de localStorage, tal vez necesitemos guardar el tenant ID
      if (process.client) {
        localStorage.setItem('selected_tenant_id', tenant.id.toString())
      }

      await this.loadUserMenu()
      return navigateTo('/')
    }
  }
})
