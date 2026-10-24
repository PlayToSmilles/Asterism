// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { orbitalLink } from "./constellationGeometry";

function expectClear(link: NonNullable<ReturnType<typeof orbitalLink>>, obstacles: { x: number; y: number }[]) {
  for (let i = 0; i <= 200; i++) {
    const t = i / 200, u = 1 - t;
    const p = { x: u * u * link.start.x + 2 * u * t * link.control.x + t * t * link.end.x,
      y: u * u * link.start.y + 2 * u * t * link.control.y + t * t * link.end.y };
    for (const obstacle of obstacles) expect(Math.hypot(p.x - obstacle.x, p.y - obstacle.y)).toBeGreaterThan(49);
  }
}

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

  it("preserva o traçado quando os demais círculos não interferem", () => {
    const a = { x: 0, y: 0 }, b = { x: 500, y: 0 };
    expect(orbitalLink(a, b, 33, 1, [{ x: 250, y: 200 }])).toEqual(orbitalLink(a, b));
  });

  it("contorna um círculo no caminho sem perder as extremidades e o ponto da contagem", () => {
    const a = { x: 0, y: 0 }, b = { x: 500, y: 0 }, obstacles = [{ x: 250, y: 20 }];
    const link = orbitalLink(a, b, 33, 1, obstacles)!;
    expect(link).not.toBeNull();
    expectClear(link, obstacles);
    expect(Math.hypot(link.start.x - a.x, link.start.y - a.y)).toBeCloseTo(33);
    expect(Math.hypot(link.end.x - b.x, link.end.y - b.y)).toBeCloseTo(33);
    expect(link.label.y).toBeCloseTo((link.start.y + 2 * link.control.y + link.end.y) / 4);
  });

  it("evita vários obstáculos e produz um caminho determinístico", () => {
    const a = { x: 0, y: 0 }, b = { x: 600, y: 0 };
    const obstacles = [{ x: 180, y: 35 }, { x: 390, y: -30 }];
    const forward = orbitalLink(a, b, 33, 1, obstacles)!;
    expect(forward).not.toBeNull();
    expectClear(forward, obstacles);
    expect(orbitalLink(a, b, 33, 1, obstacles)).toEqual(forward);
    const reverse = orbitalLink(b, a, 33, -1, [...obstacles].reverse())!;
    expect(reverse.control).toEqual(forward.control);
  });

  it("não perde ligações nem atravessa círculos na composição completa em diferentes dimensões", () => {
    const anchors = [[38, 40], [67, 22], [85, 43], [76, 73], [47, 77], [17, 66], [52, 12], [16, 27]];
    for (const [width, height] of [[760, 360], [1100, 440], [1600, 680]]) {
      const centers = anchors.map(([x, y]) => ({ x: x * width / 100, y: y * height / 100 }));
      for (let a = 0; a < centers.length; a++) for (let b = a + 1; b < centers.length; b++) {
        const obstacles = centers.filter((_, index) => index !== a && index !== b);
        const link = orbitalLink(centers[a], centers[b], 33, 1, centers);
        expect(link, `ligação ${a}–${b} em ${width}×${height}`).not.toBeNull();
        expectClear(link!, obstacles);
      }
    }
  });
});
