import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePeriodsStore, type Period } from '../stores/periods'

export const useLiveSchedule = () => {
    const periodsStore = usePeriodsStore()
    const now = ref(new Date())
    let timer: number | undefined

    const updateNow = () => {
        now.value = new Date()
    }

    onMounted(() => {
        updateNow()
        timer = window.setInterval(updateNow, 60 * 1000) // Actualizar cada minuto

        // Cargar periodos si no están cargados
        if (periodsStore.items.length === 0) {
            periodsStore.fetchAll()
        }
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    const diaActual = computed(() => {
        // JS: 0=Dom .. 6=Sáb; App: 1=Lun .. 5=Vie
        const js = now.value.getDay()
        return js >= 1 && js <= 5 ? js : -1
    })

    const parseToMinutes = (hhmm: string) => {
        if (!hhmm) return -1
        const parts = hhmm.split(':')
        if (parts.length < 2) return -1
        const h = parseInt(parts[0] as string, 10)
        const m = parseInt(parts[1] as string, 10)
        if (Number.isNaN(h) || Number.isNaN(m)) return -1
        return h * 60 + m
    }

    const currentPeriods = computed(() => {
        if (periodsStore.items.length === 0) return []
        const minutes = now.value.getHours() * 60 + now.value.getMinutes()
        return periodsStore.clases.filter((p: Period) => {
            const s = parseToMinutes(p.start_time)
            const e = parseToMinutes(p.end_time)
            // Inclusivo al inicio, exclusivo al final
            return minutes >= s && minutes < e
        })
    })

    const isInPeriod = computed(() => {
        return diaActual.value !== -1 && currentPeriods.value.length > 0
    })

    const isSchoolDay = computed(() => diaActual.value !== -1)

    return {
        now,
        diaActual,
        currentPeriods,
        isInPeriod,
        isSchoolDay
    }
}
