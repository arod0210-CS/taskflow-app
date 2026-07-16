const FILTER_VALUES = Object.freeze({
  priority: new Set(["high", "medium", "low"]),
  category: new Set(["work", "school", "personal", "health", "other", "none"]),
  due: new Set(["today", "tomorrow", "week", "month", "overdue", "none"]),
  status: new Set(["open", "completed"]),
  repeat: new Set(["true", "false"]),
  has: new Set(["notes", "project", "category"]),
  focus: new Set(["true", "false"])
});

const TOKEN_PATTERN = /([a-z]+):(?:"([^"]*)"|([^\s"]+))|"([^"]*)"|([^\s"]+)/gi;

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function localDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateContext(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return {
    today: localDateKey(today),
    tomorrow: localDateKey(tomorrow),
    weekStart: localDateKey(weekStart),
    weekEnd: localDateKey(weekEnd),
    month: localDateKey(today).slice(0, 7)
  };
}

function addFilter(filters, key, value) {
  if (!filters[key]) filters[key] = [];
  filters[key].push(value);
}

export function parseTaskQuery(query) {
  const source = String(query ?? "").trim();
  const filters = {};
  const textTerms = [];
  const tokens = [];
  const warnings = [];
  let match;
  let consumedUntil = 0;

  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(source)) !== null) {
    const skipped = source.slice(consumedUntil, match.index).trim();
    if (skipped) textTerms.push(normalize(skipped));
    consumedUntil = TOKEN_PATTERN.lastIndex;

    if (match[1]) {
      const key = normalize(match[1]);
      const rawValue = match[2] ?? match[3] ?? "";
      const value = normalize(rawValue);
      const raw = match[0];
      let valid = false;

      if (key === "project") {
        valid = Boolean(value);
      } else if (FILTER_VALUES[key]) {
        valid = FILTER_VALUES[key].has(value);
      }

      if (valid) {
        addFilter(filters, key, value);
        tokens.push({ key, value, raw });
      } else {
        warnings.push({ raw, key, value });
        textTerms.push(normalize(raw));
      }
      continue;
    }

    const text = normalize(match[4] ?? match[5]);
    if (text === "overdue") {
      addFilter(filters, "due", "overdue");
      tokens.push({ key: "due", value: "overdue", raw: match[0] });
    } else if (text) {
      textTerms.push(text);
    }
  }

  const trailing = source.slice(consumedUntil).trim();
  if (trailing) textTerms.push(normalize(trailing));

  return {
    query: source,
    filters,
    textTerms: textTerms.filter(Boolean),
    tokens,
    warnings
  };
}

function matchesDue(task, value, dates) {
  if (value === "none") return !task.dueDate;
  if (!task.dueDate) return false;
  if (value === "today") return task.dueDate === dates.today;
  if (value === "tomorrow") return task.dueDate === dates.tomorrow;
  if (value === "overdue") return !task.completed && task.dueDate < dates.today;
  if (value === "week") return task.dueDate >= dates.weekStart && task.dueDate <= dates.weekEnd;
  if (value === "month") return task.dueDate.slice(0, 7) === dates.month;
  return false;
}

function matchesFilter(task, key, value, context, dates) {
  if (key === "priority") return task.priority === value;
  if (key === "status") return value === "completed" ? task.completed : !task.completed;
  if (key === "repeat") return value === "true" ? Boolean(task.recurrence) : !task.recurrence;
  if (key === "focus") {
    const hasFocus = context.focusedTaskIds?.has(task.id) || false;
    return value === "true" ? hasFocus : !hasFocus;
  }
  if (key === "has") {
    if (value === "notes") return Boolean(task.notes?.trim());
    if (value === "project") return Boolean(task.projectId);
    if (value === "category") return Boolean(task.category);
  }
  if (key === "category") return value === "none" ? !task.category : task.category === value;
  if (key === "due") return matchesDue(task, value, dates);
  if (key === "project") {
    if (value === "unassigned") return !task.projectId;
    const project = context.projects?.find((item) => item.id === task.projectId);
    return normalize(project?.name) === value || normalize(task.projectId) === value;
  }
  return true;
}

export function matchesTaskQuery(task, parsedQuery, context = {}) {
  const parsed = parsedQuery || parseTaskQuery("");
  const project = context.projects?.find((item) => item.id === task.projectId);
  const categoryLabel = context.categoryLabels?.[task.category] || task.category || "";
  const searchableText = normalize([
    task.text,
    task.notes,
    project?.name,
    categoryLabel,
    context.recurrenceLabel?.(task.recurrence) || ""
  ].filter(Boolean).join(" "));

  if (!parsed.textTerms.every((term) => searchableText.includes(term))) return false;
  const dates = dateContext(context.now instanceof Date ? context.now : new Date());
  return Object.entries(parsed.filters).every(([key, values]) =>
    values.every((value) => matchesFilter(task, key, value, context, dates))
  );
}

export function getSearchSuggestions(query, context = {}) {
  const tail = String(query ?? "").split(/\s+/).pop()?.toLocaleLowerCase() || "";
  const suggestions = [
    "priority:high", "priority:medium", "priority:low",
    "due:today", "due:tomorrow", "due:week", "due:month", "due:overdue", "due:none",
    "status:open", "status:completed", "repeat:true", "repeat:false",
    "has:notes", "has:project", "has:category", "focus:true", "focus:false",
    "category:work", "category:school", "category:personal", "category:health", "category:other", "category:none",
    "project:unassigned",
    ...(context.projects || []).map((project) => `project:"${project.name.replaceAll('"', "")}"`)
  ];
  return suggestions.filter((suggestion) => !tail || suggestion.toLocaleLowerCase().startsWith(tail)).slice(0, 8);
}

export function formatActiveSearchSummary(parsedQuery, language = "en") {
  const count = parsedQuery?.tokens?.length || 0;
  const terms = parsedQuery?.textTerms?.length || 0;
  if (language === "es") return `${count} filtros estructurados · ${terms} términos de texto`;
  return `${count} structured filters · ${terms} text terms`;
}
