// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import {
  boundaryPoint,
  floatingPath,
  relationLanes,
  type NodeBox,
} from "./floatingGeometry";
const box: NodeBox = {
  x: 10,
  y: 20,
  width: 200,
  height: 100,
  category: "Ideia",
};
describe("geometria flutuante", () => {
  it.each([
    [
      { x: 500, y: 70 },
      { x: 210, y: 70 },
    ],
    [
      { x: -500, y: 70 },
      { x: 10, y: 70 },
    ],
    [
      { x: 110, y: -500 },
      { x: 110, y: 20 },
    ],
    [
      { x: 110, y: 500 },
      { x: 110, y: 120 },
    ],
  ])("segue os quatro lados", (toward, result) => {
    const actual = boundaryPoint(box, toward);
    expect(actual.x).toBeCloseTo(result.x);
    expect(actual.y).toBeCloseTo(result.y);
  });
  it("respeita recortes e dimensões diferentes sem deslocar os nós", () => {
    const magic: NodeBox = {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      category: "Magia",
    };
    expect(boundaryPoint(magic, { x: 500, y: -300 })).toEqual({
      x: 188,
      y: 12,
    });
    const path = floatingPath(box, { ...magic, x: 400, y: 400 });
    const moved = floatingPath(box, { ...magic, x: 400, y: -400 });
    expect(path.start.y).toBeGreaterThan(70);
    expect(moved.start.y).toBeLessThan(70);
    expect(path.path).toContain(" L ");
  });
  it("separa paralelas e direções inversas, gera auto-relação e não produz NaN em sobreposição", () => {
    const relations = [
      { id: "1", sourceId: "a", targetId: "b", label: "possui" },
      { id: "2", sourceId: "b", targetId: "a", label: "pertence" },
    ];
    const lanes = relationLanes(relations);
    const target = { ...box, x: 500 };
    expect(floatingPath(box, target, false, lanes.get("1")).labelY).not.toBe(
      floatingPath(target, box, false, lanes.get("2")).labelY,
    );
    expect(floatingPath(box, box, true).path).toContain(" C ");
    expect(floatingPath(box, box).path).not.toMatch(/NaN|Infinity/);
    expect(floatingPath(box, box, true, 1).labelY).toBeLessThan(
      floatingPath(box, box, true).labelY,
    );
  });
});
