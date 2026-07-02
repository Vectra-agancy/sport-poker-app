const pad = (n: number) => n.toString().padStart(2, "0");

/** 05.07.2026 19:30 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

/** 05.07.2026 */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()}`;
}

/** Date -> value для <input type="date"> */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

/** Date -> value для <input type="datetime-local"> */
export function toDateTimeInputValue(date: Date): string {
  return `${toDateInputValue(date)}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}
