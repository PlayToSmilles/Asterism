// SPDX-License-Identifier: MPL-2.0
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getReference,
  listReferences,
  referenceError,
  removeReference,
  removeProjectReferences,
  saveReference,
} from "./referenceStore";
import { prepareReference } from "../domain/reference";

const pdf = () =>
  new File(["%PDF-1.7\nfixture"], "lore.pdf", { type: "application/pdf" });
afterEach(() => vi.unstubAllGlobals());

// Controlled native API boundary: tests can deliver request success separately
// from transaction commit/abort, which a simple in-memory repository would miss.
function databaseBoundary() {
  const request = {
    result: undefined as unknown,
    onsuccess: null as (() => void) | null,
  };
  const store = {
    get: vi.fn(() => request),
    put: vi.fn(() => request),
    delete: vi.fn(() => request),
    index: vi.fn(() => ({
      getAll: vi.fn(() => request),
      openKeyCursor: vi.fn(() => request),
    })),
  };
  const tx = {
    error: null as DOMException | null,
    oncomplete: null as (() => void) | null,
    onabort: null as (() => void) | null,
    objectStore: () => store,
    abort: vi.fn(() => {
      tx.onabort?.();
    }),
  };
  const db = {
    transaction: vi.fn(() => tx),
    close: vi.fn(),
    onversionchange: null,
  };
  const open = { result: db, onsuccess: null as (() => void) | null };
  vi.stubGlobal("indexedDB", {
    open: vi.fn(() => {
      queueMicrotask(() => open.onsuccess?.());
      return open;
    }),
  });
  return { request, store, tx, db };
}

