// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef } from "react";
import type { Entity, Project } from "../../domain/model";
import { getRelationKind } from "../../domain/relations";
import { relationLabels } from "../relationPresentation";
import { EntityArtwork } from "../EntityArtwork";

export function MobileEntityDetails({
  entity,
  project,
  close,
  edit,
  locate,
  select,
  write,
}: {
  entity: Entity;
  project: Project;
  close: () => void;
  edit: () => void;
  locate: () => void;
  select: (id: string) => void;
  write: (id: string) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [entity.id]);
  const relations = project.relations.filter(
    (relation) =>
      relation.sourceId === entity.id || relation.targetId === entity.id,
  );
  return (
    <section className="studio-details" aria-label="Informações do elemento">
      <header className="studio-details-bar">
        <button onClick={close} aria-label="Voltar à exploração">
          ‹ Voltar
        </button>
        <button onClick={edit}>Editar</button>
      </header>
      <div className="studio-detail-cover">
        <EntityArtwork
          key={entity.imageUrl ?? "fallback"}
          entity={entity}
          preview
        />
        <div className="studio-detail-shade" />
        <div>
          <span className="eyebrow">{entity.category}</span>
          <h1 ref={heading} tabIndex={-1}>
            {entity.title}
          </h1>
        </div>
      </div>
      <div className="studio-detail-content">
        <div className="studio-detail-actions">
          {entity.category === "Documento" && (
            <button className="primary" onClick={() => write(entity.id)}>
              Abrir documento ↗
            </button>
          )}
          <button onClick={locate}>Ver no canvas ↗</button>
        </div>
        <span className="eyebrow">
          {entity.category === "Documento" ? "RESUMO" : "SOBRE ESTE ELEMENTO"}
        </span>
        <p className="studio-description">
          {entity.description ||
            "Esta ideia ainda tem espaço para crescer. Toque em Editar para contar mais."}
        </p>
        <div className="studio-section-heading">
          <h2>Conexões</h2>
          <span>{relations.length}</span>
        </div>
        {!relations.length && (
          <p className="muted">
            No canvas, toque no ponto de um elemento e depois no ponto de outro
            para conectá-los.
          </p>
        )}
        {relations.map((relation) => {
          const other = project.entities.find(
            (item) =>
              item.id ===
              (relation.sourceId === entity.id
                ? relation.targetId
                : relation.sourceId),
          );
          if (!other) return null;
          const kind = getRelationKind(relation);
          const arrow =
            kind === "directional"
              ? relation.sourceId === entity.id
                ? "→"
                : "←"
              : kind === "reciprocal"
                ? "↔"
                : "•—•";
          return (
            <div className="studio-relation" key={relation.id}>
              <button onClick={() => select(other.id)}>
                <span className="studio-relation-symbol" aria-hidden="true">
                  {arrow}
                </span>
                <span>
                  <small>
                    {relationLabels[kind]} · {relation.label}
                  </small>
                  <strong>{other.title}</strong>
                  <span>{other.category}</span>
                </span>
                <span aria-hidden="true">›</span>
              </button>
              <button
                className="studio-edit-relation"
                onClick={() => select(relation.id)}
              >
                Editar relação
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
