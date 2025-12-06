/**
 * Convierte hora en formato 24h (HH:mm o HH:mm:ss) a formato 12h (h:mm AM/PM)
 */
export function formatTime12h(time24: string): string {
  if (!time24) return ''
  const trimmed = time24.trim()
  // Acepta "H:mm:ss", "HH:mm:ss", "H:mm" o "HH:mm" y valida rangos 00-23 y 00-59
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/)
  if (!match) return ''
  if (!match[1] || !match[2]) return ''

  const h24 = parseInt(match[1], 10)
  const minutes = match[2]
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 || 12

  return `${h12}:${minutes} ${period}`
}

/**
 * Convierte hora en formato 12h (h:mm AM/PM) a formato 24h (HH:mm)
 */
export function formatTime24h(time12: string): string {
  if (!time12) return ''

  const trimmed = time12.trim()
  // H o HH (1-12), minutos 00-59, y sufijo AM/PM (case-insensitive)
  const match = trimmed.match(/^([1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/)
  if (!match) return ''
  if (!match[1] || !match[2] || !match[3]) return ''

  let h = parseInt(match[1], 10)
  const minutes = match[2]
  const period = match[3].toUpperCase()

  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0

  return `${h.toString().padStart(2, '0')}:${minutes}`
}
