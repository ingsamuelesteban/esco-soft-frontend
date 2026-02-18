<template>
    <div>
        <header class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Promoción de Estudiantes</h1>
                    <p class="text-sm text-gray-500 mt-1">Selecciona estudiantes y asígnalos a un aula del siguiente año lectivo</p>
                </div>
            </div>
        </header>

        <div class="p-6 space-y-6">
            <!-- Filtros -->
            <div class="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Año Lectivo Origen</label>
                    <select v-model="anioOrigenId" @change="onAnioOrigenChange"
                        class="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option :value="null">Seleccionar año...</option>
                        <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">
                            {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                        </option>
                    </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Aula</label>
                    <select v-model="aulaOrigenId" @change="cargarEstudiantes"
                        :disabled="!anioOrigenId"
                        class="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                        <option :value="null">Todas las aulas</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                            {{ aula.titulo }}
                        </option>
                    </select>
                </div>
                <button @click="cargarEstudiantes" :disabled="!anioOrigenId || loadingEstudiantes"
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Cargar
                </button>
            </div>

            <!-- Tabla de estudiantes -->
            <div v-if="estudiantes.length > 0 || loadingEstudiantes" class="bg-white rounded-lg shadow overflow-hidden">
                <!-- Toolbar -->
                <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" :checked="todosSeleccionados" @change="toggleTodos"
                            class="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <span class="text-sm text-gray-600">
                            {{ seleccionados.length }} de {{ estudiantes.length }} seleccionados
                        </span>
                        <button v-if="!todosSeleccionados && estudiantes.length > 0" @click="seleccionarTodos"
                            class="text-sm text-blue-600 hover:underline">
                            Seleccionar todos
                        </button>
                    </div>
                    <button v-if="seleccionados.length > 0" @click="abrirModalPromocion"
                        class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Promover {{ seleccionados.length }} estudiante(s)
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="loadingEstudiantes" class="flex justify-center py-10">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <!-- Lista -->
                <table v-else class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="w-10 px-4 py-3"></th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="est in estudiantes" :key="est.id"
                            @click="toggleSeleccion(est.id)"
                            class="cursor-pointer hover:bg-blue-50 transition-colors"
                            :class="{ 'bg-blue-50': seleccionados.includes(est.id) }">
                            <td class="px-4 py-3">
                                <input type="checkbox" :checked="seleccionados.includes(est.id)"
                                    @click.stop="toggleSeleccion(est.id)"
                                    class="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">{{ est.numero_orden }}</td>
                            <td class="px-4 py-3">
                                <div class="text-sm font-medium text-gray-900">{{ est.apellidos }}, {{ est.nombres }}</div>
                                <div class="text-xs text-gray-500">{{ est.cedula || est.rne || '-' }}</div>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600">{{ est.aula?.titulo || '-' }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                    :class="est.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                                    {{ est.estado || 'activo' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else-if="anioOrigenId && !loadingEstudiantes" class="text-center py-12 text-gray-500">
                No hay estudiantes en el aula seleccionada.
            </div>
        </div>

        <!-- Modal de Promoción -->
        <div v-if="showModalPromocion" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="px-6 py-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Promover {{ seleccionados.length }} estudiante(s)
                    </h3>
                    <button @click="showModalPromocion = false" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="px-6 py-5 space-y-4">
                    <!-- Estado en el año origen -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado en el año origen</label>
                        <select v-model="promocionForm.estado_origen"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="promovido">Promovido ✅</option>
                            <option value="repitente">Repitente 🔁</option>
                            <option value="retirado">Retirado ❌</option>
                        </select>
                    </div>

                    <!-- Año destino -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Año Lectivo Destino</label>
                        <select v-model="promocionForm.anio_destino_id" @change="cargarAulasDestino"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option :value="null">Seleccionar año destino...</option>
                            <option v-for="anio in aniosLectivos.filter(a => a.id !== anioOrigenId)" :key="anio.id" :value="anio.id">
                                {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                            </option>
                        </select>
                    </div>

                    <!-- Aula destino (solo si no es retirado) -->
                    <div v-if="promocionForm.estado_origen !== 'retirado'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Aula Destino</label>
                        <select v-model="promocionForm.aula_destino_id"
                            :disabled="!promocionForm.anio_destino_id || loadingAulasDestino"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                            <option :value="null">Seleccionar aula destino...</option>
                            <option v-for="aula in aulasDestino" :key="aula.id" :value="aula.id">
                                {{ aula.titulo }}
                            </option>
                        </select>
                        <div v-if="loadingAulasDestino" class="text-xs text-gray-400 mt-1">Cargando aulas...</div>
                    </div>
                    <div v-else class="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                        Los estudiantes retirados no se asignarán a ningún aula.
                    </div>

                    <!-- Error -->
                    <div v-if="promocionError" class="text-red-600 text-sm bg-red-50 rounded p-3">
                        {{ promocionError }}
                    </div>
                </div>

                <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button @click="showModalPromocion = false" :disabled="loadingPromocion"
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button @click="ejecutarPromocion" :disabled="loadingPromocion || !puedePromover"
                        class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg v-if="loadingPromocion" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loadingPromocion ? 'Promoviendo...' : 'Confirmar Promoción' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { api } from '../../../utils/api'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface AnioLectivo { id: number; nombre: string; activo: boolean; fecha_inicio?: string }
interface Aula { id: number; titulo: string }
interface Estudiante {
    id: number
    nombres: string
    apellidos: string
    cedula?: string
    rne?: string
    numero_orden?: number
    estado?: string
    aula?: Aula
}

// ── Estado ─────────────────────────────────────────────────────────────────
const aniosLectivos = ref<AnioLectivo[]>([])
const aulas = ref<Aula[]>([])
const aulasDestino = ref<Aula[]>([])
const estudiantes = ref<Estudiante[]>([])
const seleccionados = ref<number[]>([])

const anioOrigenId = ref<number | null>(null)
const aulaOrigenId = ref<number | null>(null)

const loadingEstudiantes = ref(false)
const loadingAulasDestino = ref(false)
const loadingPromocion = ref(false)

const showModalPromocion = ref(false)
const promocionError = ref<string | null>(null)

const promocionForm = reactive({
    anio_destino_id: null as number | null,
    aula_destino_id: null as number | null,
    estado_origen: 'promovido' as 'promovido' | 'repitente' | 'retirado',
})

// ── Computed ───────────────────────────────────────────────────────────────
const todosSeleccionados = computed(() =>
    estudiantes.value.length > 0 && seleccionados.value.length === estudiantes.value.length
)

const puedePromover = computed(() => {
    if (!promocionForm.anio_destino_id) return false
    if (promocionForm.estado_origen !== 'retirado' && !promocionForm.aula_destino_id) return false
    return true
})

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
    await cargarAniosLectivos()
    await cargarAulas()
})

// ── Métodos ────────────────────────────────────────────────────────────────
async function cargarAniosLectivos() {
    const data = await api.get<AnioLectivo[]>('/api/anios-lectivos')
    aniosLectivos.value = data
    // Pre-seleccionar el año activo como origen
    const activo = data.find(a => a.activo)
    if (activo) anioOrigenId.value = activo.id
}

async function cargarAulas() {
    const data = await api.get<Aula[]>('/api/aulas')
    aulas.value = data
}

async function onAnioOrigenChange() {
    aulaOrigenId.value = null
    estudiantes.value = []
    seleccionados.value = []
}

async function cargarEstudiantes() {
    if (!anioOrigenId.value) return
    loadingEstudiantes.value = true
    seleccionados.value = []
    try {
        const params: Record<string, any> = {}
        if (aulaOrigenId.value) params.aula_id = aulaOrigenId.value
        const data = await api.get<Estudiante[]>('/api/estudiantes', { params })
        estudiantes.value = data
    } catch (e) {
        console.error(e)
    } finally {
        loadingEstudiantes.value = false
    }
}

async function cargarAulasDestino() {
    if (!promocionForm.anio_destino_id) {
        aulasDestino.value = []
        return
    }
    loadingAulasDestino.value = true
    try {
        // Traer aulas del año destino via historial o simplemente todas las aulas
        const data = await api.get<Aula[]>('/api/aulas')
        aulasDestino.value = data
    } finally {
        loadingAulasDestino.value = false
    }
}

function toggleSeleccion(id: number) {
    const idx = seleccionados.value.indexOf(id)
    if (idx === -1) seleccionados.value.push(id)
    else seleccionados.value.splice(idx, 1)
}

function toggleTodos() {
    if (todosSeleccionados.value) seleccionados.value = []
    else seleccionarTodos()
}

function seleccionarTodos() {
    seleccionados.value = estudiantes.value.map(e => e.id)
}

function abrirModalPromocion() {
    promocionError.value = null
    promocionForm.anio_destino_id = null
    promocionForm.aula_destino_id = null
    promocionForm.estado_origen = 'promovido'
    aulasDestino.value = []
    showModalPromocion.value = true
}

async function ejecutarPromocion() {
    if (!puedePromover.value || !anioOrigenId.value) return
    loadingPromocion.value = true
    promocionError.value = null

    try {
        const payload = {
            anio_destino_id: promocionForm.anio_destino_id,
            estudiantes: seleccionados.value.map(id => ({
                estudiante_id: id,
                aula_id: promocionForm.estado_origen !== 'retirado' ? promocionForm.aula_destino_id : null,
                estado_origen: promocionForm.estado_origen,
            })),
        }

        const res = await api.post<{ message: string; promovidos: number }>(
            `/api/anios-lectivos/${anioOrigenId.value}/promover`,
            payload
        )

        showModalPromocion.value = false
        seleccionados.value = []
        alert(res.message)
        await cargarEstudiantes()
    } catch (e: any) {
        promocionError.value = e.response?.data?.message || 'Error al promover estudiantes.'
    } finally {
        loadingPromocion.value = false
    }
}
</script>
