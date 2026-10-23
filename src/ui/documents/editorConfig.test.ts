import { getSchema } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { documentExtensions } from "./editorConfig";
import { validateDocument } from "../../domain/document";
describe("contrato do editor", () => {
  it("o schema real aceita o formato persistido e seus atributos padrão são validados", () => {
    const schema = getSchema(documentExtensions);
    const doc = schema.nodes.doc.create(null, [
      schema.nodes.heading.create({ level: 2 }, schema.text("A lenda")),
      schema.nodes.paragraph.create(
        null,
        schema.text("Ekko", [
          schema.marks.bold.create(),
          schema.marks.italic.create(),
        ]),
      ),
      schema.nodes.orderedList.create(null, [
        schema.nodes.listItem.create(
          null,
          schema.nodes.paragraph.create(null, schema.text("Retorno")),
        ),
      ]),
    ]);
    doc.check();
    const portable = validateDocument(doc.toJSON());
    const restored = schema.nodeFromJSON(portable);
    restored.check();
    expect(restored.eq(doc)).toBe(true);
    expect(schema.nodes).not.toHaveProperty("image");
    expect(schema.marks).not.toHaveProperty("link");
  });
});
