import type { CSSProperties, ReactNode } from "react";
import type { Entity } from "../../domain/model";
import { EntityArtwork } from "../EntityArtwork";
import type { Detail } from "./cardPresentation";
import { categoryPresentation } from "../categoryPresentation";

export function WorldCard({
  entity,
  selected,
  children,
  emphasis = "normal",
  detail = "full",
  captionScale,
  panoramic = false,
}: {
  panoramic?: boolean;
  captionScale?: number;
  detail?: Detail;
  emphasis?: "normal" | "related" | "muted";
  entity: Entity;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`universe-card card-${entity.category}${selected ? " selected" : ""}`}
      data-emphasis={emphasis}
      data-detail={detail}
      style={{ "--category-color": categoryPresentation[entity.category].color } as CSSProperties}
      aria-label={`${entity.title}, ${entity.category}`}
    >
      <div className="card-frame" aria-hidden="true" />
      <div className="card-surface">
        {detail === "symbol" || (panoramic && detail === "compact")
          ? <span className="lightweight-symbol" aria-hidden="true">{categoryPresentation[entity.category].symbol}</span>
          : <><EntityArtwork key={entity.imageUrl ?? "no-image"} entity={entity} /><div className="card-shade" /></>}
        {detail !== "symbol" && <div className="card-content">
          <span className="eyebrow">{entity.category}</span>
          <h3 title={entity.title}>{entity.title}</h3>
        </div>}
      </div>
      {captionScale !== undefined && detail === "symbol" && <span className="semantic-caption" title={entity.title} style={{ transform: `translateX(-50%) scale(${captionScale})` }}>{entity.title}</span>}
      {children}
    </article>
  );
}
