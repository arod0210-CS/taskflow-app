export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

export function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function addDays(date, amount) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

export function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const parsed = parseDateOnly(value);
  return !Number.isNaN(parsed.getTime()) && toDateKey(parsed) === value;
}

export function isInCurrentWeek(dateString) {
  const today = startOfToday();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const due = parseDateOnly(dateString);
  return due >= today && due <= weekEnd;
}

export function isInCurrentMonth(dateString) {
  const today = startOfToday();
  const due = parseDateOnly(dateString);
  return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
}
