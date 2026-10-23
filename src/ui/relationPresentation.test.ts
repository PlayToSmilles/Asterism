import { describe, expect, it } from "vitest";
import { MarkerType } from "@xyflow/react";
import { relationAppearance } from "./relationPresentation";
describe("marcadores das relações", () => {
  it("mapeia direção, reciprocidade e associação sem alterar a geometria", () => {
    const directional = relationAppearance("directional", false, "dot");
    expect(directional.markerStart).toBeUndefined();
    expect(directional.markerEnd).toMatchObject({
      type: MarkerType.ArrowClosed,
    });
    const reciprocal = relationAppearance("reciprocal", false, "dot");
    expect(reciprocal.markerStart).toEqual(reciprocal.markerEnd);
    expect(reciprocal.markerStart).toMatchObject({
      orient: "auto-start-reverse",
    });
    const associative = relationAppearance("associative", false, "dot");
    // React Flow resolves string IDs to url references before calling BaseEdge.
    expect(associative.markerStart).toBe("dot");
    expect(associative.markerEnd).toBe("dot");
    expect(associative.style.strokeDasharray).toBeTruthy();
    const selected = relationAppearance("associative", true, "dot");
    expect(selected.style.strokeWidth).toBeGreaterThan(
      associative.style.strokeWidth,
    );
    expect(selected.markerStart).toBe(associative.markerStart);
  });
});
