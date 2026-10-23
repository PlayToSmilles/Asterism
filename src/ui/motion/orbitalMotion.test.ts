import { describe, expect, it } from "vitest";
import { createOrbitalMotion } from "./orbitalMotion";

function rig() {
  const calls: { frames: Keyframe[]; options: KeyframeAnimationOptions; currentTime: number; cancelled: boolean; finish: () => void }[] = [];
  const particles = [{ x: -35, y: -7 }, { x: 16.5, y: -33.5 }, { x: 27, y: 26 }].map(home => ({
    home,
    element: {
      animate(frames: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions) {
        let finish!: () => void, reject!: (reason: Error) => void;
        const finished = new Promise<Animation>(resolve => { finish = () => resolve(animation); });
        // Cancellation must reject like WAAPI; every rejection is handled.
        const abortable = Promise.race([finished, new Promise<Animation>((_, no) => { reject = no; })]);
        const call = { frames: frames as Keyframe[], options: options as KeyframeAnimationOptions, currentTime: 0, cancelled: false, finish: () => {
          call.currentTime = Number(call.options.duration) + Number(call.options.delay ?? 0);
          finish();
        } };
        const animation = {
          get currentTime() { return call.currentTime; },
          finished: abortable,
          cancel() { call.cancelled = true; reject(new Error("cancelled")); },
        } as unknown as Animation;
        calls.push(call);
        return animation;
      },
    },
  }));
  const motion = createOrbitalMotion(particles);
  return { motion, calls };
}
type Call = ReturnType<typeof rig>["calls"][number];
function point(frame: Keyframe) {
  const [, x, y] = String(frame.transform).match(/^translate\((.+)px, (.+)px\)$/)!;
  return { x: Number(x), y: Number(y) };
}
function visual(call: Call) {
  const count = call.frames.length - 1, duration = Number(call.options.duration);
  const elapsed = Math.max(0, call.currentTime - Number(call.options.delay ?? 0));
  const t = (call.options.iterations === Infinity ? elapsed % duration : Math.min(duration, elapsed)) / duration * count;
  const i = Math.min(count - 1, Math.floor(t)), a = point(call.frames[i]), b = point(call.frames[i + 1]);
  return {
    x: a.x + (b.x - a.x) * (t - i), y: a.y + (b.y - a.y) * (t - i),
    vx: (b.x - a.x) / (duration / count), vy: (b.y - a.y) / (duration / count),
  };
}
function expectContinuous(before: ReturnType<typeof visual>, next: Call) {
  const start = point(next.frames[0]), a = point(next.frames[1]), dt = Number(next.options.duration) / (next.frames.length - 1);
  expect(start.x).toBeCloseTo(before.x, 8);
  expect(start.y).toBeCloseTo(before.y, 8);
  expect((a.x - start.x) / dt).toBeCloseTo(before.vx, 8);
  expect((a.y - start.y) / dt).toBeCloseTo(before.vy, 8);
}
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

describe("máquina orbital WAAPI", () => {
  it("dispersa com atrasos e entra em três órbitas independentes", async () => {
    const { motion, calls } = rig();
    expect(motion.state).toBe("rest"); expect(calls).toHaveLength(0);
    motion.setActive(true);
    expect(motion.state).toBe("dispersing");
    expect(calls.map(c => c.options.delay)).toEqual([0, 45, 90]);
    calls.slice().forEach(c => c.finish()); await flush();
    expect(motion.state).toBe("orbiting");
    const orbits = calls.slice(3);
    expect(new Set(orbits.map(c => c.options.duration)).size).toBe(3);
    expect(orbits.every(c => c.options.iterations === Infinity)).toBe(true);
    orbits.forEach(c => expect(point(c.frames[0])).toEqual(point(c.frames.at(-1)!)));
    expect(orbits.map(c => {
      const a = point(c.frames[0]), b = point(c.frames[24]), d = point(c.frames[48]);
      return Math.sign((b.x - a.x) * (d.y - b.y) - (b.y - a.y) * (d.x - b.x));
    })).toEqual([1, -1, 1]);
    motion.dispose();
  });
  it("retorna durante a dispersão sem salto, ignora conclusão antiga e para exatamente em casa", async () => {
    const { motion, calls } = rig(); motion.setActive(true);
    const old = calls.slice(); old.forEach(c => { c.currentTime = 210; });
    const before = old.map(visual);
    motion.setActive(false);
    expect(motion.state).toBe("returning");
    calls.slice(3).forEach((c, i) => {
      expectContinuous(before[i], c);
      expect(point(c.frames.at(-1)!)).toEqual({ x: 0, y: 0 });
    });
    old.forEach(c => c.finish()); await flush(); expect(calls).toHaveLength(6);
    calls.slice(3).forEach(c => c.finish()); await flush();
    expect(motion.state).toBe("rest"); expect(calls.every(c => c.cancelled)).toBe(true);
  });
  it("preserva posição e velocidade saindo da órbita e reentrando durante o retorno", async () => {
    const { motion, calls } = rig(); motion.setActive(true);
    calls.slice().forEach(c => c.finish()); await flush();
    const orbits = calls.slice(3); orbits.forEach(c => { c.currentTime = 2345; });
    const beforeExit = orbits.map(visual); motion.setActive(false);
    const returns = calls.slice(6); returns.forEach((c, i) => expectContinuous(beforeExit[i], c));
    returns.forEach(c => { c.currentTime = 137; });
    const beforeEntry = returns.map(visual); motion.setActive(true);
    const entries = calls.slice(9); entries.forEach((c, i) => expectContinuous(beforeEntry[i], c));
    returns.forEach(c => c.finish()); await flush(); expect(calls).toHaveLength(12);
    entries.forEach(c => c.finish()); await flush(); expect(motion.state).toBe("orbiting");
    motion.dispose();
  });
  it("tolera saída antes dos atrasos e reentrada no mesmo instante", () => {
    const { motion, calls } = rig(); motion.setActive(true);
    motion.setActive(false); motion.setActive(true);
    expect(calls).toHaveLength(9);
    calls.forEach(c => expect(point(c.frames[0])).toEqual({ x: 0, y: 0 }));
    motion.dispose();
  });
  it("fica estática em movimento reduzido e não ressuscita após desmontagem", async () => {
    const { motion, calls } = rig(); motion.setReducedMotion(true); motion.setActive(true);
    expect(calls).toHaveLength(0); expect(motion.state).toBe("rest");
    motion.setReducedMotion(false); expect(calls).toHaveLength(3);
    motion.setReducedMotion(true); expect(calls.every(c => c.cancelled)).toBe(true);
    motion.setReducedMotion(false); const pending = calls.slice(3);
    motion.dispose(); pending.forEach(c => c.finish()); await flush();
    motion.setActive(false); motion.setActive(true); motion.setReducedMotion(false);
    expect(calls).toHaveLength(6); expect(motion.state).toBe("rest");
  });
  it("mantém categorias simultâneas isoladas e não reinicia uma seleção já ativa", () => {
    const a = rig(), b = rig(); a.motion.setActive(true); b.motion.setActive(true);
    a.motion.setActive(true); expect(a.calls).toHaveLength(3);
    a.motion.dispose(); expect(b.calls.every(c => !c.cancelled)).toBe(true);
    b.motion.dispose();
  });
});
