import {
  lazy,
  useCallback,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactFlowInstance, Node } from "@xyflow/react";
import type { Exploration, LayoutActivity } from "../ui/canvas/exploration";
import { focusViewport } from "../ui/canvas/canvasFocus";
import {
  addEntity,
  createProject,
  type Entity,
  type Project,
  type Category,
} from "../domain/model";
import { createDemo } from "../domain/demo";
import {
  exportProject,
  importProject,
  loadLibrary,
  type Library,
} from "../persistence/persistence";
import { UniverseCanvas, type CanvasNavigator } from "../ui/canvas/UniverseCanvas";
import { SearchTrigger, UniverseSearch } from "../ui/search/UniverseSearch";
import type { SearchResult } from "../ui/search/search";
import { searchDestination } from "../ui/search/searchNavigation";
import { Inspector } from "../ui/Inspector";
import { ReferenceLibrary } from "../ui/references/ReferenceLibrary";
import { createLibrarySession } from "../persistence/librarySession";
import { NewElement } from "../ui/NewElement";
import type { FloatingRelation } from "../ui/canvas/FloatingEdge";
import { ProjectHome } from "../ui/home/ProjectHome";
import { AsterismMark } from "../ui/home/AsterismMark";
import { removeProjectReferences } from "../persistence/referenceStore";
import { ProjectFileActions } from "../ui/ProjectFileActions";
import { useVisualViewport } from "../ui/useVisualViewport";
import { useMobile } from "../ui/mobile/useMobile";
import { useProjectTransition } from "../ui/motion/usePortalZoom";

import {
  MobileStudio,
  MobileNavigation,
  type StudioTab,
} from "../ui/mobile/MobileStudio";
import { MobileEntityDetails } from "../ui/mobile/MobileEntityDetails";
import { DesktopNavigation } from "../ui/workspace/DesktopNavigation";
import { DesktopDocuments } from "../ui/workspace/DesktopDocuments";
const DocumentEditor = lazy(() => import("../ui/documents/DocumentEditor"));

