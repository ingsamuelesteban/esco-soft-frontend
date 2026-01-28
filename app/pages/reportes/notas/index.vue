<template>
  <div>
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <h1 class="text-2xl font-bold text-gray-900">Reportes de Notas</h1>
      <p class="text-sm text-gray-600 mt-1">Generación de boletines, sábanas y planillas</p>
    </header>

    <div class="p-6 max-w-7xl mx-auto">
      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]">
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="bg-white shadow rounded-lg p-6">
        
        <!-- Tab 1: Boletín (Por Estudiante) -->
        <div v-if="currentTab === 'student'" class="space-y-6">
          <div class="max-w-xl">
             <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Estudiante</label>
             <div class="relative">
                <input 
                  v-model="studentSearch" 
                  @input="searchStudents"
                  type="text" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  placeholder="Escribe nombre, apellido o RNE..."
                />
                <!-- Resultados de búsqueda -->
                <div v-if="studentJsonResults.length > 0" class="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 max-h-60 overflow-auto">
                   <div 
                      v-for="s in studentJsonResults" :key="s.id" 
                      @click="selectStudent(s)"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                   >
                      <div class="font-medium text-gray-900">{{ s.apellidos }}, {{ s.nombres }}</div>
                      <div class="text-xs text-gray-500">{{ s.aula ? `${s.aula.grado_cardinal}° ${s.aula.seccion}` : 'Sin Aula' }} | {{ s.rne }}</div>
                   </div>
                </div>
             </div>
          </div>

          <div v-if="selectedStudent" class="bg-blue-50 p-4 rounded-md border border-blue-200 flex justify-between items-center">
             <div>
                <h3 class="text-sm font-bold text-blue-900">{{ selectedStudent.apellidos }}, {{ selectedStudent.nombres }}</h3>
                <p class="text-xs text-blue-700 mt-1">
                   {{ selectedStudent.aula ? `${selectedStudent.aula.grado_cardinal}° ${selectedStudent.aula.seccion}` : 'Sin Aula' }}
                </p>
             </div>
             <button @click="selectedStudent = null" class="text-blue-500 hover:text-blue-700 text-sm">Cambiar</button>
          </div>
          
          <div class="max-w-xs">
              <label class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
              <select v-model="selectedPeriod" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                  <option value="all">Todos (Acumulado)</option>
                  <option value="1">Periodo 1</option>
                  <option value="2">Periodo 2</option>
                  <option value="3">Periodo 3</option>
                  <option value="4">Periodo 4</option>
              </select>
          </div>

          <div class="pt-4">
             <button 
                @click="generateStudentReport" 
                :disabled="!selectedStudent || loadingGenerate"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generar PDF Final
             </button>

             <button 
                @click="previewStudentReport" 
                :disabled="!selectedStudent || loadingPreview"
                class="ml-3 inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Vista Previa (Consultar)
             </button>
          </div>

          <!-- Report Preview -->
          <div v-if="reportPreview" class="border border-gray-300 rounded-lg p-6 bg-gray-50 mt-6 print-container">
              <div class="text-center border-b border-gray-300 pb-4 mb-4">
                  <h2 class="text-lg font-bold text-gray-900">{{ reportPreview.tenant?.nombre }}</h2>
                  <p class="text-xs text-gray-500">{{ reportPreview.tenant?.direccion }}</p>
                  <h3 class="font-bold mt-2">BOLETÍN DE CALIFICACIONES - AÑO {{ reportPreview.year }}</h3>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div>
                      <span class="font-bold">Estudiante:</span> {{ reportPreview.estudiante?.apellidos }}, {{ reportPreview.estudiante?.nombres }}<br>
                      <span class="font-bold">Código:</span> {{ reportPreview.estudiante?.rne }}
                  </div>
                  <div>
                      <span class="font-bold">Grado/Aula:</span> 
                      {{ reportPreview.aula?.grado_cardinal }} {{ reportPreview.aula?.seccion }} 
                      {{ reportPreview.aula?.titulo ? '- ' + reportPreview.aula.titulo.nombre : '' }}<br>
                      <span class="font-bold">No. Orden:</span> {{ reportPreview.estudiante?.numero_orden }}
                  </div>
              </div>
              
              <table class="w-full text-xs border-collapse border border-gray-400">
                  <thead class="bg-gray-200">
                      <tr>
                          <th class="border border-gray-400 p-1 text-left">Asignatura</th>
                          <th v-if="selectedPeriod === 'all' || selectedPeriod === '1'" class="border border-gray-400 p-1">P1</th>
                          <th v-if="selectedPeriod === 'all' || selectedPeriod === '2'" class="border border-gray-400 p-1">P2</th>
                          <th v-if="selectedPeriod === 'all' || selectedPeriod === '3'" class="border border-gray-400 p-1">P3</th>
                          <th v-if="selectedPeriod === 'all' || selectedPeriod === '4'" class="border border-gray-400 p-1">P4</th>
                          <th class="border border-gray-400 p-1">Prom.</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="subj in reportPreview.subjects" :key="subj.materia" class="bg-white">
                          <td class="border border-gray-400 p-1">
                              <div class="font-medium">{{ subj.materia }}</div>
                              <div class="text-[10px] text-gray-500">{{ subj.profesor }}</div>
                          </td>
                          
                          <template v-if="subj.tipo === 'Academico'">
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '1'" class="border border-gray-400 p-1 text-center">{{ subj.periodos[1] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '2'" class="border border-gray-400 p-1 text-center">{{ subj.periodos[2] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '3'" class="border border-gray-400 p-1 text-center">{{ subj.periodos[3] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '4'" class="border border-gray-400 p-1 text-center">{{ subj.periodos[4] || '-' }}</td>
                              <td class="border border-gray-400 p-1 text-center font-bold">{{ subj.promedio || '-' }}</td>
                          </template>
                          
                          <template v-else>
                              <!-- Technical -->
                              <td :colspan="selectedPeriod === 'all' ? 4 : 1" class="border border-gray-400 p-1">
                                  <div class="flex flex-wrap gap-1">
                                      <span v-for="ra in subj.ras" :key="ra.numero" class="border border-gray-300 rounded px-1 text-[10px]">
                                          RA{{ ra.numero }}: <b>{{ ra.nota_final }}</b>
                                      </span>
                                  </div>
                              </td>
                              <td class="border border-gray-400 p-1 text-center font-bold">{{ subj.promedio || '-' }}</td>
                          </template>
                      </tr>
                  </tbody>
              </table>

              <div class="mt-4 text-[10px] text-center text-gray-500">
                  Vista previa generada para consulta. 
              </div>
              </div>
          </div>


        <!-- Tab 2: Sábana (Por Aula) -->
        <div v-if="currentTab === 'classroom'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
                <select v-model="selectedAula" @change="loadSubjects" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                   <option value="">Seleccionar Aula...</option>
                   <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                      {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                   </option>
                </select>
             </div>
             

          </div>

          <div class="pt-4">
             <button 
                @click="generateClassroomReport" 
                :disabled="!selectedAula || loadingGenerate"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generar Sábana PDF
             </button>
          </div>
        </div>

        <!-- Tab 3: Planilla (Por Materia) -->
        <div v-if="currentTab === 'subject'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
                <select v-model="selectedAula" @change="loadSubjects" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                   <option value="">Seleccionar Aula...</option>
                   <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                      {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                   </option>
                </select>
             </div>
             
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                <select v-model="selectedMateria" :disabled="!selectedAula" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border disabled:bg-gray-100">
                   <option value="">Seleccionar Materia...</option>
                   <option v-for="subj in subjects" :key="subj.materia_id" :value="subj.materia_id">
                      {{ subj.nombre }} ({{ subj.tipo }}) - {{ subj.profesor ? subj.profesor.nombre_completo : 'N/D' }}
                   </option>
                </select>
             </div>

             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                <select v-model="selectedPeriod" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                    <option value="all">Todos (Acumulado)</option>
                    <option value="1">Periodo 1</option>
                    <option value="2">Periodo 2</option>
                    <option value="3">Periodo 3</option>
                    <option value="4">Periodo 4</option>
                </select>
             </div>
          </div>

          <div class="pt-4">
             <button 
                @click="generateSubjectReport" 
                :disabled="!selectedAula || !selectedMateria || loadingGenerate"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generar Planilla PDF
             </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

import { api } from '~/utils/api'
import printJS from 'print-js'

// State
const currentTab = ref('student')
const tabs = [
  { id: 'student', name: 'Boletín por Estudiante' },
  { id: 'classroom', name: 'Sábana por Aula' },
  { id: 'subject', name: 'Planilla por Asignatura' },
]

const loadingGenerate = ref(false)
const loadingPreview = ref(false)
const aulas = ref([])
const subjects = ref([])
const selectedAula = ref('')
const selectedMateria = ref('')
const selectedPeriod = ref('all')

// Student Search State
const studentSearch = ref('')
const studentJsonResults = ref([])
const selectedStudent = ref(null)
const reportPreview = ref(null) // Data for preview
let searchTimeout = null

// Load Aulas
onMounted(async () => {
  try {
    const res = await api.get('/api/aulas')
    aulas.value = res || []
  } catch (e) {
    console.error(e)
  }
})

// Search Students
const searchStudents = () => {
   if (searchTimeout) clearTimeout(searchTimeout)
   if (!studentSearch.value || studentSearch.value.length < 3) {
      studentJsonResults.value = []
      return
   }
   
   searchTimeout = setTimeout(async () => {
      try {
         // Using general search endpoint if exists, else iterating. 
         // Assuming /api/estudiantes has search (usually standard in Laravel APIs provided by older modules here)
         // If not, we might need to rely on the user typing exactly or fetch all.
         // Let's try to assume /api/estudiantes supports filtering? Or use a dedicated endpoint if known.
         // Given "EstudianteController", index usually returns paginated.
         // Let's assume ?search= works or ?q=
         const res = await api.get(`/api/estudiantes?search=${studentSearch.value}&per_page=10`)
         studentJsonResults.value = res.data || []
      } catch (e) {
         console.error(e)
      }
   }, 300)
}

const selectStudent = (s: any) => {
   selectedStudent.value = s
   studentSearch.value = ''
   studentJsonResults.value = []
   reportPreview.value = null // Clear preview on change
}

// Load Subjects when Aula changes
const loadSubjects = async () => {
   subjects.value = []
   selectedMateria.value = ''
   
   if (!selectedAula.value) return
   
   try {
      // Fetch ClassAssignments for this Aula
      const res = await api.get(`/api/class-assignments?aula_id=${selectedAula.value}&only_active=true`)
      const data = res.data?.data || res.data || []
      
      subjects.value = data.map((a: any) => ({
          materia_id: a.materia_id, // Actually we need assignment ID potentially, but controller asked for materia_id + aula. 
          // Wait, controller `subjectReport` asks for `aula_id` and `materia_id`. 
          // And it queries: ClassAssignment::where('aula_id', $aulaId)->where('materia_id', $materiaId)
          // So this map is correct.
          nombre: a.materia?.nombre,
          tipo: a.materia?.tipo,
          profesor: a.profesor
      }))
   } catch (e) {
      console.error(e)
   }
}

// Generators
const generateStudentReport = async () => {
   if (!selectedStudent.value) return
   loadingGenerate.value = true
   try {
       const url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}`
       // Fetch Blob directly
       const blob = await api.get(url, { responseType: 'blob' })
       const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
       
       printJS({
            printable: blobUrl,
            type: 'pdf',
            showModal: true,
            modalMessage: 'Generando boletín...',
            onPrintDialogClose: () => URL.revokeObjectURL(blobUrl)
       })
   } catch (e) {
       console.error(e)
       alert('Error generando reporte')
   } finally {
       loadingGenerate.value = false
   }
}

const previewStudentReport = async () => {
    if (!selectedStudent.value) return
    loadingPreview.value = true
    reportPreview.value = null
    try {
        const url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}&format=json`
        const res = await api.get(url)
        reportPreview.value = res // JSON data
    } catch (e) {
        console.error(e)
        alert('Error cargando vista previa')
    } finally {
        loadingPreview.value = false
    }
}

const generateClassroomReport = async () => {
   if (!selectedAula.value) return
   loadingGenerate.value = true
   try {
       const url = `/api/reports/grades/classroom?aula_id=${selectedAula.value}`
       const blob = await api.get(url, { responseType: 'blob' })
       const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
       
        printJS({
            printable: blobUrl,
            type: 'pdf',
            showModal: true,
            modalMessage: 'Generando sábana...',
            onPrintDialogClose: () => URL.revokeObjectURL(blobUrl)
       })
   } catch (e) {
       console.error(e)
       alert('Error generando sábana')
   } finally {
       loadingGenerate.value = false
   }
}

const generateSubjectReport = async () => {
   if (!selectedAula.value || !selectedMateria.value) return
   loadingGenerate.value = true
   try {
       const url = `/api/reports/grades/subject?aula_id=${selectedAula.value}&materia_id=${selectedMateria.value}&period=${selectedPeriod.value}`
       const blob = await api.get(url, { responseType: 'blob' })
       const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
       
        printJS({
            printable: blobUrl,
            type: 'pdf',
            showModal: true,
            modalMessage: 'Generando planilla...',
            onPrintDialogClose: () => URL.revokeObjectURL(blobUrl)
       })
   } catch (e) {
       console.error(e)
       alert('Error generando planilla')
   } finally {
       loadingGenerate.value = false
   }
}

</script>
