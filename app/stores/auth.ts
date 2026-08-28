import { defineStore } from 'pinia'
import { api } from '../utils/api'

import type { User } from '@/types/user'

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
  requires_email_verification?: boolean
  needs_email_verification?: boolean
  user_id?: number
  email?: string
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
  departamento?: string
  distrito?: string
  logo_departamento?: string
  abbreviation?: string
  provincia?: string
  municipio?: string
  sello_institucional?: string
  public_pages_enabled?: boolean | number
  public_description?: string
  hero_image_url?: string
  director_name?: string
  director_bio?: string
  director_image_url?: string
  mission?: string
  vision?: string
  values?: string
  social_media?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  features?: string[]
  // ── Campos de pantalla de TV / Display ──────────────────────────────────────
  /** URL relativa generada por el accessor del backend: /storage/tenants/videos/... */
  display_idle_video_url?: string | null
  /** Color de fondo de la pantalla TV (ej: "#030712") */
  display_bg_color?: string | null
}

export interface LoginResponse {
  user: User
  token: string
  tenant?: Tenant
  tenant_features?: string[]
  requires_tenant_selection?: boolean
  tenants?: Tenant[]
  director?: Director
}

export interface Director {
  name: string
  cargo: string
  signature: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    tenant: null as Tenant | null,
    tenantFeatures: [] as string[],
    director: null as Director | null,
    availableTenants: [] as Tenant[],
    isAuthenticated: false as boolean,
    isLoading: false as boolean,
    lastActivity: Date.now() as number,
    activityInterval: null as any,
  }),

  getters: {
    isProfesor: (state) => state.user?.role === 'profesor',
    isAdmin: (state) => state.user?.role === 'admin',
    isMaster: (state) => state.user?.role === 'master',
    isCoordinator: (state) => state.user?.role === 'coordinador',
    isSecre: (state) => (state.user?.role || '').toLowerCase().includes('sec'),
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
          this.director = data.data.director || null

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
          this.tenantFeatures = data.data.tenant_features || []
          this.isAuthenticated = true

          if (process.client) {
            // Guardar ID del tenant para que api.ts construya URLs correctamente
            if (this.tenant) {
              localStorage.setItem('selected_tenant_id', this.tenant.id.toString())
              // ── Cachear el objeto tenant completo ────────────────────────────────
              // Necesario porque /api/me puede devolver tenant:null para usuarios
              // display_horario (contexto de tenant no establecido en esa ruta)
              localStorage.setItem('cached_tenant', JSON.stringify(this.tenant))
            }
          }

          await this.loadUserMenu()
          return { success: true }
        }



        if (data.requires_password_change) {
          return {
            success: false,
            requiresPasswordChange: true,
            needsEmailVerification: data.needs_email_verification,
            userId: data.user_id,
            email: data.email,
            message: data.message || 'Debes cambiar tu contraseña antes de continuar'
          }
        }

        if (data.requires_email_verification) {
          return {
            success: false,
            requiresEmailVerification: true,
            userId: data.user_id,
            email: data.email,
            message: data.message || 'Debes verificar tu correo electrónico antes de continuar'
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
              needsEmailVerification: errorData.needs_email_verification,
              userId: errorData.user_id,
              email: errorData.email,
              message: errorData.message || 'Debes cambiar tu contraseña antes de continuar'
            }
          }
          if (errorData?.requires_email_verification) {
            return {
              success: false,
              requiresEmailVerification: true,
              userId: errorData.user_id,
              email: errorData.email,
              message: errorData.message || 'Debes verificar tu correo electrónico antes de continuar'
            }
          }
        }

        const errorData = error.data || error.response?._data || error
        if (errorData?.requires_password_change) {
          return {
            success: false,
            requiresPasswordChange: true,
            needsEmailVerification: errorData.needs_email_verification,
            userId: errorData.user_id,
            email: errorData.email,
            message: errorData.message || 'Debes cambiar tu contraseña antes de continuar'
          }
        }

        if (errorData?.requires_email_verification) {
          return {
            success: false,
            requiresEmailVerification: true,
            userId: errorData.user_id,
            email: errorData.email,
            message: errorData.message || 'Debes verificar tu correo electrónico antes de continuar'
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
      this.tenantFeatures = []
      this.director = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('cached_tenant')   // Limpiar cache de tenant
        this.stopActivityTracker()
      }

      await navigateTo('/login')
    },

    initActivityTracker() {
      if (!process.client) return

      this.lastActivity = Date.now()
      this.startActivityInterval()

      const events = ['mousemove', 'keydown', 'click', 'scroll']
      const updateActivity = () => {
        this.lastActivity = Date.now()
      }

      events.forEach(event => {
        window.addEventListener(event, updateActivity)
      })

      // Store cleanup function if needed later, 
      // but for now we rely on the interval check to define "active"
    },

    startActivityInterval() {
      if (this.activityInterval) clearInterval(this.activityInterval)

      // Check every minute
      this.activityInterval = setInterval(() => {
        this.checkAutoLogout()
      }, 60000)
    },

    stopActivityTracker() {
      if (this.activityInterval) {
        clearInterval(this.activityInterval)
        this.activityInterval = null
      }
    },

    checkAutoLogout() {
      if (!this.isAuthenticated) return

      const timeoutDuration = 30 * 60 * 1000 // 30 minutes in ms
      const timeSinceLastActivity = Date.now() - this.lastActivity

      if (timeSinceLastActivity > timeoutDuration) {
        console.warn('Session timed out due to inactivity')
        this.logout()
      }
    },

    async initializeAuth() {
      if (process.client && !this.isAuthenticated) {
        const savedToken = localStorage.getItem('auth_token')
        const savedTenantId = localStorage.getItem('selected_tenant_id')
        const cachedTenantRaw = localStorage.getItem('cached_tenant')

        if (savedToken) {
          this.token = savedToken
          try {
            const response = await api.get<ApiResponse<{ user: User, isAuthenticated: boolean, tenant?: Tenant, director?: Director }>>('/api/me')

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
                console.error('Error parsing response string in initializeAuth:', e)
              }
            }

            if (data.success) {
              this.user = data.data.user
              this.tenantFeatures = data.data.tenant_features || []
              this.director = data.data.director || null

              // ── Diagnóstico: qué devuelve /api/me ─────────────────────────────
              console.log('[Auth] /api/me tenant from server:', data.data.tenant)
              console.log('[Auth] cached_tenant in localStorage:', cachedTenantRaw ? 'PRESENT' : 'EMPTY')

              if (data.data.tenant) {
                // ── Caso normal: el servidor devolvió el tenant ────────────────
                this.tenant = data.data.tenant

                // Actualizar cache con datos frescos del servidor
                localStorage.setItem('cached_tenant', JSON.stringify(this.tenant))
                localStorage.setItem('selected_tenant_id', this.tenant.id.toString())

                // Corrección para master: priorizar tenant guardado manualmente
                if (savedTenantId && savedTenantId !== this.tenant.id.toString() && this.isMaster) {
                  console.log('[Auth] Master: restaurando tenant seleccionado manualmente:', savedTenantId)
                  try {
                    const tenantRes = await api.get<ApiResponse<Tenant>>(`/api/tenants/${savedTenantId}`)
                    if (tenantRes.success && tenantRes.data) {
                      this.tenant = tenantRes.data
                      localStorage.setItem('cached_tenant', JSON.stringify(this.tenant))
                      console.log('[Auth] Tenant de master corregido:', this.tenant.name)
                    }
                  } catch (e) {
                    console.warn('[Auth] No se pudo recuperar el tenant del master, usando el del servidor', e)
                  }
                }
              } else {
                // ── Caso display_horario / usuario sin contexto tenant ─────────
                // El backend no pudo resolver el tenant (contexto no establecido en /api/me)
                // Intentar restaurar desde el cache localStorage generado en el login
                console.warn('[Auth] Servidor devolvió tenant:null — intentando restaurar desde cache local')

                if (cachedTenantRaw) {
                  try {
                    const cachedTenant: Tenant = JSON.parse(cachedTenantRaw)
                    this.tenant = cachedTenant
                    console.log('[Auth] ✅ Tenant restaurado desde cache:', cachedTenant.name, '| video_url:', cachedTenant.display_idle_video_url)
                  } catch (e) {
                    console.error('[Auth] Error parseando cached_tenant:', e)
                    this.tenant = null
                  }
                } else {
                  // Fallback: intentar fetch directo del tenant por ID si lo tenemos
                  if (savedTenantId) {
                    console.warn('[Auth] Sin cache, intentando fetch por ID:', savedTenantId)
                    try {
                      const tenantRes = await api.get<ApiResponse<Tenant>>(`/api/tenants/${savedTenantId}`)
                      if (tenantRes.success && tenantRes.data) {
                        this.tenant = tenantRes.data
                        localStorage.setItem('cached_tenant', JSON.stringify(this.tenant))
                        console.log('[Auth] ✅ Tenant recuperado por ID:', this.tenant.name)
                      }
                    } catch (e) {
                      console.error('[Auth] No se pudo recuperar el tenant por ID:', e)
                      this.tenant = null
                    }
                  } else {
                    this.tenant = null
                    console.error('[Auth] ❌ Tenant no disponible: sin cache ni ID guardado')
                  }
                }
              }

              this.isAuthenticated = true
              await this.loadUserMenu()
            } else {
              this.clearTokens()
            }
          } catch (error: any) {
            console.error('Error in initializeAuth:', error)
            if (error.status === 401 || error.statusCode === 401) {
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
      this.director = null
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
      newPasswordConfirmation: string,
      email?: string
    }) {
      this.isLoading = true
      try {
        // Usar api.post que maneja el parsing automáticamente
        const response: any = await api.post('/api/change-required-password', {
          user_id: data.userId,
          current_password: data.currentPassword,
          new_password: data.newPassword,
          new_password_confirmation: data.newPasswordConfirmation,
          email: data.email
        })

        if (response.success) {
          if (response.requires_email_verification) {
            return {
              success: true,
              requiresEmailVerification: true,
              userId: response.user_id,
              email: response.email,
              message: response.message
            }
          }
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
    },

    async updateProfileInformation(profileData: any) {
      this.isLoading = true
      try {
        // Use FormData for file upload
        const formData = new FormData()

        // Only append fields that are present in profileData
        if (profileData.username) formData.append('username', profileData.username)
        if (profileData.email) formData.append('email', profileData.email)
        if (profileData.nombre) formData.append('nombre', profileData.nombre)
        if (profileData.apellido) formData.append('apellido', profileData.apellido)
        if (profileData.telefono) formData.append('telefono', profileData.telefono)
        if (profileData.cedula) formData.append('cedula', profileData.cedula)

        if (profileData.photo) {
          formData.append('photo', profileData.photo)
        }

        if (profileData.digital_signature) {
          formData.append('digital_signature', profileData.digital_signature)
        }

        const response: any = await api.post('/api/user/profile', formData)

        if (response.user) {
          this.user = { ...this.user, ...response.user }
        }

        return { success: true, message: 'Perfil actualizado correctamente', user: response.user }
      } catch (error: any) {
        return {
          success: false,
          message: error.data?.message || 'Error al actualizar perfil',
          errors: error.data?.errors
        }
      } finally {
        this.isLoading = false
      }
    },

    async updatePassword(passwordData: any) {
      this.isLoading = true
      try {
        await api.put('/api/user/password', passwordData)
        return { success: true, message: 'Contraseña actualizada correctamente' }
      } catch (error: any) {
        return {
          success: false,
          message: error.data?.message || 'Error al actualizar contraseña',
          errors: error.data?.errors
        }
      } finally {
        this.isLoading = false
      }
    },

    async validateCurrentPassword(password: string) {
      try {
        const response: any = await api.post('/api/user/validate-password', { password })
        return { success: true, valid: response.valid }
      } catch (error) {
        return { success: false, valid: false }
      }
    }
  }
})
