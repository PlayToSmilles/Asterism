import { MarkerType, type EdgeMarker } from "@xyflow/react";
import type { RelationKind } from "../domain/model";

export const relationLabels: Record<RelationKind, string> = {
  directional: "→ Direcional",
  reciprocal: "↔ Recíproca",
  associative: "•—• Associativa",
};
export const relationDescriptions: Record<RelationKind, string> = {
  directional: "Uma seta indica a direção da origem para o destino.",
  reciprocal: "Duas setas indicam uma relação nos dois sentidos.",
  associative: "Os pontos indicam associação sem direção principal.",
};
export function relationAppearance(
  kind: RelationKind,
  selected: boolean,
  neutralMarkerId: string,
) {
  const color = selected
    ? "#e2d5ff"
    : kind === "reciprocal"
      ? "#9fcbbf"
      : kind === "associative"
        ? "#a6b9d2"
        : "#a79bc7";
  const arrow: EdgeMarker = {
    type: MarkerType.ArrowClosed,
    color,
    orient: "auto-start-reverse",
    width: 18,
    height: 18,
  };
  return {
    markerStart:
      kind === "associative"
        ? neutralMarkerId
        : kind === "reciprocal"
          ? arrow
          : undefined,
    markerEnd: kind === "associative" ? neutralMarkerId : arrow,
    style: {
      stroke: color,
      strokeWidth: selected ? 2.5 : 1.7,
      strokeDasharray: kind === "associative" ? "4 5" : undefined,
    },
  };
}
