// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { orbitalLink } from "./constellationGeometry";

describe("conexões orbitais", () => {
  it("termina nas bordas dos dois círculos em diferentes direções", () => {
    const a = { x: 150, y: 100 };
    for (const b of [{ x: 600, y: 100 }, { x: 150, y: 500 }, { x: 650, y: 550 }]) {
      const link = orbitalLink(a, b)!;
      expect(Math.hypot(link.start.x - a.x, link.start.y - a.y)).toBeCloseTo(33);
      expect(Math.hypot(link.end.x - b.x, link.end.y - b.y)).toBeCloseTo(33);
    }
  });
  it("mantém contagem no meio da curva e curva reversa simétrica", () => {
    const a = { x: 0, y: 0 }, b = { x: 400, y: 0 };
    const forward = orbitalLink(a, b)!, reverse = orbitalLink(b, a, 33, -1)!;
    expect(forward.start).toEqual(reverse.end);
    expect(forward.end).toEqual(reverse.start);
    expect(forward.label).toEqual(reverse.label);
    expect(forward.label.x).toBeCloseTo(200);
    expect(forward.label.y).toBeGreaterThan(0);
  });
  it("não gera curvas inválidas entre círculos coincidentes ou sobrepostos", () => {
    expect(orbitalLink({ x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
    expect(orbitalLink({ x: 0, y: 0 }, { x: 30, y: 30 })).toBeNull();
  });
});
