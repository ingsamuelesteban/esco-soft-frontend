<template>
  <aside
    class="flex flex-col h-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700 transition-colors duration-300 select-none"
  >
    <!-- Logo / Branding -->
    <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-slate-700 px-4 shrink-0">
      <div class="flex items-center space-x-2">
        <img
          src="/images/logo.png?v=3"
          alt="EscoSoft"
          class="h-14 w-auto max-w-[180px] object-contain scale-110"
        />
      </div>
    </div>

    <!-- Navegación principal -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
      <div v-if="isMenuLoaded" class="space-y-1.5">
        <template v-for="item in sortedMenuItems" :key="item.id">
          <!-- Ítems directos sin hijos (ej. Panel / Dashboard) -->
          <NuxtLink
            v-if="!item.children && item.route"
            :to="item.route"
            class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150"
            :class="
              isActive(item.route)
                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-2xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-gray-100 hover:dark:bg-slate-700/50'
            "
            @click="handleNavClick"
          >
            <span
              class="mr-3 flex items-center justify-center h-5 w-5 transition-colors"
              :class="
                isActive(item.route)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
              "
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  v-for="(d, idx) in getIconPaths(item.icon)"
                  :key="idx"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="d"
                />
              </svg>
            </span>
            <span class="truncate">{{ item.label }}</span>
          </NuxtLink>

          <!-- Secciones colapsables con hijos -->
          <div
            v-else-if="item.children && item.children.length > 0"
            class="rounded-xl transition-colors"
            :class="
              isGroupOpen(item.id)
                ? 'bg-gray-50/70 dark:bg-slate-800/90'
                : ''
            "
          >
            <button
              type="button"
              class="group w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150"
              :class="
                hasActiveChild(item)
                  ? 'text-primary-700 dark:text-primary-300 bg-primary-50/60 dark:bg-primary-900/30 hover:bg-primary-50 hover:dark:bg-slate-700/50'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-gray-100 hover:dark:bg-slate-700/50'
              "
              :aria-expanded="isGroupOpen(item.id)"
              @click="toggleGroup(item.id)"
            >
              <span class="flex items-center min-w-0">
                <span
                  class="mr-3 flex items-center justify-center h-5 w-5 shrink-0 transition-colors"
                  :class="
                    hasActiveChild(item)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  "
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      v-for="(d, idx) in getIconPaths(item.icon)"
                      :key="idx"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="d"
                    />
                  </svg>
                </span>
                <span class="truncate text-left">{{ item.label }}</span>
              </span>

              <span class="ml-2 flex items-center gap-1.5 shrink-0">
                <span
                  v-if="hasActiveChild(item) && !isGroupOpen(item.id)"
                  class="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400"
                ></span>
                <svg
                  class="h-4 w-4 text-slate-400 dark:text-slate-400 transform transition-transform duration-200 ease-in-out"
                  :class="{ 'rotate-180 text-slate-600 dark:text-slate-200': isGroupOpen(item.id) }"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </button>

            <!-- Animación suave de apertura/cierre de submenú -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out overflow-hidden"
              enter-from-class="max-h-0 opacity-0 -translate-y-1"
              enter-to-class="max-h-[600px] opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in overflow-hidden"
              leave-from-class="max-h-[600px] opacity-100 translate-y-0"
              leave-to-class="max-h-0 opacity-0 -translate-y-1"
            >
              <div
                v-show="isGroupOpen(item.id)"
                class="mt-1 ml-4 pl-3 border-l border-gray-200 dark:border-slate-700 space-y-1 pb-1"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.id"
                  :to="child.route"
                  class="group flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-150"
                  :class="
                    isActive(child.route)
                      ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 hover:dark:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                  "
                  @click="handleNavClick"
                >
                  <svg
                    class="mr-2.5 h-4 w-4 shrink-0 transition-colors"
                    :class="
                      isActive(child.route)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      v-for="(d, idx) in getIconPaths(child.icon)"
                      :key="idx"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="d"
                    />
                  </svg>
                  <span class="truncate">{{ child.label }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </template>
      </div>

      <!-- Loading state -->
      <div v-else class="space-y-2">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    </nav>

    <!-- Pie del Aside con controles rápidos de secciones -->
    <div class="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>Menú Administrativo</span>
      <button
        v-if="hasAnyOpenGroup"
        type="button"
        @click="collapseAllGroups"
        class="hover:text-slate-800 dark:hover:text-slate-200 underline transition-colors"
      >
        Colapsar todo
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenu } from '~/composables/useMenu'
import { useAuthStore } from '~/stores/auth'
import { useMenuFilter } from '~/composables/useMenuFilter'
import { usePermissions } from '~/composables/usePermissions'

const STORAGE_KEY = 'asideOpenGroups'

const route = useRoute()
const { menuItems, isMenuLoaded, loadMenu } = useMenu()
const authStore = useAuthStore()
const { filterMenu } = useMenuFilter()
const { can } = usePermissions()

const emit = defineEmits(['close-sidebar'])

// Estado reactivo de qué secciones están abiertas (persistido en localStorage)
const openGroups = ref<Record<string, boolean>>({})
const isClient = ref(false)

