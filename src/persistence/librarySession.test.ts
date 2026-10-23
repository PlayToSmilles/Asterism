import { afterEach, describe, expect, it, vi } from "vitest";
import { createLibrarySession } from "./librarySession";
import { addEntity, createProject, updateEntity } from "../domain/model";
import { loadLibrary } from "./persistence";
describe("sessão e autosave", () => {
  afterEach(() => vi.useRealTimers());
  const initial = () => ({
    projects: [addEntity(createProject(), { x: 0, y: 0 }, "Documento")],
  });
  it("publica imediatamente e agrupa digitação em uma gravação após pausa", () => {
    vi.useFakeTimers();
    const write = vi.fn(),
      status = vi.fn(),
      listener = vi.fn();
    const session = createLibrarySession(initial(), { setItem: write }, status);
    const unsubscribe = session.subscribe(listener);
    for (const title of ["A", "A lenda", "A lenda de Ekko"]) {
      session.update(
        (l) => ({
          projects: [
            updateEntity(l.projects[0], l.projects[0].entities[0].id, {
              title,
            }),
          ],
        }),
        true,
      );
      vi.advanceTimersByTime(100);
    }
    expect(session.getSnapshot().projects[0].entities[0].title).toBe(
      "A lenda de Ekko",
    );
    expect(listener).toHaveBeenCalledTimes(3);
    expect(write).not.toHaveBeenCalled();
    vi.advanceTimersByTime(750);
    expect(write).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenLastCalledWith("Salvo neste navegador");
    unsubscribe();
  });
  it("flush de navegação/unmount/exportação preserva a última tecla sem aguardar timer", () => {
    vi.useFakeTimers();
    let raw = "";
    const write = vi.fn((_key: string, value: string) => {
      raw = value;
    });
    const session = createLibrarySession(
      initial(),
      { setItem: write },
      vi.fn(),
    );
    session.update(
      (l) => ({
        projects: [
          updateEntity(l.projects[0], l.projects[0].entities[0].id, {
            document: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "última tecla" }],
                },
              ],
            },
          }),
        ],
      }),
      true,
    );
    session.flush();
    expect(loadLibrary({ getItem: () => raw })).toEqual(session.getSnapshot());
    session.flush();
    vi.runAllTimers();
    expect(write).toHaveBeenCalledTimes(1);
  });
  it("operações concorrentes usam o snapshot mais recente e gravação imediata inclui rascunho", () => {
    vi.useFakeTimers();
    const write = vi.fn();
    const session = createLibrarySession(
      initial(),
      { setItem: write },
      vi.fn(),
    );
    session.update(
      (l) => ({
        projects: [
          updateEntity(l.projects[0], l.projects[0].entities[0].id, {
            title: "Rascunho",
          }),
        ],
      }),
      true,
    );
    session.update((l) => ({
      projects: [{ ...l.projects[0], name: "Renomeado" }],
    }));
    expect(session.getSnapshot().projects[0].entities[0].title).toBe(
      "Rascunho",
    );
    expect(JSON.parse(write.mock.calls[0][1]).projects[0].name).toBe(
      "Renomeado",
    );
    vi.runAllTimers();
    expect(write).toHaveBeenCalledTimes(1);
    session.update((l) => l);
    expect(write).toHaveBeenCalledTimes(1);
  });
  it("quota não descarta conteúdo em memória e permite tentar flush novamente", () => {
    const status = vi.fn(),
      write = vi.fn().mockImplementationOnce(() => {
        throw new Error("Quota");
      });
    const session = createLibrarySession(initial(), { setItem: write }, status);
    session.update((l) => ({
      projects: [{ ...l.projects[0], name: "Novo nome" }],
    }));
    expect(status).toHaveBeenLastCalledWith(
      "Falha ao salvar · exporte um backup",
    );
    expect(session.getSnapshot().projects[0].name).toBe("Novo nome");
    session.flush();
    expect(status).toHaveBeenLastCalledWith("Salvo neste navegador");
  });
  it("apaga somente o projeto solicitado e persiste alterações pendentes dos demais", () => {
    vi.useFakeTimers();
    let raw = "";
    const first = createProject("Primeiro"),
      second = initial().projects[0];
    const write = vi.fn((_key: string, value: string) => {
      raw = value;
    });
    const session = createLibrarySession(
      { projects: [first, second] },
      { setItem: write },
      vi.fn(),
    );
    session.update(
      (library) => ({
        projects: [
          library.projects[0],
          { ...library.projects[1], name: "Última edição" },
        ],
      }),
      true,
    );
    const survivor = session.getSnapshot().projects[1];
    const listener = vi.fn();
    session.subscribe(listener);
    session.removeProject(first.id);
    expect(session.getSnapshot().projects).toEqual([survivor]);
    expect(session.getSnapshot().projects[0]).toBe(survivor);
    expect(loadLibrary({ getItem: () => raw }).projects).toEqual([survivor]);
    vi.runAllTimers();
    expect(write).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledOnce();
  });
  it("não publica exclusão quando a gravação falha e permite nova tentativa", () => {
    const original = initial(),
      listener = vi.fn();
    const write = vi.fn().mockImplementationOnce(() => {
      throw new Error("SecurityError");
    });
    const session = createLibrarySession(original, { setItem: write }, vi.fn());
    session.subscribe(listener);
    expect(() => session.removeProject(original.projects[0].id)).toThrow();
    expect(session.getSnapshot()).toBe(original);
    expect(listener).not.toHaveBeenCalled();
    session.removeProject(original.projects[0].id);
    expect(session.getSnapshot().projects).toEqual([]);
    expect(listener).toHaveBeenCalledOnce();
  });
  it("ignora ID ausente sem gravar ou publicar", () => {
    const write = vi.fn();
    const session = createLibrarySession(
      initial(),
      { setItem: write },
      vi.fn(),
    );
    const original = session.getSnapshot();
    session.removeProject("inexistente");
    expect(session.getSnapshot()).toBe(original);
    expect(write).not.toHaveBeenCalled();
  });
});
