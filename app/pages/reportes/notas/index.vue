<template>
   <div>
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
         <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4">
            <div>
               <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 font-outfit">Reportes de Calificaciones</h1>
               <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Generación de boletines, sábanas y actas</p>
            </div>

            <div class="w-full md:w-64">
               <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Año Lectivo</label>
               <select v-model="selectedAnioId" v-if="aniosStore.items.length > 0"
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option :value="null">Año Activo (Por defecto)</option>
                  <option v-for="anio in aniosStore.items" :key="anio.id" :value="anio.id">
                     {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                  </option>
               </select>
            </div>
         </div>
      </header>

      <div class="p-6 max-w-7xl mx-auto">


         <!-- Tabs -->
         <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
               <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" :class="[
                  currentTab === tab.id
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
               ]">
                  {{ tab.name }}
               </button>
            </nav>
         </div>

         <!-- Tab Content -->
         <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">

            <!-- Tab 1: Boletín (Por Estudiante) -->
            <div v-if="currentTab === 'student'" class="space-y-6">
               <div class="max-w-xl">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Estudiante</label>
                  <div class="relative">
                     <input v-model="studentSearch" @input="searchStudents" type="text"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Escribe nombre, apellido o RNE..." />
                     <!-- Resultados de búsqueda -->
                     <div v-if="studentJsonResults.length > 0"
                        class="absolute z-10 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1 border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        <div v-for="s in studentJsonResults" :key="s.id" @click="selectStudent(s)"
                           class="px-4 py-2 hover:bg-gray-100 dark:bg-gray-800 cursor-pointer text-sm">
                           <div class="font-medium text-gray-900 dark:text-gray-100">{{ s.apellidos }}, {{ s.nombres }}</div>
                           <div class="text-xs text-gray-500 dark:text-gray-400">{{ s.aula ? `${s.aula.grado_cardinal}° ${s.aula.seccion}`
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periodo</label>
              <select v-model="selectedPeriod" class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
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
                     class="ml-3 inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
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
               <div v-if="reportPreview" class="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-6 overflow-x-auto print-container">

                  <!-- Institutional header -->
                  <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                     <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Ministerio de Educación (MINERD)</p>
                     <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{{ reportPreview.tenant?.name }}</h2>
                     <h3 class="font-bold mt-2 text-sm">BOLETÍN DE CALIFICACIONES</h3>
                     <p class="text-xs text-gray-500 dark:text-gray-400">Año Lectivo: {{ reportPreview.year }}</p>
                  </div>

                  <!-- Student info bar -->
                  <div class="grid grid-cols-2 gap-2 text-xs mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
                     <div>
                        <span class="font-bold">Estudiante:</span> {{ reportPreview.estudiante?.apellidos }}, {{ reportPreview.estudiante?.nombres }}<br>
                        <span class="font-bold">Código (RNE):</span> {{ reportPreview.estudiante?.rne }}
                     </div>
                     <div>
                        <span class="font-bold">Grado/Aula:</span>
                        {{ reportPreview.aula?.grado_cardinal }}° {{ reportPreview.aula?.seccion }}
                        <span v-if="reportPreview.aula?.titulo"> — {{ reportPreview.aula.titulo.nombre }}</span><br>
                        <span class="font-bold">No. Orden:</span> {{ reportPreview.estudiante?.numero_orden }}
                     </div>
                  </div>

                  <!-- Section: Promedio de Competencias Específicas -->
                  <div class="text-xs font-bold text-white bg-blue-800 dark:bg-blue-900 px-3 py-1.5 rounded-t mb-0 uppercase tracking-wide">
                     Promedio de Competencias Específicas
                  </div>
                  <div class="overflow-x-auto mb-4">
                     <table class="min-w-full text-[10px] border-collapse border border-gray-400">
                        <thead>
                           <!-- Row 1: Asignatura | Bloque labels | Promedio C.E. | Calif.Final -->
                           <tr>
                              <th rowspan="2" class="border border-gray-400 p-1 text-left bg-gray-100 dark:bg-gray-700" style="min-width:120px;">Asignatura</th>
                              <th v-for="(bloqueLabel, bloqueNum) in reportPreview.bloque_labels" :key="'bh-' + bloqueNum"
                                 colspan="4" class="border border-gray-400 p-1 text-center bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 text-[9px]">
                                 <div class="text-[9px] max-w-[100px] mx-auto whitespace-normal break-words leading-tight">
                                    {{ bloqueLabel }}
                                 </div>
                              </th>
                              <th colspan="4" class="border border-gray-400 p-1 text-center bg-blue-900 text-white text-[9px]">Promedio C.E.</th>
                              <th rowspan="2" class="border border-gray-400 p-1 text-center bg-red-900 text-white text-[9px]" style="min-width:28px;">Calif.<br>Final</th>
                           </tr>
                           <!-- Row 2: P1-P4 per bloque + PC1-PC4 -->
                           <tr class="bg-gray-100 dark:bg-gray-700">
                              <template v-for="(_, bloqueNum) in reportPreview.bloque_labels" :key="'pp-' + bloqueNum">
                                 <th v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center text-[9px]" style="min-width:24px;">P{{ p }}</th>
                              </template>
                              <th v-for="p in [1,2,3,4]" :key="'pc' + p" class="border border-gray-400 p-1 text-center bg-blue-800 text-white text-[9px]" style="min-width:24px;">PC{{ p }}</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(subject, idx) in reportPreview.academic_subjects" :key="subject.id"
                              :class="idx % 2 === 1 ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'">
                              <td class="border border-gray-400 p-1 text-left font-medium pl-2">{{ subject.nombre }}</td>
                              <!-- Bloque period grades -->
                              <template v-for="(_, bloqueNum) in reportPreview.bloque_labels" :key="'bg-' + bloqueNum">
                                 <td v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center font-bold"
                                    :class="gradeClass(reportPreview.bloques?.[subject.id]?.[bloqueNum]?.[p])">
                                    {{ reportPreview.bloques?.[subject.id]?.[bloqueNum]?.[p] ?? '–' }}
                                 </td>
                              </template>
                              <!-- PC1-PC4 -->
                              <td v-for="p in [1,2,3,4]" :key="'pc-' + p"
                                 class="border border-gray-400 p-1 text-center font-bold"
                                 :class="[idx % 2 === 1 ? 'bg-green-100/60 dark:bg-green-900/20' : 'bg-green-50 dark:bg-green-900/10',
                                          gradeClass(calcPC(reportPreview.bloques, subject.id, reportPreview.bloque_labels, p))]">
                                 {{ fmtPC(calcPC(reportPreview.bloques, subject.id, reportPreview.bloque_labels, p)) }}
                              </td>
                              <!-- Calificación Final -->
                              <td class="border border-gray-400 p-1 text-center font-bold"
                                 :class="[idx % 2 === 1 ? 'bg-red-100/60 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10',
                                          gradeClass(calcCF(reportPreview.bloques, subject.id, reportPreview.bloque_labels))]">
                                 {{ calcCF(reportPreview.bloques, subject.id, reportPreview.bloque_labels) ?? '–' }}
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <!-- Section: Resultado de Aprendizaje (módulos técnicos) -->
                  <template v-if="reportPreview.technical_modules?.length > 0">
                     <div class="text-xs font-bold text-white bg-blue-800 dark:bg-blue-900 px-3 py-1.5 rounded-t mb-0 mt-3 uppercase tracking-wide">
                        Resultado de Aprendizaje
                     </div>
                     <div class="overflow-x-auto mb-4">
                        <table class="min-w-full text-[10px] border-collapse border border-gray-400">
                           <thead>
                              <tr class="bg-gray-100 dark:bg-gray-700">
                                 <th class="border border-gray-400 p-1 text-left pl-2" style="min-width:160px;">Módulo Técnico</th>
                                 <th class="border border-gray-400 p-1 text-left pl-2">Resultados de Aprendizaje (RAs)</th>
                                 <th class="border border-gray-400 p-1 text-center bg-red-900 text-white" style="min-width:40px;">C.F.</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr v-for="(module, idx) in reportPreview.technical_modules" :key="module.nombre"
                                 :class="idx % 2 === 1 ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'">
                                 <td class="border border-gray-400 p-1 text-left pl-2 font-medium">{{ module.nombre }}</td>
                                 <td class="border border-gray-400 p-1 text-left pl-2">
                                     <div v-if="!module.is_fct" class="flex flex-wrap gap-1">
                                        <span v-for="(raNota, raNum) in module.ras" :key="raNum"
                                           class="border border-gray-300 dark:border-gray-600 rounded px-1 text-[10px]">
                                           RA{{ raNum }}: <b>{{ fmtPC(raNota) }}</b>
                                        </span>
                                     </div>
                                     <div v-else>
                                        <span class="text-gray-400 italic">N/A</span>
                                     </div>
                                  </td>
                                  <td class="border border-gray-400 p-1 text-center font-bold"
                                     :class="[idx % 2 === 1 ? 'bg-red-100/60 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10',
                                              techGradeClass(module.final, module.is_fct)]">
                                     <span v-if="module.is_fct">
                                        {{ module.final !== null && module.final !== undefined ? (module.final >= 70 ? 'APTO' : 'NO APTO') : '–' }}
                                     </span>
                                     <span v-else>
                                        {{ fmtPC(module.final) }}
                                     </span>
                                  </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </template>

                  <div class="mt-4 text-[10px] text-center text-gray-500 dark:text-gray-400">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>


            <!-- Tab 2: Sábana (Por Aula) -->
            <div v-if="currentTab === 'classroom'" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aula</label>
                     <select v-model="selectedAula" @change="loadSubjects"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                     class="inline-flex items-center px-4 py-2 border border-green-600 shadow-sm text-sm font-medium rounded-md text-green-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
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
                  class="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-6 overflow-x-auto">
                  <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                     <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ classroomPreview.tenant?.nombre }}</h2>
                     <h3 class="font-bold mt-2">SÁBANA DE CALIFICACIONES - {{ classroomPreview.aula?.grado_cardinal }}°
                        {{
                           classroomPreview.aula?.seccion }}</h3>
                     <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Año {{ classroomPreview.year }} - Período: {{
                        classroomPreview.period }}
                     </p>
                  </div>

                  <table class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200">
                        <tr>
                           <th class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 z-10 w-12 min-w-[48px] max-w-[48px]">No.</th>
                           <th class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 z-10">Estudiante
                           </th>
                           <th v-for="subject in classroomPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-1 text-center min-w-[60px]">
                              <div class="font-medium">{{ subject.materia?.nombre }}</div>
                              <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ subject.materia?.tipo }}</div>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in classroomPreview.data" :key="row.numero" class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white dark:bg-gray-800 z-10 w-12 min-w-[48px] max-w-[48px]">{{ row.numero
                              }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white dark:bg-gray-800 z-10">{{ row.nombre }}</td>
                           <td v-for="subject in classroomPreview.subjects" :key="subject.id"
                              class="border border-gray-400 p-1 text-center font-bold">
                              {{ row.notas[subject.id] ?? '-' }}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="mt-4 text-[10px] text-center text-gray-500 dark:text-gray-400">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

            <!-- Tab 3: Planilla (Por Materia) -->
            <div v-if="currentTab === 'subject'" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aula</label>
                     <select v-model="selectedAula" @change="loadSubjects"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Seleccionar Aula...</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                           {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                        </option>
                     </select>
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Materia</label>
                     <select v-model="selectedMateria" :disabled="!selectedAula"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed">
                        <option value="">Seleccionar Materia...</option>
                        <option v-for="subj in subjects" :key="subj.materia_id" :value="subj.materia_id">
                           {{ subj.nombre }} ({{ subj.tipo }}) - {{ subj.profesor ? subj.profesor.nombre_completo :
                              'N/D' }}
                        </option>
                     </select>
                  </div>

                  <!-- Period Selector Hidden for Global Report
             <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periodo</label>
                <select v-model="selectedPeriod" class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
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
                     class="inline-flex items-center px-4 py-2 border border-purple-600 shadow-sm text-sm font-medium rounded-md text-purple-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
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
               <div v-if="subjectPreview" class="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-6 overflow-x-auto">
                  <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                     <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ subjectPreview.tenant?.nombre }}</h2>
                     <h3 class="font-bold mt-2 dark:text-gray-100">PLANILLA DE CALIFICACIONES</h3>
                     <p class="text-sm font-bold mt-1 dark:text-gray-200">{{ subjectPreview.materia?.nombre }} ({{
                        subjectPreview.materia?.tipo }})</p>
                     <p class="text-xs text-gray-500 dark:text-gray-400">{{ subjectPreview.assignment?.aula?.grado_cardinal }}° {{
                        subjectPreview.assignment?.aula?.seccion }} - Profesor: {{
                           subjectPreview.assignment?.profesor?.nombre_completo }}</p>
                  </div>

                  <!-- Technical Subject Table -->
                  <table v-if="subjectPreview.materia?.tipo === 'Tecnico'"
                     class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200 dark:bg-gray-700">
                        <tr>
                           <th class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 z-10 w-12 min-w-[48px] max-w-[48px]">No.</th>
                           <th class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 z-10">Estudiante
                           </th>
                           <th v-for="i in subjectPreview.assignment?.cantidad_ra" :key="i"
                              class="border border-gray-400 p-1 text-center dark:text-gray-100">
                              RA{{ i }}
                           </th>
                           <th class="border border-gray-400 p-1 text-center bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 font-bold">Total</th>
                           <template v-if="subjectPreview.data?.[0]?.is_fct">
                              <th class="border border-gray-400 p-1 text-center bg-gray-200 dark:bg-gray-700 dark:text-gray-100 font-bold">Promedio</th>
                              <th class="border border-gray-400 p-1 text-center bg-gray-200 dark:bg-gray-700 dark:text-gray-100 font-bold">Situación</th>
                           </template>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in subjectPreview.data" :key="row.estudiante.id"
                           class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white dark:bg-gray-800 z-10 w-12 min-w-[48px] max-w-[48px]">{{
                              row.estudiante.numero_orden }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white dark:bg-gray-800 z-10">{{
                              row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                           <td v-for="i in subjectPreview.assignment?.cantidad_ra" :key="i"
                              class="border border-gray-400 p-1 text-center font-bold dark:text-gray-100">
                              {{ row.is_fct ? (parseFloat(row.ras?.[i] ?? 0).toFixed(1)) : (row.ras?.[i] ?? 0) }}
                           </td>
                           <td class="border border-gray-400 p-1 text-center font-bold bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-200">{{ row.total }}
                           </td>
                           <template v-if="row.is_fct">
                              <td class="border border-gray-400 p-1 text-center font-bold dark:text-gray-100">{{ row.promedio }}</td>
                              <td class="border border-gray-400 p-1 text-center font-bold"
                                 :class="row.promedio >= 70 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                                 {{ row.situacion }}
                              </td>
                           </template>
                        </tr>
                     </tbody>
                  </table>

                  <!-- Academic Subject Table -->
                  <table v-else class="min-w-full text-xs border-collapse border border-gray-400">
                     <thead class="bg-gray-200 dark:bg-gray-700">
                        <tr>
                           <th rowspan="2" class="border border-gray-400 p-1 text-left sticky left-0 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 z-10 w-12 min-w-[48px] max-w-[48px]">No.</th>
                           <th rowspan="2" class="border border-gray-400 p-1 text-left sticky left-12 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 z-10" style="min-width: 140px;">Estudiante</th>
                           <th v-for="(bloqueLabel, bloqueNum) in subjectPreview.bloque_labels" :key="'sbh-' + bloqueNum"
                              colspan="4" class="border border-gray-400 p-1 text-center bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200">
                              <div class="text-[9px] max-w-[100px] mx-auto whitespace-normal break-words leading-tight">
                                 {{ bloqueLabel }}
                              </div>
                           </th>
                           <th colspan="4" class="border border-gray-400 p-1 text-center bg-blue-900 text-white text-[9px]">Promedio C.E.</th>
                           <th rowspan="2" class="border border-gray-400 p-1 text-center bg-red-900 text-white text-[9px]" style="min-width:28px;">Calif.<br>Final</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-700">
                           <template v-for="(_, bloqueNum) in subjectPreview.bloque_labels" :key="'spp-' + bloqueNum">
                              <th v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center text-[9px]" style="min-width:24px;">P{{ p }}</th>
                           </template>
                           <th v-for="p in [1,2,3,4]" :key="'spc' + p" class="border border-gray-400 p-1 text-center bg-blue-800 text-white text-[9px]" style="min-width:24px;">PC{{ p }}</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="row in subjectPreview.data" :key="row.estudiante.id"
                           class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50">
                           <td class="border border-gray-400 p-1 text-center sticky left-0 bg-white dark:bg-gray-800 z-10 w-12 min-w-[48px] max-w-[48px]">{{
                              row.estudiante.numero_orden }}</td>
                           <td class="border border-gray-400 p-1 sticky left-12 bg-white dark:bg-gray-800 z-10">{{
                              row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                           
                           <!-- P1-P4 per block -->
                           <template v-for="(_, bloqueNum) in subjectPreview.bloque_labels" :key="'sbg-' + bloqueNum">
                              <td v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center font-bold"
                                 :class="gradeClass(row.bloques?.[bloqueNum]?.[p])">
                                 {{ row.bloques?.[bloqueNum]?.[p] ?? '–' }}
                              </td>
                           </template>

                           <!-- PC1-PC4 -->
                           <td v-for="p in [1,2,3,4]" :key="'spc-' + p"
                              class="border border-gray-400 p-1 text-center font-bold"
                              :class="gradeClass(row.periodos?.[p])">
                              {{ fmtPC(row.periodos?.[p]) }}
                           </td>

                           <!-- Calificación Final -->
                           <td class="border border-gray-400 p-1 text-center font-bold bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-200"
                              :class="gradeClass(row.final)">
                              {{ row.final ?? '–' }}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="mt-4 text-[10px] text-center text-gray-500 dark:text-gray-400">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

            <!-- Tab 4: Meritorios (Por Aula) -->
            <div v-if="currentTab === 'merit'" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aula</label>
                     <select v-model="selectedAula"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Seleccionar Aula...</option>
                        <option value="all">Todas las Aulas</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                           {{ aula.grado_cardinal }}° {{ aula.seccion }} - {{ aula.titulo ? aula.titulo.nombre : '' }}
                        </option>
                     </select>
                     <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                     class="inline-flex items-center px-4 py-2 border border-yellow-600 shadow-sm text-sm font-medium rounded-md text-yellow-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
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
               <div v-if="meritPreview" class="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-6 overflow-x-auto">

                  <div v-if="meritPreview.school_excellence && meritPreview.school_excellence.length > 0"
                     class="mb-12 border-b-2 border-dashed border-gray-400 pb-8">
                     <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ meritPreview.tenant?.nombre }}</h2>
                        <h3 class="font-bold mt-2 text-green-700 dark:text-green-400">EXCELENCIA DEL CENTRO EDUCATIVO</h3>
                        <p class="text-xs italic text-gray-600 dark:text-gray-400">Estudiantes con promedio > 98.0 puntos</p>
                     </div>

                     <table class="min-w-full text-xs border-collapse border border-gray-400">
                        <thead class="bg-gray-200">
                           <tr class="bg-green-50">
                              <th class="border border-gray-400 p-2 text-left">No.</th>
                              <th class="border border-gray-400 p-2 text-left">Estudiante</th>
                              <th class="border border-gray-400 p-2 text-left">Aula</th>
                              <th class="border border-gray-400 p-2 text-center bg-green-100 font-bold">Promedio</th>
                              <th class="border border-gray-400 p-2 text-center font-bold">Estado</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(row, idx) in meritPreview.school_excellence" :key="idx"
                              class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50">
                              <td class="border border-gray-400 p-2 text-center font-bold">{{ Number(idx) + 1 }}</td>
                              <td class="border border-gray-400 p-2 font-bold">{{ row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                              <td class="border border-gray-400 p-2">{{ row.aula_label }}</td>
                              <td class="border border-gray-400 p-2 text-center font-bold bg-green-50 text-sm">{{
                                 row.average }}
                              </td>
                              <td class="border border-gray-400 p-2 text-center">
                                 <span
                                    class="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold">Excelencia
                                    Ac.</span>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div v-for="(report, reportIdx) in (meritPreview.reports || [meritPreview])" :key="reportIdx"
                     class="mb-12 last:mb-0">

                     <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ report.tenant?.nombre ||
                           meritPreview.tenant?.nombre }}</h2>
                        <h3 class="font-bold mt-2 text-yellow-700 dark:text-yellow-400">LISTADO DE HONOR - MERITORIOS</h3>
                        <p class="text-sm font-medium dark:text-gray-300">{{ report.aula?.grado_cardinal }}° {{
                           report.aula?.seccion }}</p>
                     </div>

                     <table class="min-w-full text-xs border-collapse border border-gray-400">
                        <thead class="bg-gray-200">
                           <tr>
                              <th class="border border-gray-400 p-2 text-left bg-gray-200">No.</th>
                              <th class="border border-gray-400 p-2 text-left bg-gray-200">Estudiante</th>
                              <th v-for="subject in report.subjects" :key="subject.id"
                                 class="border border-gray-400 p-2 text-center min-w-[60px]">
                                 <div class="font-medium">{{ subject.materia?.nombre }}</div>
                              </th>
                              <th class="border border-gray-400 p-2 text-center bg-yellow-100 font-bold">Promedio</th>
                              <th class="border border-gray-400 p-2 text-center bg-gray-200 font-bold">Estado</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(row, idx) in report.data" :key="row.estudiante.id"
                              class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50">
                              <td class="border border-gray-400 p-2 text-center">{{ Number(idx) + 1 }}</td>
                              <td class="border border-gray-400 p-2 font-medium">{{ row.estudiante.apellidos }} {{
                                 row.estudiante.nombres }}</td>
                              <td v-for="subject in report.subjects" :key="subject.id"
                                 class="border border-gray-400 p-2 text-center">
                                 {{ row.grades[subject.materia_id] ?? '-' }}
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
                           <tr v-if="report.data && report.data.length === 0">
                              <td :colspan="(report.subjects ? report.subjects.length : 0) + 4"
                                 class="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                                 No se encontraron estudiantes meritorios (Promedio >= 97) en esta aula.
                              </td>
                           </tr>
                        </tbody>
                     </table>

                  </div>

                  <div class="mt-4 text-[10px] text-center text-gray-500 dark:text-gray-400">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

            <!-- Tab 5: Boletín Final (Por Estudiante) -->
            <div v-if="currentTab === 'final'" class="space-y-6">

               <!-- Descarga por Aula (ZIP) -->
               <div class="border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
                  <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                     </svg>
                     Descargar todos los boletines de un aula (ZIP)
                  </h3>
                  <div class="flex flex-col sm:flex-row gap-3 items-end">
                     <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Seleccionar Aula</label>
                        <select v-model="selectedAulaFinal"
                           class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500">
                           <option :value="null">-- Elige un aula --</option>
                           <option v-for="a in aulas" :key="a.id" :value="a.id">
                              {{ a.grado_cardinal }}° {{ a.seccion }}
                              <template v-if="a.titulo"> — {{ a.titulo.nombre }}</template>
                           </option>
                        </select>
                     </div>
                     <button @click="chooseAulaDownloadFormat" :disabled="!selectedAulaFinal || loadingAulaZip"
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                        <svg v-if="loadingAulaZip" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {{ loadingAulaZip ? 'Generando...' : 'Descargar' }}
                     </button>
                  </div>
               </div>

               <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Boletín individual por estudiante</p>
               </div>

               <!-- Student search -->
               <div class="max-w-xl">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Estudiante</label>
                  <div class="relative">
                     <input v-model="finalStudentSearch" @input="searchFinalStudents" type="text"
                        class="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Escribe nombre, apellido o RNE..." />
                     <div v-if="finalStudentResults.length > 0"
                        class="absolute z-10 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1 border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        <div v-for="s in finalStudentResults" :key="s.id" @click="selectFinalStudent(s)"
                           class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
                           <div class="font-medium text-gray-900 dark:text-gray-100">{{ s.apellidos }}, {{ s.nombres }}</div>
                           <div class="text-xs text-gray-500 dark:text-gray-400">
                              {{ s.aula ? `${s.aula.grado_cardinal}° ${s.aula.seccion}` : 'Sin Aula' }} | {{ s.rne }}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Selected student chip -->
               <div v-if="selectedFinalStudent"
                  class="bg-indigo-50 p-4 rounded-md border border-indigo-200 flex justify-between items-center">
                  <div>
                     <h3 class="text-sm font-bold text-indigo-900">{{ selectedFinalStudent.apellidos }}, {{ selectedFinalStudent.nombres }}</h3>
                     <p class="text-xs text-indigo-700 mt-1">
                        {{ selectedFinalStudent.aula ? `${selectedFinalStudent.aula.grado_cardinal}° ${selectedFinalStudent.aula.seccion}` : 'Sin Aula' }}
                        &nbsp;|&nbsp; RNE: {{ selectedFinalStudent.rne }}
                     </p>
                  </div>
                  <button @click="selectedFinalStudent = null; finalPreview = null" class="text-indigo-500 hover:text-indigo-700 text-sm">Cambiar</button>
               </div>

               <!-- Action buttons -->
               <div class="pt-2 flex gap-3">
                  <button @click="generateFinalReport" :disabled="!selectedFinalStudent || loadingGenerate"
                     class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingGenerate" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Generar Boletín Final PDF
                  </button>

                  <button @click="previewFinalReport" :disabled="!selectedFinalStudent || loadingPreview"
                     class="inline-flex items-center px-4 py-2 border border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg v-if="loadingPreview" class="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Vista Previa
                  </button>
               </div>

               <!-- Final Report Preview -->
               <div v-if="finalPreview" class="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-6 overflow-x-auto">

                  <!-- Institutional header -->
                  <div class="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
                     <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Ministerio de Educación (MINERD)</p>
                     <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{{ finalPreview.tenant?.name }}</h2>
                     <h3 class="font-bold mt-2 text-sm">BOLETÍN FINAL DE CALIFICACIONES</h3>
                     <p class="text-xs text-gray-500 dark:text-gray-400">Año Lectivo: {{ finalPreview.year }}</p>
                  </div>

                  <!-- Student info bar -->
                  <div class="grid grid-cols-2 gap-2 text-xs mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
                     <div>
                        <span class="font-bold">Estudiante:</span> {{ finalPreview.estudiante?.apellidos }}, {{ finalPreview.estudiante?.nombres }}<br>
                        <span class="font-bold">Código (RNE):</span> {{ finalPreview.estudiante?.rne }}
                     </div>
                     <div>
                        <span class="font-bold">Grado/Aula:</span>
                        {{ finalPreview.aula?.grado_cardinal }}° {{ finalPreview.aula?.seccion }}
                        <span v-if="finalPreview.aula?.titulo"> — {{ finalPreview.aula.titulo.nombre }}</span><br>
                        <span class="font-bold">No. Orden:</span> {{ finalPreview.estudiante?.numero_orden }}
                     </div>
                  </div>

                  <!-- Status badge -->
                  <div class="flex justify-end mb-4">
                     <span :class="
                        finalReportStatus(finalPreview).status === 'POR DEFINIR' ? 'bg-amber-600' : 
                        (finalReportStatus(finalPreview).status === 'APLAZADO' ? 'bg-red-600' : 'bg-green-700')"
                        class="text-white text-xs font-bold px-4 py-1 rounded tracking-widest uppercase">
                        {{ finalReportStatus(finalPreview).status }}
                     </span>
                  </div>

                  <!-- Section: Promedio de Competencias Específicas -->
                  <div class="text-xs font-bold text-white bg-blue-800 dark:bg-blue-900 px-3 py-1.5 rounded-t mb-0 uppercase tracking-wide">
                     Promedio de Competencias Específicas
                  </div>
                  <div class="overflow-x-auto mb-4">
                     <table class="min-w-full text-[10px] border-collapse border border-gray-400">
                        <thead>
                           <!-- Row 1: Asignatura | Bloque labels | Promedio C.E. | Calif.Final -->
                           <tr>
                              <th rowspan="2" class="border border-gray-400 p-1 text-left bg-gray-100 dark:bg-gray-700" style="min-width:120px;">Asignatura</th>
                              <th v-for="(bloqueLabel, bloqueNum) in finalPreview.bloque_labels" :key="'bh-' + bloqueNum"
                                 colspan="4" class="border border-gray-400 p-1 text-center bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 text-[9px]">
                                 {{ bloqueLabel }}
                              </th>
                              <th colspan="4" class="border border-gray-400 p-1 text-center bg-blue-900 text-white text-[9px]">Promedio C.E.</th>
                              <th rowspan="2" class="border border-gray-400 p-1 text-center bg-red-900 text-white text-[9px]" style="min-width:28px;">Calif.<br>Final</th>
                           </tr>
                           <!-- Row 2: P1-P4 per bloque + PC1-PC4 -->
                           <tr class="bg-gray-100 dark:bg-gray-700">
                              <template v-for="(_, bloqueNum) in finalPreview.bloque_labels" :key="'pp-' + bloqueNum">
                                 <th v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center text-[9px]" style="min-width:24px;">P{{ p }}</th>
                              </template>
                              <th v-for="p in [1,2,3,4]" :key="'pc' + p" class="border border-gray-400 p-1 text-center bg-blue-800 text-white text-[9px]" style="min-width:24px;">PC{{ p }}</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(subject, idx) in finalPreview.academic_subjects" :key="subject.id"
                              :class="idx % 2 === 1 ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'">
                              <td class="border border-gray-400 p-1 text-left font-medium pl-2">{{ subject.nombre }}</td>
                              <!-- Bloque period grades -->
                              <template v-for="(_, bloqueNum) in finalPreview.bloque_labels" :key="'bg-' + bloqueNum">
                                 <td v-for="p in [1,2,3,4]" :key="p" class="border border-gray-400 p-1 text-center font-bold"
                                    :class="gradeClass(finalPreview.bloques?.[subject.id]?.[bloqueNum]?.[p])">
                                    {{ finalPreview.bloques?.[subject.id]?.[bloqueNum]?.[p] ?? '–' }}
                                 </td>
                              </template>
                              <!-- PC1-PC4 -->
                              <td v-for="p in [1,2,3,4]" :key="'pc-' + p"
                                 class="border border-gray-400 p-1 text-center font-bold"
                                 :class="[idx % 2 === 1 ? 'bg-green-100/60 dark:bg-green-900/20' : 'bg-green-50 dark:bg-green-900/10',
                                          gradeClass(calcPC(finalPreview.bloques, subject.id, finalPreview.bloque_labels, p))]">
                                 {{ fmtPC(calcPC(finalPreview.bloques, subject.id, finalPreview.bloque_labels, p)) }}
                              </td>
                              <!-- Calificación Final -->
                              <td class="border border-gray-400 p-1 text-center font-bold"
                                 :class="[idx % 2 === 1 ? 'bg-red-100/60 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10',
                                          gradeClass(calcCF(finalPreview.bloques, subject.id, finalPreview.bloque_labels))]">
                                 {{ calcCF(finalPreview.bloques, subject.id, finalPreview.bloque_labels) ?? '–' }}
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <!-- Section: Resultado de Aprendizaje (módulos técnicos) -->
                  <template v-if="finalPreview.technical_modules?.length > 0">
                     <div class="text-xs font-bold text-white bg-blue-800 dark:bg-blue-900 px-3 py-1.5 rounded-t mb-0 mt-3 uppercase tracking-wide">
                        Resultado de Aprendizaje
                     </div>
                     <div class="overflow-x-auto mb-4">
                        <table class="min-w-full text-[10px] border-collapse border border-gray-400">
                           <thead>
                              <tr class="bg-gray-100 dark:bg-gray-700">
                                 <th class="border border-gray-400 p-1 text-left pl-2" style="min-width:160px;">Módulo Técnico</th>
                                 <th class="border border-gray-400 p-1 text-center bg-red-900 text-white" style="min-width:40px;">C.F.</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr v-for="(module, idx) in finalPreview.technical_modules" :key="module.nombre"
                                 :class="idx % 2 === 1 ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'">
                                 <td class="border border-gray-400 p-1 text-left pl-2 font-medium">{{ module.nombre }}</td>
                                 <td class="border border-gray-400 p-1 text-center font-bold"
                                    :class="[idx % 2 === 1 ? 'bg-red-100/60 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10',
                                             techGradeClass(module.final, module.is_fct)]">
                                    <span v-if="module.is_fct">
                                       {{ module.final !== null && module.final !== undefined ? (module.final >= 70 ? 'APTO' : 'NO APTO') : '–' }}
                                    </span>
                                    <span v-else>
                                       {{ module.final ?? '–' }}
                                    </span>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </template>

                  <div class="mt-2 text-[10px] text-center text-gray-500 dark:text-gray-400">
                     Vista previa generada para consulta.
                  </div>
               </div>
            </div>

         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { apiCall as useApi, api } from '@/utils/api'
