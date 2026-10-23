// SPDX-License-Identifier: MPL-2.0 AND MIT
// ASTERISM additions: MPL-2.0; upstream example material: MIT.
// See THIRD_PARTY_NOTICES.md (xyflow) and docs/LICENSING.md.
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  useStore,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { useState } from "react";
import type { CardNode } from "./canvasState";
import { floatingPath, type NodeBox } from "./floatingGeometry";
import { zoomDetail, semanticBox } from "./cardPresentation";
export type FloatingRelation = Edge<{ lane: number; fullDetail?: boolean; emphasis?: "normal" | "related" | "focused" | "muted" }, "floating">;
export function FloatingEdge({
  id,
  source,
  target,
  data,
  label,
  markerEnd,
  markerStart,
  style,
  interactionWidth,
}: EdgeProps<FloatingRelation>) {
  const distant = useStore((state) => state.transform[2] < 0.55);
  const [hovered, setHovered] = useState(false);
  const detail = useStore((state) => data?.fullDetail ? "full" as const : zoomDetail(state.transform[2]));
  const focused = data?.emphasis === "focused";
  // Only the focused label subscribes to every zoom step; other edges only
  // update when crossing the readability threshold.
  const labelZoom = useStore((state) => focused ? state.transform[2] : 1);
  const from = useInternalNode<CardNode>(source);
  const to = useInternalNode<CardNode>(target);
  if (
    !from?.measured.width ||
    !from.measured.height ||
    !to?.measured.width ||
    !to.measured.height
  )
    return null;
  const box = (node: typeof from): NodeBox => semanticBox({
    ...node.internals.positionAbsolute,
    width: node.measured.width!,
    height: node.measured.height!,
    category: node.data.entity.category,
  }, detail);
  const geometry = floatingPath(
    box(from),
    box(to),
    source === target,
    data?.lane,
  );
  return (
    <>
    <g onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} className={`floating-relation emphasis-${data?.emphasis ?? "normal"}${distant ? " is-distant" : ""}`}>
    <BaseEdge
      id={id}
      path={geometry.path}
      label={focused || (distant && !hovered) ? undefined : label}
      labelX={geometry.labelX}
      labelY={geometry.labelY}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={style}
      labelBgPadding={[9, 6]}
      labelBgBorderRadius={9}
      interactionWidth={interactionWidth}
    />
    </g>
    {focused && <EdgeLabelRenderer>
      <div className="focused-relation-label" style={{
        transform: `translate(-50%, -50%) translate(${geometry.labelX}px, ${geometry.labelY}px) scale(${1 / labelZoom})`,
      }}>{label}</div>
    </EdgeLabelRenderer>}
    </>
  );
}
