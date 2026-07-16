const messages = {
  en: {
    persistenceQuota: "TaskFlow could not save because browser storage is full. Your latest change may not persist after this page closes.",
    persistenceSecurity: "Browser storage is blocked. TaskFlow remains usable, but new changes may not persist.",
    persistenceSerialization: "TaskFlow could not prepare this data for storage. Your latest change may not persist.",
    persistenceUnavailable: "Browser storage is unavailable. TaskFlow remains usable for this session only.",
    persistenceUnknown: "TaskFlow could not save your latest change. Keep this page open while you review browser storage settings.",
    persistenceRecovered: "Browser storage is available again. New changes will be saved.",
    offline: "Offline mode. Changes remain only in this browser and will be saved locally when storage is available.",
    online: "Back online. TaskFlow data remains stored in this browser; cloud synchronization is not enabled.",
    updateAvailable: "A new TaskFlow version is ready.",
    updateNow: "Update now"
  },
  es: {
    persistenceQuota: "TaskFlow no pudo guardar porque el almacenamiento del navegador está lleno. Es posible que el último cambio no permanezca al cerrar esta página.",
    persistenceSecurity: "El almacenamiento del navegador está bloqueado. TaskFlow sigue funcionando, pero es posible que los cambios nuevos no permanezcan.",
    persistenceSerialization: "TaskFlow no pudo preparar estos datos para guardarlos. Es posible que el último cambio no permanezca.",
    persistenceUnavailable: "El almacenamiento del navegador no está disponible. TaskFlow funcionará solo durante esta sesión.",
    persistenceUnknown: "TaskFlow no pudo guardar el último cambio. Mantén esta página abierta mientras revisas la configuración de almacenamiento.",
    persistenceRecovered: "El almacenamiento del navegador vuelve a estar disponible. Los cambios nuevos se guardarán.",
    offline: "Modo sin conexión. Los cambios permanecen solo en este navegador y se guardan localmente cuando el almacenamiento está disponible.",
    online: "Conexión restaurada. Los datos de TaskFlow permanecen en este navegador; no hay sincronización en la nube.",
    updateAvailable: "Hay una nueva versión de TaskFlow lista.",
    updateNow: "Actualizar ahora"
  }
};

export function createAppStatus({ getLanguage = () => "en" } = {}) {
  const elements = {
    region: document.getElementById("appStatusRegion"),
    persistence: document.getElementById("persistenceStatus"),
    persistenceText: document.getElementById("persistenceStatusText"),
    connectivity: document.getElementById("connectivityStatus"),
    connectivityText: document.getElementById("connectivityStatusText"),
    update: document.getElementById("updateStatus"),
    updateText: document.getElementById("updateStatusText"),
    updateButton: document.getElementById("updateNowBtn")
  };
  let persistenceState = null;
  let connectivityState = null;
  let updateAvailable = false;
  let updateHandler = () => {};
  let connectivityTimer = null;
  let persistenceTimer = null;

  function text(key) {
    const language = getLanguage() === "es" ? "es" : "en";
    return messages[language][key] || messages.en[key] || key;
  }

  function updateRegionVisibility() {
    const visible = [elements.persistence, elements.connectivity, elements.update]
      .some((element) => element && !element.classList.contains("hidden"));
    elements.region?.classList.toggle("hidden", !visible);
  }

  function render() {
    if (persistenceState) {
      const key = persistenceState === "recovered"
        ? "persistenceRecovered"
        : `persistence${persistenceState[0].toUpperCase()}${persistenceState.slice(1)}`;
      elements.persistenceText.textContent = text(key in messages.en ? key : "persistenceUnknown");
      elements.persistence.classList.remove("hidden");
      elements.persistence.classList.toggle("is-recovered", persistenceState === "recovered");
    } else {
      elements.persistence?.classList.add("hidden");
    }

    if (connectivityState) {
      elements.connectivityText.textContent = text(connectivityState);
      elements.connectivity.classList.remove("hidden");
      elements.connectivity.classList.toggle("is-online", connectivityState === "online");
    } else {
      elements.connectivity?.classList.add("hidden");
    }

    if (updateAvailable) {
      elements.updateText.textContent = text("updateAvailable");
      elements.updateButton.textContent = text("updateNow");
      elements.update.classList.remove("hidden");
    } else {
      elements.update?.classList.add("hidden");
    }
    updateRegionVisibility();
  }

  function setPersistence(event) {
    clearTimeout(persistenceTimer);
    if (event?.type === "failure") {
      persistenceState = event.reason || "unknown";
    } else if (event?.type === "recovered") {
      persistenceState = "recovered";
      persistenceTimer = setTimeout(() => {
        persistenceState = null;
        render();
      }, 4000);
    }
    render();
  }

  function setConnectivity(isOnline, { initial = false } = {}) {
    clearTimeout(connectivityTimer);
    if (!isOnline) {
      connectivityState = "offline";
    } else if (!initial) {
      connectivityState = "online";
      connectivityTimer = setTimeout(() => {
        connectivityState = null;
        render();
      }, 4000);
    } else {
      connectivityState = null;
    }
    render();
  }

  function setUpdateAvailable(value) {
    updateAvailable = Boolean(value);
    render();
  }

  elements.updateButton?.addEventListener("click", () => updateHandler());

  return {
    render,
    setConnectivity,
    setPersistence,
    setUpdateAvailable,
    setUpdateHandler(handler) {
      updateHandler = typeof handler === "function" ? handler : () => {};
    }
  };
}
