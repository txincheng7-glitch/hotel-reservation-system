export function formatDateYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function calcNights(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`).getTime()
  const end = new Date(`${checkOut}T00:00:00`).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1
  return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)))
}

export function formatMonthDayRange(checkIn: string, checkOut: string): string {
  if (checkIn.length < 10 || checkOut.length < 10) return '请选择日期'
  return `${checkIn.slice(5)} 至 ${checkOut.slice(5)}`
}
