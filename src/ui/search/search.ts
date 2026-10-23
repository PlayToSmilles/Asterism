import type { DocumentNode } from "../../domain/document";
import type { Category, Project } from "../../domain/model";
import type { ReferenceSummary } from "../../domain/reference";

export type SearchKind = "entity" | "document" | "relation" | "reference";
export interface SearchResult {
  id: string;
  projectId: string;
  kind: SearchKind;
  title: string;
  category: Category | "Relação" | "PDF";
  context: string;
  snippet: string;
}
interface Entry extends Omit<SearchResult, "snippet"> {
  text: string;
  foldedTitle: string;
  foldedCategory: string;
  foldedText: string;
}
export const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");

function documentText(node: DocumentNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map(documentText).join(node.type === "paragraph" || node.type === "heading" ? "" : "\n");
}

export function buildSearchIndex(project: Pick<Project, "id" | "entities" | "relations">, references: ReferenceSummary[] = []): Entry[] {
  const names = new Map(project.entities.map(e => [e.id, e.title]));
  const duplicates = new Map<string, number>();
  project.entities.forEach(e => duplicates.set(fold(e.title), (duplicates.get(fold(e.title)) ?? 0) + 1));
  const rows: Omit<Entry, "foldedTitle" | "foldedCategory" | "foldedText">[] = project.entities.map(e => ({
    id: e.id, projectId: project.id, kind: e.category === "Documento" ? "document" : "entity", title: e.title,
    category: e.category, context: `${e.category}${(duplicates.get(fold(e.title)) ?? 0) > 1 ? ` · #${e.id.slice(-8)}` : ""}`,
    text: [e.description, e.document ? documentText(e.document) : ""].filter(Boolean).join("\n"),
  }));
  project.relations.forEach(r => {
    if (!names.has(r.sourceId) || !names.has(r.targetId)) return;
    const arrow = r.kind === "reciprocal" ? "↔" : r.kind === "associative" ? "—" : "→";
    const context = `${names.get(r.sourceId)} ${arrow} ${names.get(r.targetId)}`;
    rows.push({ id: r.id, projectId: project.id, kind: "relation", title: r.label || "Relação sem rótulo", category: "Relação", context: `Relação · ${context}`, text: context });
  });
  references.filter(r => r.projectId === project.id).forEach(r => rows.push({
    id: r.id, projectId: project.id, kind: "reference", title: r.name, category: "PDF", context: "Referência PDF · somente nome do arquivo",
    text: "",
  }));
  const repeated = new Map<string, number>();
  const identity = (row: (typeof rows)[number]) => JSON.stringify([fold(row.title), row.context]);
  rows.forEach(row => repeated.set(identity(row), (repeated.get(identity(row)) ?? 0) + 1));
  return rows.map(row => ({ ...row, context: (repeated.get(identity(row)) ?? 0) > 1 ? `${row.context} · #${row.id.slice(-8)}` : row.context,
    foldedTitle: fold(row.title), foldedCategory: fold(row.category), foldedText: fold(row.text) }));
}

function originalOffset(text: string, foldedOffset: number) {
  let offset = 0, count = 0;
  for (const char of text) {
    const size = fold(char).length;
    if (count >= foldedOffset && size > 0) break;
    count += size; offset += char.length;
  }
  return offset;
}
function excerpt(entry: Entry, terms: string[]) {
  const phrase = entry.foldedText.indexOf(terms.join(" "));
  const meaningful = terms.filter(term => term.length > 2);
  const matches = phrase >= 0 ? [phrase] : (meaningful.length ? meaningful : terms).map(term => entry.foldedText.indexOf(term)).filter(i => i >= 0);
  const match = matches.length ? originalOffset(entry.text, Math.min(...matches)) : 0;
  let start = Math.max(0, match - 48);
  while (start > 0 && start < match && !/\s/.test(entry.text[start - 1])) start++;
  const end = Math.min(entry.text.length, start + 180);
  return `${start ? "…" : ""}${entry.text.slice(start, end).replace(/\s+/g, " ")}${end < entry.text.length ? "…" : ""}`;
}

export function searchUniverse(index: Entry[], query: string, limit = 60): { results: SearchResult[]; total: number } {
  const needle = fold(query.trim()).replace(/\s+/g, " ");
  if (!needle) return { results: [], total: 0 };
  const terms = [...new Set(needle.split(" "))];
  const matches = index.flatMap(entry => {
    const all = `${entry.foldedTitle}\n${entry.foldedCategory}\n${entry.foldedText}`;
    if (!terms.every(term => all.includes(term))) return [];
    const score = entry.kind === "relation" ? 5 : entry.foldedTitle === needle ? 0 : entry.foldedTitle.startsWith(needle) ? 1
      : entry.foldedTitle.includes(needle) ? 2 : terms.every(t => entry.foldedCategory.includes(t)) ? 3 : 4;
    return [{ entry, score }];
  }).sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title, "pt-BR") || a.entry.id.localeCompare(b.entry.id));
  return { total: matches.length, results: matches.slice(0, limit).map(({ entry }) => ({
    id: entry.id, projectId: entry.projectId, kind: entry.kind, title: entry.title, category: entry.category,
    context: entry.context, snippet: entry.kind === "relation" ? "" : excerpt(entry, terms),
  })) };
}

// UTF-16 ranges refer to the original text, including accents and emoji.
export function highlightRanges(text: string, query: string): [number, number][] {
  const needle = fold(query.trim()).replace(/\s+/g, " ");
  const tokens = [...new Set(needle.split(" ").filter(Boolean))];
  const meaningful = tokens.filter(token => token.length > 2);
  const value = fold(text), ranges: [number, number][] = [];
  const terms = needle && value.includes(needle) ? [needle] : tokens.length > 1 && meaningful.length ? meaningful : tokens;
  for (const term of terms) {
    let from = 0;
    while (from < value.length) {
      const at = value.indexOf(term, from);
      if (at < 0) break;
      ranges.push([originalOffset(text, at), originalOffset(text, at + term.length)]);
      from = at + term.length;
    }
  }
  const merged: [number, number][] = [];
  ranges.sort((a, b) => a[0] - b[0]).forEach(range => {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]); else merged.push(range);
  });
  return merged;
}
