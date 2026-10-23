// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { createDemo } from "./demo";
import { exportProject, importProject } from "../persistence/persistence";

describe("extração dos dados demonstrativos", () => {
  it("preserva a saída integral anterior, incluindo ordem, exceto o UUID do projeto", async () => {
    const project = { ...createDemo(), id: "<project-id>" };
    // Digest captured from the previous factory before extraction. No duplicate narrative fixture.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(project)));
    const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    expect(hex)
      .toBe("deb14f843f8d8da60a76dd4feb87e20be2902a716dafeb1a1423020fa42626f8");
  });

  it("não compartilha arrays, entidades, posições, relações ou viewport entre criações", () => {
    const first = createDemo();
    const next = createDemo();
    expect(first.id).not.toBe(next.id);
    expect(first.entities).not.toBe(next.entities);
    expect(first.relations).not.toBe(next.relations);
    expect(first.viewport).not.toBe(next.viewport);
    first.viewport.x = -999;
    first.entities[0].position.x = -999;
    first.entities[0].title = "editado";
    first.relations[0].label = "editada";
    first.entities.pop();
    first.relations.pop();
    expect({ ...createDemo(), id: next.id }).toEqual(next);
  });

  it("mantém compatibilidade com exportação e importação", () => {
    const project = createDemo();
    expect(importProject(exportProject(project))).toEqual(project);
  });
});
