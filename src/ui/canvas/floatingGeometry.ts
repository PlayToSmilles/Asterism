// SPDX-License-Identifier: MPL-2.0 AND MIT
// ASTERISM additions: MPL-2.0; upstream example material: MIT.
// See THIRD_PARTY_NOTICES.md (xyflow) and docs/LICENSING.md.
import type { Category, Relation } from "../../domain/model";
type Point = { x: number; y: number };
export type NodeBox = Point & {
  width: number;
  height: number;
  category: Category;
  shape?: "circle";
};
const center = (box: NodeBox): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;

// Eight edges approximate rounded corners and match the decorative CSS cuts.
export function boundaryPoint(box: NodeBox, toward: Point): Point {
  const c = center(box);
  let direction = { x: toward.x - c.x, y: toward.y - c.y };
  if (!direction.x && !direction.y) direction = { x: 1, y: 0 };
  if (box.shape === "circle") {
    const length = Math.hypot(direction.x, direction.y);
    return { x: c.x + direction.x / length * box.width / 2, y: c.y + direction.y / length * box.height / 2 };
  }
  const { width: w, height: h, category } = box;
  const cut = Math.min(
    category === "Magia"
      ? 24
      : category === "Evento"
        ? 22
        : category === "Personagem"
          ? 9
          : category === "Local"
            ? 5
            : 6,
    w / 3,
    h / 3,
  );
  const a = category === "Evento" ? 0 : cut;
  const polygon = [
    { x: a, y: 0 },
    { x: w - cut, y: 0 },
    { x: w, y: cut },
    { x: w, y: h - a },
    { x: w - a, y: h },
    { x: cut, y: h },
    { x: 0, y: h - cut },
    { x: 0, y: a },
  ].map((p) => ({ x: p.x + box.x, y: p.y + box.y }));
  let nearest = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i],
      q = polygon[(i + 1) % polygon.length];
    const side = { x: q.x - p.x, y: q.y - p.y };
    const origin = { x: p.x - c.x, y: p.y - c.y };
    const denominator = cross(direction, side);
    if (Math.abs(denominator) < 1e-9) continue;
    const t = cross(origin, side) / denominator;
    const u = cross(origin, direction) / denominator;
    if (t >= 0 && u >= 0 && u <= 1) nearest = Math.min(nearest, t);
  }
  return Number.isFinite(nearest)
    ? { x: c.x + direction.x * nearest, y: c.y + direction.y * nearest }
    : c;
}

export function relationLanes(relations: Relation[]): Map<string, number> {
  const groups = new Map<string, Relation[]>();
  for (const relation of relations) {
    const key = JSON.stringify([relation.sourceId, relation.targetId].sort());
    const group = groups.get(key) ?? [];
    group.push(relation);
    groups.set(key, group);
  }
  const result = new Map<string, number>();
  for (const group of groups.values())
    group.forEach((r, i) =>
      result.set(
        r.id,
        r.sourceId === r.targetId
          ? i
          : (i - (group.length - 1) / 2) *
              64 *
              (r.sourceId < r.targetId ? 1 : -1),
      ),
    );
  return result;
}

export function floatingPath(
  source: NodeBox,
  target: NodeBox,
  self = false,
  lane = 0,
) {
  const a = center(source),
    b = center(target);
  if (self) {
    const reach = 65 + lane * 32;
    const start = boundaryPoint(source, { x: a.x, y: source.y - reach });
    const end = boundaryPoint(source, {
      x: source.x + source.width + reach,
      y: a.y,
    });
    return {
      start,
      end,
      path: `M ${start.x},${start.y} C ${start.x},${source.y - reach} ${end.x + reach},${source.y - reach} ${end.x},${end.y}`,
      labelX: end.x + reach * 0.35,
      labelY: source.y - reach * 0.55,
    };
  }
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const control = {
    x: (a.x + b.x) / 2 - (dy / length) * lane,
    y: (a.y + b.y) / 2 + (dx / length || (!dy ? 1 : 0)) * lane,
  };
  // Coincident centers still produce finite, deterministic endpoints.
  const start = boundaryPoint(
    source,
    dx || dy || lane ? control : { x: a.x + 1, y: a.y },
  );
  const end = boundaryPoint(
    target,
    dx || dy || lane ? control : { x: b.x - 1, y: b.y },
  );
  return {
    start,
    end,
    path: lane
      ? `M ${start.x},${start.y} Q ${control.x},${control.y} ${end.x},${end.y}`
      : `M ${start.x},${start.y} L ${end.x},${end.y}`,
    labelX: lane
      ? 0.25 * start.x + 0.5 * control.x + 0.25 * end.x
      : (start.x + end.x) / 2,
    labelY: lane
      ? 0.25 * start.y + 0.5 * control.y + 0.25 * end.y
      : (start.y + end.y) / 2,
  };
}
