// SPDX-License-Identifier: MPL-2.0
import { expect, it } from "vitest";
import type { Entity } from "../../domain/model";
import { collectionEntities } from "./collectionOrdering";

it("ordena a categoria para leitura, preservando referências e a ordem do universo", () => {
  const entity = (id: string, title: string, category: Entity["category"]): Entity => ({ id, title, category, description: "", position: { x: 4, y: 7 } });
  const entities = [entity("a", "Documento 10", "Documento"), entity("b", "Outro", "Facção"), entity("c", "Documento 2", "Documento")];
  const result = collectionEntities(entities, "Documento");
  expect(result.map(item => item.id)).toEqual(["c", "a"]);
  expect(result[0]).toBe(entities[2]);
  expect(entities.map(item => item.id)).toEqual(["a", "b", "c"]);
  expect(collectionEntities(entities, "Magia")).toEqual([]);
});

