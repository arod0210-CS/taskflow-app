export function createPwaManager({ status }) {
  let registration = null;
  let updateRequested = false;
  let reloadStarted = false;

  function showWaitingWorker() {
    status.setUpdateAvailable(Boolean(registration?.waiting));
  }

  function watchRegistration(nextRegistration) {
    registration = nextRegistration;
    showWaitingWorker();
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          showWaitingWorker();
        }
      });
    });
  }

  function requestUpdate() {
    if (!registration?.waiting) return;
    updateRequested = true;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  async function register() {
    status.setConnectivity(navigator.onLine, { initial: true });
    window.addEventListener("offline", () => status.setConnectivity(false));
    window.addEventListener("online", () => status.setConnectivity(true));

    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateRequested || reloadStarted) return;
      reloadStarted = true;
      status.setUpdateAvailable(false);
      window.location.reload();
    });

    try {
      watchRegistration(await navigator.serviceWorker.register("./service-worker.js", { scope: "./" }));
    } catch (error) {
      console.warn("TaskFlow service worker registration failed.", error);
    }
  }

  status.setUpdateHandler(requestUpdate);
  return { register, requestUpdate };
}
