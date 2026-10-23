// SPDX-License-Identifier: MPL-2.0
import { useState } from "react";
import type { Entity } from "../domain/model";

import { categoryPresentation } from "./categoryPresentation";

// Key this artwork by imageUrl at the call site: changing a URL retries loading
// only the artwork, without remounting the card or losing React Flow metadata.
export function EntityArtwork({
  entity,
  preview = false,
}: {
  entity: Entity;
  preview?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`entity-artwork artwork-${entity.category}`}>
      <div className="artwork-fallback" aria-hidden="true">
        <span className="artwork-orbit" />
        <span className="artwork-symbol">{categoryPresentation[entity.category].symbol}</span>
        <span className="artwork-caption">
          {failed ? "Imagem indisponível" : "Um mundo por descobrir"}
        </span>
      </div>
      {entity.imageUrl && !failed && (
        <img
          src={entity.imageUrl}
          alt={preview ? `Imagem de ${entity.title}` : ""}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
      {preview && failed && (
        <span className="artwork-error" role="status">
          Não foi possível carregar a imagem.
        </span>
      )}
    </div>
  );
}
