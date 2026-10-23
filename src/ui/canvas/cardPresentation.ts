// SPDX-License-Identifier: MPL-2.0
import type { Category } from "../../domain/model";
import type { NodeBox } from "./floatingGeometry";

export type Detail = "symbol" | "compact" | "full";
export const zoomDetail = (zoom: number): Detail => zoom < 0.35 ? "symbol" : zoom < 0.75 ? "compact" : "full";

export function cardSize(category: Category) {
  if (category === "Personagem") return { width: 228, height: 310 };
  if (category === "Local") return { width: 314, height: 194 };
  if (category === "Magia") return { width: 248, height: 260 };
  if (category === "Evento") return { width: 280, height: 212 };
  if (category === "Documento") return { width: 270, height: 160 };
  return { width: 248, height: 236 };
}

// Outer node measurements remain fixed; only the visible surface changes.
export function semanticBox(box: NodeBox, detail: Detail): NodeBox {
  if (detail === "full") return box;
  const width = detail === "symbol" ? 96 : Math.min(224, box.width - 4);
  const height = detail === "symbol" ? 96 : 102;
  return { ...box, x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height,
    shape: detail === "symbol" ? "circle" : undefined };
}
