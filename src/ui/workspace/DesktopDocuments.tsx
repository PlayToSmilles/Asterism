import type { Project } from "../../domain/model";

export function DesktopDocuments({
  project,
  open,
  close,
  create,
}: {
  project: Project;
  open: (id: string) => void;
  close: () => void;
  create: () => void;
}) {
  const documents = project.entities.filter(
    (entity) => entity.category === "Documento",
  );
  return (
    <aside className="workspace-documents" aria-label="Documentos do universo">
      <header>
        <div>
          <span className="eyebrow">BIBLIOTECA DE ESCRITA</span>
          <h2>
            Documentos <span>{documents.length}</span>
          </h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Fechar documentos"
        >
          ×
        </button>
      </header>
      <p className="muted">As histórias que dão vida ao seu universo.</p>
      <div className="workspace-document-list">
        {documents.map((entity) => (
          <button key={entity.id} onClick={() => open(entity.id)}>
            <span aria-hidden="true">▤</span>
            <span>
              <strong>{entity.title}</strong>
              <small>{entity.description || "Continuar escrevendo"}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      {!documents.length && (
        <div className="workspace-documents-empty">
          <span aria-hidden="true">▤</span>
          <h3>Uma página em branco.</h3>
          <p>
            Crie um elemento da categoria Documento para começar a escrever.
          </p>
        </div>
      )}
      <button className="primary workspace-document-create" onClick={create}>
        ＋ Novo elemento
      </button>
    </aside>
  );
}
