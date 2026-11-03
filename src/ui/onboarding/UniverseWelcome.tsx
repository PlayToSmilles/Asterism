// SPDX-License-Identifier: MPL-2.0
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "../../domain/model";
import { isValidImageUrl } from "../../domain/imageUrl";
import { AsterismMark } from "../home/AsterismMark";
import { isBlankUniverse, nextIdeaNumber, type SparkSaveOptions, type SparkSaveResult } from "./firstSpark";
import type { PathDraft, SparkDraft, SparkDraftStore } from "./sparkDraft";
import { possibilities, type PossibilityId } from "./possibilities";
import { PossibilityMap } from "./PossibilityMap";
import { SparkArtwork } from "./SparkArtwork";
import { usePossibilityTransition } from "./usePossibilityTransition";

export function UniverseWelcome({ project, store, open, visible, locked, show, dismiss, finish, create, save, saveReference }: {
  project: Project; store: SparkDraftStore; open: boolean; visible: boolean; locked: boolean;
  show: () => void; dismiss: () => void; finish: () => void; create: () => void;
  save: (text: string, action: "create" | "deepen", currentId: string | null, nextNumber: number, operationId: string, options?: SparkSaveOptions) => SparkSaveResult;
  saveReference: (id: string, url: string) => string | null;
}) {
  const [initial] = useState(() => store.read(project));
  const [draft, setDraft] = useState(initial.draft);
  const draftRef = useRef(draft), saving = useRef(false);
  const [warning, setWarning] = useState(initial.warning), [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirming, setConfirming] = useState(false), [mode, setMode] = useState<"deepen" | "create">("deepen");
  const [link, setLink] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transition = usePossibilityTransition(stage, visible && open);
  const central = project.entities.find(e => e.id === draft.currentId);
  const activePath = possibilities.find(p => p.id === draft.activePath);
  const updateDraft = useCallback((patch: Partial<SparkDraft>) => {
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next; setDraft(next);
    setWarning(store.write(project.id, next) ? "" : "Rascunho só em memória. Guarde seu texto antes de fechar ou recarregar esta aba.");
  }, [project.id, store]);
  const updatePath = (id: PossibilityId, patch: Partial<PathDraft>) => updateDraft({ paths: {
    ...draftRef.current.paths, [id]: { ...draftRef.current.paths[id], ...patch },
  } });
  useEffect(() => {
    const nextNumber = nextIdeaNumber(project, draftRef.current.nextNumber);
    if (nextNumber > draftRef.current.nextNumber) updateDraft({ nextNumber });
  }, [project, updateDraft]);
  const hasDraft = !!draft.answer || Object.values(draft.paths).some(p => !!p.answer);
  const eligible = isBlankUniverse(project) || draft.inspired || !!draft.currentId || hasDraft;
  if (!eligible || (draft.completed && !hasDraft)) return null;
  function leave() { transition.dispose(); dismiss(); }
  function exit() { transition.dispose(); updateDraft({ completed: true }); finish(); }
  function choose(id: PossibilityId) {
    setError(""); setFeedback(""); setConfirming(false);
    void transition.start(id, "enter", () => updateDraft({ scene: "writing", activePath: id }));
  }
  function back() {
    if (!draft.activePath) return;
    setConfirming(false); setError("");
    void transition.start(draft.activePath, "leave", () => updateDraft({ scene: "possibilities" }));
  }
  function guardIdea(first: boolean) {
    const pending = draftRef.current;
    const path = pending.activePath;
    const answer = first ? pending.answer : path ? pending.paths[path].answer : "";
    if (saving.current || locked || !answer.trim()) return;
    const url = pending.referenceUrl.trim();
    if (first && url && !isValidImageUrl(url)) { setError("Use uma URL HTTP ou HTTPS válida para a referência, ou deixe o campo vazio."); return; }
    saving.current = true;
    try {
      const result = save(answer, first ? "create" : mode, first ? null : pending.currentId, pending.nextNumber,
        first ? pending.operationId : pending.paths[path!].operationId,
        first ? { imageUrl: url || undefined } : { connectToSource: mode === "create" && link });
      if (!result.ok) { setError(result.error); return; }
      if (first) updateDraft({ answer: "", currentId: result.entityId, nextNumber: result.nextNumber,
        operationId: crypto.randomUUID(), inspired: true, scene: "possibilities" });
      else {
        updateDraft({ nextNumber: result.nextNumber, currentId: central ? pending.currentId : result.entityId });
        updatePath(path!, { answer: "", operationId: crypto.randomUUID(), developed: true });
      }
      setConfirming(false); setError(""); setFeedback(`${result.title} guardada neste navegador.`);
    } finally { saving.current = false; }
  }
  const referenceControl = <details className="spark-reference-control">
    <summary>{central?.imageUrl ? "Imagem de referência" : "Adicionar imagem de referência"}</summary>
    <div className="spark-reference-fields">
      <label>URL da imagem<input type="url" maxLength={2048} value={draft.referenceUrl}
        onChange={event => updateDraft({ referenceUrl: event.target.value })} placeholder="https://…" /></label>
      {central && <button type="button" disabled={locked} onClick={() => {
        const url = draft.referenceUrl.trim();
        if (url && !isValidImageUrl(url)) { setError("Use uma URL HTTP ou HTTPS válida."); return; }
        const failure = saveReference(central.id, url); setError(failure ?? ""); if (!failure) setFeedback("Referência visual atualizada.");
      }}>Usar imagem</button>}
      <small>Somente HTTP/HTTPS. A imagem depende do site de origem; o JSON guarda apenas a URL.</small>
    </div>
  </details>;
  return <div className={`universe-welcome${open && !draft.completed ? " is-open" : ""}`} hidden={!visible}>
    {open && !draft.completed ? <div ref={stage} className="spark-stage" data-scene={draft.inspired ? draft.scene : "welcome"}
      onKeyDown={event => { if (event.key === "Escape" && !transition.pending) {
        event.stopPropagation(); if (draft.scene === "writing") back(); else leave();
      } }}>
      <button type="button" className="spark-exit" onClick={exit}>Explorar meu universo →</button>
      <p className="spark-feedback" role="status">{feedback}</p>
      {error && <p className="spark-error" role="alert">{error}</p>}
      {warning && <p className="spark-warning" role="status">{warning}</p>}
      {!draft.inspired ? <section className="first-spark-panel spark-welcome" aria-labelledby="spark-welcome-heading">
        <span className="first-spark-mark" aria-hidden="true"><AsterismMark /></span>
        <span className="eyebrow">A PRIMEIRA FAÍSCA</span>
        <h2 id="spark-welcome-heading">Bem-vindo a {project.name}.</h2>
        <p>Uma ideia pode abrir muitos caminhos. Como você gostaria de começar?</p>
        <div className="first-spark-paths">
          <button onClick={() => { updateDraft({ inspired: true, scene: central ? "possibilities" : "idea" }); requestAnimationFrame(() => input.current?.focus({ preventScroll: true })); }}><span aria-hidden="true">✦</span><span><strong>Quero encontrar inspiração</strong><small>Comece com uma ideia.</small></span><span aria-hidden="true">→</span></button>
          <button onClick={create}><span aria-hidden="true">＋</span><span><strong>Já tenho algo em mente</strong><small>Use a criação por categoria.</small></span><span aria-hidden="true">→</span></button>
          <button onClick={exit}><span aria-hidden="true">✧</span><span><strong>Prefiro explorar livremente</strong><small>Entre nas ferramentas do universo.</small></span><span aria-hidden="true">→</span></button>
        </div>
      </section> : draft.scene === "idea" ? <section className="first-spark-panel spark-first-idea" aria-labelledby="spark-idea-heading">
        <span className="eyebrow">A PRIMEIRA FAÍSCA</span>
        <h2 id="spark-idea-heading">Qual é a primeira ideia do seu mundo?</h2>
        <p>Pode ser uma frase, uma imagem ou algo que você ainda não sabe explicar.</p>
        <form onSubmit={event => { event.preventDefault(); guardIdea(true); }}>
          <label className="sr-only" htmlFor="spark-first-answer">Sua primeira ideia</label>
          <textarea ref={input} id="spark-first-answer" rows={6} value={draft.answer} maxLength={4000}
            onChange={event => { updateDraft({ answer: event.target.value }); setError(""); }} placeholder="Este espaço é seu…" />
          {referenceControl}
          {isValidImageUrl(draft.referenceUrl) && <SparkArtwork key={draft.referenceUrl} imageUrl={draft.referenceUrl} />}
          <div className="first-spark-actions"><button type="button" onClick={() => updateDraft({ inspired: false })}>← Voltar</button>
            <button type="submit" className="primary" disabled={!draft.answer.trim() || locked}>Guardar minha ideia</button></div>
          <small className="spark-draft-hint">Rascunho temporário nesta aba. Só você decide quando guardar.</small>
        </form>
      </section> : null}
      <div className="spark-map-layer" aria-hidden={draft.scene !== "possibilities" || !draft.inspired} inert={draft.scene !== "possibilities" || !draft.inspired}>
        <h2 className="spark-map-label">CONSTELAÇÃO DE POSSIBILIDADES</h2>
        {central ? <><PossibilityMap central={central} paths={draft.paths} active={visible && open && draft.inspired && draft.scene === "possibilities"} choose={choose} />
          <div className="spark-map-reference">{referenceControl}</div></> : <section className="spark-missing">
          <p>A ideia central não está mais disponível. Seus rascunhos continuam nesta aba.</p>
          <button onClick={() => updateDraft({ scene: "idea", currentId: null, operationId: crypto.randomUUID() })}>Começar outra ideia</button>
        </section>}
      </div>
      <div className="spark-writing-layer" aria-hidden={draft.scene !== "writing" || !draft.inspired} inert={draft.scene !== "writing" || !draft.inspired}>
        {activePath && <section className="spark-writing" aria-labelledby="spark-writing-heading" style={{ "--category-color": activePath.color } as CSSProperties}>
          <header><button type="button" onClick={back}>← Voltar às possibilidades</button><span>{activePath.name}</span></header>
          <div className="spark-writing-content">
            <SparkArtwork key={central?.imageUrl || activePath.artwork || activePath.id} possibility={activePath} imageUrl={central?.imageUrl} />
            <h2 id="spark-writing-heading" data-writing-heading tabIndex={-1}>{activePath.question}</h2>
            <p>{activePath.invitation}</p>
            <label className="sr-only" htmlFor="spark-path-answer">Sua resposta sobre {activePath.name}</label>
            <textarea id="spark-path-answer" rows={5} maxLength={4000} value={draft.paths[activePath.id].answer}
              onChange={event => { updatePath(activePath.id, { answer: event.target.value }); setError(""); }} placeholder="O que você imagina?" />
            {!central && <p role="status">A ideia central foi removida. Você pode guardar o texto como uma nova ideia.</p>}
            {confirming ? <fieldset className="spark-save-choice"><legend>Como deseja guardar?</legend>
              <label><input type="radio" name="spark-save-mode" checked={mode === "deepen"} disabled={!central} onChange={() => setMode("deepen")} />Aprofundar a ideia central</label>
              <label><input type="radio" name="spark-save-mode" checked={mode === "create"} onChange={() => setMode("create")} />Criar uma nova ideia</label>
              {mode === "create" && central && <label><input type="checkbox" checked={link} onChange={event => setLink(event.target.checked)} />Conectar à ideia central</label>}
              <div className="first-spark-actions"><button onClick={() => setConfirming(false)}>Cancelar</button>
                <button className="primary" disabled={!draft.paths[activePath.id].answer.trim() || locked || (mode === "deepen" && !central)} onClick={() => guardIdea(false)}>Confirmar</button></div>
            </fieldset> : <button className="primary spark-guard-answer" disabled={!draft.paths[activePath.id].answer.trim() || locked}
              onClick={() => { setMode(central ? "deepen" : "create"); setLink(false); setConfirming(true); }}>Guardar resposta</button>}
            {referenceControl}
            <small className="spark-draft-hint">Rascunho preservado nesta aba ao voltar ou fechar.</small>
          </div>
        </section>}
      </div>
    </div> : <button className="first-spark-reopen" onClick={() => { updateDraft({ completed: false }); show(); }}>
      {draft.completed ? "✦ Retomar rascunho" : "✦ Retomar primeira faísca"}
    </button>}
  </div>;
}
