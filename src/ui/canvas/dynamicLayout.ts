import type { Position, Relation } from "../../domain/model";
import type { CardNode } from "./canvasState";
import { semanticBox, type Detail } from "./cardPresentation";
import { createForceSystem, type Particle } from "./forceLayout";

export type DynamicStatus = "running" | "settled" | "paused";
export type DynamicLayout = ReturnType<typeof createDynamicLayout>;

// The simulation owns transient coordinates; React Flow keeps its measurements
// and receives batched position changes. No timers from d3 or persistence here.
export function createDynamicLayout(
  nodes: CardNode[], relations: Relation[], detail: Detail,
  publish: (positions: ReadonlyMap<string, Position>) => void,
  status: (value: DynamicStatus) => void,
  reducedMotion = false,
) {
  const { particles, simulation, collision, attraction } = createForceSystem(nodes, relations);
  const byId = new Map(particles.map(p => [p.id, p]));
  simulation.alphaMin(0.015).alphaDecay(reducedMotion ? 0.09 : 0.035).velocityDecay(reducedMotion ? 0.65 : 0.45);
  let frame: number | null = null, enabled = false, disposed = false, budget = 0, lastPublish = -Infinity;
  let currentDetail: Detail | null = null;
  const snapshot = () => new Map(particles.map(p => [p.id, { x: p.x - p.width / 2, y: p.y - p.height / 2 }]));

  function setDetail(next: Detail) {
    if (next === currentDetail) return;
    currentDetail = next;
    for (const p of particles) {
      const box = semanticBox({ ...p }, next);
      p.radius = (next === "symbol" ? box.width : Math.hypot(box.width, box.height)) / 2 + 24;
    }
    collision.radius(p => p.radius);
    attraction.distance(link => (link.source as Particle).radius + (link.target as Particle).radius + 95).strength(0.09);
    heat(0.3);
  }
  setDetail(detail);

  function tick(now: number) {
    frame = null;
    if (!enabled || disposed) return;
    simulation.tick(2);
    budget -= 2;
    const resting = budget <= 0 || simulation.alpha() < simulation.alphaMin();
    if (resting || now - lastPublish >= (reducedMotion ? 64 : 32)) {
      publish(snapshot());
      lastPublish = now;
    }
    if (resting) status("settled");
    else frame = requestAnimationFrame(tick);
  }
  function heat(alpha: number) {
    if (!enabled || disposed) return;
    budget = reducedMotion ? 100 : 300;
    simulation.alpha(Math.max(simulation.alpha(), alpha));
    status("running");
    if (frame === null) frame = requestAnimationFrame(tick);
  }
  function setEnabled(value: boolean) {
    if (disposed) return;
    enabled = value;
    if (value) heat(0.45);
    else {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      simulation.stop();
      for (const p of particles) p.fx = p.fy = null;
      simulation.alphaTarget(0);
      publish(snapshot());
      status("paused");
    }
  }
  function pin(id: string, position: Position) {
    const p = byId.get(id);
    if (!p || disposed) return;
    p.x = p.fx = position.x + p.width / 2;
    p.y = p.fy = position.y + p.height / 2;
    p.vx = p.vy = 0;
    simulation.alphaTarget(0.08);
    heat(0.3);
  }
  function release(id: string) {
    const p = byId.get(id);
    if (!p || disposed) return;
    p.fx = p.fy = null;
    if (!particles.some(n => n.fx != null)) simulation.alphaTarget(0);
    heat(0.25);
  }
  function dispose() {
    disposed = true;
    enabled = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    simulation.stop();
  }
  return { snapshot, pin, release, setDetail, setEnabled, dispose, get enabled() { return enabled; } };
}
