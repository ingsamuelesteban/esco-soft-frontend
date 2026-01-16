<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <!-- Header con información de la fecha y aula -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Lista de Asistencia</h3>
          <p class="text-sm text-gray-600">{{ formatFecha(fecha) }} - {{ aulaName }}</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Estadísticas rápidas -->
          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{{ attendanceStore.presentCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{{ attendanceStore.absentCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>{{ attendanceStore.excusedCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{{ attendanceStore.lateCount }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="attendanceStore.loading && attendanceStore.records.length === 0" class="p-8 text-center">
      <div class="flex justify-center items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span class="text-sm text-gray-600 font-medium">Cargando estudiantes...</span>
      </div>
    </div>

    <!-- Lista de estudiantes -->
    <div v-else-if="attendanceStore.records.length > 0" class="divide-y divide-gray-200">
      <div v-for="record in attendanceStore.records" :key="record.estudiante.id"
        class="p-4 hover:bg-gray-50 transition-colors">
        <div class="flex items-center justify-between">
          <!-- Información del estudiante -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-sm font-bold text-primary-800">
                    {{ record.estudiante.numero_orden }}
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0 hidden sm:block">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ record.estudiante.apellidos }}, {{ record.estudiante.nombres }}
                </p>
                <p class="text-sm text-gray-500 hidden sm:block">
                  Cédula: {{ record.estudiante.cedula }}
                </p>
              </div>
            </div>
          </div>

          <!-- Botones de estado -->
          <div class="flex items-center space-x-2">
            <template v-if="record.estudiante.estado !== 'retirado'">
              <button v-for="estado in estados" :key="estado.value"
                @click="updateAttendance(record.estudiante.id, estado.value)"
                :class="getButtonClass(estado.value, record.asistencia?.estado)"
                class="px-3 py-2 text-xs font-medium rounded-lg transition-colors border">
                {{ estado.label }}
              </button>
            </template>
            <span v-else class="px-3 py-2 text-xs font-medium rounded-lg bg-red-100 text-red-800 border border-red-200">
              Retirado
            </span>
          </div>
        </div>

        <!-- Campo de observaciones -->
        <div v-if="record.asistencia && ['ausente', 'excusa', 'tardanza'].includes(record.asistencia.estado)"
          class="mt-3">
          <textarea v-model="localObservaciones[record.estudiante.id]"
            @input="updateObservaciones(record.estudiante.id, ($event.target as HTMLTextAreaElement).value)"
            :placeholder="`Observaciones para ${record.asistencia.estado}...`"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none disabled:bg-gray-100 disabled:text-gray-500"
            :disabled="props.readOnly" rows="2"></textarea>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!attendanceStore.loading" class="p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
      <p class="mt-1 text-sm text-gray-500">No se encontraron estudiantes para esta aula.</p>
    </div>

    <!-- Error state -->
    <div v-if="attendanceStore.error" class="p-4 bg-red-50 border-l-4 border-red-400">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ attendanceStore.error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="attendanceStore.clearError()" class="text-red-400 hover:text-red-600">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAttendanceStore } from '../../stores/attendance'


interface Props {
  fecha: string
  aulaId: number
  aulaName: string
  assignmentId: number
  readOnly?: boolean
}

const props = defineProps<Props>()

const attendanceStore = useAttendanceStore()

// Estado local para observaciones
const localObservaciones = ref<Record<number, string>>({})

const estados = [
  { value: 'presente', label: 'Presente', color: 'green' },
  { value: 'ausente', label: 'Ausente', color: 'red' },
  { value: 'excusa', label: 'Excusa', color: 'yellow' },
  { value: 'tardanza', label: 'Tardanza', color: 'orange' }
]

// Inicializar observaciones locales cuando cambien los records  
watch(() => attendanceStore.records, (records) => {
  records.forEach((record: any) => {
    if (record.asistencia?.observaciones) {
      localObservaciones.value[record.estudiante.id] = record.asistencia.observaciones
    }
  })
}, { deep: true, immediate: true })

const updateAttendance = (estudianteId: number, estado: string) => {
  if (props.readOnly) return
  attendanceStore.updateLocalAttendance(estudianteId, estado, localObservaciones.value[estudianteId])
}

const updateObservaciones = (estudianteId: number, observaciones: string) => {
  if (props.readOnly) return
  localObservaciones.value[estudianteId] = observaciones

  // Si ya tiene asistencia, actualizar también en el store
  const record = attendanceStore.records.find((r: any) => r.estudiante.id === estudianteId)
  if (record?.asistencia) {
    attendanceStore.updateLocalAttendance(estudianteId, record.asistencia.estado, observaciones)
  }
}

const getButtonClass = (estado: string, estadoActual?: string) => {
  const isActive = estado === estadoActual
  const estadoConfig = estados.find(e => e.value === estado)
  let baseClass = 'px-3 py-2 text-xs font-medium rounded-lg transition-colors border'

  if (props.readOnly) {
    baseClass += ' cursor-not-allowed opacity-75'
    if (!isActive) baseClass += ' opacity-50'
  }

  if (isActive) {
    switch (estadoConfig?.color) {
      case 'green':
        return `${baseClass} bg-green-100 text-green-800 border-green-200`
      case 'red':
        return `${baseClass} bg-red-100 text-red-800 border-red-200`
      case 'yellow':
        return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-200`
      case 'orange':
        return `${baseClass} bg-orange-100 text-orange-800 border-orange-200`
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-200`
    }
  }

  return `${baseClass} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
}

const formatFecha = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