import { useAniosLectivosStore } from '~/stores/anios_lectivos'
import Swal from 'sweetalert2'

const config = useRuntimeConfig()
import { usePrint } from '~/composables/usePrint'
import { useAuthStore } from '~/stores/auth'

const { printPdfBlob } = usePrint()
const auth = useAuthStore()

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
const allTabs = [
   { id: 'student', name: 'Boletín por Estudiante' },
   { id: 'classroom', name: 'Sábana por Aula' },
   { id: 'subject', name: 'Planilla por Asignatura' },
   { id: 'merit', name: 'Meritorios' },
   { id: 'final', name: 'Boletín Final' },
]

const tabs = computed(() => {
   if (auth.isProfesor) {
      return allTabs.filter(t => t.id === 'subject')
   }
   if (auth.isSecre) {
      return allTabs.filter(t => t.id === 'final')
   }
   return allTabs
})
const aniosStore = useAniosLectivosStore()

// State
const loading = ref(false)
const loadingGenerate = ref(false)
const loadingPreview = ref(false)
const selectedAnioId = ref<number | null>(null)
const activeTab = ref('boletin')

// Data Lists
const estudiantes = ref<any[]>([])
const aulas = ref<any[]>([])
const subjects = ref<any[]>([])

// Form State
const selectedStudent = ref<any>(null)
const selectedAula = ref<any>(null)
const selectedMateria = ref<any>(null)
const selectedPeriod = ref('all')

