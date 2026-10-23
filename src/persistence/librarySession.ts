import { saveLibrary, type Library } from "./persistence";

// One canonical in-memory snapshot. React subscribes; timers only defer disk I/O.
export function createLibrarySession(
  initial: Library,
  storage: Pick<Storage, "setItem">,
  status: (message: string) => void,
) {
  let snapshot = initial;
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (!dirty) return;
    try {
      saveLibrary(storage, snapshot);
      dirty = false;
      status("Salvo neste navegador");
    } catch {
      status("Falha ao salvar · exporte um backup");
    }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(operation: (library: Library) => Library, deferred = false) {
      const next = operation(snapshot);
      if (next === snapshot) return;
      snapshot = next;
      dirty = true;
      if (deferred) {
        status("Salvando…");
        clearTimeout(timer);
        timer = setTimeout(flush, 750);
      } else flush();
      listeners.forEach((listener) => listener());
    },
    removeProject(id: string) {
      const projects = snapshot.projects.filter((project) => project.id !== id);
      if (projects.length === snapshot.projects.length) return;
      const next = { projects };
      // Destruction must be durable before publishing or deleting associated PDFs.
      // A failed write keeps the existing snapshot and any pending autosave intact.
      saveLibrary(storage, next);
      clearTimeout(timer);
      timer = undefined;
      snapshot = next;
      dirty = false;
      status("Salvo neste navegador");
      listeners.forEach((listener) => listener());
    },
    flush,
  };
}
