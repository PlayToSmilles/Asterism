// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { createProject, type Category, type Entity, type Project } from "../../domain/model";
import { buildSearchIndex, fold, highlightRanges, searchUniverse } from "./search";
import { searchDestination } from "./searchNavigation";

const entity = (id: string, title: string, category: Category = "Ideia", description = ""): Entity => ({ id, title, category, description, position: { x: 40, y: 60 } });
function project(entities: Entity[]): Project { return { ...createProject("Busca"), id: "universe", entities }; }

describe("pesquisa local", () => {
  it("prioriza título exato, prefixo, ocorrência, categoria, texto e relação", () => {
    const p = project([entity("exact", "Magia"), entity("prefix", "Magia antiga"), entity("contains", "A magia do retorno"),
      entity("category", "Centelha", "Magia"), entity("text", "Agulha", "Artefato", "Contém magia")]);
    p.relations = [{ id: "relation", sourceId: "exact", targetId: "text", label: "magia" }];
    expect(searchUniverse(buildSearchIndex(p), "magia").results.map(r => r.id)).toEqual(["exact", "prefix", "contains", "category", "text", "relation"]);
  });
  it("ignora caixa e acentos, permite termos em campos diferentes e não inventa vizinhos", () => {
    const p = project([entity("star", "Áuralis", "Local", "Sistema de Aurélis"), entity("person", "Ekko", "Personagem")]);
    const index = buildSearchIndex(p);
    expect(searchUniverse(index, "aUrAlIs").results[0].id).toBe("star");
    expect(searchUniverse(index, "local aurelis").results[0].id).toBe("star");
    expect(searchUniverse(index, "Ekko Aurélis").total).toBe(0);
    expect(fold("Facção")).toBe("faccao");
  });
  it("pesquisa texto estruturado contínuo e devolve trecho curto de documentos longos", () => {
    const doc = entity("doc", "Crônica", "Documento");
    doc.document = { type: "doc", content: [{ type: "paragraph", content: [
      { type: "text", text: "Início. ".repeat(1500) }, { type: "text", text: "Ek", marks: [{ type: "bold" }] }, { type: "text", text: "ko atravessou o limiar." },
    ] }] };
    const p = project([doc]);
    const result = searchUniverse(buildSearchIndex(p), "ekko").results[0];
    expect(result.kind).toBe("document"); expect(result.snippet).toContain("Ekko atravessou");
    expect(result.snippet.length).toBeLessThanOrEqual(182);
    expect(searchUniverse(buildSearchIndex(p), "ekko o").results[0].snippet).toContain("Ekko");
  });
  it("distingue homônimos por ID, respeita universo dos PDFs e pesquisa somente metadados", () => {
    const p = project([entity("one-12345678", "Ekko", "Personagem"), entity("two-87654321", "Ekko", "Personagem")]);
    const refs = [{ id: "pdf", projectId: p.id, name: "Aurélis.pdf", size: 1024, updatedAt: 1 },
      { id: "other", projectId: "other-universe", name: "Aurélis.pdf", size: 1024, updatedAt: 1 }];
    const index = buildSearchIndex(p, refs), matches = searchUniverse(index, "ekko").results;
    expect(matches).toHaveLength(2); expect(matches[0].context).not.toBe(matches[1].context);
    expect(searchUniverse(index, "aurelis").results.map(r => r.id)).toEqual(["pdf"]);
    expect(searchUniverse(index, "conteúdo não indexado").total).toBe(0);
  });
  it("limita a lista, conta todos os resultados e reflete renomeação/remoção sem alterar o modelo", () => {
    const p = project(Array.from({ length: 80 }, (_, i) => entity(String(i), `Limiar ${i}`)));
    const before = JSON.stringify(p), old = buildSearchIndex(p);
    expect(searchUniverse(old, " ").total).toBe(0);
    expect(searchUniverse(old, "ausente").total).toBe(0);
    expect(searchUniverse(old, "limiar").total).toBe(80);
    expect(searchUniverse(old, "limiar").results).toHaveLength(60);
    expect(JSON.stringify(p)).toBe(before);
    const changed = { ...p, entities: [{ ...p.entities[0], title: "Novo portal" }] };
    expect(searchUniverse(buildSearchIndex(changed), "limiar").total).toBe(0);
    expect(searchUniverse(buildSearchIndex(changed), "portal").total).toBe(1);
  });
  it("mantém acentos e offsets UTF-16 originais no destaque, sem HTML", () => {
    expect(highlightRanges("🌙 Áuralis", "aur")).toEqual([[3, 6]]);
    expect(highlightRanges("Facção".normalize("NFD"), "faccao")).toEqual([[0, 8]]);
    expect(highlightRanges("Facção".normalize("NFD"), "facc")).toEqual([[0, 5]]);
    expect(highlightRanges("Ekko", "Ek Ekko")).toEqual([[0, 4]]);
    expect(highlightRanges("<script>Ekko</script>", "ekko")).toEqual([[8, 12]]);
    expect(highlightRanges("Ekko assume o corpo de Eron", "assume o corpo de")).toEqual([[5, 22]]);
  });
});

describe("destinos da busca", () => {
  it("usa a categoria atual e abre documentos diretamente, preservando posições", () => {
    const p = project([entity("ekko", "Ekko", "Personagem")]);
    const result = searchUniverse(buildSearchIndex(p), "Ekko").results[0];
    const changed = { ...p, entities: [{ ...p.entities[0], category: "Magia" as const }] };
    const before = JSON.stringify(changed);
    expect(searchDestination(changed, result)).toMatchObject({ kind: "canvas", mode: { kind: "category", category: "Magia" }, ids: ["ekko"], selected: "ekko" });
    expect(JSON.stringify(changed)).toBe(before);
    expect(searchDestination({ ...changed, entities: [{ ...changed.entities[0], category: "Documento" }] }, result)).toEqual({ kind: "document", id: "ekko" });
    expect(searchDestination({ ...p, entities: [] }, result)).toBeNull();
    expect(searchDestination({ ...p, id: "other" }, result)).toBeNull();
  });
  it("foca a conexão específica e os dois extremos; rejeita relações removidas ou quebradas", () => {
    const p = project([entity("a", "Ekko", "Personagem"), entity("b", "Aurélis", "Local")]);
    p.relations = [{ id: "rel", sourceId: "a", targetId: "b", label: "viaja para" }];
    const result = searchUniverse(buildSearchIndex(p), "viaja").results[0];
    expect(searchDestination(p, result)).toEqual({ kind: "canvas", mode: { kind: "focus", id: "a" }, ids: ["a", "b"], selected: "rel", relationId: "rel" });
    expect(searchDestination({ ...p, relations: [] }, result)).toBeNull();
    expect(searchDestination({ ...p, entities: [p.entities[0]] }, result)).toBeNull();
  });
});
