// SPDX-License-Identifier: MPL-2.0
import type { Project } from "../../domain/model";
import type { Exploration } from "../canvas/exploration";
import type { SearchResult } from "./search";

export type SearchDestination = { kind: "document"; id: string } | { kind: "reference"; id: string }
  | { kind: "canvas"; mode: Exploration; ids: string[]; selected: string; relationId?: string };

// Resolve against the current snapshot, never trust a stale result's category.
export function searchDestination(project: Project, result: SearchResult): SearchDestination | null {
  if (result.projectId !== project.id) return null;
  if (result.kind === "reference") return { kind: "reference", id: result.id };
  if (result.kind === "relation") {
    const relation = project.relations.find(r => r.id === result.id);
    if (!relation || ![relation.sourceId, relation.targetId].every(id => project.entities.some(e => e.id === id))) return null;
    return { kind: "canvas", mode: { kind: "focus", id: relation.sourceId }, ids: [relation.sourceId, relation.targetId], selected: relation.id, relationId: relation.id };
  }
  const entity = project.entities.find(e => e.id === result.id);
  if (!entity) return null;
  if (entity.category === "Documento") return { kind: "document", id: entity.id };
  return { kind: "canvas", mode: { kind: "category", category: entity.category }, ids: [entity.id], selected: entity.id };
}
