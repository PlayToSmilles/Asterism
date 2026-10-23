export type PwaState = "ready" | "update" | "error";

// Deliberately never calls skipWaiting, clients.claim, postMessage or reload.
// The browser activates an update only after all previous clients close.
export function registerPwa(
  container: ServiceWorkerContainer,
  notify: (state: PwaState) => void,
  base = "/",
) {
  let disposed = false;
  let registration: ServiceWorkerRegistration | undefined;
  let worker: ServiceWorker | null = null;
  const emit = (state: PwaState) => {
    if (!disposed) notify(state);
  };
  const changed = () => {
    if (worker?.state === "installed")
      emit(container.controller ? "update" : "ready");
    if (worker?.state === "redundant") emit("error");
  };
  const found = () => {
    worker?.removeEventListener("statechange", changed);
    worker = registration?.installing ?? null;
    worker?.addEventListener("statechange", changed);
    changed();
  };
  void container
    .register(`${base}sw.js`, { scope: base, updateViaCache: "none" })
    .then((value) => {
      if (disposed) return;
      registration = value;
      registration.addEventListener("updatefound", found);
      if (registration.waiting) emit("update");
      else if (registration.active) emit("ready");
      found();
      // Check when the home screen opens; discovery must not depend on the
      // browser's periodic update throttle. Installation still stays waiting.
      void registration.update().catch(() => undefined);
    })
    .catch(async () => {
      const previous = await container
        .getRegistration(base)
        .catch(() => undefined);
      emit(previous?.active ? "ready" : "error");
    });
  return () => {
    disposed = true;
    registration?.removeEventListener("updatefound", found);
    worker?.removeEventListener("statechange", changed);
  };
}
