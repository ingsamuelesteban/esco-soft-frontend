<template>
  <div class="relative tasks-container">
    <button @click="toggleTasks"
      class="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative focus:outline-none transition-colors duration-200"
      :class="{ 'bg-gray-100 text-primary-600': isOpen }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <!-- Badge de tareas pendientes/vencidas -->
      <span v-if="taskStore.overdueCount > 0"
        class="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse">
      </span>
      <span v-else-if="taskStore.todayCount > 0"
        class="absolute top-1 right-1 h-3 w-3 rounded-full bg-orange-400 ring-2 ring-white">
      </span>
    </button>

    <!-- Dropdown Tareas -->
    <Transition enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2">
      <div v-if="isOpen"
        class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden flex flex-col max-h-[600px]">
        
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 class="text-base font-bold text-gray-800">Mis Tareas</h3>
            <p v-if="taskStore.overdueCount > 0" class="text-[10px] text-red-500 font-medium">
              Tienes {{ taskStore.overdueCount }} tareas vencidas
            </p>
          </div>
          <button @click="isAdding = !isAdding" 
            class="text-primary-600 hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-all duration-200">
            <svg v-if="!isAdding" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Add Task Form -->
        <div v-if="isAdding" class="p-4 bg-gray-50 border-b border-gray-100 space-y-3 shadow-inner">
          <input v-model="newTask.title" type="text" placeholder="¿Qué hay que hacer?" 
            class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-medium" />
          <textarea v-model="newTask.details" placeholder="Detalles (opcional)" rows="2"
            class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"></textarea>
          
          <div class="flex items-center space-x-2">
            <button @click="setDueDate('today')" :class="newTask.due_date === todayFormatted ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-white text-gray-600 border-gray-200'"
              class="text-[11px] px-2 py-1.5 rounded-md border hover:border-primary-300 transition-all font-medium">Hoy</button>
            <button @click="setDueDate('tomorrow')" :class="newTask.due_date === tomorrowFormatted ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-white text-gray-600 border-gray-200'"
              class="text-[11px] px-2 py-1.5 rounded-md border hover:border-primary-300 transition-all font-medium">Mañana</button>
            <input type="date" v-model="newTask.due_date" 
              class="text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 outline-none h-[30px]" />
          </div>

          <div class="flex justify-end space-x-2 pt-1">
            <button @click="saveTask" :disabled="!newTask.title || isSaving"
              class="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-700 disabled:opacity-50 transition-all">
              {{ isSaving ? 'Guardando...' : 'Crear' }}
            </button>
          </div>
        </div>

        <!-- Task List -->
        <div class="overflow-y-auto flex-1 bg-white">
          <div v-if="taskStore.isLoading && taskStore.tasks.length === 0" class="p-8 text-center">
            <div class="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          </div>

          <div v-else-if="taskStore.tasks.length === 0" class="p-12 text-center flex flex-col items-center opacity-60">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-task-found-illustration-download-in-svg-png-gif-formats--list-clipboard-results-empty-activity-management-pack-business-illustrations-4541703.png" 
              class="w-32 h-32 object-contain grayscale mb-4" />
            <p class="text-sm font-medium text-gray-500">No tienes tareas pendientes</p>
            <button @click="isAdding = true" class="mt-4 text-xs font-bold text-primary-600 hover:underline">Añade tu primera tarea</button>
          </div>

          <div v-else class="pb-4">
            <!-- Pendientes Section -->
            <div v-if="pendingTasks.length > 0">
              <div class="px-4 py-2 bg-gray-50/50 flex items-center justify-between">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pendientes ({{ pendingTasks.length }})</span>
              </div>
              <ul class="divide-y divide-gray-50">
                <li v-for="task in pendingTasks" :key="task.id" 
                  class="group hover:bg-blue-50/30 transition-colors duration-150 p-4 flex items-start space-x-3">
                  <!-- Checkbox -->
                  <button @click="toggleComplete(task)" 
                    class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary-500'">
                    <svg v-if="task.is_completed" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h4 class="text-sm font-bold truncate pr-4" :class="task.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'">
                        {{ task.title }}
                      </h4>
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="deleteTask(task.id)" class="text-gray-400 hover:text-red-500 p-0.5">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p v-if="task.details" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ task.details }}</p>
                    <div class="flex items-center mt-2 space-x-2">
                      <span v-if="task.due_date" class="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center" :class="getDateBadgeClass(task)">
                        <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(task.due_date) }}
                      </span>
                      <span v-if="isUpcoming(task.due_date)" class="text-[9px] uppercase tracking-wider text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded">Próxima</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Completadas Section -->
            <div v-if="completedTasks.length > 0" class="mt-2">
              <button @click="showCompleted = !showCompleted" 
                class="w-full px-4 py-2 bg-gray-50/50 flex items-center justify-between hover:bg-gray-100 transition-colors">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completadas ({{ completedTasks.length }})</span>
                <svg class="h-4 w-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': showCompleted }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul v-if="showCompleted" class="divide-y divide-gray-50">
                <li v-for="task in completedTasks" :key="task.id" 
                  class="group hover:bg-gray-50/30 transition-colors duration-150 p-4 flex items-start space-x-3 bg-gray-50/20">
                  <!-- Checkbox -->
                  <button @click="toggleComplete(task)" 
                    class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-green-500 border-green-500">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h4 class="text-sm font-bold truncate pr-4 text-gray-400 line-through">
                        {{ task.title }}
                      </h4>
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="deleteTask(task.id)" class="text-gray-400 hover:text-red-500 p-0.5">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="p-3 border-t border-gray-100 bg-gray-50 flex justify-center sticky bottom-0 z-10">
          <p class="text-[10px] text-gray-400 font-medium">Gestiona tus tareas diarias de forma eficiente</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useTaskStore } from '../../stores/tasks'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const taskStore = useTaskStore()
