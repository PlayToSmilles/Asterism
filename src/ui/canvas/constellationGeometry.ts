interface Point { x: number; y: number }

// SVG coordinates are CSS pixels, matching the fixed-size category circles.
export function orbitalLink(a: Point, b: Point, radius = 33, bend = 1) {
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
  if (length <= radius * 2) return null;
  const offset = Math.min(42, length * .09) * bend;
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
}
