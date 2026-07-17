const busyControls = new WeakSet();

function restore(button, label) {
  busyControls.delete(button);
  if (!button) return;
  button.disabled = false;
  button.removeAttribute("aria-busy");
  if (label !== null) button.textContent = label;
}

export function runGuardedAction(button, action, { savingLabel = "Saving…", schedule = requestAnimationFrame } = {}) {
  if (!button || busyControls.has(button)) return { ok: false, busy: true };
  const label = button.textContent;
  busyControls.add(button);
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = savingLabel;
  try {
    return { ok: true, value: action() };
  } catch (error) {
    return { ok: false, error };
  } finally {
    schedule(() => restore(button, label));
  }
}

export function focusInvalidField(field, message, text) {
  if (!field) return;
  field.classList.add("input-error");
  field.setAttribute("aria-invalid", "true");
  if (message) {
    message.textContent = text;
    const ids = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    ids.add(message.id);
    field.setAttribute("aria-describedby", [...ids].join(" "));
  }
  field.focus({ preventScroll: true });
  const phone = globalThis.matchMedia?.("(max-width: 600px)")?.matches;
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (phone) {
    field.scrollIntoView?.({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }
}

export function clearFieldValidation(field, message) {
  field?.classList.remove("input-error");
  field?.removeAttribute("aria-invalid");
  if (message) message.textContent = "";
}
