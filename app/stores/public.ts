import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface PublicInfo {
  name: string
  abbreviation: string
  description: string
  public_description: string
  logo_url: string
  banner_url: string
  hero_image_url: string
  director_name: string
  director_bio: string
  director_image_url: string
  sello: string
  sello_institucional: string
  contact: {
    email: string
    phone: string
    address: string
    departamento: string
    municipio: string
  }
  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
}

export const usePublicStore = defineStore('public', {
  state: () => ({
    info: null as PublicInfo | null,
    news: [] as any[],
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    async fetchPublicData(subdomain: string) {
      this.isLoading = true
      this.error = null
      
      try {
        // En Nuxt 3, podemos llamar a la API usando el subdominio como contexto
        // El backend está configurado para manejar /api/{subdomain}/public-web/info
        const [infoRes, newsRes] = await Promise.all([
          api.get(`/api/${subdomain}/public-web/info`),
          api.get(`/api/${subdomain}/public-web/news`)
        ])

        if (infoRes.success && infoRes.data) {
          const config = useRuntimeConfig()
          const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
          
          const normalizeUrl = (url?: string) => {
            if (!url) return ''
            if (url.startsWith('http')) {
              // Si es una URL de localhost o del dominio base, normalizarla al apiBase actual
              // Esto arregla problemas de CORS o puertos incorrectos en local
              return url.replace(/https?:\/\/(localhost:8010|127\.0\.0\.1:8010|escosoft\.online|api\.escosoft\.online)/, apiBase)
            }
            return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
          }

          const data = infoRes.data
          this.info = {
            ...data,
            logo_url: normalizeUrl(data.logo_url),
            hero_image_url: normalizeUrl(data.hero_image_url),
            banner_url: normalizeUrl(data.banner_url),
            director_image_url: normalizeUrl(data.director_image_url),
            sello_institucional: normalizeUrl(data.sello_institucional)
          }
        }
        
        if (newsRes.success && newsRes.data) {
          const config = useRuntimeConfig()
          const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
          this.news = newsRes.data.map((item: any) => ({
            ...item,
            attachment_path: item.attachment_path ? 
              (item.attachment_path.startsWith('http') ? 
                item.attachment_path.replace(/https?:\/\/(localhost:8010|127\.0\.0\.1:8010|escosoft\.online|api\.escosoft\.online)/, apiBase) : 
                `${apiBase}${item.attachment_path.startsWith('/') ? '' : '/'}${item.attachment_path}`) : 
              null
          }))
        }

      } catch (err: any) {
        console.error('Error fetching public data:', err)
        this.error = err.message || 'No se pudo cargar la información de la institución.'
      } finally {
        this.isLoading = false
      }
    }
  }
})
