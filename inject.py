import sys

path = 'app/components/escosoft/Nav.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = '              </div>\n\n              <div class="max-h-[calc(100vh-200px)] overflow-y-auto">\n                <div v-if="notificationStore.isLoading && notificationStore.notifications?.length === 0"'

new_str = '''              </div>

              <!-- WebPush Toggle UI -->
              <div v-if="isSupported" class="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-300">Alertas en este equipo</span>
                <button v-if="!isSubscribed" @click.stop="subscribeUser" class="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors" style="background-color: #3b82f6;">
                  Activar
                </button>
                <button v-else @click.stop="unsubscribeUser" class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors">
                  Desactivar
                </button>
              </div>

              <div class="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div v-if="notificationStore.isLoading && notificationStore.notifications?.length === 0"'''

content = content.replace(old_str, new_str)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
