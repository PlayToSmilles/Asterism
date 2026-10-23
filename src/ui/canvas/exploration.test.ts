import { describe, expect, it } from "vitest";
import { createDemo } from "../../domain/demo";
import { visibleElements, neighborhoodPositions, categoryGroups, categoryPositions } from "./exploration";
import { reconcileNodes } from "./canvasState";

describe("exploração transitória", () => {
  it("entra e sai da vizinhança preservando posições, conteúdo e medidas", () => {
    const p = createDemo();
    const before = JSON.stringify(p);
    const original = reconcileNodes([], p.entities, null).map(n => ({ ...n, measured: { width: 248, height: 236 } }));
    const focused = reconcileNodes(original, p.entities, p.entities[0].id,
      neighborhoodPositions(p, p.entities[0].id), visibleElements(p, { kind: "focus", id: p.entities[0].id }, null));
    const restored = reconcileNodes(focused, p.entities, null);
    expect(restored.map(n => n.position)).toEqual(p.entities.map(e => e.position));
    expect(focused[0].measured).toBe(original[0].measured);
    expect(JSON.stringify(p)).toBe(before);
  });
  it("revela extremos de uma relação consultada fora da categoria", () => {
    const p = createDemo();
    const r = p.relations[0];
    const visible = visibleElements(p, { kind: "category", category: "Documento" }, r.id);
    expect(visible.has(r.sourceId) && visible.has(r.targetId)).toBe(true);
    expect(p.relations).toHaveLength(3);
  });
  it("agrega cada relação uma vez, incluindo paralelas, tipos e auto-relações", () => {
    const p = createDemo();
    const cross = p.relations.find(r => p.entities.find(e => e.id === r.sourceId)!.category !== p.entities.find(e => e.id === r.targetId)!.category)!;
    p.relations = [
      { ...cross, id: "one", kind: "reciprocal" },
      { ...cross, id: "two", kind: "associative" },
      { id: "self", sourceId: p.entities[0].id, targetId: p.entities[0].id, label: "reflete" },
    ];
    const before = JSON.stringify(p);
    const result = categoryGroups(p);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].count).toBe(2);
    expect(result.links[0].kinds).toEqual({ directional: 0, reciprocal: 1, associative: 1 });
    expect(result.groups.reduce((sum, g) => sum + g.internal, 0)).toBe(1);
    for (const group of result.groups) {
      const ids = visibleElements(p, { kind: "category", category: group.category }, null);
      expect(ids.size).toBe(group.count);
      expect(categoryPositions(p, group.category).size).toBe(group.count);
    }
    expect(JSON.stringify(p)).toBe(before);
  });
});
