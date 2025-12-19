import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { api } from '../utils/api'

export interface Estudiante {
  id: number
  nombres: string
  apellidos: string
  cedula: string
  aula_id: number
  numero_orden?: number
  fecha_nacimiento?: string
  sexo?: string
  rne?: string
  edad?: number
}

export interface Attendance {
  id: number
  estado: 'presente' | 'ausente' | 'excusa' | 'tardanza'
  observaciones?: string
}

export interface AttendanceRecord {
  estudiante: Estudiante
  asistencia: Attendance | null
}

export interface TeacherAssignment {
  id: number
  aula_id: number
  aula_nombre: string
  materia: string
  anio_lectivo: string
  horas_semanales: number
}

export interface CurrentClass {
  assignment_id: number
  aula_id: number
  aula_nombre: string
  materia: string
  period: string
  hora_inicio: string
  hora_fin: string
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [] as AttendanceRecord[],
    loading: false,
    error: null as string | null,
    currentDate: new Date().toLocaleDateString('en-CA'),
    currentAulaId: null as number | null,
    currentAssignmentId: null as number | null, // <--- Agregado para manejar assignment_id actual
    teacherAssignments: [] as TeacherAssignment[],
    currentClass: null as CurrentClass | null,
    loadingCurrentClass: false,
    loadingAssignments: false,
    dailyClasses: [] as any[],
    loadingDailyClasses: false,
  }),

  getters: {
    recordsByEstado: (state) => (estado: string) => {
      return state.records.filter(record => record.asistencia?.estado === estado)
    },

    presentCount: (state) => {
      return state.records.filter(record => record.asistencia?.estado === 'presente').length
    },

    absentCount: (state) => {
      return state.records.filter(record => record.asistencia?.estado === 'ausente').length
    },

    excusedCount: (state) => {
      return state.records.filter(record => record.asistencia?.estado === 'excusa').length
    },

    lateCount: (state) => {
      return state.records.filter(record => record.asistencia?.estado === 'tardanza').length
    },

    totalStudents: (state) => {
      return state.records.length
    },

    pendingStudents: (state) => {
      return state.records.filter(record => !record.asistencia).length
    }
  },

  actions: {
    async fetchAttendance(fecha: string, aulaId: number, assignmentId: number) {
      this.loading = true
      this.error = null
      this.currentDate = fecha
      this.currentAulaId = aulaId
      this.currentAssignmentId = assignmentId

      try {
        const response = await api.get<{ data: AttendanceRecord[], fecha: string, aula_id: number, assignment_id: number }>('/api/attendance', {
          params: { fecha, aula_id: aulaId, assignment_id: assignmentId }
        })

        this.records = response.data || []
      } catch (error: any) {
        this.error = error.message || 'Error al cargar la asistencia'
        console.error('Error fetching attendance:', error)
      } finally {
        this.loading = false
      }
    },

    async saveAttendance(estudianteId: number, estado: string, observaciones?: string) {
      try {
        const response = await api.post<any>('/api/attendance', {
          estudiante_id: estudianteId,
          fecha: this.currentDate,
          estado,
          observaciones,
          assignment_id: this.currentAssignmentId // Asegura que assignment_id se envía
        })

        // Actualizar el record en el estado local
        const recordIndex = this.records.findIndex(r => r.estudiante.id === estudianteId)
        if (recordIndex !== -1 && this.records[recordIndex]) {
          this.records[recordIndex].asistencia = {
            id: (response as any).id,
            estado: estado as any,
            observaciones
          }
        }

        return response
      } catch (error: any) {
        this.error = error.message || 'Error al guardar la asistencia'
        throw error
      }
    },

    async saveBatchAttendance(asistencias: Array<{ estudiante_id: number, estado: string, observaciones?: string }>) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post<any>('/api/attendance/batch', {
          fecha: this.currentDate,
          assignment_id: this.currentAssignmentId, // Asegura que assignment_id se envía
          asistencias
        })

        // Actualizar todos los records en el estado local
        asistencias.forEach(asistencia => {
          const recordIndex = this.records.findIndex(r => r.estudiante.id === asistencia.estudiante_id)
          if (recordIndex !== -1 && this.records[recordIndex]) {
            this.records[recordIndex].asistencia = {
              id: 0, // Se actualizará con el response real
              estado: asistencia.estado as any,
              observaciones: asistencia.observaciones
            }
          }
        })

        return response
      } catch (error: any) {
        this.error = error.message || 'Error al guardar las asistencias'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStatistics(fechaInicio: string, fechaFin: string, aulaId?: number) {
      try {
        const params: any = {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }

        if (aulaId) {
          params.aula_id = aulaId
        }

        const response = await api.get<any>('/api/attendance/statistics', {
          params
        })

        return response
      } catch (error: any) {
        this.error = error.message || 'Error al obtener estadísticas'
        throw error
      }
    },

    updateLocalAttendance(estudianteId: number, estado: string, observaciones?: string) {
      const recordIndex = this.records.findIndex(r => r.estudiante.id === estudianteId)
      if (recordIndex !== -1 && this.records[recordIndex]) {
        if (!this.records[recordIndex].asistencia) {
          this.records[recordIndex].asistencia = {
            id: 0,
            estado: estado as any,
            observaciones
          }
        } else {
          const asistencia = this.records[recordIndex].asistencia
          if (asistencia) {
            asistencia.estado = estado as any
            asistencia.observaciones = observaciones
          }
        }
      }
    },

    clearError() {
      this.error = null
    },

    resetRecords() {
      this.records = []
      this.currentAulaId = null
      this.error = null
    },

    async getCurrentClass() {
      this.loadingCurrentClass = true
      this.error = null

      try {
        const response = await api.get<{ current_class: CurrentClass | null, message: string }>('/api/attendance/current-class')
        this.currentClass = response.current_class
        return response
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener la clase actual'
        throw error
      } finally {
        this.loadingCurrentClass = false
      }
    },

    async getTeacherAssignments() {
      this.loadingAssignments = true
      this.error = null

      try {
        const response = await api.get<{ assignments: TeacherAssignment[] }>('/api/attendance/teacher-assignments')
        this.teacherAssignments = response.assignments
        return response
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener las asignaciones'
        throw error
      } finally {
        this.loadingAssignments = false
      }
    },

    async fetchDailyClasses(filters: { aulaId?: number, professorId?: number, date: string }) {
      this.loadingDailyClasses = true
      this.dailyClasses = []

      try {
        // Convert date string (YYYY-MM-DD) to day of week (0-6)
        // Create date object treating input as local time components to avoid timezone shift
        const parts = filters.date.split('-').map(Number)
        if (parts.length < 3) {
          this.loadingDailyClasses = false
          return
        }
        const year = parts[0]!
        const month = parts[1]!
        const day = parts[2]!
        const dateObj = new Date(year, month - 1, day)
        const dia = dateObj.getDay()

        const params: any = {
          dia: dia,
          include_attendance: true, // Bonus: fetch attendance summary if backend supports it
          date: filters.date
        }

        if (filters.aulaId) params.aula_id = filters.aulaId
        if (filters.professorId) params.profesor_id = filters.professorId

        const response = await api.get<any[]>('/api/timetable-entries', {
          params
        })
        this.dailyClasses = response || []
      } catch (error) {
        console.error('Error fetching daily classes:', error)
        // No blocking error, just empty list
      } finally {
        this.loadingDailyClasses = false
      }
    }
  }
})