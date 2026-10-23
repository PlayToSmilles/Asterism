import { describe, expect, it, vi } from "vitest";
import { applyNodeChanges, type NodeChange } from "@xyflow/react";
import { createDemo } from "../../domain/demo";
import { updateEntity } from "../../domain/model";
import {
  exportProject,
  importProject,
  loadLibrary,
  saveLibrary,
} from "../../persistence/persistence";
import {
  commitNodeChanges,
  reconcileNodes,
  type CardNode,
} from "./canvasState";

function measuredNodes() {
  const project = createDemo();
  const nodes = applyNodeChanges<CardNode>(
    project.entities.map((entity) => ({
      type: "dimensions",
      id: entity.id,
      dimensions: { width: 252, height: 230 },
    })),
    reconcileNodes([], project.entities, null),
  );
  return { project, nodes };
}

describe("estado visual e confirmação de posições", () => {
  it("preserva medidas e arrasto ao editar imagem e categoria, mantendo os demais nodes", () => {
    const { project, nodes } = measuredNodes();
    const dragging = applyNodeChanges<CardNode>(
      [
        {
          type: "position",
          id: nodes[0].id,
          position: { x: 700, y: 300 },
          dragging: true,
        },
      ],
      nodes,
    );
    const edited = updateEntity(project, nodes[0].id, {
      imageUrl: "https://example.com/portrait.jpg",
      category: "Local",
    });
    const reconciled = reconcileNodes(dragging, edited.entities, null);
    expect(reconciled[0]).toMatchObject({
      measured: { width: 252, height: 230 },
      dragging: true,
      position: { x: 700, y: 300 },
    });
    expect(reconciled[0].data.entity).toBe(edited.entities[0]);
    expect(reconciled[1]).toBe(nodes[1]);
    const resized = applyNodeChanges<CardNode>(
      [
        {
          type: "dimensions",
          id: nodes[0].id,
          dimensions: { width: 314, height: 194 },
        },
      ],
      reconciled,
    );
    expect(resized[0].measured).toEqual({ width: 314, height: 194 });
    expect(
      commitNodeChanges(edited, [
        {
          type: "dimensions",
          id: nodes[0].id,
          dimensions: { width: 314, height: 194 },
        },
      ]),
    ).toBe(edited);
  });
  it("mantém medidas, identidade e referências dos cards não alterados", () => {
    const { project, nodes } = measuredNodes();
    const next = updateEntity(project, nodes[0].id, { title: "Novo título" });
    const reconciled = reconcileNodes(nodes, next.entities, null);
    expect(reconciled[0].measured).toEqual({ width: 252, height: 230 });
    expect(reconciled[0].id).toBe(nodes[0].id);
    expect(reconciled[0].data.entity.title).toBe("Novo título");
    expect(reconciled[1]).toBe(nodes[1]);
    expect(reconciled[1].data).toBe(nodes[1].data);
    expect(reconcileNodes(nodes, project.entities, null)[0]).toBe(nodes[0]);
  });

  it("preserva dimensões e posição em curso ao selecionar ou editar conteúdo", () => {
    const { project, nodes } = measuredNodes();
    const moving = applyNodeChanges<CardNode>(
      [
        {
          type: "position",
          id: nodes[0].id,
          position: { x: 300, y: 400 },
          dragging: true,
        },
      ],
      nodes,
    );
    const edited = updateEntity(project, nodes[0].id, {
      description: "Editado durante o arrasto",
    });
    const next = reconcileNodes(moving, edited.entities, nodes[0].id);
    expect(next[0]).toMatchObject({
      position: { x: 300, y: 400 },
      dragging: true,
      selected: true,
      measured: { width: 252, height: 230 },
    });
    expect(next[0].data.entity.description).toBe("Editado durante o arrasto");
    expect(edited.entities[0].position).toEqual(project.entities[0].position);
  });

  it("não altera nem persiste o modelo em medições, seleção e movimentos intermediários", () => {
    const { project, nodes } = measuredNodes();
    const setItem = vi.fn();
    let current = project;
    for (const changes of [
      [
        {
          type: "dimensions",
          id: nodes[0].id,
          dimensions: { width: 252, height: 250 },
        },
      ],
      [{ type: "select", id: nodes[0].id, selected: true }],
      ...Array.from({ length: 50 }, (_, x) => [
        {
          type: "position" as const,
          id: nodes[0].id,
          position: { x, y: 100 },
          dragging: true,
        },
      ]),
    ] satisfies NodeChange<CardNode>[][]) {
      const next = commitNodeChanges(current, changes);
      // Same identity check used by App.change to decide whether to save.
      if (next !== current) saveLibrary({ setItem }, { projects: [next] });
      expect(next).toBe(project);
      current = next;
    }
    expect(setItem).not.toHaveBeenCalled();
  });

  it("confirma o fim do arrasto sem perder conteúdo, relações ou medidas", () => {
    const { project, nodes } = measuredNodes();
    const latest = updateEntity(project, nodes[0].id, {
      title: "Edição preservada",
    });
    const changes: NodeChange<CardNode>[] = [
      {
        type: "position",
        id: nodes[0].id,
        position: { x: 512, y: -30 },
        dragging: false,
      },
    ];
    const final = commitNodeChanges(latest, changes);
    const visual = reconcileNodes(
      applyNodeChanges(changes, nodes),
      final.entities,
      nodes[0].id,
    );
    expect(final.entities[0]).toMatchObject({
      title: "Edição preservada",
      position: { x: 512, y: -30 },
    });
    expect(final.relations).toBe(project.relations);
    expect(final.entities[1]).toBe(project.entities[1]);
    expect(visual[0].measured).toEqual(nodes[0].measured);
    expect(visual[0].dragging).toBe(false);
    expect(commitNodeChanges(final, changes)).toBe(final);
  });

  it("salva a posição final uma vez e restaura no armazenamento e no JSON, sem metadados visuais", () => {
    const { project, nodes } = measuredNodes();
    const changes: NodeChange<CardNode>[] = [
      {
        type: "position",
        id: nodes[0].id,
        position: { x: 777, y: 222 },
        dragging: false,
      },
    ];
    const final = commitNodeChanges(project, changes);
    let raw = "";
    const storage = {
      setItem: vi.fn((_key: string, value: string) => {
        raw = value;
      }),
      getItem: () => raw,
    };
    saveLibrary(storage, { projects: [final] });
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(loadLibrary(storage).projects[0]).toEqual(final);
    expect(importProject(exportProject(final))).toEqual(final);
    expect(raw).not.toMatch(/measured|dragging|selected/);
  });

  it("suporta movimento pelo teclado e confirma vários cards em um lote", () => {
    const { project, nodes } = measuredNodes();
    const final = commitNodeChanges(project, [
      { type: "position", id: nodes[0].id, position: { x: 0, y: 0 } },
      {
        type: "position",
        id: nodes[1].id,
        position: { x: 10, y: 20 },
        dragging: false,
      },
    ]);
    expect(final.entities[0].position).toEqual({ x: 0, y: 0 });
    expect(final.entities[1].position).toEqual({ x: 10, y: 20 });
    expect(final.entities[2]).toBe(project.entities[2]);
  });

  it("ignora movimentos sem posição ou de IDs ausentes e remove relações incidentes", () => {
    const { project, nodes } = measuredNodes();
    expect(
      commitNodeChanges(project, [
        { type: "position", id: nodes[0].id, dragging: false },
        {
          type: "position",
          id: "ausente",
          position: { x: 1, y: 2 },
          dragging: false,
        },
      ]),
    ).toBe(project);
    const final = commitNodeChanges(project, [
      { type: "remove", id: nodes[0].id },
    ]);
    expect(final.relations.map((r) => r.id)).toEqual(["nyvorn-r3"]);
    expect(
      reconcileNodes(nodes, final.entities, null).map((n) => n.id),
    ).not.toContain(nodes[0].id);
  });
});
