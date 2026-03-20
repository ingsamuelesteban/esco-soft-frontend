<template>
  <div class="relative overflow-hidden min-h-screen bg-white">
    <!-- Loading Overlay -->
    <div v-if="store.isLoading && !store.info" class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <div class="relative w-24 h-24">
        <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p class="mt-6 text-slate-500 font-medium animate-pulse">Cargando la mejor experiencia educativa...</p>
    </div>

    <div v-else-if="!store.info && !store.isLoading" class="flex items-center justify-center min-h-screen bg-gray-50 p-6">
       <div class="text-center max-w-md">
          <div class="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 mb-6">
             <svg class="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             <h3 class="text-xl font-bold">Institución no encontrada</h3>
             <p class="mt-2 text-red-500/80">{{ store.error || 'Verifica que el subdominio sea el correcto o que la página pública esté habilitada.' }}</p>
          </div>
          <button @click="reloadPage" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">Reintentar</button>
       </div>
    </div>
    <!-- Hero Section -->
    <section id="inicio" class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
      <!-- Background Image with Overlay -->
      <div v-if="store.info?.hero_image_url || store.info?.banner_url" class="absolute inset-0 z-0">
        <img :src="store.info.hero_image_url || store.info.banner_url" alt="Banner" class="w-full h-full object-cover opacity-30 blur-[2px] transition-transform duration-10000 hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-b from-[#1a365d]/90 via-[#1a365d]/70 to-[#1a365d]/95"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-4xl mx-auto space-y-8">
          <span class="inline-flex px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20 animate-fade-in-down">
             Bienvenidos a nuestra comunidad educativa
          </span>
          <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight font-outfit leading-tight drop-shadow-2xl">
            {{ store.info?.name }}
          </h1>
          <p class="text-lg md:text-xl text-blue-100/80 leading-relaxed font-medium">
            Formando líderes de mañana con excelencia académica hoy.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#director" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all transform hover:-translate-y-1">
              Conoce a nuestro Director
            </a>
            <a href="#noticias" class="w-full sm:w-auto text-white backdrop-blur-sm bg-white/10 border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
              Últimas Noticias
            </a>
          </div>
        </div>
      </div>
      
      <!-- Scrolling indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- About Section -->
    <section id="nosotros" class="py-24 bg-white relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="relative group">
            <div class="absolute -inset-4 bg-blue-100 rounded-3xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <img v-if="store.info?.logo_url" :src="store.info.logo_url" alt="Logo Institución" class="relative rounded-2xl shadow-2xl mx-auto max-h-80 object-contain p-8 bg-white" />
            <div v-else class="relative h-64 w-64 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
               <span class="text-gray-400 font-bold uppercase tracking-widest">Logo</span>
            </div>
          </div>
          
          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-gray-900 font-outfit uppercase tracking-tight border-l-4 border-blue-600 pl-4">Nuestra Identidad</h2>
            <p class="text-lg text-gray-600 leading-relaxed font-inter">
              {{ store.info?.public_description }}
            </p>
            <div class="grid grid-cols-2 gap-6 pt-6">
              <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-2xl font-bold text-blue-600 font-outfit">Excelencia</p>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Calidad Educativa</p>
              </div>
              <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-2xl font-bold text-blue-600 font-outfit">Liderazgo</p>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Valores y Respeto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Director Section -->
    <section v-if="store.info?.director_name" id="director" class="py-24 bg-slate-50 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div class="lg:col-span-5 bg-slate-900 relative min-h-[400px]">
                        <img v-if="store.info?.director_image_url" :src="store.info.director_image_url" class="absolute inset-0 w-full h-full object-cover opacity-80" alt="Director" />
                        <div v-else class="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-600">
                             <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                            <p class="text-white text-2xl font-bold font-outfit">{{ store.info.director_name }}</p>
                            <p class="text-blue-400 font-semibold uppercase tracking-widest text-xs">Director de la Institución</p>
                        </div>
                    </div>
                    <div class="lg:col-span-7 p-12 lg:p-20 flex flex-col justify-center space-y-8">
                        <div class="inline-flex items-center text-blue-600 font-bold uppercase tracking-tighter text-sm italic">
                            <svg class="w-10 h-10 mr-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V5C14.017 3.89543 14.9124 3 16.017 3H19.017C21.2261 3 23.017 4.79086 23.017 7V15C23.017 18.866 19.883 22 16.017 22H14.017V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H7.017C5.91243 8 5.017 7.10457 5.017 6V5C5.017 3.89543 5.91243 3 7.017 3H10.017C12.2261 3 14.017 4.79086 14.017 7V15C14.017 18.866 10.883 22 7.017 22H5.017V21Z"/></svg>
                            Palabras de nuestra dirección
                        </div>
                        <h3 class="text-3xl font-extrabold text-slate-900 font-outfit leading-tight">Liderazgo con Visión Educativa</h3>
                        <p class="text-slate-600 text-lg leading-relaxed italic border-l-4 border-blue-100 pl-6">
                            "{{ store.info.director_bio }}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- News Section -->
    <section id="noticias" class="py-24 bg-gray-50 relative overflow-hidden">
      <!-- Subtle circles -->
      <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div class="space-y-2">
            <h2 class="text-4xl font-bold text-gray-900 font-outfit uppercase tracking-tight">Publicaciones Recientes</h2>
            <p class="text-gray-500 font-semibold uppercase tracking-widest text-xs">Manténgase al día con nuestras actividades</p>
          </div>
          <button v-if="store.news.length > 3" class="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center group">
            Ver todas las publicaciones
            <svg class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <div v-if="store.news.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="item in store.news" :key="item.id" class="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col">
            <!-- News Image Placeholder or actual if exists -->
            <div class="aspect-video bg-slate-100 relative overflow-hidden">
               <img v-if="item.attachment_path" :src="item.attachment_path" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                  <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {{ new Date(item.published_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) }}
               </div>
            </div>
            
            <div class="p-8 flex-grow space-y-4">
              <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                {{ item.title }}
              </h3>
              <p class="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                {{ item.body }}
              </p>
            </div>
            
            <div class="px-8 pb-8 pt-0 mt-auto">
              <NuxtLink :to="`/noticias/${item.id}`" class="text-xs font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-600 transition-colors flex items-center">
                Leer Noticia Completa
                <svg class="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
           <p class="text-gray-400 font-bold uppercase tracking-widest">No hay publicaciones recientes en este momento.</p>
        </div>
      </div>
    </section>

    <!-- Contact Section / Already partly covered by footer in layour, but we can add more if needed -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePublicStore } from '~/stores/public'
import { useDomain } from '~/composables/useDomain'

const store = usePublicStore()
const { subdomain } = useDomain()

onMounted(() => {
    if (subdomain.value) {
        store.fetchPublicData(subdomain.value)
    }
})

const reloadPage = () => {
    if (process.client) {
        window.location.reload()
    }
}

const goToAdmissions = () => {
    // Redirigir al formulario de admisión de este tenant
    if (process.client) {
        const mainHost = 'escosoft.online'
        // Si tenemos info, podemos usar su slug o ID si existe ruta amigable
        // Por ahora redirigimos al sistema de admisiones global
        window.location.href = `https://${mainHost}/student/admision`
    }
}
</script>

<style scoped>
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease-out forwards;
}
</style>
