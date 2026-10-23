// SPDX-License-Identifier: MPL-2.0
import { getViewportForBounds, type Rect } from "@xyflow/react";
import type { Project } from "../../domain/model";

// Focus belongs to the UI, never to the saved universe.
export function canvasFocus(project: Pick<Project, "entities" | "relations">, selected: string | null, relationId: string | null) {
  const relation = project.relations.find((r) => r.id === relationId) ?? project.relations.find((r) => r.id === selected);
  const nodes = new Set<string>();
  const edges = new Set<string>();
  if (relation) {
    nodes.add(relation.sourceId).add(relation.targetId);
    edges.add(relation.id);
  } else if (project.entities.some((e) => e.id === selected)) {
    nodes.add(selected!);
    for (const r of project.relations) if (r.sourceId === selected || r.targetId === selected) {
      nodes.add(r.sourceId).add(r.targetId);
      edges.add(r.id);
    }
  }
  return { nodes, edges, relationId: relation?.id ?? null };
}

export function focusViewport(bounds: Rect, width: number, height: number, left: number, right: number, top = 60, padding = .22, bottom = 60) {
  const viewport = getViewportForBounds(bounds, Math.max(1, width - left - right), Math.max(1, height - top - bottom), 0.05, 1, padding);
  return { ...viewport, x: viewport.x + left, y: viewport.y + top };
}