describe("fronteira transacional das referências", () => {
  it("recupera o Blob do universo correto após concluir a leitura", async () => {
    const document = await prepareReference("world", pdf());
    const boundary = databaseBoundary();
    const pending = getReference("world", document.id);
    await vi.waitFor(() =>
      expect(boundary.store.get).toHaveBeenCalledWith(document.id),
    );
    boundary.request.result = document;
    boundary.request.onsuccess?.();
    boundary.tx.oncomplete?.();
    expect(await pending).toBe(document);
    expect(await (await pending).blob.text()).toBe("%PDF-1.7\nfixture");
  });
  it("remove somente o ID solicitado e aguarda commit antes de confirmar", async () => {
    const document = await prepareReference("world", pdf());
    const boundary = databaseBoundary();
    const pending = removeReference("world", document.id);
    await vi.waitFor(() =>
      expect(boundary.store.get).toHaveBeenCalledWith(document.id),
    );
    boundary.request.result = document;
    boundary.request.onsuccess?.();
    expect(boundary.store.delete).toHaveBeenCalledExactlyOnceWith(document.id);
    const settled = vi.fn();
    void pending.then(settled);
    boundary.request.onsuccess?.();
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    boundary.tx.oncomplete?.();
    await pending;
    expect(boundary.db.close).toHaveBeenCalledOnce();
  });
  it("informa indisponibilidade do IndexedDB sem usar localStorage", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(listReferences("world")).rejects.toThrow(
      "IndexedDB não está disponível",
    );
  });
  it("não abre armazenamento para arquivos inválidos", async () => {
    const open = vi.fn();
    vi.stubGlobal("indexedDB", { open });
    await expect(
      saveReference(
        "world",
        new File(["not pdf"], "bad.pdf", { type: "application/pdf" }),
      ),
    ).rejects.toThrow("assinatura");
    expect(open).not.toHaveBeenCalled();
  });
  it("só confirma a gravação depois do commit, não no sucesso do put", async () => {
    const boundary = databaseBoundary();
    const pending = saveReference("world", pdf());
    await vi.waitFor(() => expect(boundary.store.put).toHaveBeenCalledOnce());
    const settled = vi.fn();
    void pending.then(settled);
    boundary.request.onsuccess?.();
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    boundary.tx.oncomplete?.();
    expect(await pending).toMatchObject({
      projectId: "world",
      name: "lore.pdf",
    });
    expect(boundary.db.close).toHaveBeenCalledOnce();
  });
  it("propaga abort por quota e não relata sucesso numa substituição", async () => {
    const old = await prepareReference("world", pdf());
    const boundary = databaseBoundary();
    const pending = saveReference("world", pdf(), old.id);
    const rejection = expect(pending).rejects.toMatchObject({
      name: "QuotaExceededError",
    });
    await vi.waitFor(() =>
      expect(boundary.store.get).toHaveBeenCalledWith(old.id),
    );
    boundary.request.result = old;
    boundary.request.onsuccess?.();
    expect(boundary.store.put).toHaveBeenCalledOnce();
    boundary.tx.error = new DOMException("quota", "QuotaExceededError");
    boundary.tx.onabort?.();
    await rejection;
    expect(boundary.db.close).toHaveBeenCalledOnce();
  });
  it.each(["ler", "remover", "substituir"])(
    "não permite %s arquivo de outro universo",
    async (operation) => {
      const old = await prepareReference("other-world", pdf());
      const boundary = databaseBoundary();
      const pending =
        operation === "ler"
          ? getReference("world", old.id)
          : operation === "remover"
            ? removeReference("world", old.id)
            : saveReference("world", pdf(), old.id);
      const rejection = expect(pending).rejects.toThrow("neste universo");
      await vi.waitFor(() =>
        expect(boundary.store.get).toHaveBeenCalledWith(old.id),
      );
      boundary.request.result = old;
      boundary.request.onsuccess?.();
      await rejection;
      expect(boundary.store.put).not.toHaveBeenCalled();
      expect(boundary.store.delete).not.toHaveBeenCalled();
    },
  );
  it("consulta o índice pelo universo e devolve somente metadados", async () => {
    const document = await prepareReference("world", pdf());
    const boundary = databaseBoundary();
    const pending = listReferences("world");
    await vi.waitFor(() =>
      expect(boundary.store.index).toHaveBeenCalledWith("projectId"),
    );
    expect(
      boundary.store.index.mock.results[0].value.getAll,
    ).toHaveBeenCalledWith("world");
    boundary.request.result = [document];
    boundary.request.onsuccess?.();
    boundary.tx.oncomplete?.();
    expect(await pending).toEqual([
      {
        id: document.id,
        projectId: "world",
        name: "lore.pdf",
        size: document.size,
        updatedAt: document.updatedAt,
      },
    ]);
  });
  it("traduz erros de quota e restrições do navegador", () => {
    expect(
      referenceError(new DOMException("quota", "QuotaExceededError")),
    ).toContain("Sem espaço");
    expect(
      referenceError(new DOMException("security", "SecurityError")),
    ).toContain("não está disponível");
  });
  it("limpa PDFs pelo índice do projeto e só confirma depois do commit", async () => {
    const boundary = databaseBoundary();
    const pending = removeProjectReferences("world");
    await vi.waitFor(() =>
      expect(boundary.store.index).toHaveBeenCalledWith("projectId"),
    );
    expect(
      boundary.store.index.mock.results[0].value.openKeyCursor,
    ).toHaveBeenCalledWith("world");
    const advance = vi.fn();
    for (const primaryKey of ["pdf-a", "pdf-b"]) {
      boundary.request.result = { primaryKey, continue: advance };
      boundary.request.onsuccess?.();
    }
    expect(boundary.store.delete.mock.calls).toEqual([["pdf-a"], ["pdf-b"]]);
    expect(advance).toHaveBeenCalledTimes(2);
    boundary.request.result = null;
    boundary.request.onsuccess?.();
    const settled = vi.fn();
    void pending.then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    boundary.tx.oncomplete?.();
    await pending;
    expect(boundary.db.close).toHaveBeenCalledOnce();
  });
  it("propaga falha na limpeza sem relatar sucesso", async () => {
    const boundary = databaseBoundary();
    const pending = removeProjectReferences("world");
    const rejection = expect(pending).rejects.toMatchObject({
      name: "UnknownError",
    });
    await vi.waitFor(() =>
      expect(boundary.store.index).toHaveBeenCalledWith("projectId"),
    );
    boundary.tx.error = new DOMException("Falha", "UnknownError");
    boundary.tx.onabort?.();
    await rejection;
    expect(boundary.db.close).toHaveBeenCalledOnce();
  });
});
