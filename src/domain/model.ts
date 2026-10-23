import {
  emptyDocument,
  validateDocument,
  type DocumentContent,
} from "./document";
export const categories = [
  "Personagem",
  "Local",
  "Facção",
  "Magia",
  "Evento",
  "Ideia",
  "Artefato",
  "Documento",
] as const;
export type Category = (typeof categories)[number];
export type Position = { x: number; y: number };
export const relationKinds = [
  "directional",
  "reciprocal",
  "associative",
] as const;
export type RelationKind = (typeof relationKinds)[number];
export interface Entity {
  id: string;
  title: string;
  category: Category;
  description: string;
  imageUrl?: string;
  document?: DocumentContent;
  position: Position;
}
export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  kind?: RelationKind;
}
export interface Project {
  version: 1;
  id: string;
  name: string;
  kind: "user" | "demo";
  entities: Entity[];
  relations: Relation[];
  viewport: { x: number; y: number; zoom: number };
}
export function createProject(
  name = "Meu universo",
  kind: Project["kind"] = "user",
): Project {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: name.trim() || "Meu universo",
    kind,
    entities: [],
    relations: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}
export function addEntity(
  project: Project,
  position: Position,
  category: Category = "Ideia",
  title?: string,
): Project {
  return {
    ...project,
    entities: [
      ...project.entities,
      {
        id: crypto.randomUUID(),
        title:
          title?.trim() ||
          (category === "Documento" ? "Novo documento" : "Nova ideia"),
        category,
        description: "",
        ...(category === "Documento" ? { document: emptyDocument() } : {}),
        position,
      },
    ],
  };
}
export function updateEntity(
  project: Project,
  id: string,
  patch: Partial<Omit<Entity, "id">>,
): Project {
  return {
    ...project,
    entities: project.entities.map((entity) =>
      entity.id === id ? normalizeEntity({ ...entity, ...patch }) : entity,
    ),
  };
}
function normalizeEntity(entity: Entity): Entity {
  const { document, ...metadata } = entity;
  return entity.category === "Documento"
    ? { ...metadata, document: validateDocument(document ?? emptyDocument()) }
    : metadata;
}
export function moveEntities(
  project: Project,
  moves: ReadonlyArray<{ id: string; position: Position }>,
): Project {
  const positions = new Map(moves.map((move) => [move.id, move.position]));
  let changed = false;
  const entities = project.entities.map((entity) => {
    const position = positions.get(entity.id);
    if (
      !position ||
      (entity.position.x === position.x && entity.position.y === position.y)
    )
      return entity;
    changed = true;
    return { ...entity, position: { ...position } };
  });
  return changed ? { ...project, entities } : project;
}
export function removeEntity(project: Project, id: string): Project {
  return {
    ...project,
    entities: project.entities.filter((entity) => entity.id !== id),
    relations: project.relations.filter(
      (relation) => relation.sourceId !== id && relation.targetId !== id,
    ),
  };
}
export function connect(
  project: Project,
  sourceId: string,
  targetId: string,
): Project {
  if (
    !project.entities.some((e) => e.id === sourceId) ||
    !project.entities.some((e) => e.id === targetId)
  )
    return project;
  return {
    ...project,
    relations: [
      ...project.relations,
      {
        id: crypto.randomUUID(),
        sourceId,
        targetId,
        label: "se conecta a",
        kind: "directional",
      },
    ],
  };
}
export function updateRelation(
  project: Project,
  id: string,
  label: string,
): Project {
  return {
    ...project,
    relations: project.relations.map((relation) =>
      relation.id === id ? { ...relation, label } : relation,
    ),
  };
}
export function removeRelation(project: Project, id: string): Project {
  return {
    ...project,
    relations: project.relations.filter((relation) => relation.id !== id),
  };
}
export function setRelationKind(
  project: Project,
  id: string,
  kind: RelationKind,
): Project {
  return {
    ...project,
    relations: project.relations.map((relation) =>
      relation.id === id ? { ...relation, kind } : relation,
    ),
  };
}
