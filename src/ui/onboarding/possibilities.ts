// SPDX-License-Identifier: MPL-2.0
export interface Possibility {
  id: "origins" | "inhabitants" | "consequences";
  name: string;
  hint: string;
  phrase: string;
  question: string;
  invitation: string;
  symbol: string;
  color: string;
  x: number;
  y: number;
  // Slot for author-supplied 256×144 art. No unlicensed placeholder files.
  artwork?: string;
}
export const possibilities: readonly Possibility[] = [
  { id: "origins", name: "Origens", hint: "Como começou?", phrase: "Toda história tem um começo.",
    question: "Como tudo começou?", invitation: "O que tornou isso possível? Uma descoberta, uma necessidade ou algo inesperado?",
    symbol: "✧", color: "#d1adff", x: 23, y: 24 },
  { id: "inhabitants", name: "Habitantes", hint: "Quem vive nesse mundo?", phrase: "Um mundo ganha vida por quem o habita.",
    question: "Quem faz parte desse mundo?", invitation: "Quem vive aqui? Que desejos, costumes ou diferenças você gostaria de imaginar?",
    symbol: "◌", color: "#9fd4c4", x: 77, y: 24 },
  { id: "consequences", name: "Consequências", hint: "O que mudou?", phrase: "Uma ideia pode abrir muitos caminhos.",
    question: "O que mudou a partir disso?", invitation: "Como essa ideia transforma o cotidiano? O que se torna possível — ou mais difícil?",
    symbol: "✦", color: "#efce80", x: 50, y: 83 },
];
export type PossibilityId = Possibility["id"];
export function isPossibilityId(value: unknown): value is PossibilityId {
  return possibilities.some(p => p.id === value);
}
