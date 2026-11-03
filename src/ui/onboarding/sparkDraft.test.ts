// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { addEntity, createProject, removeEntity } from "../../domain/model";
import { exportProject } from "../../persistence/persistence";
import { createSparkDraftStore } from "./sparkDraft";
import { saveSparkIdea } from "./firstSpark";

function storageFixture() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("rascunho temporário da Primeira Faísca", () => {
  it("recupera criação confirmada mesmo se a limpeza do rascunho falhou antes de recarregar", () => {
    const storage = storageFixture(), project = createProject();
    const store = createSparkDraftStore(storage);
    const draft = { ...store.read(project).draft, answer: "Já guardada", inspired: true };
    store.write(project.id, draft);
    const saved = saveSparkIdea(project, draft.answer, "create", null, 1, { x: 0, y: 0 }, draft.operationId);
    const restored = createSparkDraftStore(storage).read(saved.project).draft;
    expect(restored.answer).toBe("");
    expect(restored.currentId).toBe(saved.entityId);
    expect(restored.nextNumber).toBe(2);
    expect(saved.project.entities).toHaveLength(1);
  });
  it("restaura texto exato, contexto e perspectiva após recriar a sessão, sem alterar o JSON", () => {
    const storage = storageFixture(), project = createProject("World");
    const before = exportProject(project);
    const store = createSparkDraftStore(storage);
    const draft = { ...store.read(project).draft, answer: "  Uma ideia\n ", inspired: true, currentId: "elemento", nextNumber: 8,
      scene: "writing" as const, activePath: "origins" as const, referenceUrl: "https://example.test/image.png" };
    draft.paths.origins.answer = "Rascunho de origem";
    draft.paths.inhabitants.answer = "Outro caminho";
    expect(store.write(project.id, draft)).toBe(true);
    expect(createSparkDraftStore(storage).read(project)).toEqual({ draft, warning: "" });
    expect(exportProject(project)).toBe(before);
    expect(exportProject(project)).not.toContain("first-spark");
  });
  it("migra o rascunho anterior para Origens sem apagar a resposta de continuação", () => {
    const storage = storageFixture(), project = addEntity(createProject(), { x: 0, y: 0 }, "Ideia", "Ideia 01", "Núcleo");
    storage.setItem(`asterism.first-spark.v1.${project.id}`, JSON.stringify({ answer: "Resposta pendente", currentId: project.entities[0].id,
      nextNumber: 2, operationId: crypto.randomUUID(), question: 3, freeWriting: true, inspired: true }));
    const draft = createSparkDraftStore(storage).read(project).draft;
    expect(draft.scene).toBe("writing");
    expect(draft.activePath).toBe("origins");
    expect(draft.paths.origins.answer).toBe("Resposta pendente");
    expect(project.entities[0].description).toBe("Núcleo");
  });
  it("conclusão e rascunhos de cada possibilidade sobrevivem ao retorno sem criar entidades", () => {
    const storage = storageFixture(), project = createProject();
    const store = createSparkDraftStore(storage), draft = store.read(project).draft;
    const next = { ...draft, completed: true, paths: { ...draft.paths, consequences: { ...draft.paths.consequences, answer: "Não perder", developed: true } } };
    store.write(project.id, next);
    expect(createSparkDraftStore(storage).read(project).draft).toEqual(next);
    expect(project.entities).toEqual([]);
  });
  it("isola rascunhos por ID, incluindo cópias importadas", () => {
    const store = createSparkDraftStore(storageFixture());
    const a = createProject(), b = { ...a, id: "cópia" };
    store.write(a.id, { ...store.read(a).draft, answer: "Só no original" });
    expect(store.read(b).draft.answer).toBe("");
    expect(store.read(a).draft.answer).toBe("Só no original");
  });
  it("conserva a sequência conhecida depois de excluir o último título e recarregar", () => {
    const storage = storageFixture();
    const project = addEntity(createProject(), { x: 0, y: 0 }, "Ideia", "Ideia 09");
    const store = createSparkDraftStore(storage);
    store.write(project.id, store.read(project).draft);
    const empty = removeEntity(project, project.entities[0].id);
    expect(createSparkDraftStore(storage).read(empty).draft.nextNumber).toBe(10);
  });
  it("preserva o contexto removido para a UI avisar, sem recriar o elemento", () => {
    const store = createSparkDraftStore(storageFixture()), project = createProject();
    store.write(project.id, { ...store.read(project).draft, currentId: "excluído", answer: "Não perder" });
    expect(store.read(project).draft.currentId).toBe("excluído");
    expect(project.entities).toEqual([]);
  });
  it("falha de storage conserva texto em memória entre navegações e mantém o aviso", () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error("Quota"); } };
    const store = createSparkDraftStore(storage), project = createProject();
    const draft = { ...store.read(project).draft, answer: "Texto preservado" };
    expect(store.write(project.id, draft)).toBe(false);
    expect(store.read(project).draft.answer).toBe("Texto preservado");
    expect(store.read(project).warning).toMatch(/memória/);
    expect(store.needsUnloadWarning()).toBe(true);
  });
  it("valida dados externos e conserva entradas inválidas sem sobrescrevê-las", () => {
    for (const raw of ["{", JSON.stringify({ answer: "a".repeat(4001) }), "null", "[]"]) {
      const storage = storageFixture(), project = createProject();
      storage.setItem(`asterism.first-spark.v1.${project.id}`, raw);
      const { draft, warning } = createSparkDraftStore(storage).read(project);
      expect(draft.answer).toBe("");
      expect(warning).toMatch(/recuperar/);
      expect([...storage.values.values()]).toEqual([raw]);
    }
  });
  it("sem acesso ao sessionStorage, mantém o rascunho em memória com aviso", () => {
    const store = createSparkDraftStore(null), project = createProject();
    expect(store.read(project).warning).toMatch(/memória/);
    const draft = { ...store.read(project).draft, answer: "Ainda aqui" };
    expect(store.write(project.id, draft)).toBe(false);
    expect(store.read(project).draft.answer).toBe("Ainda aqui");
    expect(store.needsUnloadWarning()).toBe(true);
    store.write(project.id, { ...draft, answer: "" });
    expect(store.needsUnloadWarning()).toBe(false);
  });
});
