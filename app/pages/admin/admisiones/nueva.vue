<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Formulario de Pre-admisión</h1>
        <p class="text-sm text-gray-500 mt-1">Complete todos los datos requeridos para la inscripción del estudiante.
        </p>
      </div>
      <button v-if="form.pdf_token" @click="downloadPdf" type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
        :disabled="isDownloadingPdf">
        <svg v-if="isDownloadingPdf" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimir Formulario Admisión
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-8">

      <!-- Sección 1: Procedencia y Área -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">1. Información de Ingreso</h2>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Fecha</label>
              <input type="date" v-model="form.admision.fecha" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Centro de Procedencia</label>
              <input type="text" v-model="form.admision.centro_procedencia" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Año Lectivo Admisión</label>
              <select v-model="form.admision.anio_lectivo_id" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                <option value="" disabled>Seleccione Año Lectivo</option>
                <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">
                  {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                </option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Área a Escoger</label>
              <select v-model="form.admision.titulo_id" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                <option value="" disabled>Seleccione un área (Título)</option>
                <option v-for="titulo in titulos" :key="titulo.id" :value="titulo.id">
                  {{ titulo.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 2: Datos del Estudiante -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">2. Datos del Estudiante</h2>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Nombres</label>
              <input type="text" v-model="form.nombres" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Apellidos</label>
              <input type="text" v-model="form.apellidos" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Cédula / Pasaporte</label>
              <input type="text" v-model="form.cedula" placeholder="Opcional"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Sexo</label>
              <select v-model="form.sexo" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Fecha de Nacimiento</label>
              <input type="date" v-model="form.fecha_nacimiento" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Edad Calculada</label>
              <input type="text" :value="edadCalculada" readonly
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 3: Datos de Acta de Nacimiento -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">3. Datos del Acta de Nacimiento
          </h2>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Provincia</label>
              <input type="text" v-model="form.acta.provincia"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium leading-6 text-gray-900">Municipio</label>
              <input type="text" v-model="form.acta.municipio"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Oficialia</label>
              <input type="text" v-model="form.acta.oficialia"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-1">
              <label class="block text-sm font-medium leading-6 text-gray-900">Libro</label>
              <input type="text" v-model="form.acta.libro"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-1">
              <label class="block text-sm font-medium leading-6 text-gray-900">Folio</label>
              <input type="text" v-model="form.acta.folio"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-1">
              <label class="block text-sm font-medium leading-6 text-gray-900">N° de Acta</label>
              <input type="text" v-model="form.acta.acta_numero"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-1">
              <label class="block text-sm font-medium leading-6 text-gray-900">Año</label>
              <input type="text" v-model="form.acta.anio" maxlength="4"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 4: Dirección -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">4. Dirección del Estudiante</h2>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div class="sm:col-span-6">
              <label class="block text-sm font-medium leading-6 text-gray-900">Calle, No. y Detalles</label>
              <input type="text" v-model="form.direccion.calle" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Sector</label>
              <input type="text" v-model="form.direccion.sector" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Municipio</label>
              <input type="text" v-model="form.direccion.municipio" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium leading-6 text-gray-900">Provincia</label>
              <input type="text" v-model="form.direccion.provincia" required
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 5: Padre, Madre o Tutor -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-lg font-semibold leading-7 text-gray-900">5. Familiares o Tutores</h2>
            <div class="flex gap-4">
              <button type="button" @click="addFamiliar"
                class="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Otro
              </button>
            </div>
          </div>

          <div v-for="(familiar, index) in form.familiares" :key="index"
            class="mb-6 pb-6 border-b last:border-0 last:mb-0 last:pb-0">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-gray-700">Familiar #{{ index + 1 }}</h3>
              <button v-if="form.familiares.length > 1" type="button" @click="removeFamiliar(index)"
                class="text-xs text-red-600 hover:text-red-800">Eliminar</button>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Nombres</label>
                <input type="text" v-model="familiar.nombres" required
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Apellidos</label>
                <input type="text" v-model="familiar.apellidos" required
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Parentesco</label>
                <select v-model="familiar.parentesco" required
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor/a</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Cédula / Pasaporte</label>
                <input type="text" v-model="familiar.cedula_pasaporte" required
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Teléfono Casa</label>
                <input type="text" v-model="familiar.telefono_casa"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900">Celular</label>
                <input type="text" v-model="familiar.celular" required
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-3">
                <label class="block text-sm font-medium leading-6 text-gray-900">Nivel Académico</label>
                <input type="text" v-model="familiar.nivel_academico" placeholder="Ej. Universitario, Bachiller..."
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-3">
                <label class="block text-sm font-medium leading-6 text-gray-900">Profesión u Oficio</label>
                <input type="text" v-model="familiar.profesion_oficio"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
              <div class="sm:col-span-6">
                <label class="block text-sm font-medium leading-6 text-gray-900">Dirección</label>
                <input type="text" v-model="familiar.direccion"
                  placeholder="Si es igual a la del estudiante, dejar en blanco o escribir 'Misma'."
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 6: Historia Clínica (Oculto por ahora para pre-admisión) -->
      <!--
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">6. Historia Clínica</h2>
          
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Padece alguna de las siguientes enfermedades:</h3>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2" v-for="enf in ['Alergia', 'Diabetes', 'Asma', 'Hepatitis']" :key="enf">
                <input type="checkbox" :value="enf" v-model="form.historia.enfermedades" class="rounded border-gray-300 text-primary-600 focus:ring-primary-600">
                <span class="text-sm text-gray-700">{{ enf }}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Vacunas aplicadas:</h3>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2" v-for="vacuna in ['Polio', 'Sarampión', 'Tétano 1', 'Tétano 2', 'Tétano 3', 'Influenza', 'Hepatitis', 'Meningitis', 'Tuberculosis']" :key="vacuna">
                <input type="checkbox" :value="vacuna" v-model="form.historia.vacunas" class="rounded border-gray-300 text-primary-600 focus:ring-primary-600">
                <span class="text-sm text-gray-700">{{ vacuna }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      -->

      <!-- Sección 7: Documentos Entregados -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">6. Documentos Entregados</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_record_notas"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Récord de notas</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_certificado_sigerd"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Certificado SIGERD</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_buena_conducta"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Buena Conducta</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_acta_nacimiento"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Acta de Nacimiento</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_fotos"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Fotos 2x2 (2)</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_certificado_medico"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Certificado Médico</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_tarjeta_vacuna"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Tarjeta de Vacunas</span>
            </label>
            <label
              class="flex items-center gap-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="form.historia.documento_copia_cedula_padres"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600">
              <span class="text-sm text-gray-700">Copia Cédula Padres</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Sección 8: Firmas -->
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <h2 class="text-lg font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">7. Firmas de Inscripción</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Firma del Padre o Tutor -->
            <div>
              <label class="block text-sm font-medium leading-6 text-gray-900 mb-2">Firma del Padre, Madre o
                Tutor</label>
              <StaffSignaturePad ref="signaturePadRef" @update="handleSignatureUpdate" />
            </div>

            <!-- Firma del Coordinador -->
            <div>
              <label class="block text-sm font-medium leading-6 text-gray-900 mb-2">Nombre y Firma del Coordinador/a de
                Registro</label>
              <input type="text" v-model="form.historia.firma_coordinador" readonly disabled
                placeholder="Cargando coordinador..."
                class="block w-full rounded-md border-0 py-1.5 text-gray-700 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 mb-4 cursor-not-allowed" />

              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 mt-10">
                <p>La firma del responsable del formulario (<strong>{{ authStore.user?.name || 'Administrador'
                }}</strong>) será adjuntada automáticamente al generar el documento final si está disponible en su
                  perfil.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6">
        <NuxtLink to="/admin/admisiones" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
          Cancelar</NuxtLink>
        <button type="submit" :disabled="loading"
          class="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 inline-flex items-center">
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          Registrar Admisión y Generar Documento
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'
import Swal from 'sweetalert2'
import { usePrint } from '~/composables/usePrint'

definePageMeta({
  middleware: ['auth']
})

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const titulos = ref([])
const aniosLectivos = ref([])
const signaturePadRef = ref(null)
const isDownloadingPdf = ref(false)

// Stores and Composables
const { printPdfBlob } = usePrint()

// Initial state
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  cedula: '',
  sexo: 'Masculino',
  admision: {
    fecha: today,
    centro_procedencia: '',
    titulo_id: '',
    anio_lectivo_id: ''
  },
  acta: {
    provincia: '',
    municipio: '',
    oficialia: '',
    libro: '',
    folio: '',
    acta_numero: '',
    anio: ''
  },
  direccion: {
    calle: '',
    sector: '',
    municipio: '',
    provincia: ''
  },
  familiares: [
    {
      nombres: '',
      apellidos: '',
      parentesco: 'Padre',
      cedula_pasaporte: '',
      telefono_casa: '',
      celular: '',
      nivel_academico: '',
      profesion_oficio: '',
      direccion: ''
    }
  ],
  historia: {
    enfermedades: [],
    vacunas: [],
    documento_record_notas: false,
    documento_certificado_sigerd: false,
    documento_buena_conducta: false,
    documento_acta_nacimiento: true,
    documento_fotos: false,
    documento_certificado_medico: false,
    documento_tarjeta_vacuna: false,
    documento_copia_cedula_padres: false,
    firma_padre_path: '',
    firma_coordinador: ''
  },
  studentData: null,
  credentials: null,
  pdf_token: null
})

const edadCalculada = computed(() => {
  if (!form.fecha_nacimiento) return ''
  const dob = new Date(form.fecha_nacimiento)
  const diff_ms = Date.now() - dob.getTime()
  const age_dt = new Date(diff_ms)
  return Math.abs(age_dt.getUTCFullYear() - 1970) + ' años'
})

const addFamiliar = () => {
  form.familiares.push({
    nombres: '',
    apellidos: '',
    parentesco: 'Madre',
    cedula_pasaporte: '',
    telefono_casa: '',
    celular: '',
    nivel_academico: '',
    profesion_oficio: '',
    direccion: ''
  })
}

const removeFamiliar = (index) => {
  if (form.familiares.length > 1) {
    form.familiares.splice(index, 1)
  }
}

const handleSignatureUpdate = (dataUrl) => {
  form.historia.firma_padre_path = dataUrl
}

const fetchTitulos = async () => {
  try {
    const res = await api.get('/api/titulos')
    titulos.value = res.data || []
  } catch (e) {
    console.error('Error fetching titulos', e)
  }
}

const fetchAniosLectivos = async () => {
  try {
    const res = await api.get('/api/anios-lectivos')
    const data = res.data || res || []
    aniosLectivos.value = Array.isArray(data) ? data : []

    // Lógica de pre-selección
    if (aniosLectivos.value.length > 0) {
      const activo = aniosLectivos.value.find(a => a.activo)
      // Intentar buscar uno que sea posterior al activo
      if (activo) {
        const posteriores = aniosLectivos.value.filter(a => a.id > activo.id).sort((a, b) => a.id - b.id)
        if (posteriores.length > 0) {
          form.admision.anio_lectivo_id = posteriores[0].id
        } else {
          form.admision.anio_lectivo_id = activo.id
        }
      } else {
        form.admision.anio_lectivo_id = aniosLectivos.value[0].id
      }
    }
  } catch (e) {
    console.error('Error fetching anios-lectivos', e)
  }
}

const fetchCoordinadorRegistro = async () => {
  try {
    const res = await api.get('/api/admisiones/coordinador-registro')
    if (res && res.data) {
      const coord = res.data
      form.historia.firma_coordinador = coord.nombre_completo || `${coord.nombre} ${coord.apellido}`
    } else {
      form.historia.firma_coordinador = 'No asignado'
    }
  } catch (e) {
    console.error('Error fetching coordinador de registro', e)
    form.historia.firma_coordinador = 'No asignado'
  }
}

const downloadPdf = async () => {
  if (!form.pdf_token) {
    Swal.fire({
      icon: 'warning',
      title: 'No hay documento para imprimir',
      text: 'Por favor, registre la admisión primero para generar el documento.',
      confirmButtonColor: '#f43f5e'
    })
    return
  }

  isDownloadingPdf.value = true
  try {
    const config = useRuntimeConfig()
    const downloadUrl = `${config.public.apiBase}/api/admisiones/download-pdf/${form.pdf_token}?token=${authStore.token}`
    const pdfBlob = await api.getBlob(downloadUrl)
    printPdfBlob(pdfBlob, `formulario_admision_${form.studentData.nombres}_${form.studentData.apellidos}.pdf`)
  } catch (error) {
    console.error('Error downloading or printing PDF:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error al descargar/imprimir PDF',
      text: 'Ocurrió un error al intentar descargar o imprimir el formulario de admisión.',
      confirmButtonColor: '#f43f5e'
    })
  } finally {
    isDownloadingPdf.value = false
  }
}

const submitForm = async () => {
  try {
    loading.value = true

    const response = await api.post('/api/admisiones', form)

    if (response.success && response.pdf_token) {
      form.studentData = response.studentData
      form.credentials = response.credentials
      form.pdf_token = response.pdf_token

      Swal.fire({
        icon: 'success',
        title: 'Admisión Completada',
        text: 'El estudiante ha sido registrado con estado de Pre-Admitido. Se descargarán las credenciales y el formulario PDF ahora.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0ea5e9',
        allowOutsideClick: false
      }).then((result) => {
        // Trigger download via downloadPdf function which has everything it needs
        downloadPdf()
        // Redirect to admission list
        router.push('/admin/admisiones')
      })
    } else {
      throw new Error(response.message || 'Error desconocido')
    }

  } catch (error) {
    console.error('Submit error:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error de Validación o Servidor',
      text: error.message || 'Ocurrió un error al procesar el formulario de admisión.',
      confirmButtonColor: '#f43f5e'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTitulos()
  fetchAniosLectivos()
  fetchCoordinadorRegistro()
})
</script>
