// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import {
  addEntity,
  connect,
  createProject,
  relationKinds,
  removeRelation,
  setRelationKind,
} from "./model";
import { getRelationKind, linkedDocuments } from "./relations";
import {
  exportProject,
  importProject,
  loadLibrary,
  saveLibrary,
} from "../persistence/persistence";

function projectWithDocument() {
  let project = addEntity(
    createProject("Relações"),
    { x: 0, y: 0 },
    "Personagem",
    "Ekko",
  );
  project = addEntity(
    project,
    { x: 400, y: 0 },
    "Documento",
    "A lenda de Ekko",
  );
  return project;
}
describe("relações semânticas e documentos vinculados", () => {
  it("preserva os três tipos no JSON e no armazenamento, sem geometria transitória", () => {
    let project = projectWithDocument();
    const [a, b] = project.entities;
    for (const kind of relationKinds) {
      project = connect(project, a.id, b.id);
      project = setRelationKind(project, project.relations.at(-1)!.id, kind);
    }
    expect(importProject(exportProject(project))).toEqual(project);
    let raw = "";
    saveLibrary(
      {
        setItem: (_, value) => {
          raw = value;
        },
      },
      { projects: [project] },
    );
    expect(loadLibrary({ getItem: () => raw }).projects[0]).toEqual(project);
    expect(project.relations.map((r) => r.kind)).toEqual(relationKinds);
    expect(Object.keys(project.relations[0]).sort()).toEqual([
      "id",
      "kind",
      "label",
      "sourceId",
      "targetId",
    ]);
  });
  it("aceita relações antigas sem tipo como direcionais sem inferir pelo rótulo", () => {
    let project = projectWithDocument();
    project = connect(project, project.entities[0].id, project.entities[1].id);
    delete project.relations[0].kind;
    project.relations[0].label = "aliança";
    const restored = importProject(exportProject(project));
    expect(getRelationKind(restored.relations[0])).toBe("directional");
    expect(restored).toEqual(project);
  });
  it("rejeita tipo desconhecido ou nulo antes de substituir dados", () => {
    let project = projectWithDocument();
    project = connect(project, project.entities[0].id, project.entities[1].id);
    const before = exportProject(project);
    for (const kind of ["unknown", null]) {
      const invalid = JSON.parse(before);
      invalid.relations[0].kind = kind;
      expect(() => importProject(JSON.stringify(invalid))).toThrow(
        "Projeto inválido",
      );
    }
    expect(exportProject(project)).toBe(before);
  });
  it("deriva documentos nos dois sentidos, elimina duplicatas e acompanha remoção", () => {
    let project = projectWithDocument();
    const [a, doc] = project.entities;
    project = addEntity(project, { x: 800, y: 0 }, "Local");
    project = connect(
      connect(connect(project, a.id, doc.id), doc.id, a.id),
      a.id,
      project.entities[2].id,
    );
    project = setRelationKind(project, project.relations[0].id, "associative");
    project = setRelationKind(project, project.relations[1].id, "reciprocal");
    expect(linkedDocuments(project, a.id)).toEqual([doc]);
    expect(linkedDocuments(project, doc.id)).toEqual([]);
    project = removeRelation(
      removeRelation(project, project.relations[0].id),
      project.relations[1].id,
    );
    expect(linkedDocuments(project, a.id)).toEqual([]);
    expect(project.entities[1]).toBe(doc);
  });
});
