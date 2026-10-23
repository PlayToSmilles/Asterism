// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it, vi } from "vitest";
import { registerPwa } from "./register";
function environment(waiting = false) {
  const worker = Object.assign(new EventTarget(), {
    state: "installing",
    postMessage: vi.fn(),
  });
  const registration = Object.assign(new EventTarget(), {
    waiting: waiting ? worker : null,
    installing: waiting ? null : worker,
    active: null,
    update: vi.fn().mockResolvedValue(undefined),
  });
  const container = {
    controller: waiting ? {} : null,
    register: vi.fn().mockResolvedValue(registration),
    getRegistration: vi.fn().mockResolvedValue(undefined),
  };
  return { worker, registration, container };
}
describe("PWA sem atualização interruptiva", () => {
  it("registra no escopo correto e avisa uma atualização sem ativá-la", async () => {
    const { worker, registration, container } = environment(true);
    const notify = vi.fn();
    const dispose = registerPwa(
      container as unknown as ServiceWorkerContainer,
      notify,
    );
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith("update"));
    expect(container.register).toHaveBeenCalledWith("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(registration.update).toHaveBeenCalledOnce();
    dispose();
  });
  it("confirma instalação offline e remove ouvintes ao desmontar", async () => {
    const { worker, container } = environment();
    const notify = vi.fn();
    const dispose = registerPwa(
      container as unknown as ServiceWorkerContainer,
      notify,
    );
    await Promise.resolve();
    worker.state = "installed";
    worker.dispatchEvent(new Event("statechange"));
    expect(notify).toHaveBeenLastCalledWith("ready");
    dispose();
    notify.mockClear();
    worker.state = "redundant";
    worker.dispatchEvent(new Event("statechange"));
    expect(notify).not.toHaveBeenCalled();
  });
  it("mantém a instalação anterior utilizável quando a verificação de rede falha", async () => {
    const { container } = environment();
    container.register.mockRejectedValue(new Error("offline"));
    container.getRegistration.mockResolvedValue({ active: {} });
    const notify = vi.fn();
    const dispose = registerPwa(
      container as unknown as ServiceWorkerContainer,
      notify,
    );
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith("ready"));
    dispose();
  });
});
