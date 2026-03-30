<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          <!-- Logo & Name -->
          <div class="flex items-center space-x-3">
            <img v-if="store.info?.logo_url" :src="store.info.logo_url" :alt="store.info.name" class="h-12 w-12 object-contain rounded-lg shadow-sm" />
            <div class="flex flex-col">
              <span class="text-xl font-extrabold text-[#1a365d] tracking-tight leading-tight uppercase font-outfit">
                {{ store.info?.name || 'Cargando...' }}
              </span>
              <span class="text-xs font-semibold text-gray-500 tracking-wider">
                {{ store.info?.abbreviation || 'CENTRO EDUCATIVO' }}
              </span>
            </div>
          </div>

          <!-- Desktop Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#inicio" class="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Inicio</a>
            <a href="#noticias" class="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Noticias</a>
            <a href="#contacto" class="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Contacto</a>
            
            <button @click="goToLogin" class="bg-[#1a365d] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all transform hover:-translate-y-0.5">
              Portal Institucional
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <transition 
        enter-active-class="transition duration-150 ease-out" 
        enter-from-class="opacity-0 scale-95" 
        enter-to-class="opacity-100 scale-100" 
        leave-active-class="transition duration-100 ease-in" 
        leave-from-class="opacity-100 scale-100" 
        leave-to-class="opacity-0 scale-95"
      >
        <div v-show="mobileMenuOpen" class="md:hidden absolute top-20 inset-x-0 p-4 z-50">
          <div class="rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 bg-white divide-y divide-gray-100 overflow-hidden">
            <div class="px-5 pt-5 pb-6 space-y-4">
              <a href="#inicio" class="block text-base font-medium text-gray-900 border-l-4 border-transparent hover:border-blue-500 pl-3">Inicio</a>
              <a href="#noticias" class="block text-base font-medium text-gray-900 border-l-4 border-transparent hover:border-blue-500 pl-3">Noticias</a>
              <a href="#contacto" class="block text-base font-medium text-gray-900 border-l-4 border-transparent hover:border-blue-500 pl-3">Contacto</a>

              <button @click="goToLogin" class="w-full bg-[#1a365d] text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg">
                Portal Institucional
              </button>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer v-if="store.info" class="bg-[#1a365d] text-white pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-12">
          <!-- About -->
          <div class="space-y-4">
             <div class="flex items-center space-x-3">
              <img v-if="store.info.logo_url" :src="store.info.logo_url" class="h-10 w-10 brightness-0 invert opacity-90" />
              <span class="text-xl font-bold uppercase tracking-tight">{{ store.info.name }}</span>
            </div>
            <p class="text-white/60 text-sm leading-relaxed max-w-sm">
              {{ store.info.public_description || store.info.description || '' }}
            </p>
          </div>

          <!-- Contact Info -->
          <div v-if="store.info.contact" id="contacto">
            <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Contacto</h3>
            <ul class="space-y-4">
              <li class="flex items-start group">
                <svg class="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div class="text-sm text-white/70">
                  <p>{{ store.info.contact.address }}</p>
                  <p class="text-xs opacity-60">{{ store.info.contact.municipio }}, {{ store.info.contact.departamento }}</p>
                </div>
              </li>
              <li class="flex items-center text-sm text-white/70 group">
                <svg class="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ store.info.contact.phone }}
              </li>
              <li class="flex items-center text-sm text-white/70 group">
                <svg class="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ store.info.contact.email }}
              </li>
            </ul>
          </div>

          <!-- Fast Links & Socials -->
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Redes Sociales</h3>
            <div class="flex space-x-5 mb-8">
              <!-- Reemplazar con íconos reales de FontAwesome o similares si están disponibles -->
              <a v-if="store.info?.social_media.facebook" :href="store.info.social_media.facebook" target="_blank" class="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                 <span class="sr-only">Facebook</span>
                 <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a v-if="store.info?.social_media.instagram" :href="store.info.social_media.instagram" target="_blank" class="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <span class="sr-only">Instagram</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.063-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.112.261-2.862.553-.775.301-1.432.704-2.088 1.36-.656.656-1.059 1.313-1.36 2.088-.292.75-.495 1.582-.553 2.862-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.28.261 2.112.553 2.862.301.775.704 1.432 1.36 2.088.656.656 1.313 1.059 2.088 1.36.75.292 1.582.495 2.862.553 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.28-.058 2.112-.261 2.862-.553.775-.301 1.432-.704 2.088-1.36.656-.656 1.059-1.313 1.36-2.088.292-.75.495-1.582.553-2.862.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.28-.261-2.112-.553-2.862-.301-.775-.704-1.432-1.36-2.088-.656-.656-1.313-1.059-2.088-1.36-.75-.292-1.582-.495-2.862-.553-1.28-.058-1.688-.072-4.947-.072zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>

            <button @click="goToLogin" class="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold flex items-center">
              Administración Central
              <svg class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 font-bold uppercase tracking-widest border-t border-white/5">
          <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© 2026 EscoSoft. Powering Education.</p>
            <span class="hidden md:inline">•</span>
            <p>Todos los derechos reservados Ing. Samuel Esteban</p>
          </div>
          
          <div class="flex items-center space-x-6 mt-6 md:mt-0">
            <!-- WhatsApp Contact -->
            <a href="https://wa.me/18097034173" target="_blank" class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.133 1.441 4.734 1.442h.005c5.42 0 9.83-4.409 9.833-9.831.002-2.628-1.02-5.1-2.877-6.957-1.856-1.856-4.329-2.879-6.957-2.88-5.424 0-9.833 4.411-9.836 9.833-.001 1.734.457 3.422 1.326 4.908l-.88 3.219 3.289-.863zm11.721-6.872c-.322-.161-1.898-.937-2.187-1.042-.289-.105-.499-.158-.709.158-.211.315-.815 1.042-1.001 1.253-.185.21-.371.237-.693.076-.322-.161-1.359-.501-2.588-1.598-.958-.854-1.605-1.91-1.794-2.225-.189-.315-.02-.486.141-.646.144-.144.322-.376.483-.563.161-.188.214-.32.321-.531.107-.212.053-.398-.026-.558-.079-.161-.709-1.708-.971-2.339-.255-.615-.515-.531-.709-.541-.185-.01-.397-.012-.609-.012-.211 0-.553.079-.843.395-.29.316-1.107 1.081-1.107 2.637 0 1.556 1.133 3.058 1.289 3.269.157.211 2.23 3.404 5.399 4.773.754.326 1.341.521 1.8.665.757.241 1.446.207 1.991.127.608-.089 1.898-.775 2.162-1.525.263-.75.263-1.396.184-1.525-.079-.131-.29-.21-.611-.371z"/>
              </svg>
              WhatsApp
            </a>
            <div class="flex space-x-6">
              <a href="#" class="hover:text-white transition-colors">Términos</a>
              <a href="#" class="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePublicStore } from '~/stores/public'

const store = usePublicStore()
const mobileMenuOpen = ref(false)

const goToLogin = () => {
    // Redirigir al dominio principal para el login, 
    // pero manteniendo el contexto (o forzando el login global)
    // El usuario mencionó que quiere que sea accesible desde aquí.
    const mainHost = 'escosoft.online'
    window.location.href = `https://${mainHost}/login`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.font-outfit {
  font-family: 'Outfit', sans-serif;
}

body {
  font-family: 'Inter', sans-serif;
}
</style>
