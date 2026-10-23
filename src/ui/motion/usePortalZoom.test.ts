// SPDX-License-Identifier: MPL-2.0
import { afterEach, describe, expect, it, vi } from "vitest";
import { createProjectTransition } from "./usePortalZoom";

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function rig({ reduced = false, visible = true, supported = true } = {}) {
  const events = new Map<string, EventListener>();
  const calls: { owner: string; frames: Keyframe[]; finish: () => void; cancel: ReturnType<typeof vi.fn> }[] = [];
  const element = (owner: string) => ({
    style: { setProperty: vi.fn() }, dataset: {} as Record<string, string>,
    setAttribute: vi.fn(), removeAttribute: vi.fn(), remove: vi.fn(), append: vi.fn(),
    focus: vi.fn(), inert: false,
    animate: vi.fn((frames: Keyframe[]) => {
      let finish!: () => void, reject!: () => void;
      const finished = new Promise<void>((yes, no) => { finish = yes; reject = () => no(new Error("cancelled")); });
      const cancel = vi.fn(reject); calls.push({ owner, frames, finish, cancel }); return { finished, cancel };
    }),
  });
  const art = element("art");
  const copy = { ...element("copy"), querySelectorAll: () => [] };
  const cover = { ...element("cover"), cloneNode: vi.fn(() => copy),
    getBoundingClientRect: () => ({ left: 100, top: visible ? 200 : 900, right: 500, bottom: visible ? 450 : 1150, width: 400, height: 250 }) };
  const trigger = element("trigger"), back = element("back"), heading = element("heading");
  const article = { dataset: { projectId: "world" }, querySelector: (selector: string) => selector === ".asterism-project-cover" ? cover : trigger };
  const home = { ...element("home"), querySelectorAll: () => [article], querySelector: () => heading };
  const workspace = element("workspace");
  const ghost = { ...element("ghost"), querySelector: () => art };
  const root = { ...element("root"),
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 1200, bottom: 800, width: 1200, height: 800 }),
    querySelector: (selector: string) => selector === ".project-home-layer" ? home : selector === ".back-button" ? back : workspace };
  vi.stubGlobal("document", { createElement: () => ghost,
    addEventListener: (name: string, listener: EventListener) => events.set(name, listener),
    removeEventListener: (name: string) => events.delete(name) });
  vi.stubGlobal("window", { setTimeout, clearTimeout,
    addEventListener: (name: string, listener: EventListener) => events.set(name, listener),
    removeEventListener: (name: string) => events.delete(name) });
  vi.stubGlobal("matchMedia", () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("CSS", { supports: () => supported });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#abcdef" }));
  return { controller: createProjectTransition(() => root as unknown as HTMLElement), calls, events, root, workspace, cover, ghost, back, trigger };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("abertura e retorno de universos", () => {
  it("monta uma vez, aguarda o mapa real e revela a partir da capa sem transformar o canvas", async () => {
    const { controller, calls, root, cover, ghost, back } = rig();
    const open = vi.fn(), duplicate = vi.fn();
    const done = controller.start("world", "enter", open);
    await controller.start("other", "enter", duplicate);
    expect(open).toHaveBeenCalledTimes(1); expect(duplicate).not.toHaveBeenCalled();
    expect(root.inert).toBe(true); expect(calls).toHaveLength(0);
    controller.ready("other"); await flush(); expect(calls).toHaveLength(0);
    controller.ready("world"); await flush();
    expect(cover.cloneNode).toHaveBeenCalledTimes(1);
    const frames = calls.find(call => call.owner === "workspace")!.frames;
    expect(frames[0].clipPath).toBe("inset(200px 700px 350px 100px round 17px)");
    expect(frames[1].opacity).toBe(.85); expect(frames.every(frame => !frame.transform)).toBe(true);
    calls.forEach(call => call.finish()); await done;
    expect(controller.pending).toBe(false); expect(root.inert).toBe(false);
    expect(root.dataset.projectTransition).toBeUndefined(); expect(ghost.remove).toHaveBeenCalled();
    expect(back.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
  it("mantém o projeto montado até a contração e devolve o foco à capa", async () => {
    const { controller, calls, trigger, events } = rig();
    const close = vi.fn(); const done = controller.start("world", "leave", close);
    expect(close).not.toHaveBeenCalled();
    expect(calls.find(call => call.owner === "workspace")!.frames.at(-1)?.opacity).toBe(0);
    calls.forEach(call => call.finish()); await done;
    expect(close).toHaveBeenCalledTimes(1); expect(trigger.focus).toHaveBeenCalled(); expect(events.size).toBe(0);
  });
  it.each([{ reduced: true }, { supported: false }, { visible: false }])("usa fallback com prontidão preservada (%j)", async options => {
    const { controller, calls, root } = rig(options);
    const done = controller.start("world", "enter", vi.fn());
    expect(root.inert).toBe(true); controller.ready("world"); await done;
    expect(calls).toHaveLength(0); expect(root.inert).toBe(false);
  });
  it("Esc e resize concluem sem overlay preso; desmontagem cancela o retorno", async () => {
    const { controller, calls, events, root } = rig();
    const done = controller.start("world", "enter", vi.fn());
    events.get("keydown")!({ key: "Escape", preventDefault: vi.fn() } as unknown as Event);
    controller.ready("world"); await done; expect(calls).toHaveLength(0);
    const close = vi.fn(); const leaving = controller.start("world", "leave", close);
    events.get("resize")!({} as Event); await leaving;
    expect(close).toHaveBeenCalledTimes(1); expect(root.inert).toBe(false);
    const cancelled = controller.start("world", "leave", close); controller.dispose(); await cancelled;
    expect(close).toHaveBeenCalledTimes(1); expect(root.inert).toBe(false); expect(events.size).toBe(0);
  });
  it("libera com segurança se o destino não emitir prontidão", async () => {
    vi.useFakeTimers(); const { controller, root } = rig();
    const done = controller.start("world", "enter", vi.fn());
    await vi.advanceTimersByTimeAsync(3000); await done;
    expect(root.inert).toBe(false); expect(controller.pending).toBe(false);
  });
});
