// SPDX-License-Identifier: MPL-2.0
import type { Category } from "../domain/model";
import { createElement, type ReactNode } from "react";
import playerIcon from "../assets/icons/player.png";
import localIcon from "../assets/icons/locale-sprite.png";
import eventIcon from "../assets/icons/clock-sprite.png";
import documentIcon from "../assets/icons/document-sprite.png";

export const categoryPresentation: Record<Category, { symbol: ReactNode; color: string }> = {
  Personagem: { symbol: createElement("img", { src: playerIcon, className: "category-pixel-icon", alt: "", "aria-hidden": true, draggable: false }), color: "var(--category-character)" },
  Local: { symbol: createElement("img", { src: localIcon, className: "category-pixel-icon category-pixel-icon--local", alt: "", "aria-hidden": true, draggable: false }), color: "var(--category-place)" },
  Facção: { symbol: "⚑", color: "var(--category-faction)" },
  Magia: { symbol: "✧", color: "var(--category-magic)" },
  Evento: { symbol: createElement("img", { src: eventIcon, className: "category-pixel-icon category-pixel-icon--event", alt: "", "aria-hidden": true, draggable: false }), color: "var(--category-event)" },
  Ideia: { symbol: "✦", color: "var(--category-idea)" },
  Artefato: { symbol: "⟡", color: "var(--category-artifact)" },
  Documento: { symbol: createElement("img", { src: documentIcon, className: "category-pixel-icon category-pixel-icon--document", alt: "", "aria-hidden": true, draggable: false }), color: "var(--category-document)" },
};
