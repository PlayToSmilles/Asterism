// SPDX-License-Identifier: MPL-2.0
import type { Project } from "../domain/model";
import { MAX_PDF_SIZE, prepareReference, type ReferenceDocument } from "../domain/reference";
import { exportProject, importProject } from "./persistence";

const MAGIC = new TextEncoder().encode("ASTERISM-BACKUP-1\n");
const MAX_MANIFEST = 5_000_000;
export const MAX_BACKUP_SIZE = 200 * 1024 * 1024;
const MAX_DOCUMENTS = 200;

type Entry = { name: string; size: number; updatedAt: number; sha256: string };
type Manifest = { version: 1; project: string; projectSha256: string; documents: Entry[] };
const encoder = new TextEncoder();
async function digest(data: Blob | Uint8Array): Promise<string> {
  const bytes = data instanceof Blob ? await data.arrayBuffer() : new Uint8Array(data).buffer;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, "0")).join("");
}

export async function createBackup(project: Project, documents: ReferenceDocument[]): Promise<Blob> {
  if (documents.length > MAX_DOCUMENTS) throw new Error("O backup permite até 200 PDFs.");
  const projectJson = exportProject(project);
  const entries: Entry[] = [];
  let size = 0;
  for (const document of documents) {
    if (document.projectId !== project.id || document.name.length > 255 || !Number.isFinite(document.updatedAt) || document.updatedAt < 0 || document.blob.size !== document.size || document.size > MAX_PDF_SIZE || document.size <= 0)
      throw new Error("Uma referência é inválida. O backup não foi criado.");
    size += document.size;
    if (size > MAX_BACKUP_SIZE) throw new Error("O backup excede o limite de 200 MiB.");
    // Validate signature and name before including stored data.
    await prepareReference(project.id, new File([document.blob], document.name, { type: "application/pdf" }), document.id);
    entries.push({ name: document.name, size: document.size, updatedAt: document.updatedAt, sha256: await digest(document.blob) });
  }
  const manifest: Manifest = { version: 1, project: projectJson, projectSha256: await digest(encoder.encode(projectJson)), documents: entries };
  const metadata = encoder.encode(JSON.stringify(manifest));
  if (metadata.length > MAX_MANIFEST || MAGIC.length + 4 + metadata.length + size > MAX_BACKUP_SIZE)
    throw new Error("O backup excede o limite permitido.");
  const header = new Uint8Array(MAGIC.length + 4);
  header.set(MAGIC);
  new DataView(header.buffer).setUint32(MAGIC.length, metadata.length, false);
  return new Blob([header, metadata, ...documents.map(document => document.blob)], { type: "application/octet-stream" });
}

export async function parseBackup(file: Blob, projectId: string): Promise<{ project: Project; documents: ReferenceDocument[] }> {
  if (file.size > MAX_BACKUP_SIZE || file.size < MAGIC.length + 4) throw new Error("Backup vazio ou maior que 200 MiB.");
  const header = new Uint8Array(await file.slice(0, MAGIC.length + 4).arrayBuffer());
  if (!MAGIC.every((byte, i) => header[i] === byte)) throw new Error("Formato de backup não reconhecido.");
  const length = new DataView(header.buffer).getUint32(MAGIC.length, false);
  let offset = header.length + length;
  if (!length || length > MAX_MANIFEST || offset > file.size) throw new Error("Cabeçalho do backup inválido.");
  let raw: unknown;
  try { raw = JSON.parse(await file.slice(header.length, offset).text()); }
  catch { throw new Error("Cabeçalho do backup corrompido."); }
  if (!raw || typeof raw !== "object") throw new Error("Cabeçalho do backup inválido.");
  const m = raw as Partial<Manifest>;
  if (m.version !== 1 || typeof m.project !== "string" || typeof m.projectSha256 !== "string" || !Array.isArray(m.documents) || m.documents.length > MAX_DOCUMENTS)
    throw new Error("Versão ou conteúdo do backup inválido.");
  if (await digest(encoder.encode(m.project)) !== m.projectSha256) throw new Error("A integridade do projeto não pôde ser verificada.");
  const project = { ...importProject(m.project), id: projectId, kind: "user" as const };
  const documents: ReferenceDocument[] = [];
  for (const entry of m.documents) {
    if (!entry || typeof entry.name !== "string" || entry.name.length > 255 || !Number.isFinite(entry.updatedAt) || entry.updatedAt < 0 || !Number.isSafeInteger(entry.size) || entry.size <= 0 || entry.size > MAX_PDF_SIZE || typeof entry.sha256 !== "string" || offset + entry.size > file.size)
      throw new Error("Dados de PDF inválidos no backup.");
    const blob = file.slice(offset, offset + entry.size, "application/pdf");
    if (await digest(blob) !== entry.sha256) throw new Error(`O PDF ${entry.name} está corrompido.`);
    documents.push({ ...await prepareReference(projectId, new File([blob], entry.name, { type: "application/pdf" })), updatedAt: entry.updatedAt });
    offset += entry.size;
  }
  if (offset !== file.size) throw new Error("O backup contém dados inesperados.");
  return { project, documents };
}
