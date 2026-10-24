// SPDX-License-Identifier: MPL-2.0
import type { Category } from "../domain/model";
import { createElement, type ReactNode } from "react";
import playerIcon from "../assets/icons/player.png";
import localIcon from "../assets/icons/locale-sprite.png";
import eventIcon from "../assets/icons/clock-sprite.png";
import documentIcon from "../assets/icons/document-sprite.png";

export const categoryPresentation: Record<Category, { symbol: ReactNode; color: string }> = {
  Personagem: { symbol: createElement("img", { src: playerIcon, className: "category-pixel-icon", alt: "", "aria-hidden": true, draggable: false }), color: "#d1adff" },
  Local: { symbol: createElement("img", { src: localIcon, className: "category-pixel-icon category-pixel-icon--local", alt: "", "aria-hidden": true, draggable: false }), color: "#80dfce" },
  Facção: { symbol: "⚑", color: "#e8afd8" },
  Magia: { symbol: "✧", color: "#b5a0ff" },
  Evento: { symbol: createElement("img", { src: eventIcon, className: "category-pixel-icon category-pixel-icon--event", alt: "", "aria-hidden": true, draggable: false }), color: "#f3b898" },
  Ideia: { symbol: "✦", color: "#c4c9ff" },
  Artefato: { symbol: "⟡", color: "#efce80" },
  Documento: { symbol: createElement("img", { src: documentIcon, className: "category-pixel-icon category-pixel-icon--document", alt: "", "aria-hidden": true, draggable: false }), color: "#9dcdf3" },
};
