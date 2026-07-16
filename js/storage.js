export function safeParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function classifyStorageError(error) {
  const name = String(error?.name || "");
  const code = Number(error?.code);
  if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || code === 22 || code === 1014) {
    return "quota";
  }
  if (name === "SecurityError") return "security";
  if (name === "TypeError") return "unavailable";
  return "unknown";
}

function resolveDefaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function createSafeStorage({ storage, onStatus = () => {} } = {}) {
  const target = storage === undefined ? resolveDefaultStorage() : storage;
  let activeFailure = null;
  let batchDepth = 0;
  let batchFailed = false;

  function reportFailure(reason, operation, error = null) {
    const result = { ok: false, reason, operation, error };
    const signature = `${operation}:${reason}`;
    if (activeFailure !== signature) onStatus({ type: "failure", ...result });
    activeFailure = signature;
    if (batchDepth > 0) batchFailed = true;
    return result;
  }

  function reportSuccess(operation) {
    if (batchDepth > 0) return { ok: true, recovered: false };
    const recovered = activeFailure !== null;
    activeFailure = null;
    if (recovered) onStatus({ type: "recovered", ok: true, operation });
    return { ok: true, recovered };
  }

  function getItem(key) {
    if (!target || typeof target.getItem !== "function") {
      reportFailure("unavailable", "read");
      return null;
    }
    try {
      const value = target.getItem(key);
      reportSuccess("read");
      return value;
    } catch (error) {
      reportFailure(classifyStorageError(error), "read", error);
      return null;
    }
  }

  function setItem(key, value) {
    if (!target || typeof target.setItem !== "function") {
      return reportFailure("unavailable", "write");
    }
    try {
      target.setItem(key, String(value));
      return reportSuccess("write");
    } catch (error) {
      return reportFailure(classifyStorageError(error), "write", error);
    }
  }

  function setJson(key, value) {
    let serialized;
    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      return reportFailure("serialization", "write", error);
    }
    if (serialized === undefined) return reportFailure("serialization", "write");
    return setItem(key, serialized);
  }

  function removeItem(key) {
    if (!target || typeof target.removeItem !== "function") {
      return reportFailure("unavailable", "write");
    }
    try {
      target.removeItem(key);
      return reportSuccess("write");
    } catch (error) {
      return reportFailure(classifyStorageError(error), "write", error);
    }
  }

  function batch(callback) {
    const outermost = batchDepth === 0;
    if (outermost) batchFailed = false;
    batchDepth += 1;
    let value;
    try {
      value = callback();
    } finally {
      batchDepth -= 1;
    }
    if (!outermost) return { ok: !batchFailed, value };
    if (!batchFailed) reportSuccess("write");
    return { ok: !batchFailed, value };
  }

  return {
    batch,
    getItem,
    removeItem,
    setItem,
    setJson,
    getStatus: () => ({ failure: activeFailure })
  };
}