// Student Search State
const studentSearch = ref('')
const studentJsonResults = ref<any[]>([])

const fetchAulas = async () => {
   try {
      const res = await api.get('/api/aulas')
      aulas.value = res.data || res || []
   } catch (e) {
      console.error('Error fetching aulas', e)
      aulas.value = []
   }
}

// Initialize
onMounted(async () => {
   loading.value = true
   try {
      if (auth.isProfesor) {
         currentTab.value = 'subject'
      } else if (auth.isSecre) {
         currentTab.value = 'final'
      }

      await Promise.all([
         aniosStore.fetchAll(),
         fetchAulas()
      ])

      // Set default active year
      if (aniosStore.activos.length > 0) {
         selectedAnioId.value = aniosStore.activos[0]?.id ?? null
      } else if (aniosStore.items.length > 0) {
         selectedAnioId.value = aniosStore.items[0]?.id ?? null
      }
   } catch (e) {
      console.error(e)
   } finally {
      loading.value = false
   }
})

const reportPreview = ref<ReportPreview | null>(null)
const classroomPreview = ref<any | null>(null)
const subjectPreview = ref<any | null>(null)
const meritPreview = ref<any | null>(null)
const finalPreview = ref<any | null>(null)

// --- Inspiring Messages for Heavy Report Generation ---
const loadingPhrases = [
   "No te desesperes, lo estamos haciendo por ti...",
   "¡Casi listo! Estamos ordenando las mejores calificaciones...",
   "Procesando datos académicos con mucho cariño...",
   "Calculando los promedios finales de cada estudiante...",
   "¡No te preocupes! Estamos construyendo el reporte para ti...",
   "Analizando registros académicos... un momento por favor.",
   "El que persevera alcanza... ¡ya casi terminamos!",
   "Organizando la información para darte el mejor reporte..."
]

