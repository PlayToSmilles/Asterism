// SPDX-License-Identifier: MPL-2.0
import type { Node, NodeChange } from "@xyflow/react";
import {
  moveEntities,
  removeEntity,
  type Entity,
  type Project,
} from "../../domain/model";

export type CardNode = Node<{ entity: Entity }, "card">;

// Content belongs to the project; measurements and an in-progress drag belong
// to the canvas. Never discard measured/dragging when projecting model edits.
export function reconcileNodes(
  previous: CardNode[],
  entities: Entity[],
  selected: string | null,
  positions?: ReadonlyMap<string, { x: number; y: number }>,
  visible?: ReadonlySet<string>,
): CardNode[] {
  const byId = new Map(previous.map((node) => [node.id, node]));
  return entities.map((entity) => {
    const node = byId.get(entity.id);
    const position = node?.dragging ? node.position : positions?.get(entity.id) ?? entity.position;
    const hidden = visible ? !visible.has(entity.id) : false;
    const isSelected = selected === entity.id;
    if (
      node &&
      node.data.entity === entity &&
      node.selected === isSelected &&
      !!node.hidden === hidden &&
      node.position.x === position.x &&
      node.position.y === position.y
    )
      return node;
    return {
      ...node,
      id: entity.id,
      type: "card",
      position,
      data: node?.data.entity === entity ? node.data : { entity },
      selected: isSelected,
      hidden,
    };
  });
}

// Dimension/selection/drag-progress events never enter the persistent model.
// dragging=false is the final drag event; undefined also supports keyboard moves.
export function commitNodeChanges(
  project: Project,
  changes: NodeChange<CardNode>[],
): Project {
  const positions = changes.flatMap((change) =>
    change.type === "position" && change.position && change.dragging !== true
      ? [{ id: change.id, position: change.position }]
      : [],
  );
  const moved = moveEntities(project, positions);
  return changes.reduce(
    (current, change) =>
      change.type === "remove" ? removeEntity(current, change.id) : current,
    moved,
  );
}
