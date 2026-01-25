<template>
    <div class="mt-4">
        <div v-for="month in months" :key="month.key"
            class="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-center text-gray-700">
                {{ month.title }}
            </div>
            <div class="grid grid-cols-7 gap-px bg-gray-200 text-sm">
                <!-- Days Header -->
                <div v-for="day in weekDays" :key="day"
                    class="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500">
                    {{ day }}
                </div>
                <!-- Calendar Days -->
                <div v-for="(date, index) in month.days" :key="index"
                    class="bg-white min-h-[40px] p-1 flex flex-col items-center justify-center relative group"
                    :class="getDateClass(date)">

                    <template v-if="date">
                        <span class="font-medium" :class="getDateTextClass(date)">
                            {{ date.format('D') }}
                        </span>

                        <!-- Tooltip for Holidays/Status -->
                        <div v-if="date.status === 'holiday'"
                            class="absolute -top-8 bg-red-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {{ date.holidayName }}
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Set locale locally or ensure it's set globally
dayjs.locale('es')

interface Props {
    startDate: string
    endDate: string
    holidays: Array<{ date: string; name: string }>
}

const props = defineProps<Props>()

const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

const months = computed(() => {
    if (!props.startDate || !props.endDate) return []

    const start = dayjs(props.startDate)
    const end = dayjs(props.endDate)
    const result = []

    let current = start.startOf('month')
    const endMonth = end.endOf('month')

    while (current.isBefore(endMonth) || current.isSame(endMonth, 'month')) {
        const monthDays = []
        const daysInMonth = current.daysInMonth()
        const firstDayOfWeek = current.day() // 0 = Sunday

        // Padding for empty start days
        for (let i = 0; i < firstDayOfWeek; i++) {
            monthDays.push(null)
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = current.date(i)
            // Determine status
            const isWeekend = date.day() === 0 || date.day() === 6
            const holiday = props.holidays.find(h => h.date === date.format('YYYY-MM-DD'))
            const inRange = date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'))

            let status = 'normal'
            if (inRange) {
                if (holiday) status = 'holiday'
                else if (isWeekend) status = 'weekend'
                else status = 'workday'
            } else {
                status = 'out-of-range'
            }

            // Object with enhanced properties
            const dateObj: any = date
            dateObj.status = status
            dateObj.holidayName = holiday?.name

            monthDays.push(dateObj)
        }

        result.push({
            key: current.format('YYYY-MM'),
            title: current.format('MMMM YYYY').charAt(0).toUpperCase() + current.format('MMMM YYYY').slice(1),
            days: monthDays
        })

        current = current.add(1, 'month')
    }

    return result
})

const getDateClass = (date: any) => {
    if (!date) return 'bg-gray-50'

    switch (date.status) {
        case 'holiday':
            return 'bg-red-50 hover:bg-red-100 border-2 border-transparent hover:border-red-200 cursor-help'
        case 'weekend':
            return 'bg-gray-100 text-gray-400'
        case 'workday':
            return 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-500'
        case 'out-of-range':
            return 'text-gray-300'
        default:
            return ''
    }
}

const getDateTextClass = (date: any) => {
    if (!date) return ''
    switch (date.status) {
        case 'holiday':
            return 'text-red-700'
        case 'weekend':
            return 'text-gray-400'
        case 'workday':
            return 'text-blue-700'
        default:
            return 'text-gray-500'
    }
}
</script>
