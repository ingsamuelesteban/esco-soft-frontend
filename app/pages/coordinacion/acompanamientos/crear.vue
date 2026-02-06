<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ isReadOnly ? 'Ver Acompañamiento' : 'Nuevo Acompañamiento' }} - Maestro Técnico
      </h1>
      <div class="flex items-center gap-2">
        <button v-if="isReadOnly" @click="downloadPdf(form.id)"
          class="text-gray-600 hover:text-red-600 transition-colors" title="Imprimir PDF">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
        <button @click="$router.push('/coordinacion/acompanamientos')" class="text-gray-600 hover:text-gray-800">
          <Icon name="ph:x" size="24" />
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <Icon name="svg-spinners:180-ring-with-bg" size="48" class="text-primary-600" />
    </div>

    <div v-else class="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">

      <!-- Stepper Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="(step, index) in steps" :key="index" class="flex flex-1 flex-col items-center cursor-pointer"
            @click="goToStep(index)">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors"
              :class="[
                currentStep > index ? 'border-primary-600 bg-primary-600 text-white' : (currentStep === index ? 'border-primary-600 text-primary-600' : 'border-gray-300 text-gray-400'),
                (isReadOnly || index <= furthestStep) ? 'hover:bg-primary-50 hover:border-primary-500' : 'opacity-50 cursor-not-allowed'
              ]">
              <Icon v-if="currentStep > index" name="ph:check" size="20" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="mt-2 text-xs font-medium"
              :class="currentStep === index ? 'text-primary-700' : 'text-gray-500'">
              {{ step.label }}
            </span>
            <div v-if="index < steps.length - 1" class="absolute mt-5 h-[2px] w-full translate-x-1/2 bg-gray-200"
              style="z-index: -1"></div>
          </div>
        </div>
        <div v-if="savingDraft && !isReadOnly" class="text-center text-xs text-gray-500 animate-pulse mt-2">
          <Icon name="ph:cloud-arrow-up" class="mr-1" /> Guardando borrador...
        </div>
      </div>

      <fieldset :disabled="isReadOnly" class="block border-0 p-0 m-0 min-w-0">

        <!-- Step 1: Información General -->
        <div v-show="currentStep === 0">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">I. Información General</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Fecha de Observación</label>
              <input type="date" v-model="form.observed_at"
                class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border" />
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="mb-2 block text-sm font-medium text-gray-700">Hora Inicio</label>
                <input type="time" v-model="form.start_time"
                  class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border" />
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Director/a</label>
              <input type="text" :value="directorName" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Coordinador/a Técnico (Observador/a)</label>
              <input type="text" :value="user.name" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
          </div>
        </div>

        <!-- Step 2: Perfil del Maestro -->
        <div v-show="currentStep === 1">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">II. Perfil del Maestro Técnico</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-gray-700">Seleccionar Maestro</label>
              <select v-model="form.teacher_id" @change="onTeacherSelect"
                class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border">
                <option value="" disabled>Seleccione un maestro...</option>
                <option v-for="t in availableTeachers" :key="t.id" :value="t.user.id">{{ t.nombre }} {{ t.apellido }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Sexo</label>
              <input type="text" :value="selectedTeacher?.sexo || '-'" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Cédula</label>
              <input type="text" :value="selectedTeacher?.cedula || '-'" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" :value="selectedTeacher?.telefono || '-'" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input type="text" :value="selectedTeacher?.user?.email || '-'" disabled
                class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
            </div>
          </div>
        </div>

        <!-- Step 3: Módulo Formativo -->
        <div v-show="currentStep === 2">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">III. Módulo Formativo que Imparte</h2>
          <div class="grid gap-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Seleccionar Asignación (Clase)</label>
              <select v-model="form.assignment_id" @change="onAssignmentSelect"
                class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border">
                <option value="" disabled>Seleccione una asignación...</option>
                <option v-for="a in assignments" :key="a.id" :value="a.id">
                  {{ a.materia?.nombre }} - {{ a.aula?.nombre }} ({{ a.aula?.grado_cardinal }}° {{ a.aula?.seccion }})
                </option>
              </select>
              <p v-if="!form.teacher_id" class="mt-1 text-xs text-red-500">Debe seleccionar un maestro primero.</p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Familia Profesional</label>
                <input type="text" :value="selectedAssignment?.aula?.titulo?.familia?.nombre || '-'" disabled
                  class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Título / Carrera</label>
                <input type="text" :value="selectedAssignment?.aula?.titulo?.nombre || '-'" disabled
                  class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Módulo Formativo</label>
                <input type="text" :value="selectedAssignment?.materia?.nombre || '-'" disabled
                  class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Grado / Sección</label>
                <input type="text"
                  :value="selectedAssignment?.aula ? `${selectedAssignment.aula.grado_cardinal}° ${selectedAssignment.aula.seccion}` : '-'"
                  disabled
                  class="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 shadow-sm border" />
              </div>
            </div>

            <!-- Student Counts -->
            <div class="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase">Masculinos</label>
                <span class="text-lg font-semibold text-gray-800">{{ form.estudiantes_m }}</span>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase">Femeninos</label>
                <span class="text-lg font-semibold text-gray-800">{{ form.estudiantes_f }}</span>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase">Total</label>
                <span class="text-lg font-semibold text-primary-600">{{ form.estudiantes_t }}</span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Resultado de Aprendizaje (Tema)</label>
              <textarea v-model="form.topic" rows="3"
                class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border"
                placeholder="Ingrese el resultado de aprendizaje o tema tratado..."></textarea>
            </div>
          </div>
        </div>

        <!-- Step 4+: Dimensions (Dynamic) -->
        <div v-if="currentStep >= 3 && currentStep < steps.length - 1">
          <h2 class="mb-6 text-xl font-bold text-gray-800">{{ currentDimensionConfig?.title }}</h2>

          <div v-for="(section, secIndex) in currentDimensionConfig?.sections" :key="secIndex"
            class="mb-8 border-b pb-6 last:border-0">
            <h3 class="mb-4 text-lg font-semibold text-primary-700">{{ section.title }}</h3>

            <div v-for="q in section.questions" :key="q.id"
              class="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p class="mb-3 text-sm font-medium text-gray-900">{{ q.text }}</p>

              <!-- Radio Options -->
              <div class="mb-3 flex flex-wrap gap-4">
                <label
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
                  <input type="radio" :name="q.id" :value="3" v-model="form.data[q.id]!.value"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                  <span class="text-sm">Se aprecia</span>
                </label>
                <label
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
                  <input type="radio" :name="q.id" :value="2" v-model="form.data[q.id]!.value"
                    class="h-4 w-4 text-yellow-500 focus:ring-yellow-500" />
                  <span class="text-sm">Parcialmente</span>
                </label>
                <label
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
                  <input type="radio" :name="q.id" :value="1" v-model="form.data[q.id]!.value"
                    class="h-4 w-4 text-red-500 focus:ring-red-500" />
                  <span class="text-sm">No se aprecia</span>
                </label>
              </div>

              <!-- Observation -->
              <input type="text" v-model="form.data[q.id]!.obs" placeholder="Observaciones..."
                class="w-full rounded-md border-gray-300 py-1.5 px-3 text-sm focus:border-primary-500 border" />
            </div>
          </div>
        </div>

        <!-- Step Last: Finalize -->
        <div v-show="currentStep === steps.length - 1">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">Acuerdos y Finalización</h2>

          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">Acuerdos y/o compromisos para la mejora</label>
            <textarea v-model="form.agreements" rows="6"
              class="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm border"
              placeholder="Describa los acuerdos establecidos..."></textarea>
          </div>

          <div class="alert alert-info rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            Revise que toda la información esté correcta antes de guardar. Una vez finalizado, no podrá editar la
            observación.
          </div>
        </div>
      </fieldset>

      <!-- Navigation Buttons -->
      <div class="mt-8 flex justify-between border-t pt-6">
        <button v-if="currentStep > 0 && !isReadOnly" @click="prevStep"
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Icon name="ph:arrow-left" /> Anterior
        </button>
        <div v-else></div> <!-- Spacer -->

        <button v-if="isReadOnly" @click="$router.push('/coordinacion/acompanamientos')"
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Icon name="ph:sign-out" /> Salir a la Lista
        </button>

        <button v-else-if="currentStep < steps.length - 1" @click="nextStep"
          class="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="!canProceed">
          Siguiente
          <Icon name="ph:arrow-right" />
        </button>

        <button v-else @click="submit"
          class="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          :disabled="submitted">
          <Icon v-if="submitted" name="svg-spinners:180-ring-with-bg" />
          {{ submitted ? 'Guardando...' : 'Finalizar Observación' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiCall as useApi, api } from '@/utils/api';
import { usePrint } from '@/composables/usePrint';
import type { User } from '../../../types/user';
import { formConfig } from './formConfig';
import { showToast } from '@/utils/sweetalert';

const router = useRouter();
const route = useRoute(); // Moved up
const authStore = useAuthStore();
const user = computed(() => authStore.user || {} as User);
const isReadOnly = computed(() => route.query.mode === 'view');


// State
const loading = ref(true);
const savingDraft = ref(false); // New state for draft saving indicator
const submitted = ref(false);
const currentStep = ref(0);
const furthestStep = ref(0); // Track furthest step reached
const teachers = ref<any[]>([]);
const availableTeachers = computed(() => teachers.value.filter(t => t.user && t.user.id));
const assignments = ref<any[]>([]);
const directorName = computed(() => authStore.director?.name || 'Director no asignado');

// Form Data
const form = reactive({
  id: null as number | null, // Add ID to track draft
  observed_at: new Date().toISOString().split('T')[0],
  start_time: '',
  teacher_id: '',
  assignment_id: '',
  estudiantes_m: 0,
  estudiantes_f: 0,
  estudiantes_t: 0,
  topic: '',
  data: {} as Record<string, { value: number | null, obs: string }>,
  agreements: '',
  status: 'finalized'
});

const selectedTeacher = ref<any>(null);
const selectedAssignment = ref<any>(null);

// Initialize form data structure from config
const initFormData = () => {
  formConfig.forEach(dim => {
    dim.sections.forEach(sec => {
      sec.questions.forEach(q => {
        form.data[q.id] = { value: null, obs: '' };
      });
    });
  });
};

// Wizard Steps
const steps = [
  { label: 'Información General' },
  { label: 'Perfil' },
  { label: 'Módulo' },
  ...formConfig.map((dim, i) => ({ label: `Dimensión ${i + 1}` })),
  { label: 'Finalizar' }
];

const currentDimensionConfig = computed(() => {
  // Offset by 3 steps (Info, Perfil, Modulo)
  const dimIndex = currentStep.value - 3;
  if (dimIndex >= 0 && dimIndex < formConfig.length) {
    return formConfig[dimIndex];
  }
  return { title: '', sections: [] }; // Fallback to avoid null errors
});

// Logic
// Initialize form data immediately
initFormData();

onMounted(async () => {
  await fetchTeachers();
  if (route.query.id) {
    await loadObservation(route.query.id as string);
    // In view mode or editing draft, set furthest step to max
    if (isReadOnly.value || form.status === 'draft') {
      furthestStep.value = steps.length - 1;
    }
  }
  loading.value = false;
});

async function fetchTeachers() {
  try {
    const response = await useApi('/profesores');
    // Ensure we handle both wrapped { data: [...] } and direct array [...] responses
    const data = response.data || response;
    teachers.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching teachers", e);
    teachers.value = [];
  }
}

async function onTeacherSelect() {
  const tId = form.teacher_id;
  selectedTeacher.value = teachers.value.find(t => (t.user?.id == tId) || (t.id == tId));
  selectedAssignment.value = null;
  form.assignment_id = '';
  assignments.value = [];

  if (selectedTeacher.value && selectedTeacher.value.id) {
    await fetchAssignments(selectedTeacher.value.id);
  }
}

async function fetchAssignments(teacherId: string | number) {
  try {
    const res = await useApi(`/class-assignments?profesor_id=${teacherId}&per_page=100&only_active=1`);
    assignments.value = res.data; // Paginated response data
  } catch (e) {
    console.error("Error fetching assignments", e);
  }
}

async function onAssignmentSelect() {
  const assignment = assignments.value.find(a => a.id == form.assignment_id);
  selectedAssignment.value = assignment;

  if (assignment && assignment.aula) {
    try {
      const res = await useApi(`/aulas/${assignment.aula.id}`);
      const aulaData = res.data || res; // Handle both wrapped and unwrapped responses

      console.log('Aula Data:', aulaData);

      // Fetch students for the classroom
      const { data: studentsData } = await useApi(`/aulas/${assignment.aula.id}/estudiantes`);
      const students = studentsData || [];

      console.log('Students fetched:', students.length);
      if (students.length > 0) {
        console.log('Sample student sex:', students[0].sexo);
        console.log('All sexes:', students.map((s: any) => s.sexo));
      }

      // Calculate counts - robust check
      const males = students.filter((s: any) => {
        const sex = s.sexo ? s.sexo.toString().toUpperCase() : '';
        return sex === 'M' || sex.startsWith('MASC');
      }).length;

      const females = students.filter((s: any) => {
        const sex = s.sexo ? s.sexo.toString().toUpperCase() : '';
        return sex === 'F' || sex.startsWith('FEM');
      }).length;

      form.estudiantes_m = males;
      form.estudiantes_f = females;
      form.estudiantes_t = students.length;

      // Update the aula object with the full data including title and family
      if (selectedAssignment.value) {
        selectedAssignment.value = {
          ...assignment,
          aula: { ...assignment.aula, ...aulaData }
        };
      }
    } catch (e) {
      console.error("Error fetching aula details or students", e);
    }
  }
}

// Navigation
const canProceed = computed(() => {
  if (currentStep.value === 0) return form.observed_at && form.start_time;
  if (currentStep.value === 1) return !!form.teacher_id;
  if (currentStep.value === 2) return !!form.assignment_id;

  return true;
});

async function nextStep() {
  if (canProceed.value) {
    // Auto-save draft on step change (only if we have minimal info)
    // Minimal info: observed_at, start_time (Step 0) + teacher_id (Step 1)
    // We can start saving draft after Step 1 is done (teacher selected)
    // We can start saving draft after Step 1 is done (teacher selected)
    if (currentStep.value >= 1 && !isReadOnly.value) {
      await saveDraft();
    }

    currentStep.value++;
    if (currentStep.value > furthestStep.value) {
      furthestStep.value = currentStep.value;
    }
    nextTick(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
    nextTick(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
}

function goToStep(index: number) {
  if (isReadOnly.value) {
    currentStep.value = index;
    scrollToTop();
  } else if (index <= furthestStep.value) {
    // Allow going back or forward to already visited steps
    // Verify we can proceed if we are moving forward relative to current step (though index <= furthest ensures we've been there)
    currentStep.value = index;
    scrollToTop();
  }
}

function scrollToTop() {
  nextTick(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

async function saveDraft() {
  savingDraft.value = true;
  try {
    const payload = { ...form, status: 'draft' };

    if (form.id) {
      // Update existing draft
      await useApi(`/observations/${form.id}`, {
        method: 'PUT',
        body: payload
      });
    } else {
      // Create new draft
      const { data } = await useApi('/observations', {
        method: 'POST',
        body: payload
      });
      // Store the ID
      if (data.data && data.data.id) {
        form.id = data.data.id;
      }
    }
    // Optional: Toast notification for draft saved? Maybe too noisy.
    // useToast().success('Borrador guardado');
  } catch (e) {
    console.error('Error saving draft', e);
    // Don't block navigation on draft error, but maybe warn?
  } finally {
    savingDraft.value = false;
  }
}

async function submit() {
  submitted.value = true;
  try {
    // Determine method: PUT if ID exists, POST if not (unlikely if draft saved)
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/observations/${form.id}` : '/observations';

    await useApi(url, {
      method: method,
      body: { ...form, status: 'finalized' }
    });

    showToast('Observación finalizada exitosamente', 'success');
    router.push('/coordinacion/acompanamientos');
  } catch (e: any) {
    showToast(e.message || 'Error al guardar', 'error');
  } finally {
    submitted.value = false;
  }
}

async function loadObservation(id: string) {
  try {
    const res = await useApi(`/observations/${id}`);
    const obs = res.data || res; // Handle both wrapped and unwrapped structure

    if (!obs || !obs.id) {
      console.error("Invalid observation data loaded", obs);
      return;
    }

    // Populate Form
    form.id = obs.id;
    form.observed_at = obs.observed_at ? obs.observed_at.split('T')[0].split(' ')[0] : '';
    form.start_time = obs.start_time ? obs.start_time.substring(0, 5) : '';
    form.teacher_id = obs.teacher?.user?.id || obs.teacher_id; // Try to use user ID if available
    form.status = obs.status;
    form.topic = obs.topic || '';
    form.agreements = obs.agreements || '';

    // Populate Dimensions Data
    if (obs.data) {
      // Merge with existing structure
      Object.keys(obs.data).forEach(key => {
        if (form.data[key]) {
          form.data[key] = obs.data[key];
        } else {
          form.data[key] = obs.data[key];
        }
      });
    }

    // Set counts
    form.estudiantes_m = obs.estudiantes_m || 0;
    form.estudiantes_f = obs.estudiantes_f || 0;
    form.estudiantes_t = obs.estudiantes_t || 0;

    // Trigger changes to load dependencies
    if (form.teacher_id) {
      await onTeacherSelect(); // Sets selectedTeacher and fetches assignments
    }

    if (obs.assignment_id) {
      form.assignment_id = obs.assignment_id;
      await onAssignmentSelect(); // Sets selectedAssignment and class details
    }

    // Determine step to jump to
    let targetStep = 0;

    if (form.teacher_id) targetStep = 1;
    if (form.assignment_id) targetStep = 2;

    // Check dimensions for data
    if (formConfig) {
      formConfig.forEach((dim, index) => {
        const hasData = dim.sections.some(sec =>
          sec.questions.some(q => {
            const val = form.data[q.id];
            return val && (val.value !== null || (val.obs && val.obs.trim() !== ''));
          })
        );
        if (hasData) {
          targetStep = 3 + index;
        }
      });
    }

    // Check agreements
    if (form.agreements && form.agreements.trim() !== '') {
      targetStep = steps.length - 1;
    }

    currentStep.value = targetStep;

  } catch (e) {
    console.error("Error loading observation", e);
    showToast('Error cargando la observación', 'error');
  }
}

const pdfLoading = ref(false);

async function downloadPdf(id: number | null) {
  if (!id) return;
  try {
    pdfLoading.value = true;
    const { printPdfBlob } = usePrint();
    const res = await api.getBlob(`/observations/${id}/pdf`);
    const blob = new Blob([res], { type: 'application/pdf' });

    printPdfBlob(blob, `acompanamiento_${id}.pdf`, 'Generando reporte...');
  } catch (e) {
    console.error("Error downloading PDF", e);
    showToast('Error al descargar el PDF', 'error');
  } finally {
    pdfLoading.value = false;
  }
}
</script>
