// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { isValidImageUrl } from "./imageUrl";
import { addEntity, createProject, updateEntity } from "./model";

describe("referência de imagem", () => {
  it.each([
    "https://example.com/image.jpg",
    "http://localhost:5173/image.png",
    "https://example.com/a?size=cover#preview",
  ])("aceita URL absoluta HTTP/HTTPS: %s", (url) => {
    expect(isValidImageUrl(url)).toBe(true);
  });
  it.each([
    undefined,
    null,
    42,
    "",
    " ",
    "/image.png",
    "example.com/a.jpg",
    "javascript:alert(1)",
    "data:image/png;base64,abc",
    "file:///photo.png",
    "ftp://example.com/a",
    "https://",
    "http:example.com",
    "https://example.com/a b",
    " https://example.com/a",
    `https://example.com/${"a".repeat(2048)}`,
  ])("rejeita referência inválida: %s", (url) => {
    expect(isValidImageUrl(url)).toBe(false);
  });
  it("adiciona, substitui e remove imagem sem mudar ID, categoria ou posição", () => {
    const original = addEntity(createProject(), { x: 120, y: 80 });
    const entity = original.entities[0];
    const withImage = updateEntity(original, entity.id, {
      imageUrl: "https://example.com/one.jpg",
    });
    const edited = updateEntity(withImage, entity.id, {
      imageUrl: "https://example.com/two.jpg",
    });
    expect(edited.entities[0]).toEqual({
      ...entity,
      imageUrl: "https://example.com/two.jpg",
    });
    const removed = updateEntity(edited, entity.id, { imageUrl: undefined });
    expect(removed.entities[0]).toMatchObject(entity);
    expect(removed.entities[0].imageUrl).toBeUndefined();
    expect(original.entities[0]).not.toHaveProperty("imageUrl");
  });
});
