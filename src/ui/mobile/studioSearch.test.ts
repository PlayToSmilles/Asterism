import { describe, expect, it } from "vitest";
import { findEntities } from "./studioSearch";
import { addEntity, createProject, updateEntity } from "../../domain/model";

function fixture() {
  let project = addEntity(
    createProject("Busca"),
    { x: 10, y: 20 },
    "Facção",
    "Ordem da Agulha",
  );
  project = updateEntity(project, project.entities[0].id, {
    description: "Guardiões do retorno",
  });
  return addEntity(project, { x: 30, y: 40 }, "Documento", "Crônica do retorno")
    .entities;
}
describe("mobile library search", () => {
  it("combines normalized words across title, category and description", () => {
    const entities = fixture();
    expect(findEntities(entities, " FACCAO   guardioes agulha ")).toEqual([
      entities[0],
    ]);
    expect(findEntities(entities, "retorno ausente")).toEqual([]);
  });
  it("applies category and query together, including the writing view", () => {
    const entities = fixture();
    expect(findEntities(entities, "retorno", "Documento")).toEqual([
      entities[1],
    ]);
    expect(findEntities(entities, "agulha", "Documento")).toEqual([]);
  });
  it("keeps order, identities and the persistent input untouched", () => {
    const entities = fixture();
    const before = JSON.stringify(entities);
    const found = findEntities(entities, "  ");
    expect(found).toEqual(entities);
    expect(found[0]).toBe(entities[0]);
    expect(JSON.stringify(entities)).toBe(before);
  });
});
