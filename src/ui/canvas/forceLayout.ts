// SPDX-License-Identifier: MPL-2.0
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum, type SimulationLinkDatum } from "d3-force";
import type { Category, Position, Relation } from "../../domain/model";
import type { CardNode } from "./canvasState";
import { cardSize } from "./cardPresentation";

export interface Particle extends SimulationNodeDatum {
  id: string;
  category: Category;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

// Every mutable particle/link is a disposable projection, never domain data.
export function createForceSystem(nodes: CardNode[], relations: Relation[]) {
  const particles: Particle[] = nodes.map((node) => {
    const size = { ...cardSize(node.data.entity.category), ...node.measured };
    return { id: node.id, category: node.data.entity.category,
      x: node.position.x + size.width / 2, y: node.position.y + size.height / 2,
      ...size, radius: Math.hypot(size.width, size.height) / 2 + 30 };
  });
  const ids = new Set(particles.map(n => n.id));
  const links: SimulationLinkDatum<Particle>[] = relations.filter(r => r.sourceId !== r.targetId && ids.has(r.sourceId) && ids.has(r.targetId))
    .map(r => ({ source: r.sourceId, target: r.targetId }));
  const cx = particles.reduce((sum, n) => sum + n.x, 0) / Math.max(1, particles.length);
  const cy = particles.reduce((sum, n) => sum + n.y, 0) / Math.max(1, particles.length);
  const collision = forceCollide<Particle>(n => n.radius).strength(1).iterations(3);
  const attraction = forceLink<Particle, typeof links[number]>(links).id(n => n.id).distance(470).strength(0.12);
  const simulation = forceSimulation(particles).stop()
    .force("charge", forceManyBody<Particle>().strength(-1400))
    .force("links", attraction).force("collision", collision)
    .force("x", forceX<Particle>(cx).strength(0.035))
    .force("y", forceY<Particle>(cy).strength(0.035));
  return { particles, simulation, collision, attraction };
}

// Manual, yielding ticks make automatic arrangement finite and cancellable.
export async function forceLayout(nodes: CardNode[], relations: Relation[], signal: AbortSignal) {
  if (signal.aborted) return null;
  if (!nodes.length) return new Map<string, Position>();
  const { particles, simulation } = createForceSystem(nodes, relations);
  try {
    for (let batch = 0; batch < 25; batch++) {
      if (signal.aborted) return null;
      simulation.tick(12);
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
    // Let collision settle without competing attractions at the end.
    simulation.force("links", null).force("charge", null).force("x", null).force("y", null);
    simulation.tick(40);
    if (signal.aborted) return null;
    return new Map(particles.map(n => [n.id, { x: n.x - n.width / 2, y: n.y - n.height / 2 }]));
  } finally {
    simulation.stop();
  }
}
