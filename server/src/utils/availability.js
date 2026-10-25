// Helpers for working out how many units of an item are free between two dates.
// Dates are always 'YYYY-MM-DD' strings, so comparing them as strings gives the right order.

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value + 'T00:00:00Z')
  // catches dates like 2026-02-30 which JS would roll over to March
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value)
}

// today's date in local time, e.g. '2026-10-26'
export function today() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// Two ranges overlap if each one starts on or before the day the other one ends.
// A booking that ends on the 5th and a search that starts on the 5th DO overlap,
// because the item is only returned some time during the 5th.
export function rangesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA
}

// Counts the bookings of one item that overlap [from, to].
// An item that is out (issued) and already late has no known return date, so it
// blocks every date until the lab engineer marks it as returned.
export function countBooked(bookings, equipmentId, from, to, todayDate = today()) {
  return bookings.filter((b) => {
    if (b.equipment_id !== equipmentId) return false
    const overdue = b.status === 'issued' && b.return_date < todayDate
    const end = overdue ? '9999-12-31' : b.return_date
    return rangesOverlap(b.collect_date, end, from, to)
  }).length
}
