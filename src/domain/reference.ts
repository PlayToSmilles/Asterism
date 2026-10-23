// SPDX-License-Identifier: MPL-2.0
export const MAX_PDF_SIZE = 20 * 1024 * 1024;

export interface ReferenceSummary {
  id: string;
  projectId: string;
  name: string;
  size: number;
  updatedAt: number;
}
export interface ReferenceDocument extends ReferenceSummary {
  blob: Blob;
}

export async function prepareReference(
  projectId: string,
  file: File,
  id: string = crypto.randomUUID(),
): Promise<ReferenceDocument> {
  if (!projectId.trim() || !id.trim())
    throw new Error("Universo ou referência inválidos.");
  if (
    !/\.pdf$/i.test(file.name) ||
    (file.type !== "application/pdf" && file.type !== "")
  ) {
    throw new Error("Escolha um arquivo PDF (.pdf).");
  }
  if (file.size === 0) throw new Error("O PDF está vazio.");
  if (file.size > MAX_PDF_SIZE) throw new Error("O limite é 20 MiB por PDF.");
  const signature = new TextDecoder().decode(
    await file.slice(0, 5).arrayBuffer(),
  );
  if (signature !== "%PDF-")
    throw new Error("O arquivo não possui uma assinatura PDF válida.");
  return {
    id,
    projectId,
    name: file.name,
    size: file.size,
    updatedAt: Date.now(),
    blob: new Blob([file], { type: "application/pdf" }),
  };
}

export function referenceSummary(
  document: ReferenceDocument,
): ReferenceSummary {
  const { id, projectId, name, size, updatedAt } = document;
  return { id, projectId, name, size, updatedAt };
}
