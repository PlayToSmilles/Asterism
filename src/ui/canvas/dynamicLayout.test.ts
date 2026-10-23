import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemo } from "../../domain/demo";
import { moveEntities } from "../../domain/model";
import { exportProject, importProject } from "../../persistence/persistence";
import { reconcileNodes } from "./canvasState";
import { createDynamicLayout } from "./dynamicLayout";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("física interativa transitória", () => {
  it("inicia desligada, esfria até parar, pausa e libera seus frames", () => {
    const p = createDemo(), publish = vi.fn(), status = vi.fn();
    const engine = createDynamicLayout(reconcileNodes([], p.entities, null), p.relations, "symbol", publish, status);
    vi.advanceTimersByTime(1000);
    expect(publish).not.toHaveBeenCalled();
    expect(engine.enabled).toBe(false);
    engine.setEnabled(true);
    vi.advanceTimersByTime(6000);
    expect(status).toHaveBeenLastCalledWith("settled");
    const calls = publish.mock.calls.length;
    vi.advanceTimersByTime(3000);
    expect(publish).toHaveBeenCalledTimes(calls);
    engine.setEnabled(false);
    const frozen = [...engine.snapshot()];
    vi.advanceTimersByTime(1000);
    expect([...engine.snapshot()]).toEqual(frozen);
    expect(status).toHaveBeenLastCalledWith("paused");
    engine.setEnabled(true);
    engine.dispose();
    const disposedCalls = publish.mock.calls.length;
    vi.advanceTimersByTime(5000);
    expect(publish).toHaveBeenCalledTimes(disposedCalls);
  });
  it("fixa o nó sob a mão, move seus vizinhos e estabiliza após soltar", () => {
    const p = createDemo(), status = vi.fn();
    const engine = createDynamicLayout(reconcileNodes([], p.entities, null), p.relations, "symbol", () => {}, status);
    engine.setEnabled(true);
    vi.advanceTimersByTime(6000);
    const id = p.entities[0].id, before = engine.snapshot();
    const held = { x: before.get(id)!.x + 400, y: before.get(id)!.y + 100 };
    engine.pin(id, held);
    vi.advanceTimersByTime(400);
    expect(engine.snapshot().get(id)).toEqual(held);
    expect(p.entities.some(e => e.id !== id && JSON.stringify(engine.snapshot().get(e.id)) !== JSON.stringify(before.get(e.id)))).toBe(true);
    engine.release(id);
    vi.advanceTimersByTime(6000);
    expect(status).toHaveBeenLastCalledWith("settled");
    engine.dispose();
  });
  it("descarta exatamente o layout anterior e aplica somente posições com round-trip JSON", () => {
    const p = createDemo(), before = exportProject(p);
    const nodes = reconcileNodes([], p.entities, null);
    const engine = createDynamicLayout(nodes, p.relations, "symbol", () => {}, () => {});
    engine.setEnabled(true);
    vi.advanceTimersByTime(6000);
    engine.setEnabled(false);
    const positions = engine.snapshot();
    const preview = reconcileNodes(nodes, p.entities, null, positions);
    expect(reconcileNodes(preview, p.entities, null).map(n => n.position)).toEqual(p.entities.map(e => e.position));
    expect(exportProject(p)).toBe(before);
    const applied = moveEntities(p, [...positions].map(([id, position]) => ({ id, position })));
    expect(applied.relations).toBe(p.relations);
    expect(applied.entities.map(e => ({ ...e, position: undefined }))).toEqual(p.entities.map(e => ({ ...e, position: undefined })));
    expect(importProject(exportProject(applied))).toEqual(applied);
    engine.dispose();
  });
});
