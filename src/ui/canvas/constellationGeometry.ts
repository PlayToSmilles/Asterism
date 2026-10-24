// SPDX-License-Identifier: MPL-2.0
interface Point { x: number; y: number }

function segmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const squared = dx * dx + dy * dy;
  const t = squared ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / squared)) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

function clearsCircles(start: Point, control: Point, end: Point, obstacles: readonly Point[], clearance: number) {
  // A quadratic differs from each chord by at most |P0 - 2P1 + P2| / (4n²).
  // Expand the checked radius by that bound so sampling cannot miss a collision.
  const curvature = Math.hypot(start.x - 2 * control.x + end.x, start.y - 2 * control.y + end.y);
  const steps = Math.max(16, Math.ceil(Math.sqrt(curvature / 2)));
  const padding = curvature / (4 * steps * steps);
  let previous = start;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    const point = { x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
      y: u * u * start.y + 2 * u * t * control.y + t * t * end.y };
    if (obstacles.some(obstacle => segmentDistance(obstacle, previous, point) <= clearance + padding)) return false;
    previous = point;
  }
  return true;
}

// SVG coordinates are CSS pixels, matching the fixed-size category circles.
export function orbitalLink(a: Point, b: Point, radius = 33, bend = 1, obstacles: readonly Point[] = []) {
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
  if (length <= radius * 2) return null;
  const initialOffset = Math.min(42, length * .09) * bend;
  const others = obstacles.filter(point => Math.hypot(point.x - a.x, point.y - a.y) > .01 &&
    Math.hypot(point.x - b.x, point.y - b.y) > .01);
  const curveAt = (offset: number) => {
    const control = { x: (a.x + b.x) / 2 - dy / length * offset, y: (a.y + b.y) / 2 + dx / length * offset };
    const rim = (center: Point) => {
      const x = control.x - center.x, y = control.y - center.y, distance = Math.hypot(x, y);
      return { x: center.x + x / distance * radius, y: center.y + y / distance * radius };
    };
    const start = rim(a), end = rim(b);
    return {
      start, end, control,
      path: `M${start.x},${start.y} Q${control.x},${control.y} ${end.x},${end.y}`,
      label: { x: (start.x + 2 * control.x + end.x) / 4, y: (start.y + 2 * control.y + end.y) / 4 },
    };
  };
  const original = curveAt(initialOffset);
  if (!others.length || clearsCircles(original.start, original.control, original.end, others, radius + 16)) return original;
  // Prefer the existing gentle curve, then the smallest safe bend on either side.
  // Bounded work, performed on layout changes rather than on animation frames.
  const direction = Math.sign(initialOffset) || 1;
  for (let step = 0; step <= 24; step++) {
    const magnitude = Math.abs(initialOffset) + step * 24;
    for (const side of [direction, -direction]) {
      if (step === 0 && side === direction) continue;
      const curve = curveAt(magnitude * side);
      if (clearsCircles(curve.start, curve.control, curve.end, others, radius + 16)) return curve;
    }
  }
  // Overcrowded/overlapping layouts must not draw a misleading connection through a node.
  return null;
}
