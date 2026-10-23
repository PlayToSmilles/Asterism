import { memo, createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { useSelectionIndicator } from "../motion/useSelectionIndicator";
import { useConstellationTransition } from "../motion/useConstellationTransition";
import settingsIcon from "../../assets/icons/settings-dark.png";
import { readDynamicPreference, writeDynamicPreference } from "./canvasPreferences";
import {
  Background,
  Controls,
  ControlButton,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  applyNodeChanges,
  useStore,
  useUpdateNodeInternals,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { DynamicLayout } from "./dynamicLayout";
import { categoryPresentation } from "../categoryPresentation";
import type { Project } from "../../domain/model";
import { connect, moveEntities, removeRelation } from "../../domain/model";
import {
  commitNodeChanges,
  reconcileNodes,
  type CardNode,
} from "./canvasState";
import { ConstellationOverview } from "./ConstellationOverview";
import { WorldCard } from "./WorldCard";
import { zoomDetail } from "./cardPresentation";
import { FloatingEdge, type FloatingRelation } from "./FloatingEdge";
import { categoryGroups, categoryPositions, neighborhoodPositions, visibleElements, type Exploration, type LayoutActivity } from "./exploration";
import { canvasFocus, focusViewport } from "./canvasFocus";
import { relationLanes } from "./floatingGeometry";
import { getRelationKind } from "../../domain/relations";
import { relationAppearance, relationLabels } from "../relationPresentation";
const FocusContext = createContext<{ ids: Set<string>; captions: boolean; panoramic: boolean; category: boolean }>({ ids: new Set(), captions: false, panoramic: false, category: false });
const UniverseCard = memo(function UniverseCard({ id, data, selected }: NodeProps<CardNode>) {
  const entity = data.entity;
  const focused = useContext(FocusContext);
  const captionZoom = useStore((state) => focused.captions ? state.transform[2] : 1);
  const detail = useStore((state) => focused.category ? "full" as const : zoomDetail(state.transform[2]));
  const updateInternals = useUpdateNodeInternals();
  useEffect(() => updateInternals(id), [detail, id, updateInternals]);
  return (
    <WorldCard
      entity={entity}
      selected={selected}
      detail={detail}
      panoramic={focused.panoramic}
      captionScale={focused.captions ? 1 / captionZoom : undefined}
      emphasis={focused.ids.size ? focused.ids.has(entity.id) ? "related" : "muted" : "normal"}
    >
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Receber conexão"
      />
      <Handle
        type="source"
        position={Position.Right}
        aria-label="Criar conexão"
      />
    </WorldCard>
  );
}, (before, after) => before.id === after.id && before.data === after.data && before.selected === after.selected);
const minimapColor = (node: CardNode) => categoryPresentation[node.data.entity.category].color;
const nodeTypes = { card: UniverseCard };
const edgeTypes = { floating: FloatingEdge };
export type CanvasNavigator = (mode: Exploration, complete: () => void) => boolean;
interface Props {
  prepared?: () => void;
  navigateRef?: RefObject<CanvasNavigator | null>;
  navigation?: ReactNode;
  settingsHost?: HTMLElement | null;
  active: boolean;
  layoutActivity: (state: LayoutActivity) => void;
  exploration: Exploration;
  explore: (mode: Exploration) => void;
  desktop?: boolean;
  focusedRelation: string | null;
  clearFocus: () => void;
  project: Project;
  selected: string | null;
  change: (operation: (project: Project) => Project) => void;
  select: (id: string | null) => void;
  ready: (instance: ReactFlowInstance<CardNode, FloatingRelation>) => void;
}
export function UniverseCanvas({
  prepared,
  navigateRef,
  navigation,
  settingsHost,
  exploration,
  active,
  layoutActivity,
  explore,
  desktop = false,
  focusedRelation,
  clearFocus,
  project,
  selected,
  change,
  select,
  ready,
}: Props) {
  const neutralId = `relation-dot-${useId().replace(/:/g, "")}`;
  const instance = useRef<ReactFlowInstance<CardNode, FloatingRelation> | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const { transition: portal, retainOverview } = useConstellationTransition(host);
  const pendingNavigation = useRef<{ mode: Exploration; complete: () => void } | null>(null);
  useEffect(() => { if (!active) portal.dispose(); }, [active, portal]);
  const previousMode = useRef(exploration);
  const [preparedMode, setPreparedMode] = useState(exploration);
  const viewSwitch = useSelectionIndicator<HTMLDivElement>(exploration.kind);
  const concealed = exploration.kind === "universe" || preparedMode !== exploration;
  const returnView = useRef<{ mode: Exploration; viewport: Project["viewport"] } | null>(null);
  const restore = useRef<Project["viewport"] | null>(null);
  const frameVisible = useCallback((durationOverride?: number) => {
    const flow = instance.current, box = host.current?.getBoundingClientRect();
    if (!flow || !box) return;
    const nodes = flow.getNodes().filter(node => !node.hidden);
    if (!nodes.length) return;
    const panel = host.current?.closest(".editor-body")?.querySelector(".inspector")?.getBoundingClientRect();
    const right = desktop && panel ? Math.max(0, box.right - panel.left) + 24 : 24;
    const chrome = host.current?.querySelector(".exploration-chrome")?.getBoundingClientRect();
    const category = exploration.kind === "category";
    const left = category && desktop && box.width - (chrome?.width ?? 0) - right > 650
      ? Math.max(24, chrome ? chrome.right - box.left + 24 : 24) : 24;
    const top = left > 24 ? 24 : Math.max(60, chrome ? chrome.bottom - box.top + 20 : 60);
    const minimap = host.current?.querySelector(".react-flow__minimap")?.getBoundingClientRect();
    const bottom = category && minimap?.height ? Math.max(60, box.bottom - minimap.top + 20) : 60;
    const bounds = flow.getNodesBounds(nodes);
    return flow.setViewport(focusViewport(bounds, box.width, box.height, left, right, top, category ? .09 : .22, bottom),
      { duration: durationOverride ?? (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350) });
  }, [desktop, exploration.kind]);
  const [preview, setPreview] = useState<{ kind: "automatic" | "dynamic"; positions: Map<string, { x: number; y: number }>; viewport: Project["viewport"] } | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const calculation = useRef<AbortController | null>(null);
  const dynamic = useRef<DynamicLayout | null>(null);
  const startingDynamic = useRef(false);
  const [dynamicEnabled, setDynamicEnabled] = useState(() => readDynamicPreference());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRoot = useRef<HTMLDivElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const [preferenceError, setPreferenceError] = useState(false);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized && preparedMode === exploration && exploration.kind !== "universe") prepared?.();
  }, [initialized, preparedMode, exploration, prepared]);
  const lifecycle = useRef({ start: () => {}, stop: () => {}, finish: () => {} });
  const interactivePreview = preview?.kind === "dynamic";
  const blocked = organizing || (!!preview && !interactivePreview);
  const previousPreview = useRef(preview);
  useEffect(() => {
    if (!settingsOpen) return;
    settingsRoot.current?.querySelector<HTMLButtonElement>(".canvas-settings button")?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !settingsRoot.current?.contains(event.target)) setSettingsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setSettingsOpen(false);
      settingsTrigger.current?.focus();
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape, true);
    };
  }, [settingsOpen, desktop, settingsHost]);
  // Keep the lifecycle callback fresh without restarting physics on each tick,
  // selection, save, or Apply/Discard. A new drag can wake it again.
  useEffect(() => {
    lifecycle.current = {
      start: () => { if (project.entities.length) void toggleDynamic(); },
      stop: () => { if (dynamic.current || startingDynamic.current) cancelLayout(false); },
      finish: () => { if (!instance.current?.getNodes().some(node => node.dragging)) applyLayout(); },
    };
  });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialized && active && dynamicEnabled && exploration.kind === "all") lifecycle.current.start();
    }, 0);
    return () => { window.clearTimeout(timer); lifecycle.current.stop(); };
  }, [initialized, active, dynamicEnabled, exploration.kind]);
  useEffect(() => {
    const pause = () => { if (document.visibilityState === "hidden") dynamic.current?.setEnabled(false); };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  useEffect(() => () => { calculation.current?.abort(); dynamic.current?.dispose(); layoutActivity("idle"); }, [layoutActivity]);
  async function organize() {
    if (!instance.current || organizing || preview) return;
    const controller = new AbortController();
    calculation.current = controller;
    const viewport = instance.current.getViewport();
    setOrganizing(true);
    setLayoutError("");
    layoutActivity("preview");
    try {
      const { forceLayout } = await import("./forceLayout");
      const positions = await forceLayout(instance.current.getNodes(), project.relations, controller.signal);
      if (positions && !controller.signal.aborted) setPreview({ kind: "automatic", positions, viewport });
    } catch {
      if (!controller.signal.aborted) { setLayoutError("Não foi possível organizar. Suas posições foram mantidas."); layoutActivity("idle"); }
    } finally {
      if (!controller.signal.aborted) setOrganizing(false);
    }
  }
  async function toggleDynamic() {
    if (dynamic.current) { dynamic.current.setEnabled(true); return; }
    if (!instance.current || organizing || preview || startingDynamic.current) return;
    startingDynamic.current = true;
    const controller = new AbortController();
    calculation.current = controller;
    const viewport = instance.current.getViewport();
    setLayoutError("");
    try {
      const { createDynamicLayout } = await import("./dynamicLayout");
      if (controller.signal.aborted || !instance.current) return;
      const engine = createDynamicLayout(instance.current.getNodes(), project.relations, zoomDetail(viewport.zoom),
        (positions) => setVisual(current => {
          let changed = false;
          const nodes = current.nodes.map(node => {
            const position = positions.get(node.id);
            if (!position || node.dragging || (Math.abs(position.x - node.position.x) < 0.2 && Math.abs(position.y - node.position.y) < 0.2)) return node;
            changed = true;
            return { ...node, position };
          });
          return changed ? { ...current, nodes } : current;
        }), status => { if (status === "settled") lifecycle.current.finish(); }, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      dynamic.current = engine;
      setPreview({ kind: "dynamic", positions: engine.snapshot(), viewport });
      engine.setEnabled(true);
    } catch {
      if (!controller.signal.aborted) { setLayoutError("Não foi possível iniciar a física. Seu layout foi mantido."); layoutActivity("idle"); }
    } finally { startingDynamic.current = false; }
  }
  function cancelLayout(restoreViewport = true) {
    dynamic.current?.dispose();
    dynamic.current = null;
    calculation.current?.abort();
    startingDynamic.current = false;
    if (preview && restoreViewport) restore.current = preview.viewport;
    setPreview(null);
    setOrganizing(false);
    layoutActivity("idle");
  }
  function switchExploration(mode: Exploration) {
    if (portal.pending) return;
    if (organizing || (preview && !interactivePreview)) return;
    if ((mode.kind === "all" || mode.kind === "universe") && mode.kind === exploration.kind) return;
    if (interactivePreview) cancelLayout(false);
    if (mode.kind === "category" && exploration.kind === "universe") {
      void portal.start(mode.category, "enter", () => explore(mode)).then(() => completeNavigation(mode));
    } else if (mode.kind === "universe" && exploration.kind === "category") {
      void portal.start(exploration.category, "leave", () => explore(mode));
    } else explore(mode);
  }
  const completeNavigation = useCallback((mode: Exploration) => {
    const pending = pendingNavigation.current;
    if (!pending || pending.mode !== mode) return;
    pendingNavigation.current = null;
    pending.complete();
  }, []);
  // External entry points reuse the same navigation and preparation pipeline.
  useEffect(() => {
    if (navigateRef) navigateRef.current = (mode, complete) => {
      if (blocked || portal.pending) return false;
      pendingNavigation.current = { mode, complete };
      switchExploration(mode);
      return true;
    };
  });
  useEffect(() => () => {
    pendingNavigation.current = null;
    if (navigateRef) navigateRef.current = null;
  }, [navigateRef]);
  function setPhysics(enabled: boolean) {
    cancelLayout();
    setDynamicEnabled(enabled);
    setPreferenceError(!writeDynamicPreference(undefined, enabled));
  }
  function applyLayout() {
    if (!preview) return;
    dynamic.current?.setEnabled(false);
    const positions = dynamic.current?.snapshot() ?? preview.positions;
    dynamic.current?.dispose();
    dynamic.current = null;
    restore.current = instance.current?.getViewport() ?? project.viewport;
    change(p => moveEntities(p, [...positions].map(([id, position]) => ({ id, position }))));
    setPreview(null);
    layoutActivity("idle");
  }
  // Reading positions depend on topology, not edits to descriptions or titles.
  const arrangementKey = useMemo(() => JSON.stringify([exploration, project.entities.map(e => [e.id, e.category]),
    exploration.kind === "focus" ? project.relations.map(r => [r.sourceId, r.targetId]) : null]),
    [exploration, project.entities, project.relations]);
  function readingPositions() {
    return exploration.kind === "focus" ? neighborhoodPositions(project, exploration.id)
      : exploration.kind === "category" ? categoryPositions(project, exploration.category) : undefined;
  }
  const [arrangement, setArrangement] = useState(() => ({ key: arrangementKey, positions: readingPositions() }));
  let reading = arrangement.positions;
  if (arrangement.key !== arrangementKey) {
    reading = readingPositions();
    setArrangement({ key: arrangementKey, positions: reading });
  }
  const positions = exploration.kind === "all" ? preview?.positions : reading;
  const visible = useMemo(() => visibleElements(project, exploration,
    focusedRelation ?? (project.relations.some((r) => r.id === selected) ? selected : null)),
    [project, exploration, focusedRelation, selected]);
  useEffect(() => {
    if (previousMode.current === exploration && previousPreview.current === preview && preparedMode === exploration) return;
    if (preview?.kind === "dynamic" && exploration.kind === "all" && preparedMode === exploration) { previousPreview.current = preview; previousMode.current = exploration; return; }
    previousPreview.current = preview;
    if (exploration.kind === "all" && previousMode.current.kind !== "all" && !restore.current) restore.current = project.viewport;
    if (exploration.kind === "focus" && previousMode.current.kind !== "focus" && instance.current) {
      returnView.current = { mode: previousMode.current, viewport: instance.current.getViewport() };
    }
    previousMode.current = exploration;
    let cancelled = false;
    let frame = requestAnimationFrame(() => {
      // Wait for projected positions without unmounting measured nodes.
      frame = requestAnimationFrame(() => {
        const flow = instance.current;
        if (!flow) return;
        const entering = preparedMode !== exploration;
        const duration = entering || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350;
        const viewport = restore.current;
        restore.current = null;
        const positioning = viewport ? flow.setViewport(viewport, { duration })
          : exploration.kind === "universe" ? undefined : frameVisible(duration);
        void Promise.resolve(positioning).then(() => {
          if (!cancelled) setPreparedMode(exploration);
        });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [exploration, desktop, preview, project.viewport, frameVisible, preparedMode]);
  useEffect(() => {
    if (retainOverview && (portal.direction === "leave" || preparedMode === exploration)) portal.ready();
  }, [preparedMode, exploration, portal, retainOverview]);
  useEffect(() => {
    if (preparedMode === exploration && !portal.pending) completeNavigation(exploration);
  }, [preparedMode, exploration, portal, retainOverview, completeNavigation]);

  function leaveNeighborhood() {
    restore.current = returnView.current?.viewport ?? project.viewport;
    switchExploration(returnView.current?.mode ?? { kind: "all" });
  }
  const [visual, setVisual] = useState(() => ({
    entities: project.entities,
    positions,
    visible,
    selected,
    nodes: reconcileNodes([], project.entities, selected, positions, visible),
  }));
  let nodes = visual.nodes;
  if (visual.entities !== project.entities || visual.selected !== selected || visual.positions !== positions || visual.visible !== visible) {
    const currentPositions = positions && visual.positions === positions
      ? new Map(visual.nodes.map(node => [node.id, node.position])) : positions;
    nodes = reconcileNodes(visual.nodes, project.entities, selected, currentPositions, visible);
    // Reconcile during render, before ReactFlow receives the next props. An
    // effect would first publish stale nodes and could rewind a finished drag.
    setVisual({ entities: project.entities, positions, visible, selected, nodes });
  }
  const focus = useMemo(
    () => canvasFocus({ entities: project.entities, relations: project.relations }, selected, focusedRelation),
    [project.entities, project.relations, selected, focusedRelation],
  );
  const cardContext = useMemo(() => ({ ids: focus.nodes, captions: exploration.kind === "focus" || exploration.kind === "category", panoramic: exploration.kind === "all", category: exploration.kind === "category" }), [focus.nodes, exploration.kind]);
  const aggregation = useMemo(() => categoryGroups(project), [project]);
  const edges = useMemo(() => {
    const lanes = relationLanes(project.relations);
    return project.relations.map(
      (relation): FloatingRelation => ({
        id: relation.id,
        type: "floating",
        data: {
          lane: lanes.get(relation.id) ?? 0,
          fullDetail: exploration.kind === "category",
          emphasis: focus.relationId === relation.id ? "focused"
            : focus.edges.has(relation.id) ? "related"
            : focus.nodes.size ? "muted" : "normal",
        },
        hidden: !visible.has(relation.sourceId) || !visible.has(relation.targetId) ||
          (exploration.kind === "focus" && relation.sourceId !== exploration.id && relation.targetId !== exploration.id && relation.id !== focus.relationId),
        source: relation.sourceId,
        target: relation.targetId,
        label: relation.label,
        selected: focus.relationId === relation.id,
        ...relationAppearance(
          getRelationKind(relation),
          focus.edges.has(relation.id),
          neutralId,
        ),
        ariaLabel: `${relation.label} · ${relationLabels[getRelationKind(relation)]}`,
        interactionWidth: 24,
      }),
    );
  }, [project.relations, focus, neutralId, visible, exploration]);
  const settingsControls = <div ref={settingsRoot} className="canvas-settings-control">
    <button ref={settingsTrigger} className="canvas-settings-trigger" title="Configurações" aria-label="Configurações" aria-haspopup="dialog" aria-expanded={settingsOpen} aria-controls="canvas-settings" onClick={() => setSettingsOpen(value => !value)}><img src={settingsIcon} alt="" aria-hidden="true" draggable={false} width={22} height={22} /></button>
    {settingsOpen && <section id="canvas-settings" className="canvas-settings" role="dialog" aria-label="Configurações">
      <header><strong>Configurações</strong><button aria-label="Fechar configurações" onClick={() => { setSettingsOpen(false); settingsTrigger.current?.focus(); }}>×</button></header>
      <label><span>Modo dinâmico<small>Somente no Canvas livre</small></span><input type="checkbox" role="switch" checked={dynamicEnabled} onChange={event => setPhysics(event.target.checked)} /></label>
      <p>A malha reage ao arrasto e salva as posições ao estabilizar. Desligar ou sair do Canvas livre antes disso mantém as últimas posições salvas.</p>
      {preferenceError && <p role="alert">Preferência aplicada nesta sessão; não foi possível salvá-la neste navegador.</p>}
    </section>}
  </div>;
  return (
    <div ref={host} className={`canvas-explorer${exploration.kind === "all" ? " panoramic-canvas" : ""}`}>
    <div className="exploration-chrome">
    <div className="workspace-command-bar">
    {desktop && settingsHost && createPortal(settingsControls, settingsHost)}
    {navigation}
    <div className="exploration-toolbar" role="group" aria-label="Exploração do canvas">
      {exploration.kind === "category" ? <button aria-label="Voltar às Constelações" disabled={blocked}
        onClick={() => switchExploration({ kind: "universe" })}><span aria-hidden="true">←</span> Constelações</button>
      : <div ref={viewSwitch} className="canvas-view-switch sliding-selection" role="group" aria-label="Vista do canvas">
        <span className="selection-indicator" aria-hidden="true" />
        <button aria-pressed={exploration.kind === "all"} disabled={organizing || (!!preview && !interactivePreview)} onClick={() => switchExploration({ kind: "all" })}>Canvas livre</button>
        <button aria-pressed={exploration.kind !== "all"} disabled={organizing || (!!preview && !interactivePreview)} onClick={() => switchExploration({ kind: "universe" })}>✦ Constelações</button>
      </div>}
      {(exploration.kind === "focus" || exploration.kind === "category") && <span className="exploration-title">{exploration.kind === "focus" ? "✧ Vizinhança" : exploration.category}</span>}
      {exploration.kind === "focus" ? <><button disabled={organizing || (!!preview && !interactivePreview)} onClick={leaveNeighborhood}>← Voltar à disposição anterior</button><button onClick={() => select(exploration.id)}>Detalhes</button></> : selected && project.entities.some((e) => e.id === selected) && <button disabled={organizing || (!!preview && !interactivePreview)} onClick={() => switchExploration({ kind: "focus", id: selected })}>✧ Explorar vizinhança</button>}
      {exploration.kind === "all" && <button onClick={() => void organize()} disabled={!project.entities.length || organizing || !!preview}>↔ Organizar automaticamente</button>}
      {!desktop && settingsControls}
    </div>
    {(organizing || (preview && !interactivePreview)) && <div className="layout-preview-bar" role="region" aria-label="Organização automática">
      <div role="status"><strong>{organizing ? "Organizando seu universo…" : "Prévia da organização"}</strong><span>As posições só serão salvas ao aplicar.</span></div>
      {preview && <button className="primary" onClick={applyLayout}>Aplicar organização</button>}
      <button onClick={() => cancelLayout()}>Cancelar organização</button>
    </div>}
    {layoutError && <p className="layout-error" role="alert">{layoutError}</p>}
    {exploration.kind === "category" && <details className="external-constellations"><summary>Relações com outras categorias</summary>
      {aggregation.links.filter(link => link.source === exploration.category || link.target === exploration.category).map(link => {
        const category = link.source === exploration.category ? link.target : link.source;
        return <button key={category} onClick={() => explore({ kind: "category", category })}>{category}<span>{link.count} relações ↗</span></button>;
      })}
      <p>Todas as relações individuais continuam disponíveis no Inspector.</p>
    </details>}
    </div>
    </div>
    {(exploration.kind === "universe" || retainOverview) && <ConstellationOverview project={project} prepared={initialized ? prepared : undefined} enter={(category) => switchExploration({ kind: "category", category })} />}
    <div className={`flow-layer${concealed ? " flow-concealed" : ""}${exploration.kind === "category" || retainOverview ? " portal-managed" : ""}`} inert={concealed} tabIndex={-1} role="region" aria-label="Elementos do canvas">
    <FocusContext.Provider value={cardContext}>
    <ReactFlow<CardNode, FloatingRelation>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="dark"
      onlyRenderVisibleElements={exploration.kind === "all"}
      onInit={(flow) => { instance.current = flow; ready(flow); setInitialized(true); }}
      defaultViewport={project.viewport}
      minZoom={0.05}
      maxZoom={2}
      deleteKeyCode={null}
      nodesDraggable={!blocked}
      nodesConnectable={!blocked}
      elementsSelectable={!blocked}
      nodeClickDistance={4}
      nodeDragThreshold={4}
      onNodeDragStart={() => {
        if (!dynamicEnabled || exploration.kind !== "all" || organizing) return;
        if (dynamic.current) dynamic.current.setEnabled(true);
        else if (!preview) void toggleDynamic();
      }}
      zoomOnPinch
      panOnDrag
      connectOnClick
      paneClickDistance={4}
      ariaLabelConfig={{
        "controls.zoomIn.ariaLabel": "Aproximar",
        "controls.zoomOut.ariaLabel": "Afastar",
        "controls.fitView.ariaLabel": "Enquadrar elementos",
      }}
      onNodeClick={(event, node) => {
        // A handle tap starts/finishes connectOnClick. Opening the full-screen
        // mobile inspector here would hide the second endpoint.
        if (
          event.target instanceof Element &&
          event.target.closest(".react-flow__handle")
        )
          return;
        if (!blocked) select(node.id);
      }}
      onEdgeClick={(_, edge) => { if (!blocked) select(edge.id); }}
      onPaneClick={() => { clearFocus(); select(null); }}
      onNodesChange={(changes) => {
        if (interactivePreview && dynamic.current) {
          for (const item of changes) if (item.type === "position" && item.position) {
            dynamic.current.pin(item.id, item.position);
            if (item.dragging !== true) dynamic.current.release(item.id);
          }
        }
        const accepted = organizing || preview
          ? changes.filter(item => item.type === "dimensions" || item.type === "select" || (interactivePreview && item.type === "position")) : changes;
        setVisual((current) => ({
          ...current,
          nodes: applyNodeChanges(accepted, current.nodes),
        }));
        if (exploration.kind === "all" && !organizing && !preview && !startingDynamic.current) change((p) => commitNodeChanges(p, changes));
      }}
      onEdgesChange={(changes) => {
        if (blocked) return;
        change((p) =>
          changes.reduce(
            (current, item) =>
              item.type === "remove"
                ? removeRelation(current, item.id)
                : current,
            p,
          ),
        );
      }}
      onConnect={(connection) => {
        if (blocked) return;
        change((p) => connect(p, connection.source, connection.target))
      }}
      onMove={(_, viewport) => dynamic.current?.setDetail(zoomDetail(viewport.zoom))}
      onMoveEnd={(_, viewport) => { if (exploration.kind === "all" && !organizing && !preview && !startingDynamic.current) change((p) => ({ ...p, viewport })); }}
      proOptions={{ hideAttribution: false }}
    >
      {focus.relationId && <div className="canvas-focus-bar"><span>Conexão em foco</span><button onClick={clearFocus}>Encerrar foco ×</button></div>}
      <svg className="relation-marker-definitions" aria-hidden="true">
        <defs>
          <marker
            id={neutralId}
            viewBox="-5 -5 10 10"
            refX="0"
            refY="0"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
          >
            <circle r="3.5" fill="#c3d1e4" />
          </marker>
        </defs>
      </svg>
      <Background gap={24} size={1} color="#343840" bgColor="transparent" />
      <Controls
        showInteractive={false}
        showFitView={false}
      >
        <ControlButton onClick={() => void frameVisible()} title="Enquadrar elementos" aria-label="Enquadrar elementos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </ControlButton>
      </Controls>
      <MiniMap
        pannable
        zoomable
        nodeColor={minimapColor}
        nodeBorderRadius={100}
        maskColor="rgba(15,17,22,.75)"
      />
    </ReactFlow>
    </FocusContext.Provider>
    </div>
    </div>
  );
}
