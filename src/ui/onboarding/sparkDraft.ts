// SPDX-License-Identifier: MPL-2.0
import type { Project } from "../../domain/model";
import { nextIdeaNumber } from "./firstSpark";
import { isPossibilityId, possibilities, type PossibilityId } from "./possibilities";

export interface PathDraft { answer: string; operationId: string; developed: boolean }
export interface SparkDraft {
  answer: string;
  currentId: string | null;
  nextNumber: number;
  operationId: string;
  inspired: boolean;
  scene: "idea" | "possibilities" | "writing";
  activePath: PossibilityId | null;
  paths: Record<PossibilityId, PathDraft>;
  completed: boolean;
  referenceUrl: string;
}
const uuid = (v: unknown): v is string => typeof v === "string" && /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(v);
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.length <= 4000;
function defaults(): SparkDraft {
  return { answer: "", currentId: null, nextNumber: 1, operationId: crypto.randomUUID(), inspired: false,
    scene: "idea", activePath: null, completed: false, referenceUrl: "",
    paths: Object.fromEntries(possibilities.map(p => [p.id, { answer: "", operationId: crypto.randomUUID(), developed: false }])) as SparkDraft["paths"] };
}
function parse(raw: string, project: Project): SparkDraft {
  const v: unknown = JSON.parse(raw);
  if (!record(v) || !text(v.answer) || !(v.currentId === null || (typeof v.currentId === "string" && v.currentId.length <= 200)) ||
    typeof v.nextNumber !== "number" || !Number.isSafeInteger(v.nextNumber) || v.nextNumber < 1 || typeof v.inspired !== "boolean" ||
    (v.operationId !== undefined && !uuid(v.operationId))) throw new Error();
  const base = { ...defaults(), answer: v.answer, currentId: v.currentId, nextNumber: v.nextNumber,
    operationId: uuid(v.operationId) ? v.operationId : crypto.randomUUID(), inspired: v.inspired };
  if (v.scene === undefined) {
    // Migrate the previous thinking space without throwing away a pending answer.
    if (base.currentId) {
      base.scene = base.answer ? "writing" : "possibilities";
      base.activePath = base.answer ? "origins" : null;
      base.paths.origins.answer = base.answer;
      base.paths.origins.operationId = base.operationId;
      base.answer = "";
    }
    base.referenceUrl = project.entities.find(e => e.id === base.currentId)?.imageUrl ?? "";
    return base;
  }
  if (!["idea", "possibilities", "writing"].includes(String(v.scene)) ||
    !(v.activePath === null || isPossibilityId(v.activePath)) || !record(v.paths) ||
    typeof v.completed !== "boolean" || typeof v.referenceUrl !== "string" || v.referenceUrl.length > 2048) throw new Error();
  for (const p of possibilities) {
    const path = v.paths[p.id];
    if (!record(path) || !text(path.answer) || !uuid(path.operationId) || typeof path.developed !== "boolean") throw new Error();
    base.paths[p.id] = { answer: path.answer, operationId: path.operationId, developed: path.developed };
  }
  if (v.scene === "writing" && !isPossibilityId(v.activePath)) throw new Error();
  return { ...base, scene: v.scene as SparkDraft["scene"], activePath: v.activePath,
    completed: v.completed, referenceUrl: v.referenceUrl };
}
export function createSparkDraftStore(storage: Pick<Storage, "getItem" | "setItem"> | null) {
  const memory = new Map<string, SparkDraft>();
  const memoryOnly = new Set<string>();
  const key = (id: string) => `asterism.first-spark.v2.${id}`;
  const volatileWarning = "Rascunho só em memória. Guarde seu texto antes de fechar ou recarregar a aba.";
  return {
    needsUnloadWarning: () => [...memory].some(([id, d]) => memoryOnly.has(id) &&
      (!!d.answer || Object.values(d.paths).some(path => !!path.answer))),
    read(project: Project): { draft: SparkDraft; warning: string } {
      let warning = memoryOnly.has(project.id) ? volatileWarning : "";
      let draft = memory.get(project.id);
      if (!draft) {
        try {
          const raw = storage?.getItem(key(project.id)) ?? storage?.getItem(`asterism.first-spark.v1.${project.id}`);
          if (raw) draft = parse(raw, project);
          if (!storage) { warning = volatileWarning; memoryOnly.add(project.id); }
        } catch {
          memoryOnly.add(project.id);
          warning = "Não foi possível recuperar o rascunho. Os dados armazenados e o universo foram preservados.";
        }
      }
      draft ??= defaults();
      const operationId = draft.operationId;
      const committed = project.entities.find(e => e.id === operationId);
      if (committed) draft = { ...draft, currentId: committed.id, inspired: true, scene: "possibilities",
        answer: committed.description === draft.answer ? "" : draft.answer, operationId: crypto.randomUUID() };
      for (const p of possibilities) {
        const pending = draft.paths[p.id];
        const child = project.entities.find(e => e.id === pending.operationId);
        if (child?.description === pending.answer) draft = { ...draft, paths: { ...draft.paths,
          [p.id]: { answer: "", operationId: crypto.randomUUID(), developed: true } } };
      }
      draft = { ...draft, nextNumber: nextIdeaNumber(project, draft.nextNumber) };
      memory.set(project.id, draft);
      return { draft, warning };
    },
    write(id: string, draft: SparkDraft) {
      memory.set(id, draft);
      try {
        if (!storage) { memoryOnly.add(id); return false; }
        storage.setItem(key(id), JSON.stringify(draft)); memoryOnly.delete(id); return true;
      } catch { memoryOnly.add(id); return false; }
    },
  };
}
export type SparkDraftStore = ReturnType<typeof createSparkDraftStore>;
