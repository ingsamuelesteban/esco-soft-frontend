<template>
   <div>
      <header class="bg-white border-b border-gray-200 px-6 py-4">
         <h1 class="text-2xl font-bold text-gray-900">Reportes de Notas</h1>
         <p class="text-sm text-gray-600 mt-1">Generación de boletines, sábanas y planillas</p>
      </header>

      <div class="p-6 max-w-7xl mx-auto">
         <!-- Global Filters (Year) -->
         <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">Año Lectivo</label>
            <div class="max-w-xs">
               <select v-model="selectedAnio"
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                  <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">
                     {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                  </option>
               </select>
            </div>
         </div>

         <!-- Tabs -->
         <div class="mb-6 border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
               <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" :class="[
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
                     <input v-model="studentSearch" @input="searchStudents" type="text"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                        placeholder="Escribe nombre, apellido o RNE..." />
                     <!-- Resultados de búsqueda -->
                     <div v-if="studentJsonResults.length > 0"
                        class="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 max-h-60 overflow-auto">
                        <div v-for="s in studentJsonResults" :key="s.id" @click="selectStudent(s)"
                           class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                           <div class="font-medium text-gray-900">{{ s.apellidos }}, {{ s.nombres }}</div>
                           <div class="text-xs text-gray-500">{{ s.aula ? `${s.aula.grado_cardinal}° ${s.aula.seccion}`
                              : 'Sin Aula' }} | {{ s.rne }}</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div v-if="selectedStudent"
                  class="bg-blue-50 p-4 rounded-md border border-blue-200 flex justify-between items-center">
                  <div>
                     <h3 class="text-sm font-bold text-blue-900">{{ selectedStudent.apellidos }}, {{
                        selectedStudent.nombres }}</h3>
                     <p class="text-xs text-blue-700 mt-1">
                        {{ selectedStudent.aula ? `${selectedStudent.aula.grado_cardinal}°
                        ${selectedStudent.aula.seccion}` : 'Sin Aula' }}
                     </p>
                  </div>
                  <button @click="selectedStudent = null"
                     class="text-blue-500 hover:text-blue-700 text-sm">Cambiar</button>
               </div>

               <!-- Period Selector Hidden for Global Report
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
          -->

               <div class="pt-4">
                  <button @click="generateStudentReport" :disabled="!selectedStudent || loadingGenerate"
                     class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Generar PDF Final
                  </button>

                  <button @click="previewStudentReport" :disabled="!selectedStudent || loadingPreview"
                     class="ml-3 inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
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
                        <span class="font-bold">Estudiante:</span> {{ reportPreview.estudiante?.apellidos }}, {{
                           reportPreview.estudiante?.nombres }}<br>
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
                           <th v-if="selectedPeriod === 'all' || selectedPeriod === '1'"
                              class="border border-gray-400 p-1">P1</th>
                           <th v-if="selectedPeriod === 'all' || selectedPeriod === '2'"
                              class="border border-gray-400 p-1">P2</th>
                           <th v-if="selectedPeriod === 'all' || selectedPeriod === '3'"
                              class="border border-gray-400 p-1">P3</th>
                           <th v-if="selectedPeriod === 'all' || selectedPeriod === '4'"
                              class="border border-gray-400 p-1">P4</th>
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
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '1'"
                                 class="border border-gray-400 p-1 text-center">{{ subj.periodos?.[1] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '2'"
                                 class="border border-gray-400 p-1 text-center">{{ subj.periodos?.[2] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '3'"
                                 class="border border-gray-400 p-1 text-center">{{ subj.periodos?.[3] || '-' }}</td>
                              <td v-if="selectedPeriod === 'all' || selectedPeriod === '4'"
                                 class="border border-gray-400 p-1 text-center">{{ subj.periodos?.[4] || '-' }}</td>
                              <td class="border border-gray-400 p-1 text-center font-bold">{{ subj.promedio || '-' }}
                              </td>
                           </template>

                           <template v-else>
                              <!-- Technical -->
                              <td :colspan="selectedPeriod === 'all' ? 4 : 1" class="border border-gray-400 p-1">
                                 <div class="flex flex-wrap gap-1">
                                    <span v-for="ra in subj.ras" :key="ra.numero"
                                       class="border border-gray-300 rounded px-1 text-[10px]">
                                       RA{{ ra.numero }}: <b>{{ ra.nota_final }}</b>
                                    </span>
                                 </div>
                              </td>
                              <td class="border border-gray-400 p-1 text-center font-bold">{{ subj.promedio || '-' }}
                              </td>
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
                     <select v-model="selectedAula" @change="loadSubjects"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                        <option value="">Seleccionar Aula...</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                           {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                        </option>
                     </select>
                  </div>


               </div>

               <div class="pt-4 flex gap-3">
                  <button @click="generateClassroomReport" :disabled="!selectedAula || loadingGenerate"
                     class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Generar Sábana PDF
                  </button>

                  <button @click="previewClassroomReport" :disabled="!selectedAula || loadingPreview"
                     class="inline-flex items-center px-4 py-2 border border-green-600 shadow-sm text-sm font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Vista Previa
                  </button>
               </div>

               <!-- Classroom Report Preview -->
               <div v-if="classroomPreview"
                  class="border border-gray-300 rounded-lg p-6 bg-gray-50 mt-6 overflow-x-auto">
                  <div class="text-center border-b border-gray-300 pb-4 mb-4">
                     <h2 class="text-lg font-bold text-gray-900">{{ classroomPreview.tenant?.nombre }}</h2>
                     <h3 class="font-bold mt-2">SÁBANA DE CALIFICACIONES - {{ classroomPreview.aula?.grado_cardinal }}°
                        {{
                           classroomPreview.aula?.seccion }}</h3>
                     <p class="text-xs text-gray-500 mt-1">Año {{ classroomPreview.year }} - Período: {{
                        classroomPreview.period }}
                     </p>
                  </div>

                  <table class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200">
                        <tr>
                           <th class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 z-10">No.</th>
                           <th class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 z-10">Estudiante
                           </th>
                           <th v-for="subject in classroomPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-1 text-center min-w-[60px]">
                              <div class="font-medium">{{ subject.materia?.nombre }}</div>
                              <div class="text-[10px] text-gray-500">{{ subject.materia?.tipo }}</div>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in classroomPreview.data" :key="row.numero" class="bg-white hover:bg-gray-50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white z-10">{{ row.numero
                           }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white z-10">{{ row.nombre }}</td>
                           <td v-for="subject in classroomPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-1 text-center font-bold">
                              {{ row.notas[subject.id] ?? '-' }}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="mt-4 text-[10px] text-center text-gray-500">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

            <!-- Tab 3: Planilla (Por Materia) -->
            <div v-if="currentTab === 'subject'" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
                     <select v-model="selectedAula" @change="loadSubjects"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                        <option value="">Seleccionar Aula...</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                           {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                        </option>
                     </select>
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                     <select v-model="selectedMateria" :disabled="!selectedAula"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border disabled:bg-gray-100">
                        <option value="">Seleccionar Materia...</option>
                        <option v-for="subj in subjects" :key="subj.materia_id" :value="subj.materia_id">
                           {{ subj.nombre }} ({{ subj.tipo }}) - {{ subj.profesor ? subj.profesor.nombre_completo :
                              'N/D' }}
                        </option>
                     </select>
                  </div>

                  <!-- Period Selector Hidden for Global Report
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
             -->
               </div>

               <div class="pt-4 flex gap-3">
                  <button @click="generateSubjectReport"
                     :disabled="!selectedAula || !selectedMateria || loadingGenerate"
                     class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Generar Planilla PDF
                  </button>

                  <button @click="previewSubjectReport" :disabled="!selectedAula || !selectedMateria || loadingPreview"
                     class="inline-flex items-center px-4 py-2 border border-purple-600 shadow-sm text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Vista Previa
                  </button>
               </div>

               <!-- Subject Report Preview -->
               <div v-if="subjectPreview" class="border border-gray-300 rounded-lg p-6 bg-gray-50 mt-6 overflow-x-auto">
                  <div class="text-center border-b border-gray-300 pb-4 mb-4">
                     <h2 class="text-lg font-bold text-gray-900">{{ subjectPreview.tenant?.nombre }}</h2>
                     <h3 class="font-bold mt-2">PLANILLA DE CALIFICACIONES</h3>
                     <p class="text-sm font-bold mt-1">{{ subjectPreview.materia?.nombre }} ({{
                        subjectPreview.materia?.tipo }})</p>
                     <p class="text-xs text-gray-500">{{ subjectPreview.assignment?.aula?.grado_cardinal }}° {{
                        subjectPreview.assignment?.aula?.seccion }} - Profesor: {{
                           subjectPreview.assignment?.profesor?.nombre_completo }}</p>
                  </div>

                  <!-- Technical Subject Table -->
                  <table v-if="subjectPreview.materia?.tipo === 'Tecnico'"
                     class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200">
                        <tr>
                           <th class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 z-10">No.</th>
                           <th class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 z-10">Estudiante
                           </th>
                           <th v-for="i in subjectPreview.assignment?.cantidad_ra" :key="i"
                              class="border border-gray-400 p-1 text-center">
                              RA{{ i }}
                           </th>
                           <th class="border border-gray-400 p-1 text-center bg-yellow-100 font-bold">Total</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in subjectPreview.data" :key="row.estudiante.id"
                           class="bg-white hover:bg-gray-50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white z-10">{{
                              row.estudiante.numero_orden }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white z-10">{{
                              row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                           <td v-for="i in subjectPreview.assignment?.cantidad_ra" :key="i"
                              class="border border-gray-400 p-1 text-center font-bold">
                              {{ row.ras?.[i] ?? 0 }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold bg-yellow-50">{{ row.total }}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <!-- Academic Subject Table -->
                  <table v-else class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200">
                        <tr>
                           <th class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 z-10">No.</th>
                           <th class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 z-10">Estudiante
                           </th>
                           <th class="border border-gray-400 p-1 text-center">P1</th>
                           <th class="border border-gray-400 p-1 text-center">P2</th>
                           <th class="border border-gray-400 p-1 text-center">P3</th>
                           <th class="border border-gray-400 p-1 text-center">P4</th>
                           <th class="border border-gray-400 p-1 text-center bg-yellow-100 font-bold">Final</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in subjectPreview.data" :key="row.estudiante.id"
                           class="bg-white hover:bg-gray-50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white z-10">{{
                              row.estudiante.numero_orden }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white z-10">{{
                              row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                           <td class="border border-gray-400 p-1 text-center font-bold">{{ row.periodos?.[1] ?? '-' }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold">{{ row.periodos?.[2] ?? '-' }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold">{{ row.periodos?.[3] ?? '-' }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold">{{ row.periodos?.[4] ?? '-' }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold bg-yellow-50">{{ row.final }}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="mt-4 text-[10px] text-center text-gray-500">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

            <!-- Tab 4: Meritorios (Por Aula) -->
            <div v-if="currentTab === 'merit'" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-gray-700 mb-2">Aula</label>
                     <select v-model="selectedAula"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
                        <option value="">Seleccionar Aula...</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                           {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                        </option>
                     </select>
                     <p class="text-xs text-gray-500 mt-2">
                        Se generará un listado de estudiantes con promedio académico general >= 97.0
                     </p>
                  </div>
               </div>

               <div class="pt-4 flex gap-3">
                  <button @click="generateMeritReport" :disabled="!selectedAula || loadingGenerate"
                     class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Generar Reporte Meritorios
                  </button>

                  <button @click="previewMeritReport" :disabled="!selectedAula || loadingPreview"
                     class="inline-flex items-center px-4 py-2 border border-yellow-600 shadow-sm text-sm font-medium rounded-md text-yellow-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-600" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                     </svg>
                     Vista Previa
                  </button>
               </div>

               <!-- Merit Report Preview -->
               <div v-if="meritPreview" class="border border-gray-300 rounded-lg p-6 bg-gray-50 mt-6 overflow-x-auto">
                  <div class="text-center border-b border-gray-300 pb-4 mb-4">
                     <h2 class="text-lg font-bold text-gray-900">{{ meritPreview.tenant?.nombre }}</h2>
                     <h3 class="font-bold mt-2 text-yellow-700">LISTADO DE HONOR - MERITORIOS</h3>
                     <p class="text-sm font-medium">{{ meritPreview.aula?.grado_cardinal }}° {{
                        meritPreview.aula?.seccion }}</p>
                  </div>

                  <table class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200">
                        <tr>
                           <th class="border border-gray-400 p-2 text-left bg-gray-200">No.</th>
                           <th class="border border-gray-400 p-2 text-left bg-gray-200">Estudiante</th>
                           <th v-for="subject in meritPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-2 text-center min-w-[60px]">
                              <div class="font-medium">{{ subject.materia?.nombre }}</div>
                           </th>
                           <th class="border border-gray-400 p-2 text-center bg-yellow-100 font-bold">Promedio</th>
                           <th class="border border-gray-400 p-2 text-center bg-gray-200 font-bold">Estado</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="(row, idx) in meritPreview.data" :key="row.estudiante.id"
                           class="bg-white hover:bg-gray-50">
                           <td class="border border-gray-400 p-2 text-center">{{ Number(idx) + 1 }}</td>
                           <td class="border border-gray-400 p-2 font-medium">{{ row.estudiante.apellidos }} {{
                              row.estudiante.nombres }}</td>
                           <td v-for="subject in meritPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-2 text-center">
                              {{ row.grades[subject.id] ?? '-' }}
                           </td>
                           <td class="border border-gray-400 p-2 text-center font-bold bg-yellow-50 text-sm">
                              {{ row.average }}
                           </td>
                           <td class="border border-gray-400 p-2 text-center">
                              <span v-if="row.status === 'Excelencia Académica'"
                                 class="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold">Excelencia</span>
                              <span v-else
                                 class="px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold">Meritorio</span>
                           </td>
                        </tr>
                        <tr v-if="meritPreview.data && meritPreview.data.length === 0">
                           <td :colspan="(meritPreview.subjects ? meritPreview.subjects.length : 0) + 4"
                              class="p-4 text-center text-gray-500 italic">
                              No se encontraron estudiantes meritorios (Promedio >= 97) en esta aula.
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="mt-4 text-[10px] text-center text-gray-500">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import { api } from '~/utils/api'
import { usePrint } from '~/composables/usePrint'

const { printPdfBlob } = usePrint()

// --- Interfaces ---
interface AnioLectivo {
   id: number
   nombre: string
   activo: boolean
}

interface Tenant {
   nombre: string
   direccion: string | null
}

interface Titulo {
   nombre: string
}

interface Aula {
   id: number
   grado_cardinal: number
   seccion: string
   titulo?: Titulo
}

interface Estudiante {
   id: number
   nombres: string
   apellidos: string
   rne: string
   numero_orden: number
   aula?: Aula
}

interface Profesor {
   nombre_completo: string
}

interface Materia {
   nombre: string
   tipo: string
}

interface Subject {
   materia_id: number
   materia: string
   profesor: Profesor
   nombre?: string // Frontend mapping adds this
   tipo?: string   // Frontend mapping adds this
}

interface ReportSubject {
   materia: string
   profesor: string
   tipo: string
   periodos?: Record<number, number | string>
   promedio?: number | string
   ras?: { numero: number; nota_final: number | string }[]
}

interface ReportPreview {
   tenant: Tenant
   year: string
   estudiante: Estudiante
   aula: Aula
   subjects: ReportSubject[]
}

// --- State ---
const currentTab = ref('student')
const tabs = [
   { id: 'student', name: 'Boletín por Estudiante' },
   { id: 'classroom', name: 'Sábana por Aula' },
   { id: 'subject', name: 'Planilla por Asignatura' },
   { id: 'merit', name: 'Meritorios' },
]

const loadingGenerate = ref(false)
const loadingPreview = ref(false)
const aulas = ref<Aula[]>([])
const subjects = ref<Subject[]>([])
const aniosLectivos = ref<AnioLectivo[]>([])
const selectedAnio = ref<number | ''>('')
const selectedAula = ref<string | number>('')
const selectedMateria = ref<string | number>('')
const selectedPeriod = ref('all')

// Student Search State
const studentSearch = ref('')
const studentJsonResults = ref<Estudiante[]>([])
const selectedStudent = ref<Estudiante | null>(null)
const reportPreview = ref<ReportPreview | null>(null) // Data for preview
const classroomPreview = ref<any | null>(null) // Classroom report preview
const subjectPreview = ref<any | null>(null) // Subject report preview
const meritPreview = ref<any | null>(null) // Merit report preview
let searchTimeout: any = null

// Load Data
onMounted(async () => {
   try {
      const resAulas = await api.get('/api/aulas')
      aulas.value = (resAulas as any) || []

      const resYears = await api.get('/api/anios-lectivos')
      aniosLectivos.value = (resYears as any) || []

      const active = aniosLectivos.value.find(y => y.activo)
      if (active) selectedAnio.value = active.id

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
         const res = await api.get(`/api/estudiantes?search=${studentSearch.value}&per_page=10`)
         studentJsonResults.value = (res.data as any) || []
      } catch (e) {
         console.error(e)
      }
   }, 300)
}

const selectStudent = (s: Estudiante) => {
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
         materia_id: a.materia_id,
         materia: a.materia?.nombre, // For report mapping consistency if needed, but select uses 'nombre'
         nombre: a.materia?.nombre,
         tipo: a.materia?.tipo,
         profesor: a.profesor
      }))
   } catch (e) {
      console.error(e)
   }
}

// Reset previews when tab changes
watch(currentTab, () => {
   reportPreview.value = null
   classroomPreview.value = null
   subjectPreview.value = null
   meritPreview.value = null
})

// Generators
const generateStudentReport = async () => {
   if (!selectedStudent.value) return
   loadingGenerate.value = true
   try {
      let url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      // Fetch Blob directly
      const blob = await api.get(url, { responseType: 'blob' }) as Blob

      const filename = `boletin_${selectedStudent.value.apellidos}_${selectedStudent.value.nombres}.pdf`
      printPdfBlob(blob, filename, 'Generando boletín...')

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
      let url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}&format=json`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const res = await api.get(url)
      reportPreview.value = res as unknown as ReportPreview
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
      let url = `/api/reports/grades/classroom?aula_id=${selectedAula.value}`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob

      const selectedAulaObj = aulas.value.find(a => a.id === selectedAula.value)
      const filename = `sabana_${selectedAulaObj?.grado_cardinal || ''}${selectedAulaObj?.seccion || ''}.pdf`
      printPdfBlob(blob, filename, 'Generando sábana...')

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
      let url = `/api/reports/grades/subject?aula_id=${selectedAula.value}&materia_id=${selectedMateria.value}&period=${selectedPeriod.value}`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob

      const selectedSubject = subjects.value.find(s => s.materia_id === selectedMateria.value)
      const filename = `planilla_${selectedSubject?.nombre || 'materia'}.pdf`
      printPdfBlob(blob, filename, 'Generando planilla...')

   } catch (e) {
      console.error(e)
      alert('Error generando planilla')
   } finally {
      loadingGenerate.value = false
   }
}

const previewClassroomReport = async () => {
   if (!selectedAula.value) return
   loadingPreview.value = true
   classroomPreview.value = null
   try {
      let url = `/api/reports/grades/classroom?aula_id=${selectedAula.value}&format=json`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const response = await api.get(url)
      classroomPreview.value = response
   } catch (e) {
      console.error(e)
      alert('Error cargando vista previa de sábana')
   } finally {
      loadingPreview.value = false
   }
}

const previewSubjectReport = async () => {
   if (!selectedAula.value || !selectedMateria.value) return
   loadingPreview.value = true
   subjectPreview.value = null
   try {
      let url = `/api/reports/grades/subject?aula_id=${selectedAula.value}&materia_id=${selectedMateria.value}&period=${selectedPeriod.value}&format=json`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const response = await api.get(url)
      subjectPreview.value = response
   } catch (e) {
      console.error(e)
      alert('Error cargando vista previa de planilla')
   } finally {
      loadingPreview.value = false
   }
}

const generateMeritReport = async () => {
   if (!selectedAula.value) return
   loadingGenerate.value = true
   try {
      let url = `/api/reports/grades/merit?aula_id=${selectedAula.value}`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob

      const selectedAulaObj = aulas.value.find(a => a.id === selectedAula.value)
      const filename = `meritorios_${selectedAulaObj?.grado_cardinal || ''}${selectedAulaObj?.seccion || ''}.pdf`
      printPdfBlob(blob, filename, 'Generando listado de meritorios...')

   } catch (e) {
      console.error(e)
      alert('Error generando listado de meritorios')
   } finally {
      loadingGenerate.value = false
   }
}

const previewMeritReport = async () => {
   if (!selectedAula.value) return
   loadingPreview.value = true
   meritPreview.value = null
   try {
      let url = `/api/reports/grades/merit?aula_id=${selectedAula.value}&format=json`
      if (selectedAnio.value) url += `&year_id=${selectedAnio.value}`

      const response = await api.get(url)
      meritPreview.value = response
   } catch (e) {
      console.error(e)
      alert('Error cargando vista previa de meritorios')
   } finally {
      loadingPreview.value = false
   }
}

</script>
