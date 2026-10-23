import { describe, expect, it } from "vitest";
import { MAX_PDF_SIZE, prepareReference, referenceSummary } from "./reference";

const pdf = (
  name = "lore.pdf",
  type = "application/pdf",
  content = "%PDF-1.7\nfixture",
) => new File([content], name, { type });

describe("documentos de referência", () => {
  it("prepara um Blob PDF e metadados vinculados ao ID do universo", async () => {
    const file = pdf();
    const record = await prepareReference("universe-a", file);
    expect(record.projectId).toBe("universe-a");
    expect(record.id).toBeTruthy();
    expect(record.name).toBe(file.name);
    expect(record.size).toBe(file.size);
    expect(record.blob.type).toBe("application/pdf");
    expect(await record.blob.text()).toBe(await file.text());
    expect(referenceSummary(record)).not.toHaveProperty("blob");
  });
  it("mantém o ID na substituição, mas gera IDs distintos para novos anexos", async () => {
    const original = await prepareReference("world", pdf());
    const replacement = await prepareReference(
      "world",
      pdf("replacement.pdf"),
      original.id,
    );
    expect(replacement.id).toBe(original.id);
    expect(replacement.projectId).toBe(original.projectId);
    expect(replacement.name).toBe("replacement.pdf");
    expect((await prepareReference("world", pdf())).id).not.toBe(original.id);
  });
  it("aceita extensão maiúscula e MIME ausente após conferir a assinatura", async () => {
    expect(
      (await prepareReference("world", pdf("LORE.PDF", ""))).blob.type,
    ).toBe("application/pdf");
  });
  it.each([
    ["arquivo vazio", () => pdf("empty.pdf", "application/pdf", ""), "vazio"],
    ["extensão incorreta", () => pdf("lore.txt"), "Escolha um arquivo PDF"],
    [
      "MIME incorreto",
      () => pdf("lore.pdf", "text/plain"),
      "Escolha um arquivo PDF",
    ],
    [
      "assinatura inválida",
      () => pdf("fake.pdf", "application/pdf", "not a pdf"),
      "assinatura",
    ],
    [
      "limite excedido",
      () =>
        new File([new Uint8Array(MAX_PDF_SIZE + 1)], "big.pdf", {
          type: "application/pdf",
        }),
      "20 MiB",
    ],
  ])("rejeita %s", async (_, create, message) => {
    await expect(prepareReference("world", create())).rejects.toThrow(message);
  });
  it("rejeita vínculo vazio sem preparar um documento", async () => {
    await expect(prepareReference(" ", pdf())).rejects.toThrow("Universo");
  });
});
