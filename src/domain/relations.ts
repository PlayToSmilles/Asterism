// SPDX-License-Identifier: MPL-2.0
import type { Entity, Project, Relation, RelationKind } from "./model";

export const getRelationKind = (relation: Relation): RelationKind =>
  relation.kind ?? "directional";

// Every incident relation to a Document is an explicit link. Labels are free
// text, so never infer ownership or relevance by matching words in a label.
export function linkedDocuments(project: Project, entityId: string): Entity[] {
  const ids = new Set<string>();
  for (const relation of project.relations) {
    if (relation.sourceId === entityId) ids.add(relation.targetId);
    if (relation.targetId === entityId) ids.add(relation.sourceId);
  }
  return project.entities.filter(
    (entity) =>
      entity.id !== entityId &&
      entity.category === "Documento" &&
      ids.has(entity.id),
  );
}
