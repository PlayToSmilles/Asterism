// SPDX-License-Identifier: MPL-2.0
import { categories, type Category, type Position, type Project, type RelationKind } from "../../domain/model";
import { getRelationKind } from "../../domain/relations";
export type LayoutActivity = "idle" | "preview" | "dynamic";

export type Exploration =
  | { kind: "all" }
  | { kind: "universe" }
  | { kind: "category"; category: Category }
  | { kind: "focus"; id: string };

export function visibleElements(project: Project, mode: Exploration, relationId: string | null) {
  const ids = new Set<string>();
  for (const entity of project.entities) {
    if (mode.kind === "all" || mode.kind === "universe" ||
      (mode.kind === "category" && entity.category === mode.category)) ids.add(entity.id);
  }
  if (mode.kind === "focus") {
    ids.add(mode.id);
    for (const r of project.relations) {
      if (r.sourceId === mode.id) ids.add(r.targetId);
      if (r.targetId === mode.id) ids.add(r.sourceId);
    }
  }
  const relation = project.relations.find((r) => r.id === relationId);
  if (relation) ids.add(relation.sourceId).add(relation.targetId);
  return ids;
}

// A reading arrangement, never an operation on the universe model.
export function neighborhoodPositions(project: Project, id: string) {
  const ids = visibleElements(project, { kind: "focus", id }, null);
  const neighbors = project.entities.filter((e) => e.id !== id && ids.has(e.id));
  const result = new Map<string, Position>([[id, { x: 0, y: 0 }]]);
  const radius = Math.max(500, neighbors.length * 370 / (2 * Math.PI));
  neighbors.forEach((entity, index) => {
    const angle = index * 2 * Math.PI / neighbors.length - Math.PI / 2;
    result.set(entity.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  });
  return result;
}

export function categoryPositions(project: Project, category: Category) {
  const members = project.entities.filter(e => e.category === category);
  const columns = Math.ceil(Math.sqrt(members.length));
  return new Map(members.map((entity, i) => [entity.id, { x: (i % columns) * 390, y: Math.floor(i / columns) * 400 }]));
}

export function categoryGroups(project: Project) {
  const byId = new Map(project.entities.map(e => [e.id, e.category]));
  const groups = categories.map(category => ({ category,
    count: project.entities.filter(e => e.category === category).length, internal: 0, external: 0 }));
  const byCategory = new Map(groups.map(g => [g.category, g]));
  const links = new Map<string, { source: Category; target: Category; count: number; kinds: Record<RelationKind, number> }>();
  for (const relation of project.relations) {
    const a = byId.get(relation.sourceId), b = byId.get(relation.targetId);
    if (!a || !b) continue;
    if (a === b) { byCategory.get(a)!.internal++; continue; }
    byCategory.get(a)!.external++;
    byCategory.get(b)!.external++;
    const [source, target] = [a, b].sort();
    const key = JSON.stringify([source, target]);
    const link = links.get(key) ?? { source, target, count: 0, kinds: { directional: 0, reciprocal: 0, associative: 0 } };
    link.count++;
    link.kinds[getRelationKind(relation)]++;
    links.set(key, link);
  }
  return { groups: groups.filter(g => g.count > 0), links: [...links.values()] };
}