function initialState(): { library: Library; error: string } {
  try {
    return { library: loadLibrary(localStorage), error: "" };
  } catch {
    return {
      library: { projects: [] },
      error:
        "Não foi possível ler os dados locais. Eles foram preservados. Importe um backup ou crie um universo para iniciar uma nova biblioteca.",
    };
  }
}
export default function App() {
  useVisualViewport();
  const appRoot = useRef<HTMLDivElement>(null);
  const projectTransition = useProjectTransition(appRoot);
  const mobile = useMobile();
  const [mobileTab, setMobileTab] =
    useState<Exclude<StudioTab, "references">>("universe");
  const [editingDetails, setEditingDetails] = useState(false);
  const [initial] = useState(initialState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [layoutState, setLayoutState] = useState<LayoutActivity>("idle");
  const layoutPending = layoutState !== "idle";
  const [exploration, setExploration] = useState<Exploration>({ kind: "all" });
  const [mobileExploring, setMobileExploring] = useState(false);
  const [focusedRelation, setFocusedRelation] = useState<string | null>(null);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [settingsHost, setSettingsHost] = useState<HTMLDivElement | null>(null);
  const [message, setMessage] = useState(initial.error);
  const [saveStatus, setSaveStatus] = useState("Salvo neste navegador");
  const [session] = useState(() =>
    createLibrarySession(initial.library, localStorage, setSaveStatus),
  );
  const library = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [creating, setCreating] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [referenceRequest, setReferenceRequest] = useState<{ id: string; token: number } | null>(null);
  const canvasNavigate = useRef<CanvasNavigator | null>(null);
  const searchGeneration = useRef(0);
  const openSearch = useCallback(() => {
    if (projectTransition.pending || document.querySelector("dialog[open]")) return;
    searchGeneration.current++;
    setSearchOpen(true);
  }, [projectTransition]);
  const input = useRef<HTMLInputElement>(null);
  const flow = useRef<ReactFlowInstance<
    Node<{ entity: Entity }, "card">,
    FloatingRelation
  > | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const project = library.projects.find((p) => p.id === activeId);
  useEffect(() => {
    if (!activeId) return;
    const shortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey || event.shiftKey ||
        !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      if (document.querySelector("dialog[open]:not(.universe-search)")) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [activeId, openSearch]);
  const documentEntity = project?.entities.find(
    (entity) => entity.id === documentId && entity.category === "Documento",
  );
  const selectedEntity = project?.entities.find(
    (entity) => entity.id === selected,
  );
  const mobileOverlay =
    mobile &&
    ((!!selected && !focusedRelation && !mobileExploring) ||
      !!documentEntity ||
      referencesOpen ||
      (mobileTab !== "canvas" && !focusedRelation && !mobileExploring));
  function frameElements(ids: string[]) {
    requestAnimationFrame(() => {
      const instance = flow.current;
      const box = canvas.current?.getBoundingClientRect();
      if (!instance || !box) return;
      const nodes = instance.getNodes().filter((node) => ids.includes(node.id));
      if (!nodes.length) return;
      const panel = canvas.current?.parentElement?.querySelector(".inspector")?.getBoundingClientRect();
      const right = !mobile && panel ? Math.max(0, box.right - panel.left) + 24 : 24;
      const chrome = canvas.current?.querySelector(".exploration-chrome")?.getBoundingClientRect();
      const top = Math.max(60, chrome ? chrome.bottom - box.top + 20 : 60);
      const viewport = focusViewport(instance.getNodesBounds(nodes), box.width, box.height, 24, right, top);
      void instance.setViewport(viewport, { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420 });
    });
  }
  function focusConnection(id: string) {
    const relation = project?.relations.find((r) => r.id === id);
    if (!relation) return;
    setFocusedRelation(id);
    if (mobile) setMobileTab("canvas");
    frameElements([relation.sourceId, relation.targetId]);
  }
  function explore(mode: Exploration) {
    if (layoutState === "preview") return;
    session.flush();
    setDocumentsOpen(false);
    setReferencesOpen(false);
    setDocumentId(null);
    setFocusedRelation(null);
    setExploration(mode);
    setMobileExploring(mobile && mode.kind === "focus");
    setMobileTab("canvas");
    if (mode.kind !== "focus") setSelected(null);
  }
  function selectItem(id: string | null) {
    if (layoutState === "preview") return;
    setMobileExploring(false);
    if (id && exploration.kind === "universe") setExploration({ kind: "all" });
    if (id && exploration.kind === "focus" && project?.entities.some((e) => e.id === id)) {
      setExploration({ kind: "focus", id });
    }
    setFocusedRelation(null);
    session.flush();
    setEditingDetails(false);
    setSelected(id);
    if (id) setDocumentsOpen(false);
    if (id) setReferencesOpen(false);
  }
  function navigate(tab: StudioTab) {
    setMobileExploring(false);
    setFocusedRelation(null);
    session.flush();
    setSelected(null);
    setDocumentId(null);
    setEditingDetails(false);
    if (tab !== "references") setMobileTab(tab);
    setReferencesOpen(tab === "references");
  }
  function beginCreating() {
    if (layoutPending) return;
    session.flush();
    setDocumentId(null);
    setCreating(true);
  }
  function write(id: string) {
    session.flush();
    setDocumentId(id);
  }
  function openSearchResult(result: SearchResult): string | null {
    const current = session.getSnapshot().projects.find(p => p.id === activeId);
    const target = current && searchDestination(current, result);
    if (!target) return "Este resultado não está mais disponível neste universo. Faça uma nova busca.";
    if (layoutState === "preview") return "Conclua ou cancele a organização automática antes de navegar.";
    if (target.kind === "document") { write(target.id); return null; }
    if (target.kind === "reference") {
      session.flush(); setDocumentId(null); setSelected(null); setDocumentsOpen(false);
      setReferenceRequest({ id: target.id, token: ++searchGeneration.current }); setReferencesOpen(true);
      return null;
    }
    const generation = ++searchGeneration.current;
    const accepted = canvasNavigate.current?.(target.mode, () => {
      if (searchGeneration.current !== generation) return;
      const latest = session.getSnapshot().projects.find(p => p.id === activeId);
      const destination = latest && searchDestination(latest, result);
      if (!destination || destination.kind !== "canvas") { setMessage("O destino não está mais disponível. Faça uma nova busca."); return; }
      setEditingDetails(false);
      setSelected(destination.selected);
      if (destination.relationId) focusConnection(destination.relationId);
      else frameElements(destination.ids);
    });
    return accepted ? null : "Aguarde a transição ou conclua a organização antes de abrir este resultado.";
  }
  useEffect(() => {
    const flush = () => session.flush();
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [session]);
  useEffect(
    () => () => session.flush(),
    [session, activeId, selected, documentId, referencesOpen],
  );
  function store(next: Library) {
    session.update(() => next);
  }
  function change(operation: (p: Project) => Project, deferred = false) {
    if (!activeId) return;
    session.update((current) => {
      const next = current.projects.map((p) =>
        p.id === activeId ? operation(p) : p,
      );
      return next.every((p, i) => p === current.projects[i])
        ? current
        : { projects: next };
    }, deferred);
  }
  function open(p: Project, isNew = false) {
    setSearchOpen(false);
    setReferenceRequest(null);
    searchGeneration.current++;
    setExploration({ kind: p.entities.length ? "universe" : "all" });
    setMobileExploring(false);
    setFocusedRelation(null);
    session.flush();
    if (isNew) store({ projects: [...session.getSnapshot().projects, p] });
    setSelected(null);
    setReferencesOpen(false);
    setDocumentsOpen(false);
    setDocumentId(null);
    setActiveId(p.id);
    setMobileTab("universe");
    setEditingDetails(false);
    flow.current = null;
  }
  function newCard(category: Category, title: string) {
    if (!project || layoutPending) return;
    setFocusedRelation(null);
    setExploration({ kind: "all" });
    setMobileExploring(false);
    setReferencesOpen(false);
    setDocumentsOpen(false);
    const bounds = canvas.current?.getBoundingClientRect();
    const position =
      flow.current && bounds
        ? flow.current.screenToFlowPosition({
            x: bounds.left + bounds.width / 2 - 130,
            y: bounds.top + bounds.height / 2 - 110,
          })
        : { x: 100, y: 100 };
    const current = session
      .getSnapshot()
      .projects.find((p) => p.id === activeId)!;
    const next = addEntity(current, position, category, title);
    change(() => next);
    setSelected(next.entities.at(-1)?.id ?? null);
    setEditingDetails(true);
    setCreating(false);
    if (category === "Documento") setDocumentId(next.entities.at(-1)!.id);
  }
  async function readFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 5_000_000)
        throw new Error("Arquivo muito grande. O limite é 5 MB.");
      const imported = importProject(await file.text());
      // Import as a separate project, even when IDs match an existing backup.
      const copy = {
        ...imported,
        id: crypto.randomUUID(),
        kind: "user" as const,
      };
      open(copy, true);
      setMessage("Projeto importado como uma cópia independente.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível importar.",
      );
    }
  }
  function download() {
    if (!project) return;
    session.flush();
    const latest = session
      .getSnapshot()
      .projects.find((p) => p.id === activeId)!;
    const url = URL.createObjectURL(
      new Blob([exportProject(latest)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[^\p{L}\p{N}_-]/gu, "-").slice(0, 80) || "universo"}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    // Safari may consume the URL asynchronously when opening its download UI.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setMessage(
      "JSON exportado. Os PDFs da biblioteca de referências não estão incluídos neste arquivo.",
    );
  }
  async function share() {
    if (!project) return;
    session.flush();
    const latest = session
      .getSnapshot()
      .projects.find((p) => p.id === activeId)!;
    const file = new File(
      [exportProject(latest)],
      `${latest.name.replace(/[^\p{L}\p{N}_-]/gu, "-").slice(0, 80) || "universo"}.json`,
      { type: "application/json" },
    );
    if (!navigator.canShare?.({ files: [file] })) {
      download();
      return;
    }
    try {
      await navigator.share({ files: [file], title: latest.name });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage(
          "Não foi possível compartilhar. Use Exportar JSON para baixar o arquivo.",
        );
    }
  }
  return (
      <div className="app" ref={appRoot}>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept=".json,application/json"
        aria-label="Importar projeto JSON"
        onChange={(e) => {
          void readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {message && (
        <div className="notice" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}
      <div className={`project-home-layer${project ? " is-away" : ""}`} inert={!!project} aria-hidden={!!project}>
        <ProjectHome
          active={!project}
          projects={library.projects}
          open={(p) => { void projectTransition.start(p.id, "enter", () => open(p)); }}
          create={(title) => open(createProject(title), true)}
          demo={() => {
            const demo = library.projects.find((p) => p.kind === "demo");
            open(demo ?? createDemo(), !demo);
          }}
          importFile={() => input.current?.click()}
          remove={(id) => session.removeProject(id)}
          cleanReferences={removeProjectReferences}
        />
      </div>
      {project && (
        <div
          key={project.id}
          className="project-workspace-layer"
        >
        <div
          className={`editor${mobile ? " mobile-studio" : ""}${documentEntity ? " is-writing" : ""}`}
        >
          <header className="toolbar">
            <button
              className="back-button"
              onClick={() => {
                void projectTransition.start(project.id, "leave", () => {
                  session.flush();
                  setDocumentId(null);
                  setActiveId(null);
                  setSelected(null);
                });
              }}
              aria-label="Voltar aos universos"
            >
              ←
            </button>
            <span className="brand-mark asterism-toolbar-mark" title="ASTERISM">
              <AsterismMark />
            </span>
            <span className="workspace-wordmark" aria-hidden="true">
              ASTERISM<small>WORLDBUILDING STUDIO</small>
            </span>
            <div className="project-heading">
              <input
                aria-label="Nome do universo"
                key={project.id}
                defaultValue={project.name}
                maxLength={120}
                onBlur={(e) => {
                  const next = e.target.value.trim() || "Meu universo";
                  e.target.value = next;
                  change((p) => ({ ...p, name: next }));
                }}
              />
              <span
                className={saveStatus.startsWith("Falha") ? "save-error" : ""}
              >
                {project.kind === "demo" ? "Demonstração · " : ""}
                {saveStatus}
              </span>
            </div>
            <div className="toolbar-actions">
              <SearchTrigger open={openSearch} />
              <button
                aria-pressed={referencesOpen}
                aria-controls="reference-library"
                onClick={() => {
                  session.flush();
                  setDocumentId(null);
                  setReferencesOpen((value) => !value);
                }}
              >
                Referências
              </button>
              {!mobile && <div className="header-settings-slot" ref={setSettingsHost} />}
              <ProjectFileActions
                importFile={() => input.current?.click()}
                exportFile={download}
                shareFile={
                  typeof navigator.share === "function"
                    ? () => void share()
                    : undefined
                }
              />
              <button
                className="primary"
                disabled={layoutPending}
                onClick={() => {
                  session.flush();
                  setDocumentId(null);
                  setCreating(true);
                }}
              >
                ＋ Novo elemento
              </button>
            </div>
          </header>
          <div className="editor-body">
            <main
              className={`canvas${mobileOverlay ? " studio-canvas-covered" : ""}`}
              ref={canvas}
              aria-label="Canvas do universo"
              inert={!!documentEntity || mobileOverlay}
            >
              <div className="canvas-heading">
                <span className="eyebrow">
                  {mobile ? "SEU UNIVERSO, CONECTADO" : "MAPA DE CONEXÕES"}
                </span>
                <span>
                  {project.entities.length} elementos <b>·</b>{" "}
                  {project.relations.length} conexões
                </span>
                <span className="touch-instructions">
                  Arraste elementos ou o fundo. Use pinça para zoom. Para
                  conectar, toque nos dois pontos.
                </span>
              </div>
              <UniverseCanvas
                prepared={() => projectTransition.ready(project.id)}
                navigateRef={canvasNavigate}
                key={project.id}
                desktop={!mobile}
                settingsHost={settingsHost}
                navigation={!mobile && (
                  <DesktopNavigation
                    area={
                      referencesOpen
                        ? "references"
                        : documentsOpen || documentEntity
                          ? "documents"
                          : "canvas"
                    }
                    canvas={() => {
                      session.flush();
                      setDocumentsOpen(false);
                      setReferencesOpen(false);
                      setDocumentId(null);
                    }}
                    documents={() => {
                      session.flush();
                      setDocumentId(null);
                      setReferencesOpen(false);
                      setDocumentsOpen((value) => !value);
                    }}
                    references={() => {
                      session.flush();
                      setDocumentsOpen(false);
                      setDocumentId(null);
                      setReferencesOpen((value) => !value);
                    }}
                  />
                )}
                layoutActivity={setLayoutState}
                active={!searchOpen && !documentEntity && !mobileOverlay}
                exploration={exploration}
                explore={explore}
                focusedRelation={focusedRelation}
                clearFocus={() => {
                  setFocusedRelation(null);
                  if (project.relations.some((r) => r.id === selected)) selectItem(null);
                }}
                project={project}
                selected={selected}
                change={change}
                select={selectItem}
                ready={(instance) => {
                  flow.current = instance;
                }}
              />
              {!project.entities.length && (
                <div className="canvas-empty">
                  <span className="workspace-empty-mark">
                    {mobile ? "✧" : <AsterismMark />}
                  </span>
                  <h2>Toda história começa em algum lugar.</h2>
                  <p>Adicione seu primeiro personagem, lugar ou ideia.</p>
                  <button className="primary" onClick={() => setCreating(true)}>
                    ＋ Criar primeiro elemento
                  </button>
                </div>
              )}
              <div className="canvas-hint">
                Arraste para explorar <span>·</span> Role para zoom{" "}
                <span>·</span> Conecte os pontos dos elementos
              </div>
            </main>
            {mobile &&
              (mobileTab === "universe" || mobileTab === "writing") && (
                <div
                  className={`studio-browser-layer${referencesOpen || selected || documentEntity ? " studio-layer-hidden" : ""}`}
                  inert={!!(referencesOpen || selected || documentEntity)}
                >
                  <MobileStudio
                    key={`${project.id}-${mobileTab}`}
                    project={project}
                    tab={mobileTab}
                    select={selectItem}
                    write={write}
                    create={beginCreating}
                    explore={() => navigate("canvas")}
                  />
                </div>
              )}
            {referencesOpen && !documentEntity && (
              <ReferenceLibrary
                key={`${project.id}-${referenceRequest?.token ?? 0}`}
                projectId={project.id}
                initialSelectedId={referenceRequest?.id}
                close={() =>
                  mobile ? navigate("universe") : setReferencesOpen(false)
                }
              />
            )}
            {!mobile && documentsOpen && !documentEntity && !referencesOpen && (
              <DesktopDocuments
                project={project}
                open={write}
                close={() => setDocumentsOpen(false)}
                create={beginCreating}
              />
            )}
            {mobile &&
            selectedEntity &&
            !focusedRelation &&
            !mobileExploring &&
            !editingDetails &&
            !referencesOpen &&
            !documentEntity ? (
              <MobileEntityDetails
                key={selectedEntity.id}
                entity={selectedEntity}
                project={project}
                close={() => selectItem(null)}
                edit={() => setEditingDetails(true)}
                select={selectItem}
                write={write}
                locate={() => {
                  navigate("canvas");
                  void flow.current?.fitView({
                    nodes: [{ id: selectedEntity.id }],
                    padding: 0.8,
                    maxZoom: 1,
                    duration: 0,
                  });
                }}
              />
            ) : (
              selected &&
              (!mobile || (!focusedRelation && !mobileExploring)) &&
              (mobile || !documentsOpen) &&
              !referencesOpen &&
              !documentEntity && (
                <Inspector
                  key={selected}
                  project={project}
                  locked={layoutPending}
                  selected={selected}
                  focusedRelation={focusedRelation}
                  focusConnection={focusConnection}
                  exploreNeighborhood={(id) => explore({ kind: "focus", id })}
                  visitEntity={(id) => { selectItem(id); frameElements([id]); }}
                  close={() => {
                    if (
                      mobile &&
                      selectedEntity &&
                      editingDetails &&
                      session
                        .getSnapshot()
                        .projects.find((p) => p.id === activeId)
                        ?.entities.some((entity) => entity.id === selected)
                    ) {
                      session.flush();
                      setEditingDetails(false);
                    } else selectItem(null);
                  }}
                  change={change}
                  openDocument={write}
                />
              )
            )}
            {documentEntity && (
              <Suspense
                fallback={
                  <section className="document-workspace" role="status">
                    Carregando editor…
                  </section>
                }
              >
                <DocumentEditor
                  key={documentEntity.id}
                  entity={documentEntity}
                  change={change}
                  saveStatus={saveStatus}
                  searchAction={mobile ? <SearchTrigger open={openSearch} /> : undefined}
                  backLabel={
                    mobile
                      ? "‹ Voltar"
                      : documentsOpen
                        ? "← Voltar aos documentos"
                        : undefined
                  }
                  close={() => {
                    session.flush();
                    setDocumentId(null);
                  }}
                />
              </Suspense>
            )}
          </div>
          {mobile && !documentEntity && !selected && (
            <MobileNavigation
              active={referencesOpen ? "references" : mobileTab}
              navigate={navigate}
              create={beginCreating}
            />
          )}
          {creating && (
            <NewElement create={newCard} close={() => setCreating(false)} />
          )}
          {searchOpen && <UniverseSearch key={project.id} project={project} dismiss={() => setSearchOpen(false)} open={openSearchResult} />}
        </div>
        </div>
      )}
    </div>
  );
}
