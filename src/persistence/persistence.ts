// SPDX-License-Identifier: MPL-2.0
import { categories, relationKinds, type Project } from "../domain/model";
import { isValidImageUrl } from "../domain/imageUrl";
import { validateDocument } from "../domain/document";
export const STORAGE_KEY = "playtosmilles.worldbuilding.v1";
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const string = (
  value: unknown,
  max: number,
  required = false,
): value is string =>
  typeof value === "string" &&
  value.length <= max &&
  (!required || value.trim().length > 0);
const number = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export function validateProject(value: unknown): Project {
  const fail = (): never => {
    throw new Error(
      "Projeto inválido. Verifique a versão, os campos e as conexões do JSON.",
    );
  };
  if (
    !record(value) ||
    value.version !== 1 ||
    !string(value.id, 100, true) ||
    !string(value.name, 120, true) ||
    (value.kind !== "user" && value.kind !== "demo")
  )
    return fail();
  if (
    !Array.isArray(value.entities) ||
    !Array.isArray(value.relations) ||
    value.entities.length > 2000 ||
    value.relations.length > 10000
  )
    return fail();
  const ids = new Set<string>();
  for (const entity of value.entities) {
    if (
      !record(entity) ||
      !string(entity.id, 100, true) ||
      ids.has(entity.id) ||
      !string(entity.title, 120, true) ||
      !categories.includes(entity.category as (typeof categories)[number]) ||
      !string(entity.description, 4000) ||
      (entity.imageUrl !== undefined && !isValidImageUrl(entity.imageUrl)) ||
      !record(entity.position) ||
      !number(entity.position.x) ||
      !number(entity.position.y)
    )
      return fail();
    ids.add(entity.id);
  }
  const relationIds = new Set<string>();
  for (const relation of value.relations) {
    if (
      !record(relation) ||
      !string(relation.id, 100, true) ||
      relationIds.has(relation.id) ||
      ids.has(relation.id) ||
      !string(relation.sourceId, 100, true) ||
      !string(relation.targetId, 100, true) ||
      !ids.has(relation.sourceId) ||
      !ids.has(relation.targetId) ||
      !string(relation.label, 100, true) ||
      (relation.kind !== undefined &&
        !relationKinds.includes(
          relation.kind as (typeof relationKinds)[number],
        ))
    )
      return fail();
    relationIds.add(relation.id);
  }
  if (
    !record(value.viewport) ||
    !number(value.viewport.x) ||
    !number(value.viewport.y) ||
    !number(value.viewport.zoom) ||
    value.viewport.zoom < 0.05 ||
    value.viewport.zoom > 2
  )
    return fail();
  // Reconstruct only known fields: imported extras never enter application state.
  return {
    version: 1,
    id: value.id,
    name: value.name,
    kind: value.kind as Project["kind"],
    entities: value.entities.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      description: e.description,
      ...(e.imageUrl !== undefined ? { imageUrl: e.imageUrl } : {}),
      ...(e.category === "Documento"
        ? { document: validateDocument(e.document) }
        : {}),
      position: { x: e.position.x, y: e.position.y },
    })),
    relations: value.relations.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      targetId: r.targetId,
      label: r.label,
      ...(r.kind !== undefined ? { kind: r.kind } : {}),
    })),
    viewport: {
      x: value.viewport.x,
      y: value.viewport.y,
      zoom: value.viewport.zoom,
    },
  };
}
export function importProject(json: string): Project {
  if (json.length > 5_000_000)
    throw new Error("Arquivo muito grande. O limite é 5 MB.");
  try {
    return validateProject(JSON.parse(json));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new Error(
        "Não foi possível ler o JSON. O arquivo está malformado.",
      );
    throw error;
  }
}
export function exportProject(project: Project): string {
  return JSON.stringify(validateProject(project), null, 2);
}
export interface Library {
  projects: Project[];
}
export function loadLibrary(storage: Pick<Storage, "getItem">): Library {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { projects: [] };
  const data: unknown = JSON.parse(raw);
  if (!record(data) || !Array.isArray(data.projects))
    throw new Error("Biblioteca local inválida.");
  return { projects: data.projects.map(validateProject) };
}
export function saveLibrary(
  storage: Pick<Storage, "setItem">,
  library: Library,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(library));
}
