import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-10-25',
  devtools: { enabled: true },

  // App metadata
  app: {
    head: {
      title: 'EscoSoft - Sistema de Gestión Escolar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema integral de gestión escolar para instituciones educativas' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },

  // Source directory
  srcDir: 'app',

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ['@nuxtjs/color-mode', {
      preference: 'light',
      fallback: 'light',
      classPrefix: '',
      classSuffix: '',
      storageKey: 'escosoft-color-mode'
    }]
  ],

  // Tailwind CSS config
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    viewer: true
  },

  // Docker-friendly Nitro preset
  nitro: {
    preset: 'node-server'
  },

  // Public runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8010',
      sanctumEndpoint: process.env.NUXT_PUBLIC_SANCTUM_ENDPOINT || 'http://localhost:8010/sanctum/csrf-cookie',
      // Reverb WebSocket Configuration
      reverb: {
        appKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || 'm8ltbfspcqtzuj4girhc',
        host: process.env.NUXT_PUBLIC_REVERB_HOST || 'api.escosoft.online',
        port: process.env.NUXT_PUBLIC_REVERB_PORT || '443',
        scheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'https'
      }
    }
  },

  // SSR configuration for SPA mode with cookie-based auth
  ssr: false,

  hooks: {
    'build:before'() {
      const versionPath = path.resolve(__dirname, 'public/version.json')
      const versionData = { version: Date.now().toString() }
      fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2))
      console.log('\x1b[32m%s\x1b[0m', '✔ Generated public/version.json with version:', versionData.version)
    }
  }
})
