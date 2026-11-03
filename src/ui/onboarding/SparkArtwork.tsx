// SPDX-License-Identifier: MPL-2.0
import { useState } from "react";
import { AsterismMark } from "../home/AsterismMark";
import type { Possibility } from "./possibilities";

// Only author-supplied files may populate possibility.artwork. Until then use
// the existing tree at an integer scale inside a 16:9 CSS placeholder.
export function SparkArtwork({ possibility, imageUrl, compact = false }: { possibility?: Possibility; imageUrl?: string; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = imageUrl || possibility?.artwork;
  return <figure className={`spark-artwork${imageUrl ? " is-reference" : ""}${compact ? " is-compact" : ""}`}>
    {url && !failed ? <img src={url} alt={imageUrl ? "Referência visual da ideia central" : `Ilustração de ${possibility?.name ?? "inspiração"}`}
      className={imageUrl ? "spark-reference-image" : "spark-default-image"} draggable={false} referrerPolicy="no-referrer"
      onError={() => setFailed(true)} /> : <div className="spark-art-placeholder" aria-label="Espaço de inspiração com a árvore ASTERISM">
      <AsterismMark /><span aria-hidden="true">✧</span>
    </div>}
    {!compact && <figcaption>{failed ? "Imagem indisponível · seu texto está preservado" : possibility?.phrase ?? "Uma ideia pode abrir muitos caminhos."}</figcaption>}
  </figure>;
}
