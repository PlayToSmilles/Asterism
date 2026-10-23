// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { createDemo } from "../../domain/demo";
import { canvasFocus, focusViewport } from "./canvasFocus";

describe("foco transitório do canvas", () => {
  it("realça somente relações incidentes e seus elementos sem alterar dados", () => {
    const project = createDemo();
    const before = JSON.stringify(project);
    const id = project.entities[0].id;
    const focus = canvasFocus(project, id, null);
    expect([...focus.edges]).toEqual(project.relations.filter(r => r.sourceId === id || r.targetId === id).map(r => r.id));
    expect(focus.nodes.has(id)).toBe(true);
    expect(JSON.stringify(project)).toBe(before);
  });
  it("foca os dois endpoints de uma relação preservando a seleção de origem", () => {
    const project = createDemo();
    const r = project.relations[0];
    const focus = canvasFocus(project, r.sourceId, r.id);
    expect([...focus.nodes]).toEqual([r.sourceId, r.targetId]);
    expect([...focus.edges]).toEqual([r.id]);
    expect(canvasFocus(project, r.id, null).relationId).toBe(r.id);
    expect(canvasFocus(project, null, "removida").nodes.size).toBe(0);
    expect(canvasFocus(project, r.sourceId, null).relationId).toBe(null);
  });
  it("enquadra os endpoints na área livre do inspector e da navegação", () => {
    const bounds = { x: -400, y: 800, width: 1600, height: 500 };
    const view = focusViewport(bounds, 1280, 800, 110, 390);
    const x = bounds.x * view.zoom + view.x;
    const y = bounds.y * view.zoom + view.y;
    expect(x).toBeGreaterThanOrEqual(110);
    expect(x + bounds.width * view.zoom).toBeLessThanOrEqual(890);
    expect(y).toBeGreaterThanOrEqual(60);
    expect(y + bounds.height * view.zoom).toBeLessThanOrEqual(740);
    expect(view.zoom).toBeLessThanOrEqual(1);
  });
  it("permite enquadrar relações distantes em grafos grandes", () => {
    const bounds = { x: 0, y: 0, width: 4700, height: 3800 };
    const view = focusViewport(bounds, 1280, 800, 110, 390);
    expect(view.zoom).toBeLessThan(0.2);
    const belowChrome = focusViewport(bounds, 1280, 800, 110, 390, 220);
    expect(bounds.y * belowChrome.zoom + belowChrome.y).toBeGreaterThanOrEqual(220);
    expect(bounds.width * view.zoom + view.x).toBeLessThan(890);
    expect(bounds.height * view.zoom + view.y).toBeLessThan(740);
  });
  it("aproxima a leitura de categorias preservando margens dos controles", () => {
    const bounds = { x: 0, y: 0, width: 1008, height: 710 };
    const before = JSON.stringify(bounds);
    const regular = focusViewport(bounds, 1280, 720, 340, 24, 24);
    const category = focusViewport(bounds, 1280, 720, 340, 24, 24, .09, 140);
    expect(focusViewport(bounds, 1280, 720, 340, 24, 24, .09).zoom).toBeGreaterThan(regular.zoom);
    expect(category.x).toBeGreaterThanOrEqual(340);
    expect(category.y).toBeGreaterThanOrEqual(24);
    expect(bounds.width * category.zoom + category.x).toBeLessThanOrEqual(1256);
    expect(bounds.height * category.zoom + category.y).toBeLessThanOrEqual(580);
    expect(JSON.stringify(bounds)).toBe(before);
  });
});
