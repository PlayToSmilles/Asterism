// SPDX-License-Identifier: MPL-2.0
import type { Category, Entity } from "../../domain/model";

export function collectionEntities(entities: readonly Entity[], category: Category): Entity[] {
  return entities.filter(entity => entity.category === category)
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base", numeric: true }));
}
