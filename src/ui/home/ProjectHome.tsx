// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef, useState } from "react";
import type { Project } from "../../domain/model";
import { PwaStatus } from "../PwaStatus";
import { AsterismMark } from "./AsterismMark";

export function ProjectHome({
  projects,
  open,
  create,
  demo,
  importFile,
  remove,
  cleanReferences,
  active = true,
}: {
  projects: Project[];
  open: (project: Project) => void;
  create: (name: string) => void;
  demo: () => void;
  importFile: () => void;
  remove: (id: string) => void;
  cleanReferences: (id: string) => Promise<void>;
  active?: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const createDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (creating) createDialog.current?.showModal();
  }, [creating]);
  useEffect(() => {
    if (deleting && !deleteDialog.current?.open)
      deleteDialog.current?.showModal();
    else if (!deleting && deleted)
      heading.current?.focus({ preventScroll: true });
  }, [deleting, deleted]);

  async function confirmRemoval() {
    if (!deleting || busy) return;
    setBusy(true);
    setError("");
    if (!deleted) {
      try {
        remove(deleting.id);
        setDeleted(true);
      } catch {
        setError(
          "Não foi possível salvar a exclusão. O universo e seus PDFs foram mantidos. Tente novamente.",
        );
        setBusy(false);
        return;
      }
    }
    try {
      await cleanReferences(deleting.id);
      setFeedback("Universo apagado.");
      setDeleting(null);
    } catch {
      setError(
        "O universo foi apagado, mas a limpeza dos PDFs falhou. Tente novamente para liberar o espaço ou feche este aviso.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="asterism-home">
      <div className="asterism-window">
      <header className="asterism-header">
        <div className="asterism-brand">
          <span className="asterism-logo">
            <AsterismMark />
          </span>
          <span>
            <strong>ASTERISM</strong>
            <small>Worldbuilding for Anything</small>
          </span>
        </div>
        <span className="asterism-local">
          <i aria-hidden="true" />
          Neste dispositivo
        </span>
      </header>
      <div className="asterism-content">
      <div className="asterism-workspace">
        <section
          className="asterism-library"
          aria-labelledby="asterism-library-title"
        >
          <div className="asterism-library-heading">
            <div>
              <span className="eyebrow">SUA BIBLIOTECA</span>
              <h1 id="asterism-library-title" ref={heading} tabIndex={-1}>
                Seus universos<span>.</span>
              </h1>
            </div>
            <div className="asterism-library-tools">
            <span className="asterism-project-count">
              {projects.length}{" "}
              {projects.length === 1 ? "universo" : "universos"}
            </span>
            <div className="asterism-actions">
              <button onClick={importFile}><span aria-hidden="true">↥</span>Importar projeto</button>
              <button className="primary" onClick={() => setCreating(true)}><span aria-hidden="true">＋</span>Criar universo</button>
            </div>
            </div>
          </div>
          {feedback && (
            <p className="asterism-feedback" role="status">
              {feedback}
            </p>
          )}
          {projects.length ? (
            <div className={`asterism-projects${projects.length <= 6 ? " is-curated-library" : ""}${projects.length <= 2 || projects.length === 4 ? " is-small-library" : ""}`}>
              {projects.map((project, index) => (
                <article
                  className={`asterism-project asterism-tone-${project.id.charCodeAt(0) % 3}`}
                  key={project.id}
                  data-project-id={project.id}
                >
                  <button
                    className="asterism-open"
                    onClick={() => open(project)}
                    aria-label={`Abrir universo ${project.name}`}
                  >
                    <span className="asterism-project-cover" aria-hidden="true">
                      <span className="asterism-cover-grid" />
                      <AsterismMark />
                      <span className="asterism-cover-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="asterism-project-info">
                      <strong>{project.name}</strong>
                      <span>
                        {project.kind === "demo" ? "Demonstração · " : ""}
                        {project.entities.length} elementos ·{" "}
                        {project.relations.length} conexões
                      </span>
                    </span>
                  </button>
                  <button
                    className="asterism-delete"
                    aria-label={`Apagar universo ${project.name}`}
                    title="Apagar universo"
                    onClick={() => {
                      setError("");
                      setFeedback("");
                      setDeleted(false);
                      setDeleting(project);
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="asterism-empty">
              <span>
                <AsterismMark />
              </span>
              <h2>Seu primeiro universo.</h2>
              <p>Um lugar para todas as suas ideias.</p>
              <button onClick={demo}>
                Abrir demonstração ↗
              </button>
            </div>
          )}
        </section>
      </div>
      <div className="asterism-home-end">
      {active && <PwaStatus />}
      </div>
      </div>
      <footer className="asterism-footer">
        <span>
          Um projeto <strong>PlayToSmilles</strong>
        </span>
        <span>Armazenamento local · Exporte backups · <a href={`${import.meta.env.BASE_URL}legal/`} target="_blank" rel="noopener noreferrer">Código-fonte e licenças</a></span>
      </footer>
      </div>
      {creating && (
        <dialog
          ref={createDialog}
          className="asterism-dialog"
          aria-labelledby="asterism-create-title"
          onCancel={() => setCreating(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCreating(false);
              setName("");
              create(name);
            }}
          >
            <span className="asterism-dialog-mark">
              <AsterismMark />
            </span>
            <h2 id="asterism-create-title">Um novo universo.</h2>
            <label>
              Nome do universo
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="Como se chama seu mundo?"
              />
            </label>
            <div className="asterism-dialog-actions">
              <button type="button" onClick={() => setCreating(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary">
                Criar universo
              </button>
            </div>
          </form>
        </dialog>
      )}
      {deleting && (
        <dialog
          ref={deleteDialog}
          className="asterism-dialog"
          aria-labelledby="asterism-delete-title"
          aria-describedby="asterism-delete-description"
          onCancel={(e) => {
            if (busy) e.preventDefault();
            else setDeleting(null);
          }}
          aria-busy={busy}
        >
          <span className="asterism-dialog-kicker">GERENCIAR UNIVERSO</span>
          <h2 id="asterism-delete-title">
            {deleted ? "Limpar referências?" : "Apagar universo?"}
          </h2>
          <p id="asterism-delete-description">
            {deleted ? (
              "O universo já foi removido da biblioteca."
            ) : (
              <>
                “<strong>{deleting.name}</strong>” e seus PDFs serão removidos
                deste navegador. Esta ação não pode ser desfeita.
              </>
            )}
          </p>
          {error && (
            <p className="asterism-dialog-error" role="alert">
              {error}
            </p>
          )}
          <div className="asterism-dialog-actions">
            <button disabled={busy} onClick={() => setDeleting(null)}>
              {deleted ? "Fechar" : "Cancelar"}
            </button>
            <button
              className="danger"
              disabled={busy}
              onClick={() => void confirmRemoval()}
            >
              {busy
                ? "Apagando…"
                : deleted
                  ? "Tentar limpar PDFs"
                  : "Apagar universo"}
            </button>
          </div>
        </dialog>
      )}
    </main>
  );
}
