<template>
    <div>
        <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Promoción de Estudiantes</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona estudiantes y asígnalos a un aula del siguiente año lectivo</p>
                </div>
            </div>
        </header>

        <div class="p-6 space-y-6">
            <!-- Filtros -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año Lectivo Origen</label>
                    <select v-model="anioOrigenId" @change="onAnioOrigenChange"
                        class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option :value="null">Seleccionar año...</option>
                        <option v-for="anio in aniosLectivos" :key="anio.id" :value="anio.id">
                            {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                        </option>
                    </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aula</label>
                    <select v-model="aulaOrigenId" @change="cargarEstudiantes"
                        :disabled="!anioOrigenId"
                        class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800">
                        <option :value="null">Todas las aulas</option>
                        <option v-for="aula in aulas" :key="aula.id" :value="aula.id">
                            {{ aula.grado_cardinal }}° {{ aula.seccion ? '(' + aula.seccion + ')' : '' }} - {{ aula.titulo?.nombre || 'General' }}
                        </option>
                    </select>
                </div>
                <button @click="cargarEstudiantes" :disabled="!anioOrigenId || loadingEstudiantes"
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Cargar
                </button>
            </div>

            <!-- Tabla de estudiantes -->
            <div v-if="estudiantes.length > 0 || loadingEstudiantes" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <!-- Toolbar -->
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" :checked="todosSeleccionados" @change="toggleTodos"
                            class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">
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
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th class="w-10 px-4 py-3"></th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estudiante</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aula</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <template v-for="est in estudiantes" :key="est.id">
                                <tr v-if="est._is_first_in_aula && !aulaOrigenId" class="bg-gray-100 dark:bg-gray-700/50">
                                    <td colspan="5" class="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {{ est.aula ? `${est.aula.grado_cardinal}° ${est.aula.seccion ? '(' + est.aula.seccion + ')' : ''} - ${est.aula.titulo?.nombre || 'General'}` : (est.aula_grado_historial ? `Aula: ${est.aula_grado_historial}° (${est.aula_seccion_historial || ''})` : 'Sin Aula Asignada') }}
                                    </td>
                                </tr>
                                <tr @click="toggleSeleccion(est.id)"
                                    class="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    :class="{ 'bg-blue-50 dark:bg-blue-900/40': seleccionados.includes(est.id) }">
                                    <td class="px-4 py-3">
                                        <input type="checkbox" :checked="seleccionados.includes(est.id)"
                                            @click.stop="toggleSeleccion(est.id)"
                                            class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded" />
                                    </td>
                                    <td class="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ est._indice_visual }}</td>
                                    <td class="px-4 py-3">
                                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ est.apellidos }}, {{ est.nombres }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ est.cedula || est.rne || '-' }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {{ est.aula ? `${est.aula.grado_cardinal}° ${est.aula.seccion ? '(' + est.aula.seccion + ')' : ''} - ${est.aula.titulo?.nombre || 'General'}` : (est.aula_grado_historial ? `${est.aula_grado_historial}° (${est.aula_seccion_historial || ''})` : '-') }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                            :class="est.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'">
                                            {{ est.estado || 'activo' }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else-if="anioOrigenId && !loadingEstudiantes" class="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay estudiantes en el aula seleccionada.
            </div>
        </div>

        <!-- Modal de Promoción -->
        <div v-if="showModalPromocion" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Promover {{ seleccionados.length }} estudiante(s)
                    </h3>
                    <button @click="showModalPromocion = false" class="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="px-6 py-5 space-y-4">
                    <!-- Estado en el año origen -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado en el año origen</label>
                        <select v-model="promocionForm.estado_origen"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="promovido">Promovido ✅</option>
                            <option value="repitente">Repitente 🔁</option>
                            <option value="retirado">Retirado ❌</option>
                        </select>
                    </div>

                    <!-- Año destino -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año Lectivo Destino</label>
                        <select v-model="promocionForm.anio_destino_id" @change="cargarAulasDestino"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option :value="null">Seleccionar año destino...</option>
                            <option v-for="anio in aniosLectivos.filter(a => a.id !== anioOrigenId)" :key="anio.id" :value="anio.id">
                                {{ anio.nombre }} {{ anio.activo ? '(Activo)' : '' }}
                            </option>
                        </select>
                    </div>

                    <!-- Aula destino (solo si no es retirado) -->
                    <div v-if="promocionForm.estado_origen !== 'retirado'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aula Destino</label>
                        <select v-model="promocionForm.aula_destino_id"
                            :disabled="!promocionForm.anio_destino_id || loadingAulasDestino"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800">
                            <option :value="null">Seleccionar aula destino...</option>
                            <option v-for="aula in aulasDestino" :key="aula.id" :value="aula.id">
                                {{ aula.grado_cardinal }}° {{ aula.seccion ? '(' + aula.seccion + ')' : '' }} - {{ aula.titulo?.nombre || 'General' }}
                            </option>
                        </select>
                        <div v-if="loadingAulasDestino" class="text-xs text-gray-400 mt-1">Cargando aulas...</div>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-md p-3">
                        Los estudiantes retirados no se asignarán a ningún aula.
                    </div>

                    <!-- Asignaturas Pendientes -->
                    <div v-if="promocionForm.estado_origen === 'promovido'" class="flex items-start mt-2">
                        <div class="flex items-center h-5">
                            <input id="con_pendientes" v-model="promocionForm.con_pendientes" type="checkbox"
                                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="con_pendientes" class="font-medium text-gray-700 dark:text-gray-300">Promover con asignaturas pendientes</label>
                            <p class="text-gray-500 dark:text-gray-400">Marque esta opción si los estudiantes seleccionados arrastran asignaturas pendientes.</p>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="promocionError" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded p-3">
                        {{ promocionError }}
                    </div>
                </div>

                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button @click="showModalPromocion = false" :disabled="loadingPromocion"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 disabled:opacity-50">
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
import { showSuccess } from '../../../utils/sweetalert'

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
    numero_orden_historial?: number
    estado?: string
    aula?: Aula
    aula_id_historial?: number
    aula_grado_historial?: number
    aula_seccion_historial?: string
    _indice_visual?: number
    _is_first_in_aula?: boolean
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
    con_pendientes: false as boolean,
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
    if (!anioOrigenId.value) return
    const data = await api.get<Aula[]>('/api/aulas', {
        params: { anio_lectivo_id: anioOrigenId.value }
    })
    aulas.value = data
}

async function onAnioOrigenChange() {
    aulaOrigenId.value = null
    estudiantes.value = []
    seleccionados.value = []
    await cargarAulas()
    await cargarEstudiantes()
}

async function cargarEstudiantes() {
    if (!anioOrigenId.value) return
    loadingEstudiantes.value = true
    seleccionados.value = []
    try {
        const params: Record<string, any> = {
            anio_lectivo_id: anioOrigenId.value
        }
        if (aulaOrigenId.value) params.aula_id = aulaOrigenId.value
        const res = await api.get<any>('/api/estudiantes', { params })
        let data = res.data || res || []
        
        // Agrupar, ordenar y asignar número de orden visual
        const agrupados = new Map<string, any[]>()
        const sinAula: any[] = []

        data.forEach((est: any) => {
            const aulaId = est.aula?.id || est.aula_id_historial
            if (aulaId) {
                const key = String(aulaId)
                if (!agrupados.has(key)) agrupados.set(key, [])
                agrupados.get(key)!.push(est)
            } else {
                sinAula.push(est)
            }
        })

        const dataProcesada: any[] = []

        // Convertir Map a Array para ordenar aulas por nombre
        const aulasKeys = Array.from(agrupados.keys()).sort((a, b) => {
            const estA = agrupados.get(a)![0]
            const estB = agrupados.get(b)![0]
            
            const nombreA = estA.aula ? `${estA.aula.grado_cardinal} ${estA.aula.seccion || ''}` : `${estA.aula_grado_historial} ${estA.aula_seccion_historial || ''}`
            const nombreB = estB.aula ? `${estB.aula.grado_cardinal} ${estB.aula.seccion || ''}` : `${estB.aula_grado_historial} ${estB.aula_seccion_historial || ''}`
            
            return nombreA.localeCompare(nombreB)
        })

        aulasKeys.forEach(key => {
            const ests = agrupados.get(key)!
            // Ordenar estudiantes dentro del aula
            ests.sort((a, b) => {
                const numA = a.numero_orden_historial ?? a.numero_orden
                const numB = b.numero_orden_historial ?? b.numero_orden
                if (numA != null && numB != null) return numA - numB
                if (numA != null) return -1
                if (numB != null) return 1
                return (a.apellidos || '').localeCompare(b.apellidos || '')
            })

            ests.forEach((est, idx) => {
                est._indice_visual = (est.numero_orden_historial ?? est.numero_orden) || (idx + 1)
                est._is_first_in_aula = idx === 0
                dataProcesada.push(est)
            })
        })

        // Manejar los que no tienen aula
        sinAula.sort((a, b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
        sinAula.forEach((est, idx) => {
            est._indice_visual = idx + 1
            est._is_first_in_aula = idx === 0
            dataProcesada.push(est)
        })

        estudiantes.value = dataProcesada
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
        const data = await api.get<Aula[]>('/api/aulas', {
            params: { anio_lectivo_id: promocionForm.anio_destino_id }
        })
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
    promocionForm.aula_destino_id = null
    promocionForm.estado_origen = 'promovido'
    aulasDestino.value = []
    
    // Default to the next school year after the active one
    const activeIndex = aniosLectivos.value.findIndex(a => a.activo)
    if (activeIndex > 0) {
        promocionForm.anio_destino_id = aniosLectivos.value[activeIndex - 1].id
        cargarAulasDestino()
    } else {
        promocionForm.anio_destino_id = null
    }
    
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
                con_pendientes: promocionForm.estado_origen === 'promovido' ? promocionForm.con_pendientes : false
            })),
        }

        const res = await api.post<{ message: string; promovidos: number }>(
            `/api/anios-lectivos/${anioOrigenId.value}/promover`,
            payload
        )

        showModalPromocion.value = false
        seleccionados.value = []
        await showSuccess(res.message)
        await cargarEstudiantes()
    } catch (e: any) {
        promocionError.value = e.response?.data?.message || 'Error al promover estudiantes.'
    } finally {
        loadingPromocion.value = false
    }
}
</script>
