import { afterEach, describe, expect, it, vi } from "vitest";
import { createConstellationTransition } from "./useConstellationTransition";

const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function rig(reduced = false, supported = true) {
  const events = new Map<string, EventListener>();
  const media = { matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const calls: { owner: string; frames: Keyframe[]; finish: () => void; cancel: ReturnType<typeof vi.fn> }[] = [];
  const element = (owner: string) => {
    const values = new Map<string, string>();
    return {
      style: { getPropertyValue: (key: string) => values.get(key) ?? "", setProperty: (key: string, value: string) => values.set(key, value), removeProperty: (key: string) => values.delete(key) },
      setAttribute: vi.fn(), remove: vi.fn(), append: vi.fn(), focus: vi.fn(), scrollTop: 0,
      getBoundingClientRect: () => ({ left: 100, top: 100, width: 62, height: 62 }),
      animate: vi.fn((frames: Keyframe[]) => {
        let finish!: () => void, reject!: () => void;
        const finished = new Promise<void>((yes, no) => { finish = yes; reject = () => no(new Error("cancelled")); });
        const cancel = vi.fn(reject);
        calls.push({ owner, frames, finish, cancel });
        return { finished, cancel };
      }),
    };
  };
  const circle = element("circle"), scene = element("scene"), chrome = element("chrome"), flow = element("flow"), overlay = element("overlay"), button = element("button");
  const host = { inert: false, dataset: {} as Record<string, string>, append: vi.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }),
    querySelector: (selector: string) => selector.includes(".constellation-orb") ? circle : selector.includes(".constellation-hub") ? button
      : selector === ".flow-layer" ? flow : selector === ".constellation-overview" ? scene : chrome,
    querySelectorAll: () => [element("card"), element("card")],
  };
  vi.stubGlobal("document", { createElement: () => overlay, createElementNS: () => element("rim"),
    addEventListener: (name: string, listener: EventListener) => events.set(name, listener),
    removeEventListener: (name: string) => events.delete(name),
  });
  vi.stubGlobal("window", {
    addEventListener: (name: string, listener: EventListener) => events.set(name, listener),
    removeEventListener: (name: string) => events.delete(name),
  });
  vi.stubGlobal("matchMedia", () => media);
  vi.stubGlobal("CSS", { supports: () => supported });
  const retain = vi.fn();
  const controller = createConstellationTransition(() => host as unknown as HTMLElement, retain);
  return { controller, host, overlay, calls, events, flow, button, scene, retain };
}
afterEach(() => vi.unstubAllGlobals());

async function finishAll(calls: ReturnType<typeof rig>["calls"]) {
  for (let i = 0; i < 4; i++) { calls.slice().forEach(call => call.finish()); await flush(); }
}

describe("passagem entre constelações", () => {
  it("prepara imediatamente, preserva a origem e aguarda a câmera antes de expandir", async () => {
    const { controller, host, calls, overlay, flow, events, retain } = rig();
    const navigate = vi.fn();
    const done = controller.start("Personagem", "enter", navigate);
    await controller.start("Local", "enter", navigate);
    expect(navigate).toHaveBeenCalledTimes(1); expect(retain).toHaveBeenLastCalledWith(true);
    expect(host.inert).toBe(true); expect(calls).toHaveLength(0);
    expect(flow.style.getPropertyValue("opacity")).toBe("0");
    controller.ready(); await flush();
    const aperture = calls.find(call => call.owner === "flow")!.frames;
    expect(aperture[0].clipPath).toBe("circle(31px at 131px 131px)");
    expect(aperture[1].opacity).toBe(.85); // Destination is revealed before expansion completes.
    expect(calls.find(call => call.owner === "circle")!.frames[1].transform).toBe("scale(3.8)");
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(controller.pending).toBe(true); expect(overlay.remove).not.toHaveBeenCalled();
    retain.mockImplementation(value => {
      if (!value) {
        expect(flow.style.getPropertyValue("z-index")).toBe("5");
        expect(calls.find(call => call.owner === "flow")!.cancel).not.toHaveBeenCalled();
      }
    });
    await finishAll(calls); await done;
    expect(controller.pending).toBe(false); expect(host.inert).toBe(false);
    expect(flow.style.getPropertyValue("opacity")).toBe("");
    expect(flow.style.getPropertyValue("clip-path")).toBe("");
    expect(retain).toHaveBeenLastCalledWith(false); expect(flow.focus).toHaveBeenCalled();
    expect(events.size).toBe(0); expect(calls.every(call => call.cancel.mock.calls.length)).toBe(true);
  });
  it("preserva o canvas de saída até contrair a abertura sobre o mapa pronto", async () => {
    const { controller, calls, button, retain, flow } = rig();
    const navigate = vi.fn();
    const done = controller.start("Personagem", "leave", navigate);
    expect(navigate).not.toHaveBeenCalled(); expect(retain).toHaveBeenLastCalledWith(true);
    expect(flow.style.getPropertyValue("opacity")).toBe("1");
    controller.ready(); await flush();
    expect(navigate).not.toHaveBeenCalled();
    const aperture = calls.find(call => call.owner === "flow")!.frames;
    expect(aperture.at(-1)?.clipPath).toBe("circle(31px at 131px 131px)");
    await finishAll(calls); await done;
    expect(navigate).toHaveBeenCalledTimes(1); expect(button.focus).toHaveBeenCalled();
  });
  it.each([[true, true], [false, false]])("troca sem progressão quando movimento/API indisponível (%s/%s)", async (reduced, supported) => {
    const { controller, calls, button, host } = rig(reduced, supported);
    const navigate = vi.fn();
    const done = controller.start("Local", "leave", navigate);
    expect(navigate).toHaveBeenCalledTimes(1); expect(calls).toHaveLength(0);
    controller.ready(); await done;
    expect(button.focus).toHaveBeenCalled(); expect(host.inert).toBe(false);
  });
  it("Esc e resize concluem sem repetir navegação, mantendo a origem enquanto a câmera prepara", async () => {
    const { controller, events, host, calls, retain } = rig();
    const navigate = vi.fn();
    const done = controller.start("Personagem", "enter", navigate);
    events.get("keydown")!({ key: "Escape", preventDefault: vi.fn() } as unknown as Event);
    events.get("resize")!(new Event("resize"));
    await flush();
    expect(navigate).toHaveBeenCalledTimes(1); expect(retain).toHaveBeenLastCalledWith(true);
    expect(calls).toHaveLength(0);
    controller.ready(); await done;
    expect(host.inert).toBe(false); expect(events.size).toBe(0);
  });
  it("desmontagem cancela animações e estilos temporários sem navegação tardia ou foco antigo", async () => {
    const { controller, events, host, calls, flow, retain } = rig();
    const navigate = vi.fn();
    const done = controller.start("Evento", "enter", navigate);
    controller.ready(); await flush();
    expect(calls.length).toBeGreaterThan(0);
    controller.dispose(); await done;
    expect(navigate).toHaveBeenCalledTimes(1); expect(flow.focus).not.toHaveBeenCalled();
    expect(host.inert).toBe(false); expect(events.size).toBe(0);
    expect(retain).toHaveBeenLastCalledWith(false);
    expect(flow.style.getPropertyValue("z-index")).toBe("");
    expect(calls.every(call => call.cancel.mock.calls.length)).toBe(true);
  });
});
