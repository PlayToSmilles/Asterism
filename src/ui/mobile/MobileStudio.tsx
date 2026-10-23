// SPDX-License-Identifier: MPL-2.0
import { useMemo, useState } from "react";
import { categories, type Category, type Project } from "../../domain/model";
import { EntityArtwork } from "../EntityArtwork";
import { findEntities } from "./studioSearch";

export type StudioTab = "universe" | "writing" | "canvas" | "references";
const tabs: { id: StudioTab; label: string; path: string }[] = [
  {
    id: "universe",
    label: "Universo",
    path: "M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  },
  {
    id: "writing",
    label: "Escrita",
    path: "M5 3h10l4 4v14H5V3Zm9 0v5h5M8 12h8M8 16h6",
  },
  {
    id: "canvas",
    label: "Canvas",
    path: "M8 6h8M6 8v8M18 8v8M8 18h8M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3zM16 16h5v5h-5z",
  },
  {
    id: "references",
    label: "Referências",
    path: "M4 4h12v16H4zM8 8h4M8 12h4M19 7h2v16H8",
  },
];

export function StudioIcon({ tab }: { tab: StudioTab }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={tabs.find((item) => item.id === tab)!.path} />
    </svg>
  );
}

export function MobileNavigation({
  active,
  navigate,
  create,
}: {
  active: StudioTab;
  navigate: (tab: StudioTab) => void;
  create: () => void;
}) {
  return (
    <div className="studio-navigation">
      <nav className="studio-dock" aria-label="Áreas do universo">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            aria-current={active === id ? "page" : undefined}
            onClick={() => navigate(id)}
          >
            <StudioIcon tab={id} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button
        className="studio-create"
        aria-label="Criar elemento"
        onClick={create}
      >
        ＋
      </button>
    </div>
  );
}

export function MobileStudio({
  project,
  tab,
  select,
  write,
  create,
  explore,
}: {
  project: Project;
  tab: "universe" | "writing";
  select: (id: string) => void;
  write: (id: string) => void;
  create: () => void;
  explore: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "Todas">("Todas");
  const writing = tab === "writing";
  const entities = useMemo(
    () =>
      findEntities(project.entities, query, writing ? "Documento" : category),
    [project.entities, query, writing, category],
  );
  const available = categories.filter((item) =>
    project.entities.some((entity) => entity.category === item),
  );
  return (
    <main
      className="studio-browser"
      aria-label={writing ? "Biblioteca de escrita" : "Explorar universo"}
    >
      <header className="studio-page-title">
        <span className="eyebrow">
          {writing ? "HISTÓRIAS EM CONSTRUÇÃO" : "SEU ESTÚDIO CRIATIVO"}
        </span>
        <h1>
          {writing ? "Palavras criam mundos." : "Um mundo de possibilidades."}
        </h1>
        <p>
          {writing
            ? "Abra um documento. Dê voz ao seu universo."
            : "Encontre uma ideia. Descubra o que a conecta."}
        </p>
      </header>
      {!writing && (
        <button className="studio-map-preview" onClick={explore}>
          <span className="studio-constellation" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="studio-map-copy">
            <small>O TODO, EM PERSPECTIVA</small>
            <strong>Explore as conexões</strong>
            <span>
              {project.entities.length} elementos · {project.relations.length}{" "}
              relações
            </span>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      )}
      <label className="studio-search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <span className="sr-only">
          {writing ? "Buscar documentos" : "Buscar elementos"}
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            writing ? "Buscar título ou resumo" : "Buscar no seu universo"
          }
        />
      </label>
      {!writing && (
        <div
          className="studio-filters"
          role="group"
          aria-label="Filtrar categoria"
        >
          {(["Todas", ...available] as const).map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="studio-section-heading">
        <h2>{writing ? "Seus documentos" : "Elementos"}</h2>
        <span>{entities.length}</span>
      </div>
      <div
        className={
          writing ? "studio-entries writing-entries" : "studio-entries"
        }
      >
        {entities.map((entity) => (
          <button
            className="studio-entry"
            key={entity.id}
            onClick={() => (writing ? write(entity.id) : select(entity.id))}
          >
            <span className="studio-entry-art">
              <EntityArtwork
                key={entity.imageUrl ?? "fallback"}
                entity={entity}
              />
            </span>
            <span className="studio-entry-copy">
              <small>{entity.category}</small>
              <strong>{entity.title}</strong>
              <span>
                {entity.description ||
                  (writing
                    ? "Continue sua história"
                    : "Uma ideia para explorar")}
              </span>
            </span>
            <span className="studio-chevron" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
      {!entities.length && (
        <div className="studio-empty">
          <span aria-hidden="true">✧</span>
          <h2>
            {query || category !== "Todas"
              ? "Nenhum resultado por aqui."
              : writing
                ? "A primeira página é sua."
                : "Seu universo começa com uma ideia."}
          </h2>
          <p>
            {query || category !== "Todas"
              ? "Tente outro termo ou categoria."
              : "Crie um personagem, um lugar ou um documento."}
          </p>
          <button onClick={create}>＋ Criar elemento</button>
        </div>
      )}
      <p className="studio-local-note">
        Só neste dispositivo. Exporte um backup em Arquivos.
      </p>
    </main>
  );
}
