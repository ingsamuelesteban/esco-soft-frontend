<template>
  <aside class="flex flex-col h-full bg-white border-r border-gray-200">
    <!-- Logo / Branding -->
    <div class="flex items-center justify-center h-16 border-b border-gray-200 px-4">
      <div class="flex items-center space-x-2">
        <img src="/images/logo.png" alt="EscoSoft" class="h-14 w-auto max-w-[180px] object-contain scale-110" />
      </div>
    </div>

    <!-- Navegación principal -->
    <nav class="flex-1 overflow-y-auto p-4">
      <div class="space-y-1" v-if="isMenuLoaded">
        <!-- Renderizar menú dinámicamente -->
        <template v-for="item in sortedMenuItems" :key="item.id">
          <!-- Items sin hijos -->
          <NuxtLink
            v-if="!item.children && item.route"
            :to="item.route"
            class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
            :class="isActive(item.route) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
            @click="handleNavClick"
          >
            <svg class="mr-3 h-5 w-5" 
              :class="isActive(item.route) ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="item.icon === 'home'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              <path v-else-if="item.icon === 'clipboard'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              <path v-else-if="item.icon === 'clock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path v-else-if="item.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <path v-else-if="item.icon === 'user-tie'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <path v-else-if="item.icon === 'briefcase'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {{ item.label }}
          </NuxtLink>

          <!-- Items con hijos (grupos) -->
          <div v-else-if="item.children">
            <button type="button" 
              class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              @click="toggleGroup(item.id)">
              <span class="flex items-center">
                <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="item.icon === 'calendar'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <path v-else-if="item.icon === 'folder'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {{ item.label }}
              </span>
              <svg class="h-4 w-4 text-gray-400 transform transition-transform" 
                :class="{ 'rotate-180': isGroupOpen(item.id) }" 
                viewBox="0 0 20 20" 
                fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <div v-show="isGroupOpen(item.id)" class="mt-1 pl-9 space-y-1">
              <NuxtLink 
                v-for="child in item.children" 
                :key="child.id"
                :to="child.route" 
                class="group flex items-center px-3 py-2 text-sm rounded-lg transition-colors"
                :class="isActive(child.route) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
                @click="handleNavClick">
                <svg class="mr-3 h-4 w-4" 
                  :class="isActive(child.route) ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="child.icon === 'clock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="child.icon === 'list'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M9 8h6M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  <path v-else-if="child.icon === 'calendar-days'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="child.icon === 'settings'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <path v-else-if="child.icon === 'folder-tree'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  <path v-else-if="child.icon === 'graduation-cap'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m4 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="child.icon === 'book'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  <path v-else-if="child.icon === 'door-open'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  <path v-else-if="child.icon === 'user-tie'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Loading state -->
      <div v-else class="space-y-2">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </nav>

    <!-- Área inferior (opcional para futuro) -->
    <div class="p-4 border-t border-gray-200">
      <!-- Espacio para información adicional del usuario o configuraciones -->
    </div>
  </aside>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenu } from '~/composables/useMenu'

const route = useRoute()
const { menuItems, isMenuLoaded, loadMenu } = useMenu()

// Definir el emit para cerrar el sidebar
const emit = defineEmits(['close-sidebar'])

// Estado de grupos abiertos, persistido
const openGroups = ref({})
const isClient = ref(false)

// Cargar menú al montar el componente
onMounted(async () => {
  await loadMenu()
  
  // Cargar estado de grupos desde localStorage
  isClient.value = true
  try {
    const raw = localStorage.getItem('asideOpenGroups')
    openGroups.value = raw ? JSON.parse(raw) : {}
  } catch (_) {
    openGroups.value = {}
  }
})

// Función para verificar si una ruta está activa
const isActive = (path) => {
  if (!path) return false
  
  // Para la ruta raíz, debe ser exacta
  if (path === '/') {
    return route.path === '/'
  }
  
  // Comparación exacta primero
  if (route.path === path) {
    return true
  }
  
  // Casos especiales para evitar conflictos entre rutas similares
  // Si la ruta es '/horarios' y estamos en '/horarios/algo', NO es activa
  if (path === '/horarios' && route.path.startsWith('/horarios/')) {
    return false
  }
  
  // Para otras rutas con sub-rutas, verificar que sea una sub-ruta válida
  if (route.path.startsWith(path)) {
    const remainder = route.path.slice(path.length)
    // Si no hay resto, es exacta
    if (remainder === '') return true
    // Si el resto empieza con / y el path NO es '/horarios', es una sub-ruta válida
    if (remainder.startsWith('/') && path !== '/horarios') return true
    // Si el path termina con /, es válida
    if (path.endsWith('/')) return true
  }
  
  return false
}

// Obtener menú ordenado
const sortedMenuItems = computed(() => {
  return [...menuItems.value].sort((a, b) => a.order - b.order)
})

// Persistir estado en localStorage
watch(openGroups, (val) => {
  if (isClient.value) {
    try { 
      localStorage.setItem('asideOpenGroups', JSON.stringify(val)) 
    } catch (_) {}
  }
}, { deep: true })

const toggleGroup = (key) => {
  const isCurrentlyOpen = openGroups.value[key]
  
  // Comportamiento acordeón: cerrar todos los grupos primero
  Object.keys(openGroups.value).forEach(groupKey => {
    openGroups.value[groupKey] = false
  })
  
  // Si el grupo no estaba abierto, abrirlo
  if (!isCurrentlyOpen) {
    openGroups.value[key] = true
  }
}

const isGroupOpen = (key) => {
  // Durante SSR, usar solo el estado por defecto basado en ruta
  if (!isClient.value) {
    // Auto-abrir grupos que contienen la ruta activa
    const menuItem = menuItems.value.find(item => item.id === key)
    if (menuItem?.children) {
      return menuItem.children.some(child => isActive(child.route))
    }
    return false
  }
  
  // Comportamiento acordeón: verificar si este grupo específico está abierto
  const stored = openGroups.value[key]
  
  // Si no hay estado almacenado, verificar si contiene una ruta activa
  if (stored === undefined) {
    const menuItem = menuItems.value.find(item => item.id === key)
    const hasActiveChild = menuItem?.children?.some(child => isActive(child.route)) || false
    
    // Si tiene un hijo activo, abrir solo este grupo (acordeón)
    if (hasActiveChild) {
      // Cerrar todos los otros grupos primero
      Object.keys(openGroups.value).forEach(groupKey => {
        if (groupKey !== key) {
          openGroups.value[groupKey] = false
        }
      })
      openGroups.value[key] = true
      return true
    }
    return false
  }
  
  return stored
}

// Función para manejar clics en links de navegación
const handleNavClick = () => {
  // Verificar si estamos en pantalla pequeña (mobile)
  if (window.innerWidth < 768) { // md breakpoint
    emit('close-sidebar')
  }
}
</script>

<style scoped>
/* Añadir estilos específicos si es necesario */
</style>