let loadingInterval: any = null

const startLoadingModal = (title = 'Generando Reporte') => {
   let messageIndex = 0
   
   Swal.fire({
      title: title,
      html: `
         <div class="flex flex-col items-center justify-center p-4">
            <div class="relative w-16 h-16 mb-4">
               <div class="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30"></div>
               <div class="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p id="swal-loading-msg" class="text-sm text-gray-600 dark:text-gray-300 font-medium text-center transition-opacity duration-300" style="min-height: 40px; opacity: 1;">
               ${loadingPhrases[0]}
            </p>
         </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
         popup: 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700',
         title: 'text-gray-900 dark:text-gray-100 font-bold font-outfit text-lg border-b border-gray-100 dark:border-gray-700 pb-3'
      },
      didOpen: () => {
         loadingInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingPhrases.length
            const msgEl = document.getElementById('swal-loading-msg')
            if (msgEl) {
               msgEl.style.opacity = '0'
               setTimeout(() => {
                  msgEl.innerText = loadingPhrases[messageIndex]
                  msgEl.style.opacity = '1'
               }, 300)
            }
         }, 3500)
      },
      willClose: () => {
         if (loadingInterval) {
            clearInterval(loadingInterval)
            loadingInterval = null
         }
      }
   })
}

const stopLoadingModal = () => {
   if (loadingInterval) {
      clearInterval(loadingInterval)
      loadingInterval = null
   }
   Swal.close()
}

// ── Helpers for final report preview ──────────────────────────────────────────
const gradeClass = (grade: number | null | undefined): string => {
   if (grade == null) return 'text-gray-300 dark:text-gray-600'
   if (grade < 70) return 'text-red-600 dark:text-red-400'
   if (grade >= 90) return 'text-green-700 dark:text-green-400'
   return ''
}

const techGradeClass = (grade: number | null | undefined, isFct: boolean): string => {
   if (grade == null) return 'text-gray-300 dark:text-gray-600'
   const low  = 70
   const high = 90
   if (grade < low)  return 'text-red-600 dark:text-red-400'
   if (grade >= high) return 'text-green-700 dark:text-green-400'
   return ''
}

const calcPC = (
   bloques: any,
   subjectId: number,
   bloqueLabels: Record<string, string>,
   period: number
): number | null => {
   // period = bloque index (1-4): PC1 = promedio de P1+P2+P3+P4 del bloque 1, etc.
   if (!bloques?.[subjectId]) return null
   const bloque = bloques[subjectId]?.[period]
   if (!bloque) return null
   const vals: number[] = []
   for (const p of [1, 2, 3, 4]) {
      const v = bloque[p]
      if (v != null) vals.push(Number(v))
   }
   return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / 4 : null
}

const fmtPC = (v: number | null | undefined): string => {
   if (v == null) return '–'
   const rounded = Math.round(Number(v) * 10) / 10
   return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}

const calcCF = (
   bloques: any,
   subjectId: number,
   bloqueLabels: Record<string, string>
): number | null => {
   const pcVals: number[] = []
   for (let p = 1; p <= 4; p++) {
      const pc = calcPC(bloques, subjectId, bloqueLabels, p)
      if (pc != null) pcVals.push(pc)
   }
   return pcVals.length > 0 ? Math.round(pcVals.reduce((a: number, b: number) => a + b, 0) / 4) : null
}

const finalReportStatus = (preview: any): { status: 'POR DEFINIR' | 'APLAZADO' | 'PROMOVIDO' } => {
   // 1. Calculate if there are any failed subjects/modules
   let aplazado = false
   if (preview?.academic_subjects && preview?.bloques && preview?.bloque_labels) {
      for (const subject of preview.academic_subjects) {
         const cf = calcCF(preview.bloques, subject.id, preview.bloque_labels)
         if (cf != null && cf < 70) { aplazado = true; break }
      }
   }
   if (!aplazado && preview?.technical_modules) {
      for (const module of preview.technical_modules) {
         const threshold = 70
         if (module.final != null && module.final < threshold) { aplazado = true; break }
      }
   }

   if (aplazado) {
      return { status: 'APLAZADO' }
   }

   // 2. Check if it is por_definir (either calculated by backend or checked here as fallback)
   if (preview && typeof preview.por_definir === 'boolean') {
      if (preview.por_definir) {
         return { status: 'POR DEFINIR' }
      }
   } else {
      let porDefinir = false

      // Fallback academic missing check (only if backend did not send por_definir)
      if (preview?.academic_subjects && preview?.bloques && preview?.bloque_labels) {
         for (const subject of preview.academic_subjects) {
            for (const bloqueNum of Object.keys(preview.bloque_labels)) {
               for (const p of [1, 2, 3, 4]) {
                  const val = preview.bloques?.[subject.id]?.[bloqueNum]?.[p]
                  if (val === null || val === undefined) {
                     porDefinir = true
                     break
                  }
               }
               if (porDefinir) break
            }
            if (porDefinir) break
         }
      }
      // Note: incomplete tech modules do NOT trigger POR DEFINIR

      if (porDefinir) {
         return { status: 'POR DEFINIR' }
      }
   }

   return { status: 'PROMOVIDO' }
}
// ──────────────────────────────────────────────────────────────────────────────

let searchTimeout: any = null

// Watchers
watch(selectedAnioId, () => {
   selectedStudent.value = null
   selectedAula.value = null
   selectedMateria.value = null
   reportPreview.value = null
   classroomPreview.value = null
   subjectPreview.value = null
   meritPreview.value = null
   finalPreview.value = null
   selectedFinalStudent.value = null
   finalStudentSearch.value = ''
   finalStudentResults.value = []
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
   reportPreview.value = null
}

// Load Subjects when Aula changes
const loadSubjects = async () => {
   subjects.value = []
   selectedMateria.value = ''

   if (!selectedAula.value) return

   try {
      const res = await api.get(`/api/class-assignments?aula_id=${selectedAula.value}&only_active=true`)
      const data = res.data?.data || res.data || []

      subjects.value = data.map((a: any) => ({
         materia_id: a.materia_id,
         materia: a.materia?.nombre,
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
   finalPreview.value = null
})

// Generators
const generateStudentReport = async () => {
   if (!selectedStudent.value) return
   loadingGenerate.value = true
   startLoadingModal('Generando Boletín de Calificaciones')
   try {
      let url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob
      stopLoadingModal()

      const studentAula = selectedStudent.value.aula
      const aulaLabel = studentAula ? `${studentAula.grado_cardinal}${studentAula.seccion}` : 'Sin_Aula'
      const filename = `boletin_${selectedStudent.value.apellidos}_${selectedStudent.value.nombres}_${aulaLabel}.pdf`
      printPdfBlob(blob, filename, 'Generando boletín...')

   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error generando reporte') })
   } finally {
      loadingGenerate.value = false
      stopLoadingModal()
   }
}

const previewStudentReport = async () => {
   if (!selectedStudent.value) return
   loadingPreview.value = true
   reportPreview.value = null
   startLoadingModal('Cargando Vista Previa del Boletín')
   try {
      let url = `/api/reports/grades/student?estudiante_id=${selectedStudent.value.id}&period=${selectedPeriod.value}&format=json`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const res = await api.get(url)
      stopLoadingModal()
      reportPreview.value = res as unknown as ReportPreview
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error cargando vista previa') })
   } finally {
      loadingPreview.value = false
      stopLoadingModal()
   }
}

const generateClassroomReport = async () => {
   if (!selectedAula.value) return
   loadingGenerate.value = true
   startLoadingModal('Generando Sábana de Calificaciones')
   try {
      let url = `/api/reports/grades/classroom?aula_id=${selectedAula.value}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob
      stopLoadingModal()

      const selectedAulaObj = aulas.value.find(a => a.id === selectedAula.value)
      const filename = `sabana_${selectedAulaObj?.grado_cardinal || ''}${selectedAulaObj?.seccion || ''}.pdf`
      printPdfBlob(blob, filename, 'Generando sábana...')

   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error generando sábana') })
   } finally {
      loadingGenerate.value = false
      stopLoadingModal()
   }
}

const generateSubjectReport = async () => {
   if (!selectedAula.value || !selectedMateria.value) return
   loadingGenerate.value = true
   startLoadingModal('Generando Planilla de Calificaciones')
   try {
      let url = `/api/reports/grades/subject?aula_id=${selectedAula.value}&materia_id=${selectedMateria.value}&period=${selectedPeriod.value}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob
      stopLoadingModal()

      const selectedSubject = subjects.value.find(s => s.materia_id === selectedMateria.value)
      const filename = `planilla_${selectedSubject?.nombre || 'materia'}.pdf`
      printPdfBlob(blob, filename, 'Generando planilla...')

   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error generando planilla') })
   } finally {
      loadingGenerate.value = false
      stopLoadingModal()
   }
}

const previewClassroomReport = async () => {
   if (!selectedAula.value) return
   loadingPreview.value = true
   classroomPreview.value = null
   startLoadingModal('Cargando Vista Previa de Sábana')
   try {
      let url = `/api/reports/grades/classroom?aula_id=${selectedAula.value}&format=json`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const response = await api.get(url)
      stopLoadingModal()
      classroomPreview.value = response
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error cargando vista previa de sábana') })
   } finally {
      loadingPreview.value = false
      stopLoadingModal()
   }
}

const previewSubjectReport = async () => {
   if (!selectedAula.value || !selectedMateria.value) return
   loadingPreview.value = true
   subjectPreview.value = null
   startLoadingModal('Cargando Vista Previa de Planilla')
   try {
      let url = `/api/reports/grades/subject?aula_id=${selectedAula.value}&materia_id=${selectedMateria.value}&period=${selectedPeriod.value}&format=json`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const res = await api.get(url)
      stopLoadingModal()
      subjectPreview.value = res
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error cargando vista previa de planilla') })
   } finally {
      loadingPreview.value = false
      stopLoadingModal()
   }
}

const generateMeritReport = async () => {
   if (!selectedAula.value) return
   loadingGenerate.value = true
   startLoadingModal('Generando Listado de Meritorios')
   try {
      let url = `/api/reports/grades/merit?aula_id=${selectedAula.value}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob
      stopLoadingModal()

      let filename = 'meritorios.pdf';

      if (selectedAula.value === 'all') {
         filename = 'meritorios_todas_las_aulas.pdf';
      } else {
         const selectedAulaObj = aulas.value.find(a => String(a.id) === String(selectedAula.value))
         filename = `meritorios_${selectedAulaObj?.grado_cardinal || ''}${selectedAulaObj?.seccion || ''}.pdf`
      }

      printPdfBlob(blob, filename, 'Generando listado de meritorios...')

   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error generando listado de meritorios') })
   } finally {
      loadingGenerate.value = false
      stopLoadingModal()
   }
}

const previewMeritReport = async () => {
   if (!selectedAula.value) return

   loadingPreview.value = true
   meritPreview.value = null
   startLoadingModal('Cargando Vista Previa de Meritorios')
   try {
      let url = `/api/reports/grades/merit?aula_id=${selectedAula.value}&format=json`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const response = await api.get(url)
      stopLoadingModal()
      meritPreview.value = response
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error cargando vista previa de meritorios') })
   } finally {
      loadingPreview.value = false
      stopLoadingModal()
   }
}
// --- Boletín Final — descarga por aula (ZIP o PDF unificado) ---
const selectedAulaFinal = ref<number | null>(null)
const loadingAulaZip = ref(false)

const chooseAulaDownloadFormat = async () => {
   if (!selectedAulaFinal.value) return

   // 1. Ask whether the user wants the boletin signed
   const { isConfirmed: wantsSigned, isDismissed: canceledSign } = await Swal.fire({
      title: '¿Incluir firma digital?',
      html: `
         <p class="text-sm text-gray-600 mb-4">¿Deseas que los boletines incluyan la firma digital de los responsables?</p>
         <div class="flex flex-col gap-3 text-left">
            <div class="p-3 border rounded-lg border-green-300 bg-green-50">
               <strong>✅ Con firma digital</strong><br>
               <span class="text-xs text-gray-500">El boletín mostrará la imagen de la firma digital registrada.</span>
            </div>
            <div class="p-3 border rounded-lg border-gray-300 bg-gray-50">
               <strong>📄 Sin firma digital</strong><br>
               <span class="text-xs text-gray-500">Solo se mostrará el nombre y cargo, sin imagen de firma.</span>
            </div>
         </div>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Con firma digital',
      denyButtonText: 'Sin firma digital',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      denyButtonColor: '#6b7280',
   })

   if (canceledSign) return
   const withSignature = wantsSigned ? 1 : 0

   // 2. Ask for the download format
   const { isConfirmed, isDenied } = await Swal.fire({
      title: 'Formato de descarga',
      html: `
         <p class="text-sm text-gray-600 mb-4">Selecciona cómo deseas descargar los boletines del aula.</p>
         <div class="flex flex-col gap-3 text-left">
            <div class="p-3 border rounded-lg border-indigo-300 bg-indigo-50">
               <strong>PDF Unificado</strong><br>
               <span class="text-xs text-gray-500">Un solo PDF con todos los boletines seguidos, ideal para imprimir de una vez.</span>
            </div>
            <div class="p-3 border rounded-lg border-blue-300 bg-blue-50">
               <strong>Múltiples PDF (ZIP)</strong><br>
               <span class="text-xs text-gray-500">Un archivo ZIP con un PDF por estudiante, nombrado con el apellido de cada uno.</span>
            </div>
         </div>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'PDF Unificado',
      denyButtonText: 'Múltiples PDF (ZIP)',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4f46e5',
      denyButtonColor: '#0369a1',
   })

   if (isConfirmed) {
      await downloadAulaFinalUnified(withSignature)
   } else if (isDenied) {
      await downloadAulaFinalZip(withSignature)
   }
}

const downloadAulaFinalUnified = async (withSignature: number = 1) => {
   loadingAulaZip.value = true
   startLoadingModal('Generando PDF Unificado de Boletines')
   try {
      let url = `/api/reports/grades/final-aula-unified?aula_id=${selectedAulaFinal.value}&with_signature=${withSignature}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.getBlob(url)
      stopLoadingModal()
      const aula = aulas.value.find(a => a.id === selectedAulaFinal.value)
      const aulaLabel = aula ? `${aula.grado_cardinal}${aula.seccion}` : selectedAulaFinal.value
      const filename = `boletines_finales_${aulaLabel}.pdf`

      const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(objectUrl)
   } catch (e: any) {
      stopLoadingModal()
      console.error(e)
      const msg = e?.response?.status === 404
         ? 'No hay estudiantes activos en esta aula.'
         : ((e as any).data?.message || (e as any).message || 'Error generando el PDF unificado.')
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
   } finally {
      loadingAulaZip.value = false
      stopLoadingModal()
   }
}

const downloadAulaFinalZip = async (withSignature: number = 1) => {
   loadingAulaZip.value = true
   startLoadingModal('Generando ZIP de Boletines del Aula')
   try {
      let url = `/api/reports/grades/final-aula?aula_id=${selectedAulaFinal.value}&with_signature=${withSignature}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.getBlob(url)
      stopLoadingModal()
      const aula = aulas.value.find(a => a.id === selectedAulaFinal.value)
      const aulaLabel = aula ? `${aula.grado_cardinal}${aula.seccion}` : selectedAulaFinal.value
      const filename = `boletines_finales_${aulaLabel}.zip`

      const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }))
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(objectUrl)
   } catch (e: any) {
      stopLoadingModal()
      console.error(e)
      const msg = e?.response?.status === 404
         ? 'No hay estudiantes activos en esta aula.'
         : ((e as any).data?.message || (e as any).message || 'Error generando el ZIP de boletines.')
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
   } finally {
      loadingAulaZip.value = false
      stopLoadingModal()
   }
}

