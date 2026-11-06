// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from "vitest";
import { addEntity, createProject } from "../domain/model";
import { prepareReference } from "../domain/reference";
import { createBackup, parseBackup } from "./backup";

const pdf = (name: string, body = "%PDF-1.7\nfixture") => new File([body], name, { type: "application/pdf" });
describe("backup com referências", () => {
  it("restaura uma cópia com conteúdo e PDFs íntegros, preservando o projeto original", async () => {
    const project = addEntity(createProject("Teste"), { x: 12, y: 34 }, "Ideia", "Estrela", "Texto");
    const reference = await prepareReference(project.id, pdf("lore.pdf"));
    const file = await createBackup(project, [reference]);
    const restored = await parseBackup(file, "novo-universo");
    expect(restored.project).toEqual({ ...project, id: "novo-universo", kind: "user" });
    expect(restored.documents).toHaveLength(1);
    expect(restored.documents[0]).toMatchObject({ projectId: "novo-universo", name: "lore.pdf", updatedAt: reference.updatedAt });
    expect(restored.documents[0].id).not.toBe(reference.id);
    expect(await restored.documents[0].blob.text()).toBe(await reference.blob.text());
    expect(project.id).not.toBe(restored.project.id);
  });
  it("permite restaurar um universo sem PDFs", async () => {
    const project = createProject("Vazio");
    const restored = await parseBackup(await createBackup(project, []), "copia");
    expect(restored.documents).toEqual([]);
    expect(restored.project.name).toBe("Vazio");
  });
  it("rejeita corrupção de PDF e arquivo truncado", async () => {
    const project = createProject("Teste");
    const reference = await prepareReference(project.id, pdf("lore.pdf"));
    const backup = await createBackup(project, [reference]);
    const bytes = new Uint8Array(await backup.arrayBuffer());
    bytes[bytes.length - 1] ^= 1;
    await expect(parseBackup(new Blob([bytes]), "copia")).rejects.toThrow("corrompido");
    await expect(parseBackup(backup.slice(0, backup.size - 2), "copia")).rejects.toThrow();
  });
  it("rejeita referências de outro universo", async () => {
    const project = createProject("Teste");
    const reference = await prepareReference("outro", pdf("lore.pdf"));
    await expect(createBackup(project, [reference])).rejects.toThrow("inválida");
  });
});
