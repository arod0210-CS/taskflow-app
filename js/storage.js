export function safeParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}