// --- Boletín Final (per student) ---
const finalStudentSearch = ref('')
const finalStudentResults = ref<any[]>([])
const selectedFinalStudent = ref<any>(null)
let finalSearchTimeout: any = null

const searchFinalStudents = () => {
   if (finalSearchTimeout) clearTimeout(finalSearchTimeout)
   if (!finalStudentSearch.value || finalStudentSearch.value.length < 3) {
      finalStudentResults.value = []
      return
   }
   finalSearchTimeout = setTimeout(async () => {
      try {
         const res = await api.get(`/api/estudiantes?search=${finalStudentSearch.value}&per_page=10`)
         finalStudentResults.value = (res.data as any) || []
      } catch (e) {
         console.error(e)
      }
   }, 300)
}

const selectFinalStudent = (s: any) => {
   selectedFinalStudent.value = s
   finalStudentSearch.value = ''
   finalStudentResults.value = []
   finalPreview.value = null
}

const generateFinalReport = async () => {
   if (!selectedFinalStudent.value) return

   // Ask whether to include digital signature
   const { isConfirmed: wantsSigned, isDismissed: canceled } = await Swal.fire({
      title: '¿Incluir firma digital?',
      html: `
         <p class="text-sm text-gray-600 mb-4">¿Deseas que el boletín incluya la firma digital de los responsables?</p>
         <div class="flex flex-col gap-3 text-left">
            <div class="p-3 border rounded-lg border-green-300 bg-green-50">
               <strong>✅ Con firma digital</strong><br>
               <span class="text-xs text-gray-500">El boletín mostrará la imagen de la firma digital registrada.</span>
            </div>
            <div class="p-3 border rounded-lg border-gray-300 bg-gray-50">
               <strong>📄 Sin firma digital</strong><br>
               <span class="text-xs text-gray-500">Solo se mostrará el nombre y cargo, sin imagen de firma.</span>
            </div>
         </div>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Con firma digital',
      denyButtonText: 'Sin firma digital',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      denyButtonColor: '#6b7280',
   })

   if (canceled) return
   const withSignature = wantsSigned ? 1 : 0

   loadingGenerate.value = true
   startLoadingModal('Generando Boletín Final')
   try {
      let url = `/api/reports/grades/final?estudiante_id=${selectedFinalStudent.value.id}&with_signature=${withSignature}`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const blob = await api.get(url, { responseType: 'blob' }) as Blob
      stopLoadingModal()
      const studentAula = selectedFinalStudent.value.aula
      const aulaLabel = studentAula ? `${studentAula.grado_cardinal}${studentAula.seccion}` : 'Sin_Aula'
      const filename = `boletin_final_${selectedFinalStudent.value.apellidos}_${selectedFinalStudent.value.nombres}_${aulaLabel}.pdf`
      printPdfBlob(blob, filename, 'Generando boletín final...')
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error generando boletín final') })
   } finally {
      loadingGenerate.value = false
      stopLoadingModal()
   }
}

const previewFinalReport = async () => {
   if (!selectedFinalStudent.value) return
   loadingPreview.value = true
   finalPreview.value = null
   startLoadingModal('Cargando Vista Previa del Boletín Final')
   try {
      let url = `/api/reports/grades/final?estudiante_id=${selectedFinalStudent.value.id}&format=json`
      if (selectedAnioId.value) url += `&year_id=${selectedAnioId.value}`

      const response = await api.get(url)
      stopLoadingModal()
      finalPreview.value = response
   } catch (e) {
      stopLoadingModal()
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error', text: ((e as any).data?.message || (e as any).message || 'Error cargando vista previa del boletín final') })
   } finally {
      loadingPreview.value = false
      stopLoadingModal()
   }
}

</script>

<style scoped>
/* Dark Mode overrides for reports preview tables */
.dark table,
.dark th,
.dark td {
   border-color: #4b5563 !important; /* gray-600 */
}

.dark thead,
.dark thead tr,
.dark thead th {
   background-color: #374151 !important; /* gray-700 */
   color: #f3f4f6 !important; /* gray-100 */
}

/* Custom backgrounds overrides */
.dark .bg-green-50 {
   background-color: rgba(6, 78, 59, 0.3) !important; /* emerald-900 / 30% */
   color: #a7f3d0 !important; /* emerald-200 */
}

.dark .bg-green-100 {
   background-color: rgba(6, 78, 59, 0.55) !important; /* emerald-900 / 55% */
   color: #a7f3d0 !important; /* emerald-200 */
}

.dark .bg-yellow-50 {
   background-color: rgba(120, 53, 4, 0.25) !important; /* amber-900 / 25% */
   color: #fde68a !important; /* amber-200 */
}

.dark .bg-yellow-100 {
   background-color: rgba(120, 53, 4, 0.45) !important; /* amber-900 / 45% */
   color: #fde68a !important; /* amber-200 */
}

.dark .bg-blue-50\/40 {
   background-color: rgba(30, 58, 138, 0.15) !important; /* blue-900 / 15% */
}

.dark .bg-gray-200 {
   background-color: #374151 !important; /* gray-700 */
   color: #f3f4f6 !important;
}

/* Sticky columns in dark mode to prevent transparent overlap */
.dark th.sticky,
.dark td.sticky {
   background-color: #1f2937 !important; /* gray-800 */
   color: #f3f4f6 !important;
}

/* Status badges inside merit list */
.dark .bg-blue-100 {
   background-color: rgba(30, 58, 138, 0.3) !important;
   color: #93c5fd !important;
   border-color: #1e3a8a !important;
}
</style>


