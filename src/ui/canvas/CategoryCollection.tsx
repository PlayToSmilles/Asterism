// SPDX-License-Identifier: MPL-2.0
import { useMemo, type CSSProperties } from "react";
import type { Category, Entity } from "../../domain/model";
import { EntityArtwork } from "../EntityArtwork";
import { categoryPresentation } from "../categoryPresentation";
import { collectionEntities } from "./collectionOrdering";

const categoryPlural: Record<Category, string> = {
  Personagem: "Personagens", Local: "Locais", "Facção": "Facções", Magia: "Magias",
  Evento: "Eventos", Ideia: "Ideias", Artefato: "Artefatos", Documento: "Documentos",
};

export function CategoryCollection({ category, entities, selected, select }: {
  category: Category; entities: Entity[]; selected: string | null; select: (id: string) => void;
}) {
  const members = useMemo(() => collectionEntities(entities, category), [entities, category]);
  return <section className="category-collection" aria-label={`Acervo de ${category}`} style={{ "--category-color": categoryPresentation[category].color } as CSSProperties}>
    <div className="category-collection-inner">
      <header><span className="eyebrow">ACERVO VIVO</span><h1>{categoryPlural[category]}</h1><p>{members.length} {members.length === 1 ? "elemento" : "elementos"}</p></header>
      {!members.length ? <p className="category-collection-empty">Nenhum elemento nesta categoria ainda.</p> :
        <div className="category-collection-grid">{members.map(entity => <button type="button" className={`collection-card${entity.imageUrl ? " has-image" : ""}`} key={entity.id}
          aria-pressed={selected === entity.id} onClick={() => select(entity.id)}>
          <div className="collection-media">{entity.imageUrl ? <div className="collection-art"><EntityArtwork key={entity.imageUrl} entity={entity} /></div>
            : <span className="collection-icon" aria-hidden="true">{categoryPresentation[entity.category].symbol}</span>}</div>
          <div className="collection-card-content"><span>{entity.category}</span><strong>{entity.title}</strong>
            {entity.description && <p>{entity.description}</p>}</div>
        </button>)}</div>}
    </div>
  </section>;
}

