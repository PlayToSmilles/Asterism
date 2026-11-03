// SPDX-License-Identifier: MPL-2.0
import { addEntity, connect, updateEntity, type Project, type Position } from "../../domain/model";
import { isValidImageUrl } from "../../domain/imageUrl";

export function isBlankUniverse(project: Project) {
  return project.kind === "user" && project.entities.length === 0 && project.relations.length === 0;
}

export function shouldWelcome(project: Project, source: "created" | "opened" | "imported") {
  return source === "created" && isBlankUniverse(project);
}

export type SparkSaveResult = { ok: true; entityId: string; nextNumber: number; title: string } | { ok: false; error: string };
export interface SparkSaveOptions { connectToSource?: boolean; imageUrl?: string }

export function nextIdeaNumber(project: Project, minimum = 1) {
  let next = minimum;
  const occupied = new Set<number>();
  for (const entity of project.entities) {
    const match = /^Ideia\s+(\d+)$/iu.exec(entity.title.trim());
    const number = match ? Number(match[1]) : 0;
    if (Number.isSafeInteger(number)) {
      occupied.add(number);
      if (number >= next) next = number + 1;
    }
  }
  // Imported titles near the numeric limit must not crash the workspace.
  if (!Number.isSafeInteger(next) || next < 1 || next >= Number.MAX_SAFE_INTEGER) {
    next = 1;
    while (occupied.has(next)) next++;
  }
  return next;
}

export function saveSparkIdea(project: Project, text: string, action: "create" | "deepen", currentId: string | null,
  minimum: number, position: Position, operationId?: string, options: SparkSaveOptions = {}) {
  if (!text.trim()) throw new Error("Escreva algo antes de guardar.");
  if (text.length > 4000) throw new Error("A ideia pode ter até 4.000 caracteres.");
  if (options.imageUrl && !isValidImageUrl(options.imageUrl)) throw new Error("Use uma URL de imagem HTTP ou HTTPS válida.");
  if (action === "deepen") {
    const entity = project.entities.find(e => e.id === currentId);
    if (!entity) throw new Error("A ideia atual foi removida. Você pode guardar o texto como outra ideia.");
    // Idempotent retry after a reload/failed draft cleanup, without trimming prose.
    const alreadyAppended = entity.description === text || entity.description.endsWith(`\n\n${text}`);
    const description = alreadyAppended ? entity.description : entity.description + (entity.description ? "\n\n" : "") + text;
    if (description.length > 4000) throw new Error("Esta descrição atingiria mais de 4.000 caracteres. Crie outra ideia para preservar o texto inteiro.");
    return { project: alreadyAppended ? project : updateEntity(project, entity.id, { description }),
      entityId: entity.id, nextNumber: nextIdeaNumber(project, minimum) };
  }
  if (options.connectToSource && !project.entities.some(e => e.id === currentId)) throw new Error("A ideia central foi removida. Guarde sem conexão ou retome seu universo.");
  const previouslySaved = project.entities.find(e => e.id === operationId);
  if (previouslySaved) {
    if (previouslySaved.description !== text) throw new Error("Esta gravação já foi concluída com outro texto. Retome a ideia pelo canvas antes de continuar.");
    return { project, entityId: previouslySaved.id, nextNumber: nextIdeaNumber(project, minimum) };
  }
  const number = nextIdeaNumber(project, minimum);
  const next = addEntity(project, position, "Ideia", `Ideia ${String(number).padStart(2, "0")}`, text);
  // Only a newly created ID is assigned; existing IDs/objects are untouched.
  if (operationId) next.entities = next.entities.map((entity, i) => i === next.entities.length - 1 ? { ...entity, id: operationId } : entity);
  const entityId = next.entities.at(-1)!.id;
  let result = options.imageUrl ? updateEntity(next, entityId, { imageUrl: options.imageUrl }) : next;
  if (options.connectToSource && currentId) {
    result = connect(result, currentId, entityId);
    result = { ...result, relations: result.relations.map((r, i) => i === result.relations.length - 1
      ? { ...r, kind: "associative", label: "se relaciona com" } : r) };
  }
  return { project: result, entityId, nextNumber: number + 1 };
}
