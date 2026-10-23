import { describe, expect, it } from "vitest";
import {
  addEntity,
  connect,
  createProject,
  removeEntity,
  removeRelation,
  updateEntity,
  updateRelation,
} from "./model";
import { createDemo } from "./demo";
describe("operações do universo", () => {
  it("cria projetos independentes e cards com IDs estáveis durante a edição", () => {
    const p = addEntity(createProject(" Mundo "), { x: 30, y: -50 });
    const id = p.entities[0].id;
    const edited = updateEntity(p, id, {
      title: "Ekko",
      position: { x: 50, y: 60 },
    });
    expect(edited.entities[0]).toMatchObject({
      id,
      title: "Ekko",
      position: { x: 50, y: 60 },
    });
    expect(p.entities[0].title).toBe("Nova ideia");
    expect(p.name).toBe("Mundo");
    expect(createProject().id).not.toBe(p.id);
  });
  it("conecta, edita rótulo e impede destinos ausentes", () => {
    const p = createDemo();
    const [a, b] = p.entities;
    expect(connect(p, a.id, a.id).relations.at(-1)).toMatchObject({
      sourceId: a.id,
      targetId: a.id,
    });
    expect(connect(p, a.id, "ausente")).toBe(p);
    expect(connect(p, a.id, b.id).relations).toHaveLength(
      p.relations.length + 1,
    );
    const next = connect(p, b.id, a.id);
    const relation = next.relations.at(-1)!;
    expect(
      updateRelation(next, relation.id, "protege").relations.at(-1),
    ).toEqual({ ...relation, label: "protege" });
    expect(removeRelation(next, relation.id).relations).toEqual(p.relations);
  });
  it("exclui todas as conexões incidentes e preserva as demais", () => {
    const p = createDemo();
    const next = removeEntity(p, "nyvorn-ekko");
    expect(next.entities).toHaveLength(3);
    expect(next.relations.map((r) => r.id)).toEqual(["nyvorn-r3"]);
    expect(p.entities).toHaveLength(4);
  });
  it("a demonstração não contamina um projeto em branco", () => {
    const demo = createDemo();
    const blank = createProject();
    expect(blank.entities).toEqual([]);
    expect(blank.relations).toEqual([]);
    expect(blank.kind).toBe("user");
    expect(demo.kind).toBe("demo");
    expect(createDemo().id).not.toBe(demo.id);
  });
});