// Verificar si una ruta está activa
const isActive = (path?: string) => {
  if (!path) return false

  if (path === '/') {
    return route.path === '/'
  }

  if (route.path === path) {
    return true
  }

  if (path === '/horarios' && route.path.startsWith('/horarios/')) {
    return false
  }

  if (route.path.startsWith(path)) {
    const remainder = route.path.slice(path.length)
    if (remainder === '') return true

    if (path === '/psicologia') {
      if (remainder.startsWith('/estadisticas') || remainder.startsWith('/categorias')) {
        return false
      }
    }

    if (path === '/personal') {
      if (remainder.startsWith('/permisos')) {
        return false
      }
    }

    if (path === '/admin/admisiones') {
      if (
        remainder.startsWith('/fechas') ||
        remainder.startsWith('/uniformes') ||
        remainder.startsWith('/facturas-uniformes') ||
        remainder.startsWith('/examenes') ||
        remainder.startsWith('/asignar-aulas')
      ) {
        return false
      }
    }

    if (remainder.startsWith('/') && path !== '/horarios') return true
    if (path.endsWith('/')) return true
  }

  return false
}

const hasActiveChild = (group: any): boolean => {
  if (!group?.children || !Array.isArray(group.children)) return false
  return group.children.some((child: any) => isActive(child.route))
}

// Obtener menú ordenado y filtrado por permisos y features del tenant
const sortedMenuItems = computed(() => {
  const activeFeatures = authStore.tenantFeatures || []
  const userRole = authStore.user?.role || ''

  const sorted = [...menuItems.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  const filtered = filterMenu(sorted as any, activeFeatures, userRole) as any[]

  // Validar con can('materiales.index') la visibilidad de Entrega de Materiales
  return filtered
    .map((item) => {
      if (Array.isArray(item.children)) {
        const children = item.children.filter((child: any) => {
          if (child.route === '/admin/materiales' || child.id === 'materiales-entrega') {
            return can('materiales.index')
          }
          return true
        })
        return { ...item, children }
      }
      if (item.route === '/admin/materiales' || item.id === 'materiales-entrega') {
        return can('materiales.index') ? item : null
      }
      return item
    })
    .filter((item) => item && (!item.children || item.children.length > 0))
})

const saveOpenGroupsToStorage = () => {
  if (!isClient.value) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups.value))
  } catch (_) {}
}

// Si la ruta activa actual pertenece a un grupo cerrado, ese grupo debe abrirse automáticamente
const ensureActiveGroupIsOpen = () => {
  let changed = false
  for (const item of sortedMenuItems.value) {
    if (item?.children && hasActiveChild(item)) {
      if (!openGroups.value[item.id]) {
        openGroups.value[item.id] = true
        changed = true
      }
    }
  }
  if (changed) {
    saveOpenGroupsToStorage()
  }
}

onMounted(async () => {
  isClient.value = true

  // 1. Restaurar estado guardado en localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        openGroups.value = parsed
      }
    }
  } catch (_) {
    openGroups.value = {}
  }

  // 2. Cargar menú desde el API si hay sesión activa
  if (authStore.isAuthenticated && authStore.token) {
    await loadMenu()
  }

  // 3. Asegurar que el grupo de la ruta activa esté abierto
  ensureActiveGroupIsOpen()
})

// Observar cambios de ruta o de ítems del menú para abrir automáticamente el grupo activo
watch(
  [() => route.path, sortedMenuItems],
  () => {
    ensureActiveGroupIsOpen()
  },
  { immediate: true }
)

// Persistir cualquier cambio en openGroups en localStorage
watch(
  openGroups,
  () => {
    saveOpenGroupsToStorage()
  },
  { deep: true }
)

const toggleGroup = (key: string) => {
  openGroups.value[key] = !isGroupOpen(key)
}

const isGroupOpen = (key: string): boolean => {
  if (!isClient.value) {
    const item = sortedMenuItems.value.find((g) => g.id === key)
    return item ? hasActiveChild(item) : false
  }
  return Boolean(openGroups.value[key])
}

const hasAnyOpenGroup = computed(() => {
  return Object.values(openGroups.value).some((v) => Boolean(v))
})

const collapseAllGroups = () => {
  const nextState: Record<string, boolean> = {}
  Object.keys(openGroups.value).forEach((k) => {
    nextState[k] = false
  })
  openGroups.value = nextState
}

const handleNavClick = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    emit('close-sidebar')
  }
}

// Mapa de íconos SVG limpios
const getIconPaths = (icon?: string): string[] => {
  switch (icon) {
    case 'home':
      return ['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6']
    case 'academic-cap':
    case 'graduation-cap':
      return [
        'M12 14l9-5-9-5-9 5 9 5z',
        'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      ]
    case 'briefcase':
      return ['M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']
    case 'package':
      return ['M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4']
    case 'shopping-bag':
      return ['M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z']
    case 'credit-card':
    case 'banknotes':
      return ['M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z']
    case 'receipt':
      return ['M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z']
    case 'arrow-path':
      return ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15']
    case 'users':
      return ['M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z']
    case 'user-tie':
      return ['M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z']
    case 'user-plus':
      return ['M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z']
    case 'user-check':
      return ['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z']
    case 'calendar':
    case 'calendar-days':
      return ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z']
    case 'clock':
      return ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z']
    case 'clipboard':
    case 'clipboard-list':
      return ['M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01']
    case 'list':
      return ['M9 12h6m-6 4h6M9 8h6M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z']
    case 'book':
      return ['M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253']
    case 'door-open':
      return ['M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4']
    case 'lock':
      return ['M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z']
    case 'key':
      return ['M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z']
    case 'shield-check':
      return ['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z']
    case 'megaphone':
      return ['M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z']
    case 'settings':
    case 'wrench':
      return [
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      ]
    case 'flag':
      return ['M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H11l-1-1H5a2 2 0 00-2 2zm9-13.5V9']
    case 'alert-triangle':
    case 'alert-circle':
      return ['M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z']
    case 'chart-bar':
      return ['M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z']
    case 'tags':
      return ['M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z']
    case 'share':
      return ['M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z']
    default:
      return ['M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10']
  }
}
</script>
