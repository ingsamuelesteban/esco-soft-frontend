export const isWeekend = (dateString: string): boolean => {
    if (!dateString) return false

    // Create date object treating the string as local date components to avoid timezone shifts
    // format YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    const dayOfWeek = date.getDay()
    // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6
}
