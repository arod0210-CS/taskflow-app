import {
  MAX_RECURRENCE_INTERVAL,
  RECURRENCE_TYPES,
  RECURRENCE_UNITS
} from "./constants.js";
import { addDays, isValidDateKey, parseDateOnly, toDateKey } from "./dates.js";

function sanitizeId(value) {
  if (value === null || value === undefined || value === "") return null;
  const id = String(value).trim();
  return id || null;
}

function clampInterval(value) {
  const interval = Number(value);
  if (!Number.isInteger(interval) || interval < 1 || interval > MAX_RECURRENCE_INTERVAL) {
    return null;
  }
  return interval;
}

export function sanitizeRecurrence(rawRecurrence, dueDate) {
  if (!rawRecurrence || typeof rawRecurrence !== "object" || !isValidDateKey(dueDate)) {
    return null;
  }

  const type = RECURRENCE_TYPES.includes(rawRecurrence.type) ? rawRecurrence.type : null;
  if (!type) return null;

  const endDate = rawRecurrence.endDate === null || rawRecurrence.endDate === undefined || rawRecurrence.endDate === ""
    ? null
    : String(rawRecurrence.endDate);
  if (endDate !== null && (!isValidDateKey(endDate) || endDate < dueDate)) return null;

  const due = parseDateOnly(dueDate);
  const rawAnchor = Number(rawRecurrence.anchorDay);
  const anchorDay = Number.isInteger(rawAnchor) && rawAnchor >= 1 && rawAnchor <= 31
    ? rawAnchor
    : due.getDate();

  if (type === "interval") {
    const interval = clampInterval(rawRecurrence.interval);
    const unit = RECURRENCE_UNITS.includes(rawRecurrence.unit) ? rawRecurrence.unit : null;
    if (!interval || !unit) return null;
    return { type, interval, unit, endDate, anchorDay };
  }

  return { type, interval: 1, unit: null, endDate, anchorDay };
}

export function sanitizeRecurrenceFields(rawTask, task) {
  const recurrence = sanitizeRecurrence(rawTask?.recurrence, task.dueDate);
  if (!recurrence) {
    return {
      recurrence: null,
      recurrenceSeriesId: null,
      recurrenceSourceId: null,
      recurrenceOccurrenceDate: null,
      nextOccurrenceGenerated: false
    };
  }

  const seriesId = sanitizeId(rawTask.recurrenceSeriesId) || task.id;
  const sourceId = sanitizeId(rawTask.recurrenceSourceId);
  const occurrenceDate = rawTask.recurrenceOccurrenceDate === task.dueDate && isValidDateKey(rawTask.recurrenceOccurrenceDate)
    ? rawTask.recurrenceOccurrenceDate
    : task.dueDate;

  return {
    recurrence,
    recurrenceSeriesId: seriesId,
    recurrenceSourceId: sourceId === task.id ? null : sourceId,
    recurrenceOccurrenceDate: occurrenceDate,
    nextOccurrenceGenerated: Boolean(rawTask.nextOccurrenceGenerated)
  };
}

function addMonthsClamped(date, amount, anchorDay) {
  const firstOfTarget = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
  return new Date(
    firstOfTarget.getFullYear(),
    firstOfTarget.getMonth(),
    Math.min(anchorDay, lastDay)
  );
}

export function getNextOccurrenceDate(dueDate, recurrence) {
  const sanitized = sanitizeRecurrence(recurrence, dueDate);
  if (!sanitized) return null;

  const source = parseDateOnly(dueDate);
  let next;

  if (sanitized.type === "daily") {
    next = addDays(source, 1);
  } else if (sanitized.type === "weekdays") {
    next = addDays(source, 1);
    while (next.getDay() === 0 || next.getDay() === 6) next = addDays(next, 1);
  } else if (sanitized.type === "weekly") {
    next = addDays(source, 7);
  } else if (sanitized.type === "monthly") {
    next = addMonthsClamped(source, 1, sanitized.anchorDay);
  } else if (sanitized.unit === "days") {
    next = addDays(source, sanitized.interval);
  } else if (sanitized.unit === "weeks") {
    next = addDays(source, sanitized.interval * 7);
  } else {
    next = addMonthsClamped(source, sanitized.interval, sanitized.anchorDay);
  }

  const nextDate = toDateKey(next);
  if (sanitized.endDate && nextDate > sanitized.endDate) return null;
  return nextDate;
}

export function createNextOccurrence(sourceTask, tasks, idFactory, createdAt = new Date().toISOString()) {
  if (!sourceTask?.recurrence || sourceTask.nextOccurrenceGenerated || !sourceTask.dueDate) {
    return { handled: false, task: null };
  }

  const nextDate = getNextOccurrenceDate(sourceTask.dueDate, sourceTask.recurrence);
  if (!nextDate) return { handled: true, task: null };

  const seriesId = sourceTask.recurrenceSeriesId || sourceTask.id;
  const duplicate = tasks.some((task) =>
    task.id !== sourceTask.id &&
    task.recurrenceSeriesId === seriesId &&
    (task.recurrenceOccurrenceDate || task.dueDate) === nextDate
  );
  if (duplicate) return { handled: true, task: null };

  const task = {
    ...sourceTask,
    id: idFactory(),
    completed: false,
    completedAt: null,
    dueDate: nextDate,
    createdAt,
    rewardGranted: false,
    recurrence: { ...sourceTask.recurrence },
    recurrenceSeriesId: seriesId,
    recurrenceSourceId: sourceTask.id,
    recurrenceOccurrenceDate: nextDate,
    nextOccurrenceGenerated: false
  };

  return { handled: true, task };
}

export function formatRecurrence(recurrence, t) {
  if (!recurrence) return t("doesNotRepeat");
  const labels = {
    daily: "recurrenceDaily",
    weekdays: "recurrenceWeekdays",
    weekly: "recurrenceWeekly",
    monthly: "recurrenceMonthly"
  };
  if (labels[recurrence.type]) return t(labels[recurrence.type]);

  const singular = recurrence.interval === 1;
  const unitKeys = {
    days: singular ? "recurrenceDay" : "recurrenceDays",
    weeks: singular ? "recurrenceWeek" : "recurrenceWeeks",
    months: singular ? "recurrenceMonth" : "recurrenceMonths"
  };
  return `${t("recurrenceEvery")} ${recurrence.interval} ${t(unitKeys[recurrence.unit])}`;
}
