import { useId, useState } from "react";
import { isValidImageUrl, MAX_IMAGE_URL_LENGTH } from "../domain/imageUrl";
import { EntityArtwork } from "./EntityArtwork";
import { getRelationKind, linkedDocuments } from "../domain/relations";
import { relationLabels, relationDescriptions } from "./relationPresentation";
import {
  categories,
  removeEntity,
  removeRelation,
  updateEntity,
  updateRelation,
  setRelationKind,
  relationKinds,
  type RelationKind,
  type Category,
  type Project,
} from "../domain/model";
interface Props {
  locked?: boolean;
  exploreNeighborhood: (id: string) => void;
  focusedRelation: string | null;
  focusConnection: (id: string) => void;
  visitEntity: (id: string) => void;
  project: Project;
  selected: string;
  close: () => void;
  change: (operation: (p: Project) => Project) => void;
  openDocument: (id: string) => void;
}
export function Inspector({
  project,
  locked = false,
  focusedRelation,
  exploreNeighborhood,
  focusConnection,
  visitEntity,
  selected,
  close,
  change,
  openDocument,
}: Props) {
  const panelId = useId();
  const [section, setSection] = useState<"information" | "connections">(
    "information",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState("");
  const entity = project.entities.find((e) => e.id === selected);
  const relation = project.relations.find((r) => r.id === selected);
  if (!entity && !relation) return null;
  const related = project.relations.filter(
    (r) => r.sourceId === selected || r.targetId === selected,
  );
  const documents = entity ? linkedDocuments(project, entity.id) : [];
  return (
    <aside
      className="inspector"
      aria-label="Painel de edição"
      data-section={section}
    >
      <header>
        <span className="eyebrow">
          {entity ? "Detalhes do elemento" : "Detalhes da conexão"}
        </span>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Fechar painel"
        >
          ×
        </button>
      </header>
      <h2>{entity ? entity.title : "Tudo tem uma ligação."}</h2>
      {entity && (
        <span className="eyebrow inspector-category">{entity.category}</span>
      )}
      {entity && <button className="explore-neighborhood" disabled={locked} onClick={() => exploreNeighborhood(entity.id)}>✧ Explorar vizinhança</button>}
      {entity && (
        <div
          className="inspector-switch"
          role="group"
          aria-label="Seções do elemento"
        >
          <button
            aria-pressed={section === "information"}
            aria-controls={panelId + "-information"}
            onClick={() => setSection("information")}
          >
            Informações
          </button>
          <button
            aria-pressed={section === "connections"}
            aria-controls={panelId + "-linked " + panelId + "-relations"}
            onClick={() => setSection("connections")}
          >
            Conexões <span>{related.length}</span>
          </button>
        </div>
      )}
      <p className="muted">
        As alterações são salvas automaticamente neste navegador.
      </p>
      {entity ? (
        <>
          {entity.category === "Documento" && (
            <button className="primary" onClick={() => openDocument(entity.id)}>
              ▤ Abrir documento
            </button>
          )}
          <section
            className="linked-documents inspector-connections"
            id={panelId + "-linked"}
            aria-label="Documentos vinculados"
          >
            <div className="linked-documents-heading">
              <span className="eyebrow">Documentos vinculados</span>
              <span className="document-count">{documents.length}</span>
            </div>
            {documents.length === 0 ? (
              <p className="muted">
                Conecte este elemento a um Documento no canvas para encontrá-lo
                aqui.
              </p>
            ) : (
              documents.map((document) => (
                <button
                  className="document-link"
                  key={document.id}
                  onClick={() => openDocument(document.id)}
                >
                  <span aria-hidden="true">▤</span>
                  <span>
                    <strong>{document.title}</strong>
                    <small>Abrir documento</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))
            )}
          </section>
          <div className="inspector-information" id={panelId + "-information"}>
            <label className="inspector-title-field">
              Título
              <input
                disabled={locked}
                key={`${entity.id}-title`}
                defaultValue={entity.title}
                maxLength={120}
                onBlur={(e) => {
                  const title = e.target.value.trim() || "Sem título";
                  e.target.value = title;
                  change((p) => updateEntity(p, selected, { title }));
                }}
              />
            </label>
            <label className="inspector-category-field">
              Categoria
              <select
                value={entity.category}
                disabled={locked || entity.category === "Documento"}
                onChange={(e) =>
                  change((p) =>
                    updateEntity(p, selected, {
                      category: e.target.value as Category,
                    }),
                  )
                }
              >
                {categories
                  .filter(
                    (c) => c !== "Documento" || entity.category === "Documento",
                  )
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </label>
            {entity.imageUrl && (
              <div className="inspector-artwork">
                <EntityArtwork key={entity.imageUrl} entity={entity} preview />
              </div>
            )}
            <label className="inspector-image-field">
              URL da imagem (opcional)
              <input
                disabled={locked}
                type="url"
                key={`${entity.id}-image`}
                defaultValue={entity.imageUrl ?? ""}
                maxLength={MAX_IMAGE_URL_LENGTH}
                placeholder="https://exemplo.com/imagem.jpg"
                aria-invalid={!!imageError}
                aria-describedby={
                  imageError ? "image-url-error" : "image-url-help"
                }
                onChange={() => setImageError("")}
                onBlur={(e) => {
                  const imageUrl = e.target.value.trim();
                  if (imageUrl && !isValidImageUrl(imageUrl)) {
                    setImageError(
                      "Informe uma URL HTTP ou HTTPS válida. A imagem anterior foi mantida.",
                    );
                    return;
                  }
                  e.target.value = imageUrl;
                  setImageError("");
                  if ((entity.imageUrl ?? "") !== imageUrl)
                    change((p) =>
                      updateEntity(p, selected, {
                        imageUrl: imageUrl || undefined,
                      }),
                    );
                }}
              />
            </label>
            {imageError ? (
              <p id="image-url-error" className="field-error" role="alert">
                {imageError}
              </p>
            ) : (
              <p id="image-url-help" className="field-note image-help">
                Salva ao sair do campo. Apague a URL para remover a imagem.
              </p>
            )}
            <label className="inspector-description-field">
              {entity.category === "Documento"
                ? "Resumo (opcional)"
                : "Descrição"}
              <textarea
                disabled={locked}
                value={entity.description}
                maxLength={4000}
                onChange={(e) =>
                  change((p) =>
                    updateEntity(p, selected, { description: e.target.value }),
                  )
                }
                placeholder="Quem é? O que torna essa ideia especial?"
                rows={7}
              />
            </label>
            <span className="field-note">
              {entity.description.length}/4000 caracteres
            </span>
          </div>
          <section
            className="relation-list inspector-connections"
            id={panelId + "-relations"}
          >
            <span className="eyebrow">Conexões · {related.length}</span>
            {related.length === 0 && (
              <p className="muted">
                Arraste o ponto direito deste elemento até o ponto esquerdo de
                outro.
              </p>
            )}
            {related.map((r) => (
              <div key={r.id} className="inspector-relation" data-focused={focusedRelation === r.id}>
                <button className="relation-focus-action" aria-pressed={focusedRelation === r.id} onClick={() => focusConnection(r.id)}>
                <span>
                  {
                    project.entities.find(
                      (e) =>
                        e.id ===
                        (r.sourceId === selected ? r.targetId : r.sourceId),
                    )?.title
                  }
                </span>
                <small>
                  {getRelationKind(r) === "directional"
                    ? r.sourceId === selected
                      ? "→"
                      : "←"
                    : getRelationKind(r) === "reciprocal"
                      ? "↔"
                      : "•—•"}{" "}
                  {r.label}
                </small>
                <span className="relation-action-caption">Enquadrar conexão ↗</span>
                </button>
                <button className="relation-visit-action" onClick={() => visitEntity(r.sourceId === selected ? r.targetId : r.sourceId)}>Abrir elemento →</button>
              </div>
            ))}
          </section>
        </>
      ) : (
        relation && (
          <>
            <div className="connection-path">
              {project.entities.find((e) => e.id === relation.sourceId)?.title}
              <span>
                {getRelationKind(relation) === "directional"
                  ? "↓"
                  : getRelationKind(relation) === "reciprocal"
                    ? "↕"
                    : "•"}
              </span>
              {project.entities.find((e) => e.id === relation.targetId)?.title}
            </div>
            <label>
              Rótulo da relação
              <input
                disabled={locked}
                key={relation.id}
                defaultValue={relation.label}
                maxLength={100}
                onBlur={(e) => {
                  const label = e.target.value.trim() || "se conecta a";
                  e.target.value = label;
                  change((p) => updateRelation(p, selected, label));
                }}
              />
            </label>
            <label>
              Tipo de relação
              <select
                disabled={locked}
                value={getRelationKind(relation)}
                onChange={(e) =>
                  change((p) =>
                    setRelationKind(
                      p,
                      selected,
                      e.target.value as RelationKind,
                    ),
                  )
                }
              >
                {relationKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {relationLabels[kind]}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              {relationDescriptions[getRelationKind(relation)]}
            </p>
          </>
        )
      )}
      <div className="delete-area">
        {confirmDelete ? (
          <>
            <p>
              Excluir{" "}
              {entity ? "este elemento e suas conexões" : "esta conexão"}?
            </p>
            <div className="button-row">
              <button onClick={() => setConfirmDelete(false)}>Cancelar</button>
              <button
                disabled={locked}
                className="danger"
                onClick={() => {
                  change((p) =>
                    entity
                      ? removeEntity(p, selected)
                      : removeRelation(p, selected),
                  );
                  close();
                }}
              >
                Excluir
              </button>
            </div>
          </>
        ) : (
          <button
            disabled={locked}
            className="danger ghost"
            onClick={() => setConfirmDelete(true)}
          >
            Excluir {entity ? "elemento" : "conexão"}
          </button>
        )}
      </div>
    </aside>
  );
}
