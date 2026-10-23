import type { Entity, Category } from "../../domain/model";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

// A view of the existing entities, never a second editable collection.
export function findEntities(
  entities: Entity[],
  query: string,
  category: Category | "Todas" = "Todas",
) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return entities.filter((entity) => {
    if (category !== "Todas" && entity.category !== category) return false;
    const text = normalize(
      `${entity.title} ${entity.category} ${entity.description}`,
    );
    return terms.every((term) => text.includes(term));
  });
}
