// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { createDemo } from "../../domain/demo";
import { moveEntities } from "../../domain/model";
import { reconcileNodes } from "./canvasState";
import { forceLayout } from "./forceLayout";
import { cardSize, zoomDetail, semanticBox } from "./cardPresentation";

describe("prévia física finita", () => {
  it("prévia/cancelamento preservam dados; aplicar confirma somente posições", async () => {
    const p = createDemo();
    const before = JSON.stringify(p);
    const nodes = reconcileNodes([], p.entities, null);
    const positions = (await forceLayout(nodes, p.relations, new AbortController().signal))!;
    expect(JSON.stringify(p)).toBe(before);
    const preview = reconcileNodes(nodes, p.entities, null, positions);
    expect(reconcileNodes(preview, p.entities, null).map(n => n.position)).toEqual(p.entities.map(e => e.position));
    const applied = moveEntities(p, [...positions].map(([id, position]) => ({ id, position })));
    expect(applied.relations).toBe(p.relations);
    for (const entity of applied.entities) {
      expect(entity.position).toEqual(positions.get(entity.id));
      expect({ ...entity, position: undefined }).toEqual({ ...p.entities.find(e => e.id === entity.id), position: undefined });
    }
    for (let i = 0; i < preview.length; i++) for (let j = i + 1; j < preview.length; j++) {
      const a = preview[i], b = preview[j];
      const sa = cardSize(a.data.entity.category), sb = cardSize(b.data.entity.category);
      expect(a.position.x + sa.width <= b.position.x || b.position.x + sb.width <= a.position.x ||
        a.position.y + sa.height <= b.position.y || b.position.y + sb.height <= a.position.y).toBe(true);
    }
  });
  it("cancela antes e durante a simulação", async () => {
    const p = createDemo(), signal = new AbortController();
    signal.abort();
    expect(await forceLayout([], [], signal.signal)).toBe(null);
    const running = new AbortController();
    const result = forceLayout(reconcileNodes([], p.entities, null), p.relations, running.signal);
    running.abort();
    expect(await result).toBe(null);
  });
  it("zoom semântico altera contorno visual sem mudar a caixa medida", () => {
    expect([0.1, 0.5, 1].map(zoomDetail)).toEqual(["symbol", "compact", "full"]);
    const box = { ...cardSize("Personagem"), x: 10, y: 20, category: "Personagem" as const };
    const compact = semanticBox(box, "symbol");
    expect(compact.x + compact.width / 2).toBe(box.x + box.width / 2);
    expect(box.width).toBe(228);
    expect(compact.shape).toBe("circle");
  });
});
