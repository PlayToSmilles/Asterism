// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { addEntity, connect, createProject, removeEntity, updateEntity } from "../../domain/model";
import { exportProject, importProject } from "../../persistence/persistence";
import { createLibrarySession } from "../../persistence/librarySession";
import { isBlankUniverse, shouldWelcome, saveSparkIdea, nextIdeaNumber } from "./firstSpark";
import { possibilities } from "./possibilities";

describe("primeira faísca", () => {
  const position = { x: 100, y: 100 };
  const first = "No meu mundo pessoas podem viver em Marte.";
  const second = "As pessoas vivem em cidades subterrâneas.";
  it("guarda diretamente Ideia 01 e permite aprofundar sem substituir o texto ou mudar IDs", () => {
    const start = createProject("World");
    const saved = saveSparkIdea(start, first, "create", null, 1, position);
    expect(saved.project.entities[0]).toMatchObject({ title: "Ideia 01", description: first, category: "Ideia", position });
    const deeper = saveSparkIdea(saved.project, second, "deepen", saved.entityId, saved.nextNumber, position);
    expect(deeper.project.entities).toHaveLength(1);
    expect(deeper.project.entities[0]).toEqual({ ...saved.project.entities[0], description: `${first}\n\n${second}` });
    expect(importProject(exportProject(deeper.project))).toEqual(deeper.project);
    expect(saved.project.entities[0].description).toBe(first);
    expect(start.entities).toEqual([]);
  });
  it("cria Ideia 02 independente sem relações e conserva espaços e quebras de linha", () => {
    const saved = saveSparkIdea(createProject(), first, "create", null, 1, position);
    const text = `  ${second}\n\n `;
    const next = saveSparkIdea(saved.project, text, "create", saved.entityId, saved.nextNumber, { x: 400, y: 100 });
    expect(next.project.entities[0]).toBe(saved.project.entities[0]);
    expect(next.project.entities[1]).toMatchObject({ title: "Ideia 02", description: text });
    expect(next.project.relations).toEqual([]);
  });
  it("evita colisões de títulos e preserva a sequência observada após exclusão", () => {
    let project = addEntity(createProject(), position, "Local", "ideia 07");
    project = addEntity(project, position, "Ideia", "Ideia 07");
    const minimum = nextIdeaNumber(project);
    expect(minimum).toBe(8);
    project = removeEntity(project, project.entities[0].id);
    project = removeEntity(project, project.entities[0].id);
    expect(saveSparkIdea(project, first, "create", null, minimum, position).project.entities[0].title).toBe("Ideia 08");
    expect(nextIdeaNumber(addEntity(project, position, "Ideia", "Ideia 9007199254740991"))).toBe(1);
  });
  it("repetir aprofundamento é idempotente e respeita renomeação/reclassificação", () => {
    const saved = saveSparkIdea(createProject(), first, "create", null, 1, position);
    const changed = updateEntity(saved.project, saved.entityId, { title: "Uma possibilidade", category: "Local" });
    const deeper = saveSparkIdea(changed, second, "deepen", saved.entityId, 2, position);
    const repeated = saveSparkIdea(deeper.project, second, "deepen", saved.entityId, 2, position);
    expect(repeated.project).toBe(deeper.project);
    expect(repeated.project.entities[0]).toMatchObject({ title: "Uma possibilidade", category: "Local" });
  });
  it("repetir uma criação confirmada com o mesmo ID de operação não duplica após falha na limpeza do rascunho", () => {
    const operationId = crypto.randomUUID();
    const saved = saveSparkIdea(createProject(), first, "create", null, 1, position, operationId);
    const repeated = saveSparkIdea(importProject(exportProject(saved.project)), first, "create", null, 1, position, operationId);
    expect(repeated.project.entities).toHaveLength(1);
    expect(repeated.entityId).toBe(saved.entityId);
    expect(repeated.nextNumber).toBe(2);
    expect(() => saveSparkIdea(saved.project, second, "create", null, 1, position, operationId)).toThrow(/outro texto/);
  });
  it("não perde texto por limites, vazios ou exclusão do alvo", () => {
    const project = createProject();
    expect(() => saveSparkIdea(project, " \n ", "create", null, 1, position)).toThrow(/Escreva/);
    expect(() => saveSparkIdea(project, "a".repeat(4001), "create", null, 1, position)).toThrow(/4.000/);
    expect(() => saveSparkIdea(project, first, "deepen", "removida", 1, position)).toThrow(/removida/);
    const saved = saveSparkIdea(project, "a".repeat(3990), "create", null, 1, position);
    expect(() => saveSparkIdea(saved.project, second, "deepen", saved.entityId, 2, position)).toThrow(/4.000/);
    expect(saved.project.entities[0].description).toHaveLength(3990);
  });
  it("oferece três caminhos temporários sem adicionar categorias ou gerar conteúdo", () => {
    expect(possibilities.map(p => p.name)).toEqual(["Origens", "Habitantes", "Consequências"]);
    expect(new Set(possibilities.map(p => p.id)).size).toBe(3);
    expect(possibilities.every(p => !p.artwork)).toBe(true);
  });
  it("só conecta uma nova ideia mediante escolha explícita e serializa a referência HTTP", () => {
    const parent = saveSparkIdea(createProject(), first, "create", null, 1, position);
    const child = saveSparkIdea(parent.project, second, "create", parent.entityId, 2, position, crypto.randomUUID(), { connectToSource: true });
    expect(child.project.relations).toHaveLength(1);
    expect(child.project.relations[0]).toMatchObject({ sourceId: parent.entityId, targetId: child.entityId, kind: "associative" });
    expect(child.project.entities[0]).toBe(parent.project.entities[0]);
    const illustrated = saveSparkIdea(createProject(), first, "create", null, 1, position, crypto.randomUUID(), { imageUrl: "https://example.test/art.png" });
    expect(importProject(exportProject(illustrated.project)).entities[0].imageUrl).toBe("https://example.test/art.png");
  });
  it("conexão solicitada não é criada sem origem e URL inválida não produz elemento", () => {
    expect(() => saveSparkIdea(createProject(), first, "create", "missing", 1, position, crypto.randomUUID(), { connectToSource: true })).toThrow(/removida/);
    expect(() => saveSparkIdea(createProject(), first, "create", null, 1, position, crypto.randomUUID(), { imageUrl: "data:image/png,bytes" })).toThrow(/URL/);
  });
  it("repetir confirmação com conexão não duplica ideia nem relação", () => {
    const parent = saveSparkIdea(createProject(), first, "create", null, 1, position);
    const id = crypto.randomUUID();
    const saved = saveSparkIdea(parent.project, second, "create", parent.entityId, 2, position, id, { connectToSource: true });
    const repeated = saveSparkIdea(saved.project, second, "create", parent.entityId, 2, position, id, { connectToSource: true });
    expect(repeated.project).toBe(saved.project);
    expect(repeated.project.entities).toHaveLength(2);
    expect(repeated.project.relations).toHaveLength(1);
  });
  it("acolhe apenas universos criados vazios, sem interromper abertura ou importação", () => {
    const project = createProject();
    expect(isBlankUniverse(project)).toBe(true);
    expect(shouldWelcome(project, "created")).toBe(true);
    expect(shouldWelcome(project, "opened")).toBe(false);
    expect(shouldWelcome(importProject(exportProject(project)), "imported")).toBe(false);
    expect(shouldWelcome(createProject("Demonstração", "demo"), "created")).toBe(false);
    expect(shouldWelcome(addEntity(project, { x: 0, y: 0 }), "created")).toBe(false);
    expect(isBlankUniverse({ ...project, relations: [{ id: "r", sourceId: "a", targetId: "b", label: "exemplo" }] })).toBe(false);
  });

  it("a consulta de acolhimento não grava nem muda o universo", () => {
    const project = createProject("Um começo");
    const before = exportProject(project);
    shouldWelcome(project, "created");
    isBlankUniverse(project);
    expect(exportProject(project)).toBe(before);
  });

  it("cria um elemento com a resposta confirmada e preserva seu conteúdo no JSON", () => {
    const project = createProject("Horizonte");
    const description = "Uma cidade que flutua.\nQuem a mantém no ar?";
    const next = addEntity(project, { x: 120, y: 80 }, "Local", "Cidade suspensa", description);
    expect(project.entities).toHaveLength(0);
    expect(next.entities).toHaveLength(1);
    expect(next.entities[0]).toMatchObject({ title: "Cidade suspensa", category: "Local", description, position: { x: 120, y: 80 } });
    expect(importProject(exportProject(next))).toEqual(next);
    expect(shouldWelcome(next, "created")).toBe(false);
    expect(addEntity(project, { x: 0, y: 0 }).entities[0].description).toBe("");
  });

  it("renomeação pela sessão preserva IDs, elementos, relações e posições ao recarregar", () => {
    let project = addEntity(createProject(), { x: 12, y: 24 });
    project = addEntity(project, { x: 250, y: 150 });
    project = connect(project, project.entities[0].id, project.entities[1].id);
    let saved = "";
    const session = createLibrarySession({ projects: [project] }, { setItem: (_key, value) => { saved = value; } }, () => {});
    session.update(library => ({ projects: library.projects.map(p => ({ ...p, name: "Nome definitivo" })) }));
    const latest = session.getSnapshot().projects[0];
    expect(latest).toEqual({ ...project, name: "Nome definitivo" });
    expect(JSON.parse(saved).projects[0]).toEqual(latest);
    expect(importProject(exportProject(latest))).toEqual(latest);
  });
});