const isOpen = ref(false)
const isAdding = ref(false)
const isSaving = ref(false)
const showCompleted = ref(false)

const newTask = ref({
  title: '',
  details: '',
  due_date: null
})

const pendingTasks = computed(() => taskStore.tasks.filter(t => !t.is_completed))
const completedTasks = computed(() => taskStore.tasks.filter(t => t.is_completed))

const todayFormatted = computed(() => dayjs().format('YYYY-MM-DD'))
const tomorrowFormatted = computed(() => dayjs().add(1, 'day').format('YYYY-MM-DD'))

const toggleTasks = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    taskStore.fetchTasks()
    taskStore.fetchStats()
  }
}

const setDueDate = (type) => {
  if (type === 'today') newTask.value.due_date = todayFormatted.value
  if (type === 'tomorrow') newTask.value.due_date = tomorrowFormatted.value
}

const saveTask = async () => {
  if (!newTask.value.title) return
  isSaving.value = true
  try {
    await taskStore.addTask(newTask.value)
    newTask.value = { title: '', details: '', due_date: null }
    isAdding.value = false
  } finally {
    isSaving.value = false
  }
}

const toggleComplete = (task) => {
  taskStore.toggleTask(task.id)
}

const deleteTask = async (id) => {
  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
    await taskStore.deleteTask(id)
  }
}

const formatDate = (date) => {
  const d = dayjs(date)
  if (d.isSame(dayjs(), 'day')) return 'Hoy'
  if (d.isSame(dayjs().add(1, 'day'), 'day')) return 'Mañana'
  return d.format('DD MMM')
}

const isOverdue = (date) => {
  if (!date) return false
  return dayjs(date).isBefore(dayjs(), 'day')
}

const isUpcoming = (date) => {
  if (!date) return false
  const d = dayjs(date)
  const today = dayjs()
  return (d.isSame(today, 'day') || d.isAfter(today, 'day')) && d.isBefore(today.add(3, 'day'), 'day')
}

const getDateBadgeClass = (task) => {
  if (task.is_completed) return 'bg-gray-100 text-gray-500 border border-gray-200'
  if (isOverdue(task.due_date)) return 'bg-red-50 text-red-600 border border-red-100 animate-pulse'
  if (dayjs(task.due_date).isSame(dayjs(), 'day')) return 'bg-orange-50 text-orange-600 border border-orange-100'
  return 'bg-blue-50 text-blue-600 border border-blue-100'
}

// Click outside to close
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target.closest('.tasks-container')
    if (!target && isOpen.value) {
      isOpen.value = false
    }
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
