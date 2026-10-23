import { describe, expect, it } from "vitest";
import { createDemo } from "../domain/demo";
import {
  exportProject,
  importProject,
  loadLibrary,
  saveLibrary,
  validateProject,
} from "./persistence";
describe("persistência e fronteira de importação", () => {
  it("salva câmera afastada e preserva dados, mantendo limites de zoom", () => {
    const project = { ...createDemo(), viewport: { x: 100, y: -80, zoom: 0.05 } };
    expect(importProject(exportProject(project))).toEqual(project);
    expect(() => validateProject({ ...project, viewport: { ...project.viewport, zoom: 0.049 } })).toThrow();
  });
  it("mantém projetos antigos sem imagem e não introduz campos visuais", () => {
    const old = createDemo();
    const imported = importProject(JSON.stringify(old));
    expect(imported).toEqual(old);
    expect(imported.entities[0]).not.toHaveProperty("imageUrl");
  });
  it("preserva URLs de imagem no JSON e na biblioteca local", () => {
    const project = createDemo();
    project.entities[0].imageUrl = "https://example.com/ekko.jpg?size=large";
    project.entities[1].imageUrl = "http://example.com/smiley.png";
    expect(importProject(exportProject(project))).toEqual(project);
    let raw = "";
    const storage = {
      setItem: (_key: string, value: string) => {
        raw = value;
      },
      getItem: () => raw,
    };
    saveLibrary(storage, { projects: [project] });
    expect(loadLibrary(storage).projects[0]).toEqual(project);
    project.entities[0].imageUrl = undefined;
    expect(
      importProject(exportProject(project)).entities[0],
    ).not.toHaveProperty("imageUrl");
  });
  it.each([
    null,
    123,
    "",
    "javascript:alert(1)",
    "data:image/svg+xml,abc",
    "/photo.png",
    "https://",
    `https://example.com/${"a".repeat(2048)}`,
  ])(
    "rejeita imagem inválida na importação sem modificar o original: %s",
    (imageUrl) => {
      const project = createDemo();
      const before = exportProject(project);
      const invalid = {
        ...project,
        entities: project.entities.map((e, i) =>
          i === 0 ? { ...e, imageUrl } : e,
        ),
      };
      expect(() => importProject(JSON.stringify(invalid))).toThrow();
      expect(exportProject(project)).toBe(before);
    },
  );
  it("preserva IDs, posições, relações e câmera no round-trip JSON", () => {
    const p = createDemo();
    expect(importProject(exportProject(p))).toEqual(p);
  });
  it.each([
    ["versão", (p: ReturnType<typeof createDemo>) => ({ ...p, version: 2 })],
    [
      "tipo do projeto",
      (p: ReturnType<typeof createDemo>) => ({ ...p, kind: ["user"] }),
    ],
    [
      "colisão de IDs entre card e relação",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        relations: [{ ...p.relations[0], id: p.entities[0].id }],
      }),
    ],
    [
      "ID duplicado",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        entities: [...p.entities, p.entities[0]],
      }),
    ],
    [
      "relação órfã",
      (p: ReturnType<typeof createDemo>) => ({ ...p, entities: [] }),
    ],
    [
      "categoria",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        entities: [{ ...p.entities[0], category: "Outra" }],
      }),
    ],
    [
      "posição infinita",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        entities: [{ ...p.entities[0], position: { x: Infinity, y: 0 } }],
      }),
    ],
    [
      "zoom",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        viewport: { x: 0, y: 0, zoom: 0 },
      }),
    ],
    [
      "título vazio",
      (p: ReturnType<typeof createDemo>) => ({
        ...p,
        entities: [{ ...p.entities[0], title: " " }],
      }),
    ],
  ])("rejeita %s sem alterar o projeto original", (_, corrupt) => {
    const p = createDemo();
    const before = exportProject(p);
    expect(() => validateProject(corrupt(p))).toThrow();
    expect(exportProject(p)).toBe(before);
  });
  it("rejeita JSON malformado e arquivos acima do limite", () => {
    expect(() => importProject("{")).toThrow("malformado");
    expect(() => importProject(" ".repeat(5_000_001))).toThrow("grande");
  });
  it("descarta campos desconhecidos", () => {
    expect(
      validateProject({ ...createDemo(), unexpected: "ignore" }),
    ).not.toHaveProperty("unexpected");
  });
  it("lê e grava a biblioteca e propaga falhas de armazenamento", () => {
    let raw: string | null = null;
    const storage = {
      getItem: () => raw,
      setItem: (_key: string, value: string) => {
        raw = value;
      },
    };
    expect(loadLibrary(storage).projects).toEqual([]);
    const library = { projects: [createDemo()] };
    saveLibrary(storage, library);
    expect(loadLibrary(storage)).toEqual(library);
    expect(() =>
      saveLibrary(
        {
          setItem: () => {
            throw new Error("Quota");
          },
        },
        library,
      ),
    ).toThrow("Quota");
    raw = "{";
    expect(() => loadLibrary(storage)).toThrow();
  });
});
