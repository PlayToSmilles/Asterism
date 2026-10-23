// SPDX-License-Identifier: MPL-2.0
import data from "../content/demo/nyvorn.json";
import { categories, createProject, type Project } from "./model";

export function createDemo(): Project {
  return {
    ...createProject(data.name, "demo"),
    viewport: { ...data.viewport },
    entities: data.entities.map((entity) => {
      const category = categories.find((value) => value === entity.category);
      if (!category) throw new Error("Categoria inválida na demonstração.");
      return { ...entity, category, position: { ...entity.position } };
    }),
    relations: data.relations.map((relation) => ({ ...relation })),
  };
}
