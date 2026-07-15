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
