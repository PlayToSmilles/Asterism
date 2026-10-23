import { describe, expect, it } from "vitest";
import {
  addEntity,
  connect,
  createProject,
  moveEntities,
  removeEntity,
  updateEntity,
} from "./model";
import {
  emptyDocument,
  validateDocument,
  type DocumentContent,
} from "./document";
import {
  exportProject,
  importProject,
  loadLibrary,
  saveLibrary,
} from "../persistence/persistence";
import { createDemo } from "./demo";

export const formattedDocument: DocumentContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "A lenda" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Ekko",
          marks: [{ type: "bold" }, { type: "italic" }],
        },
        { type: "hardBreak" },
        { type: "text", text: "voltou." },
      ],
    },
    {
      type: "orderedList",
      attrs: { start: 3 },
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Montanha dos Gigantes" }],
            },
            {
              type: "bulletList",
              content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
            },
          ],
        },
      ],
    },
  ],
};
describe("Documento autoral", () => {
  it("cria e atualiza conteúdo estruturado preservando identidade e metadados", () => {
    const p = addEntity(
      createProject(),
      { x: 10, y: 20 },
      "Documento",
      "A lenda de Ekko",
    );
    const entity = p.entities[0];
    expect(entity.document).toEqual(emptyDocument());
    const edited = updateEntity(p, entity.id, { document: formattedDocument });
    expect(edited.entities[0]).toEqual({
      ...entity,
      document: formattedDocument,
    });
    expect(p.entities[0].document).toEqual(emptyDocument());
  });
  it("move e exclui Documento, preservando relações e removendo apenas incidentes", () => {
    let p = addEntity(createDemo(), { x: -30, y: 200 }, "Documento");
    const id = p.entities.at(-1)!.id;
    p = connect(
      connect(connect(p, id, "nyvorn-ekko"), id, id),
      id,
      "nyvorn-ekko",
    );
    const moved = moveEntities(p, [{ id, position: { x: 500, y: -100 } }]);
    expect(moved.relations).toBe(p.relations);
    expect(moved.entities.at(-1)!.document).toBe(p.entities.at(-1)!.document);
    expect(removeEntity(moved, id).relations).toEqual(createDemo().relations);
  });
  it("preserva todo o texto, formato, IDs, posições e relações no JSON e armazenamento local", () => {
    let p = addEntity(createDemo(), { x: 30, y: -70 }, "Documento");
    p = updateEntity(p, p.entities.at(-1)!.id, { document: formattedDocument });
    p = connect(p, p.entities.at(-1)!.id, "nyvorn-ekko");
    expect(importProject(exportProject(p))).toEqual(p);
    let raw = "";
    saveLibrary(
      {
        setItem: (_, value) => {
          raw = value;
        },
      },
      { projects: [p] },
    );
    expect(loadLibrary({ getItem: () => raw }).projects[0]).toEqual(p);
    expect(importProject(exportProject(createDemo()))).toEqual(
      expect.objectContaining({
        entities: expect.arrayContaining([
          expect.not.objectContaining({ category: "Documento" }),
        ]),
      }),
    );
  });
  it("conecta documentos entre si sem propriedade exclusiva sobre outro elemento", () => {
    let p = addEntity(
      addEntity(createProject(), { x: 0, y: 0 }, "Documento"),
      { x: 400, y: 0 },
      "Documento",
    );
    const [a, b] = p.entities;
    p = connect(connect(p, a.id, b.id), b.id, a.id);
    expect(importProject(exportProject(p)).relations).toEqual(p.relations);
    expect(removeEntity(p, a.id).entities).toEqual([b]);
    expect(removeEntity(p, a.id).relations).toEqual([]);
  });
  it.each([
    undefined,
    { type: "doc", content: [] },
    {
      type: "doc",
      content: [{ type: "html", text: "<script>bad()</script>" }],
    },
    { type: "doc", content: [{ type: "heading", attrs: { level: 6 } }] },
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "link",
              marks: [{ type: "link", attrs: { href: "javascript:bad()" } }],
            },
          ],
        },
      ],
    },
    {
      type: "doc",
      content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
    },
    {
      type: "doc",
      content: [
        {
          type: "orderedList",
          attrs: { start: -1 },
          content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
        },
      ],
    },
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "a".repeat(200_001) }],
        },
      ],
    },
  ])("rejeita conteúdo incompatível sem substituir o projeto: %j", (value) => {
    const p = addEntity(createProject(), { x: 0, y: 0 }, "Documento");
    const original = exportProject(p);
    const invalid = JSON.parse(original);
    invalid.entities[0].document = value;
    expect(() => importProject(JSON.stringify(invalid))).toThrow("Documento");
    expect(exportProject(p)).toBe(original);
  });
  it("rejeita profundidade e quantidade excessivas, descarta atributos externos", () => {
    let nested: unknown = { type: "paragraph" };
    for (let i = 0; i < 8; i++)
      nested = {
        type: "bulletList",
        content: [
          { type: "listItem", content: [{ type: "paragraph" }, nested] },
        ],
      };
    expect(() =>
      validateDocument({ type: "doc", content: [nested] }),
    ).toThrow();
    expect(() =>
      validateDocument({
        type: "doc",
        content: Array.from({ length: 10_001 }, () => ({ type: "paragraph" })),
      }),
    ).toThrow();
    expect(
      validateDocument({
        type: "doc",
        onclick: "bad()",
        content: [{ type: "paragraph", unknown: "bad" }],
      }),
    ).toEqual(emptyDocument());
    expect(
      validateDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "<script>literal</script>" }],
          },
        ],
      }).content[0].content![0].text,
    ).toBe("<script>literal</script>");
  });
});
