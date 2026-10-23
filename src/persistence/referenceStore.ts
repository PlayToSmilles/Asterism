import {
  prepareReference,
  referenceSummary,
  type ReferenceDocument,
  type ReferenceSummary,
} from "../domain/reference";

const DATABASE = "playtosmilles.references";
const STORE = "documents";

export function referenceError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError")
      return "Sem espaço para salvar o PDF. Libere espaço no navegador e tente novamente.";
    if (error.name === "SecurityError" || error.name === "InvalidStateError")
      return "O armazenamento de PDFs não está disponível neste navegador ou modo de navegação.";
  }
  return error instanceof Error
    ? error.message
    : "Não foi possível acessar as referências. Tente novamente.";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(
        new Error(
          "IndexedDB não está disponível. Os cards continuam disponíveis, mas os PDFs precisam deste armazenamento.",
        ),
      );
      return;
    }
    let blocked = false;
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("projectId", "projectId");
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(
        new Error(
          "Feche outras abas deste aplicativo e tente abrir as referências novamente.",
        ),
      );
    };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) {
        db.close();
        return;
      }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

// Resolve only after transaction completion, never merely after put/delete.
// A failed replacement rolls back atomically, preserving the previous Blob.
async function transaction<T>(
  mode: IDBTransactionMode,
  work: (
    store: IDBObjectStore,
    done: (value: T) => void,
    fail: (error: Error) => void,
  ) => void,
): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE, mode);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }
    let result: () => T = () => {
      throw new Error("A operação de referência não foi concluída.");
    };
    let failure: Error | null = null;
    const fail = (error: Error) => {
      failure = error;
      tx.abort();
    };
    tx.oncomplete = () => {
      db.close();
      try {
        resolve(result());
      } catch (error) {
        reject(error);
      }
    };
    tx.onabort = () => {
      db.close();
      reject(
        failure ??
          tx.error ??
          new Error("A operação foi cancelada. O PDF anterior foi preservado."),
      );
    };
    try {
      work(
        tx.objectStore(STORE),
        (value) => {
          result = () => value;
        },
        fail,
      );
    } catch (error) {
      fail(
        error instanceof Error
          ? error
          : new Error("Falha ao acessar as referências."),
      );
    }
  });
}

export function listReferences(projectId: string): Promise<ReferenceSummary[]> {
  return transaction("readonly", (store, done) => {
    const request = store.index("projectId").getAll(projectId);
    request.onsuccess = () => {
      const documents = request.result as ReferenceDocument[];
      done(
        documents
          .map(referenceSummary)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
    };
  });
}

export function getReference(
  projectId: string,
  id: string,
): Promise<ReferenceDocument> {
  return transaction("readonly", (store, done, fail) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const document = request.result as ReferenceDocument | undefined;
      if (!document || document.projectId !== projectId) {
        fail(new Error("Referência não encontrada neste universo."));
        return;
      }
      done(document);
    };
  });
}

export async function saveReference(
  projectId: string,
  file: File,
  id?: string,
): Promise<ReferenceSummary> {
  const document = await prepareReference(projectId, file, id);
  return transaction("readwrite", (store, done, fail) => {
    const write = () => {
      const request = store.put(document);
      request.onsuccess = () => done(referenceSummary(document));
    };
    if (!id) {
      write();
      return;
    }
    const request = store.get(id);
    request.onsuccess = () => {
      const previous = request.result as ReferenceDocument | undefined;
      if (!previous || previous.projectId !== projectId) {
        fail(
          new Error(
            "Referência não encontrada neste universo. O arquivo não foi substituído.",
          ),
        );
        return;
      }
      write();
    };
  });
}

export function removeReference(projectId: string, id: string): Promise<void> {
  return transaction("readwrite", (store, done, fail) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const document = request.result as ReferenceDocument | undefined;
      if (!document || document.projectId !== projectId) {
        fail(new Error("Referência não encontrada neste universo."));
        return;
      }
      const deletion = store.delete(id);
      deletion.onsuccess = () => done(undefined);
    };
  });
}

export function removeProjectReferences(projectId: string): Promise<void> {
  return transaction("readwrite", (store, done) => {
    const request = store.index("projectId").openKeyCursor(projectId);
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        done(undefined);
        return;
      }
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
  });
}
